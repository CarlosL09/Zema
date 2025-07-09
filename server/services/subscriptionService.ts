export class SubscriptionService {
  private stripeSecretKey: string | undefined;

  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  }

  // Check if user's trial has expired
  isTrialExpired(user: any): boolean {
    if (!user.trialEndsAt) return false;
    return new Date() > new Date(user.trialEndsAt);
  }

  // Check if user has active subscription
  hasActiveSubscription(user: any): boolean {
    return user.subscriptionStatus === 'active' || 
           (user.subscriptionStatus === 'trialing' && !this.isTrialExpired(user));
  }

  // Calculate trial end date (7 days from now)
  calculateTrialEndDate(): Date {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    return trialEnd;
  }

  // Mock Stripe operations for when keys aren't available
  async createCustomer(email: string, name?: string) {
    if (!this.stripeSecretKey) {
      return {
        id: `cus_mock_${Date.now()}`,
        email,
        name: name || 'Demo User'
      };
    }

    // Real Stripe implementation would go here
    throw new Error('Stripe integration not fully implemented yet');
  }

  async createSubscription(customerId: string) {
    if (!this.stripeSecretKey) {
      return {
        id: `sub_mock_${Date.now()}`,
        status: 'trialing',
        trial_end: Math.floor(this.calculateTrialEndDate().getTime() / 1000),
        latest_invoice: {
          payment_intent: {
            client_secret: `pi_mock_${Date.now()}_secret_mock`
          }
        }
      };
    }

    // Real Stripe implementation would go here
    throw new Error('Stripe integration not fully implemented yet');
  }

  async cancelSubscription(subscriptionId: string) {
    if (!this.stripeSecretKey) {
      return {
        id: subscriptionId,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000)
      };
    }

    // Real Stripe implementation would go here
    throw new Error('Stripe integration not fully implemented yet');
  }

  // Get subscription pricing info
  getPricingInfo() {
    return {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: 2.00,
          emailLimit: 500,
          features: [
            'Up to 500 emails processed/month',
            'Basic AI email processing',
            'Smart categorization', 
            'Email templates',
            'Basic analytics'
          ]
        },
        {
          id: 'professional', 
          name: 'Professional',
          price: 5.00,
          emailLimit: 2000,
          features: [
            'Up to 2,000 emails processed/month',
            'Advanced AI automation',
            'Smart scheduling detection',
            'Auto-generated replies',
            'Priority scoring',
            'Multi-account support',
            'Advanced analytics',
            'Security monitoring'
          ],
          popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise', 
          price: 15.00,
          emailLimit: 10000,
          features: [
            'Up to 10,000 emails processed/month',
            'Full AI feature access',
            'Advanced business intelligence',
            'CRM integrations',
            'Workflow automation',
            'Priority support',
            'Custom integrations',
            'Advanced security & compliance'
          ]
        }
      ],
      currency: 'USD',
      trialDays: 7
    };
  }

  // Check subscription status and permissions
  getSubscriptionStatus(user: any) {
    const isTrialExpired = this.isTrialExpired(user);
    const hasActive = this.hasActiveSubscription(user);
    
    // Calculate usage percentage
    const usagePercentage = user.emailLimitPerMonth > 0 ? 
      Math.round((user.emailsProcessedThisMonth || 0) / user.emailLimitPerMonth * 100) : 0;
    
    // Check if user has exceeded their email limit
    const hasExceededLimit = (user.emailsProcessedThisMonth || 0) >= (user.emailLimitPerMonth || 500);
    
    return {
      status: user.subscriptionStatus || 'trial',
      plan: user.subscriptionPlan || 'starter',
      isActive: hasActive,
      isTrialExpired,
      trialEndsAt: user.trialEndsAt,
      subscriptionEndsAt: user.subscriptionEndsAt,
      daysRemaining: user.trialEndsAt ? 
        Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 
        null,
      emailsProcessed: user.emailsProcessedThisMonth || 0,
      emailLimit: user.emailLimitPerMonth || 500,
      usagePercentage,
      hasExceededLimit,
      billingPeriodStart: user.billingPeriodStart
    };
  }
}

export const subscriptionService = new SubscriptionService();