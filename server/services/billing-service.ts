import Stripe from 'stripe';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';

export class BillingService {
  private stripe: Stripe | null = null;

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Handle successful payment - activate subscription
   */
  async handlePaymentSuccess(subscriptionId: string, customerId: string) {
    try {
      // Find user by Stripe customer ID
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        console.error(`User not found for Stripe customer: ${customerId}`);
        return;
      }

      // Get subscription details from Stripe
      const subscription = await this.stripe?.subscriptions.retrieve(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found in Stripe');
      }

      // Determine plan based on price ID
      const priceId = subscription.items.data[0]?.price.id;
      const plan = this.getPlanFromPriceId(priceId);

      // Update user subscription status
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        stripeSubscriptionId: subscriptionId,
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
        billingPeriodStart: new Date(subscription.current_period_start * 1000),
      });

      // Reset monthly usage for new billing period
      await storage.resetUserMonthlyUsage(user.id);

      console.log(`✅ Subscription activated for user ${user.email}: ${plan} plan`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment - mark subscription for retry
   */
  async handlePaymentFailed(subscriptionId: string, customerId: string) {
    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        console.error(`User not found for Stripe customer: ${customerId}`);
        return;
      }

      // Mark subscription as past due
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'past_due',
      });

      // Log billing issue
      await storage.createBillingEvent({
        userId: user.id,
        eventType: 'payment_failed',
        stripeSubscriptionId: subscriptionId,
        metadata: { customerId },
        createdAt: new Date(),
      });

      console.log(`⚠️ Payment failed for user ${user.email}`);
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCanceled(subscriptionId: string, customerId: string) {
    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        console.error(`User not found for Stripe customer: ${customerId}`);
        return;
      }

      // Update subscription status
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'cancelled',
        subscriptionEndsAt: new Date(), // Immediate cancellation
      });

      // Log cancellation
      await storage.createBillingEvent({
        userId: user.id,
        eventType: 'subscription_cancelled',
        stripeSubscriptionId: subscriptionId,
        metadata: { customerId },
        createdAt: new Date(),
      });

      console.log(`❌ Subscription cancelled for user ${user.email}`);
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
      throw error;
    }
  }

  /**
   * Handle invoice payment succeeded - continue subscription
   */
  async handleInvoicePaymentSucceeded(invoiceId: string, subscriptionId: string, customerId: string) {
    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        console.error(`User not found for Stripe customer: ${customerId}`);
        return;
      }

      // Get updated subscription details
      const subscription = await this.stripe?.subscriptions.retrieve(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found in Stripe');
      }

      // Update subscription period and reactivate if needed
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'active',
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
        billingPeriodStart: new Date(subscription.current_period_start * 1000),
      });

      // Reset monthly usage for new billing period
      await storage.resetUserMonthlyUsage(user.id);

      // Log successful renewal
      await storage.createBillingEvent({
        userId: user.id,
        eventType: 'subscription_renewed',
        stripeSubscriptionId: subscriptionId,
        metadata: { invoiceId, customerId },
        createdAt: new Date(),
      });

      console.log(`🔄 Subscription renewed for user ${user.email}`);
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Enforce usage limits based on subscription plan
   */
  async enforceUsageLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      // Check subscription status
      if (user.subscriptionStatus === 'cancelled' || user.subscriptionStatus === 'past_due') {
        return { allowed: false, reason: 'Subscription inactive' };
      }

      // Check if trial expired
      if (user.subscriptionStatus === 'trial' && user.trialEndsAt && new Date() > user.trialEndsAt) {
        await storage.updateUserSubscription(userId, { subscriptionStatus: 'trial_expired' });
        return { allowed: false, reason: 'Trial expired' };
      }

      // Check email usage limits
      const emailLimit = user.emailLimitPerMonth || 500;
      const emailsUsed = user.emailsProcessedThisMonth || 0;

      if (emailsUsed >= emailLimit) {
        return { allowed: false, reason: 'Monthly email limit exceeded' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error enforcing usage limits:', error);
      return { allowed: false, reason: 'Error checking limits' };
    }
  }

  /**
   * Create Stripe customer and subscription
   */
  async createSubscription(userId: string, priceId: string, paymentMethodId?: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.stripeCustomerId;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId, null);
      }

      // Create subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      // Update user with subscription ID
      await storage.updateUserStripeInfo(userId, customerId, subscription.id);

      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(userId: string, immediate: boolean = false) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      if (immediate) {
        // Cancel immediately
        await this.stripe.subscriptions.cancel(user.stripeSubscriptionId);
        await storage.updateUserSubscription(userId, {
          subscriptionStatus: 'cancelled',
          subscriptionEndsAt: new Date(),
        });
      } else {
        // Cancel at period end
        await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        await storage.updateUserSubscription(userId, {
          subscriptionStatus: 'active', // Still active until period end
        });
      }

      return { success: true, immediate };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get plan name from Stripe price ID
   */
  private getPlanFromPriceId(priceId: string): string {
    // Map price IDs to plan names
    const priceMap: { [key: string]: string } = {
      [process.env.STRIPE_STARTER_PRICE_ID || 'price_starter']: 'starter',
      [process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional']: 'professional',
      [process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise']: 'enterprise',
    };

    return priceMap[priceId] || 'starter';
  }

  /**
   * Check if user has access to premium features
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      // Check subscription status
      const usageCheck = await this.enforceUsageLimits(userId);
      if (!usageCheck.allowed) return false;

      // Feature access based on plan
      const plan = user.subscriptionPlan || 'starter';
      
      switch (feature) {
        case 'advanced_ai':
          return ['professional', 'enterprise'].includes(plan);
        case 'multi_account':
          return ['professional', 'enterprise'].includes(plan);
        case 'crm_integration':
          return plan === 'enterprise';
        case 'priority_support':
          return plan === 'enterprise';
        default:
          return true; // Basic features available to all
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }
}

export const billingService = new BillingService();