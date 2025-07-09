import { storage } from "../storage";
import { User } from "@shared/schema";

export class TrialService {
  // Start a 14-day trial for a new user
  static async startTrial(userId: string): Promise<User> {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days from now
    
    return await storage.updateUserSubscriptionStatus(
      userId,
      "trial",
      trialEndsAt
    );
  }

  // Check if user's trial is still active
  static async isTrialActive(user: User): Promise<boolean> {
    if (user.subscriptionStatus !== "trial") {
      return false;
    }
    
    if (!user.trialEndsAt) {
      return false;
    }
    
    return new Date() < user.trialEndsAt;
  }

  // Get days remaining in trial
  static getDaysRemaining(user: User): number {
    if (!user.trialEndsAt || user.subscriptionStatus !== "trial") {
      return 0;
    }
    
    const now = new Date();
    const trialEnd = user.trialEndsAt;
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // Check if trial has expired
  static isTrialExpired(user: User): boolean {
    if (user.subscriptionStatus !== "trial") {
      return false;
    }
    
    if (!user.trialEndsAt) {
      return true;
    }
    
    return new Date() >= user.trialEndsAt;
  }

  // Get trial status summary
  static getTrialStatus(user: User) {
    const isActive = this.isTrialActive(user);
    const isExpired = this.isTrialExpired(user);
    const daysRemaining = this.getDaysRemaining(user);
    
    return {
      isActive,
      isExpired,
      daysRemaining,
      trialEndsAt: user.trialEndsAt,
      status: user.subscriptionStatus,
      plan: user.subscriptionPlan
    };
  }

  // Convert trial to paid subscription
  static async convertTrialToSubscription(userId: string, plan: string): Promise<User> {
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1); // 1 month from now
    
    const user = await storage.updateUserSubscriptionStatus(
      userId,
      "active",
      undefined, // clear trial end date
      subscriptionEndsAt
    );
    
    return await storage.updateUserSubscriptionPlan(userId, plan);
  }

  // Expire trial (move to expired status)
  static async expireTrial(userId: string): Promise<User> {
    return await storage.updateUserSubscriptionStatus(
      userId,
      "trial_expired"
    );
  }

  // Check email usage limits during trial
  static canProcessEmail(user: User): boolean {
    // During trial, users get 100 emails per month
    const trialEmailLimit = 100;
    
    if (user.subscriptionStatus === "trial") {
      return (user.emailsProcessedThisMonth || 0) < trialEmailLimit;
    }
    
    // For paid users, use their plan limits
    return (user.emailsProcessedThisMonth || 0) < (user.emailLimitPerMonth || 500);
  }

  // Get remaining email quota
  static getRemainingEmailQuota(user: User): number {
    const trialEmailLimit = 100;
    const currentUsage = user.emailsProcessedThisMonth || 0;
    
    if (user.subscriptionStatus === "trial") {
      return Math.max(0, trialEmailLimit - currentUsage);
    }
    
    const planLimit = user.emailLimitPerMonth || 500;
    return Math.max(0, planLimit - currentUsage);
  }

  // Get trial progress percentage
  static getTrialProgress(user: User): number {
    if (user.subscriptionStatus !== "trial" || !user.trialEndsAt || !user.createdAt) {
      return 0;
    }
    
    const trialStart = user.createdAt;
    const trialEnd = user.trialEndsAt;
    const now = new Date();
    
    const totalDuration = trialEnd.getTime() - trialStart.getTime();
    const elapsed = now.getTime() - trialStart.getTime();
    
    const progress = (elapsed / totalDuration) * 100;
    return Math.min(100, Math.max(0, progress));
  }
}