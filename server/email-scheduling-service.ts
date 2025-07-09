import { db } from "./db";
import { 
  scheduledEmails, 
  recipientTimeAnalytics, 
  sendTimeOptimization,
  type InsertScheduledEmail,
  type InsertRecipientTimeAnalytics,
  type InsertSendTimeOptimization,
  type ScheduledEmail,
  type RecipientTimeAnalytics,
  type SendTimeOptimization
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

interface TimezoneInfo {
  timezone: string;
  offset: number;
  name: string;
}

interface OptimalSendTime {
  hour: number;
  confidence: number;
  reason: string;
}

interface RecipientAnalysis {
  email: string;
  optimalHours: number[];
  optimalDays: string[];
  timezone: string;
  confidence: number;
}

export class EmailSchedulingService {

  /**
   * Enhanced recipient analysis with timezone detection and online patterns
   */
  async analyzeRecipients(recipients: string[], userId: string): Promise<any[]> {
    const analysis = [];
    
    for (const recipientEmail of recipients) {
      try {
        const timezone = await this.detectRecipientTimezone(recipientEmail, userId);
        const optimalTimes = await this.analyzeRecipientOptimalTimes(recipientEmail, userId);
        const currentTime = this.getCurrentTimeInTimezone(timezone.timezone);
        const isOnline = this.predictRecipientOnlineStatus(recipientEmail, currentTime);
        
        analysis.push({
          email: recipientEmail,
          timezone: timezone.name,
          offset: timezone.offset,
          confidence: 85, // Base confidence, can be enhanced with more data
          optimalHours: optimalTimes ? [optimalTimes.hour] : [9, 14, 17], // Default business hours
          currentTime: currentTime.toLocaleTimeString(),
          isOnline: isOnline
        });
      } catch (error) {
        console.error(`Error analyzing recipient ${recipientEmail}:`, error);
        // Provide fallback data
        analysis.push({
          email: recipientEmail,
          timezone: 'UTC',
          offset: 0,
          confidence: 30,
          optimalHours: [9, 14, 17],
          currentTime: new Date().toLocaleTimeString(),
          isOnline: false
        });
      }
    }
    
    return analysis;
  }

  /**
   * Find optimal send time across multiple recipients
   */
  async findOptimalSendTime(
    recipients: string[], 
    emailContent: string, 
    userId: string
  ): Promise<{ suggestedTime: Date; confidence: number; reason: string; alternativeTimes: Date[] }> {
    try {
      const recipientAnalysis = await this.analyzeRecipients(recipients, userId);
      
      // Find overlapping optimal hours across timezones
      const now = new Date();
      const optimalSlots = [];
      
      // Check next 48 hours for optimal sending windows
      for (let hour = 0; hour < 48; hour++) {
        const checkTime = new Date(now.getTime() + hour * 60 * 60 * 1000);
        const score = this.calculateTimeScore(checkTime, recipientAnalysis);
        
        if (score > 0.6) { // Threshold for good send times
          optimalSlots.push({
            time: checkTime,
            score,
            reason: this.generateTimeReason(checkTime, recipientAnalysis)
          });
        }
      }
      
      // Sort by score and select best times
      optimalSlots.sort((a, b) => b.score - a.score);
      
      if (optimalSlots.length === 0) {
        // Fallback to next business hour
        const fallbackTime = this.getNextBusinessHour();
        return {
          suggestedTime: fallbackTime,
          confidence: 40,
          reason: "No optimal time found, suggesting next business hour",
          alternativeTimes: []
        };
      }
      
      const bestTime = optimalSlots[0];
      const alternatives = optimalSlots.slice(1, 4).map(slot => slot.time);
      
      return {
        suggestedTime: bestTime.time,
        confidence: Math.round(bestTime.score * 100),
        reason: bestTime.reason,
        alternativeTimes: alternatives
      };
      
    } catch (error) {
      console.error('Error finding optimal send time:', error);
      throw new Error('Failed to calculate optimal send time');
    }
  }

  /**
   * Schedule email with cancellation option (change your mind feature)
   */
  async scheduleEmailWithCancellation(emailData: {
    userId: string;
    recipients: string[];
    subject: string;
    content: string;
    scheduledFor: Date;
    cancellationWindowMinutes?: number;
    useSmartTiming?: boolean;
    reason?: string;
  }): Promise<any> {
    try {
      const cancellationDeadline = emailData.cancellationWindowMinutes 
        ? new Date(Date.now() + emailData.cancellationWindowMinutes * 60 * 1000)
        : new Date(emailData.scheduledFor.getTime() - 2 * 60 * 1000); // Default 2 min before send
      
      const scheduledEmail = await this.scheduleEmail({
        userId: emailData.userId,
        recipientEmail: emailData.recipients[0] || 'unknown@example.com', // Use first recipient as primary
        subject: emailData.subject,
        content: emailData.content,
        scheduledFor: emailData.scheduledFor,
        metadata: {
          recipients: emailData.recipients,
          useSmartTiming: emailData.useSmartTiming || false,
          reason: emailData.reason || 'User scheduled',
          cancellationDeadline: cancellationDeadline.toISOString(),
          cancellable: true
        }
      });
      
      return {
        ...scheduledEmail,
        cancellationDeadline,
        timeUntilSend: emailData.scheduledFor.getTime() - Date.now(),
        canCancel: true
      };
      
    } catch (error) {
      console.error('Error scheduling email with cancellation:', error);
      throw new Error('Failed to schedule email');
    }
  }

  /**
   * Cancel scheduled email if within cancellation window
   */
  async cancelScheduledEmail(emailId: number, userId: string): Promise<{ success: boolean; reason?: string }> {
    try {
      const scheduledEmail = await this.getScheduledEmail(emailId, userId);
      
      if (!scheduledEmail) {
        return { success: false, reason: 'Email not found' };
      }
      
      if (scheduledEmail.status === 'sent') {
        return { success: false, reason: 'Email already sent' };
      }
      
      const metadata = scheduledEmail.metadata as any;
      const cancellationDeadline = metadata?.cancellationDeadline 
        ? new Date(metadata.cancellationDeadline)
        : new Date(scheduledEmail.scheduledFor.getTime() - 2 * 60 * 1000);
      
      if (Date.now() > cancellationDeadline.getTime()) {
        return { success: false, reason: 'Cancellation window expired' };
      }
      
      // Update status to cancelled  
      const [updated] = await db
        .update(scheduledEmails)
        .set({ status: 'cancelled' })
        .where(and(
          eq(scheduledEmails.id, emailId),
          eq(scheduledEmails.userId, userId)
        ))
        .returning();
      
      const success = !!updated;
      
      return { 
        success, 
        reason: success ? 'Email cancelled successfully' : 'Failed to cancel email'
      };
      
    } catch (error) {
      console.error('Error cancelling scheduled email:', error);
      return { success: false, reason: 'Error cancelling email' };
    }
  }

  /**
   * Get current time in specific timezone
   */
  private getCurrentTimeInTimezone(timezone: string): Date {
    try {
      return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    } catch (error) {
      return new Date(); // Fallback to local time
    }
  }

  /**
   * Predict if recipient is likely online based on patterns
   */
  private predictRecipientOnlineStatus(email: string, currentTime: Date): boolean {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    
    // Basic heuristics - can be enhanced with ML
    const isWeekday = day >= 1 && day <= 5;
    const isBusinessHours = hour >= 9 && hour <= 17;
    const isEveningHours = hour >= 18 && hour <= 22;
    
    // More likely online during business hours on weekdays
    if (isWeekday && isBusinessHours) return Math.random() > 0.3;
    
    // Moderately likely during evening hours
    if (isEveningHours) return Math.random() > 0.6;
    
    // Less likely during night/early morning
    return Math.random() > 0.8;
  }

  /**
   * Calculate score for a specific send time across all recipients
   */
  private calculateTimeScore(sendTime: Date, recipientAnalysis: any[]): number {
    let totalScore = 0;
    
    for (const recipient of recipientAnalysis) {
      const recipientLocalTime = this.convertToRecipientTime(sendTime, recipient.offset);
      const hour = recipientLocalTime.getHours();
      const day = recipientLocalTime.getDay();
      
      let score = 0;
      
      // Business hours bonus
      if (hour >= 9 && hour <= 17 && day >= 1 && day <= 5) {
        score += 0.8;
      }
      
      // Optimal hours bonus
      if (recipient.optimalHours.includes(hour)) {
        score += 0.6;
      }
      
      // Avoid very early/late hours
      if (hour < 7 || hour > 22) {
        score -= 0.5;
      }
      
      // Weekend penalty for business emails
      if (day === 0 || day === 6) {
        score -= 0.3;
      }
      
      totalScore += Math.max(0, score);
    }
    
    return recipientAnalysis.length > 0 ? totalScore / recipientAnalysis.length : 0;
  }

  /**
   * Convert time to recipient's timezone
   */
  private convertToRecipientTime(time: Date, offsetHours: number): Date {
    return new Date(time.getTime() + offsetHours * 60 * 60 * 1000);
  }

  /**
   * Generate human-readable reason for suggested time
   */
  private generateTimeReason(time: Date, recipientAnalysis: any[]): string {
    const hour = time.getHours();
    const isBusinessHour = hour >= 9 && hour <= 17;
    const recipientCount = recipientAnalysis.length;
    
    if (recipientCount === 1) {
      const recipient = recipientAnalysis[0];
      if (recipient.optimalHours.includes(hour)) {
        return `${recipient.email} typically responds well at this time`;
      }
      if (isBusinessHour) {
        return `Good business hour timing for ${recipient.timezone}`;
      }
      return `Suitable time for ${recipient.timezone}`;
    }
    
    if (isBusinessHour) {
      return `Optimal business hours across ${recipientCount} timezones`;
    }
    
    return `Best available time window for all ${recipientCount} recipients`;
  }

  /**
   * Get next business hour as fallback
   */
  private getNextBusinessHour(): Date {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    
    // If it's weekend or outside business hours, move to next Monday 9 AM
    if (nextHour.getDay() === 0 || nextHour.getDay() === 6 || 
        nextHour.getHours() < 9 || nextHour.getHours() > 17) {
      const daysUntilMonday = (8 - nextHour.getDay()) % 7 || 7;
      nextHour.setDate(nextHour.getDate() + daysUntilMonday);
      nextHour.setHours(9, 0, 0, 0);
    }
    
    return nextHour;
  }

  /**
   * Get scheduled email details
   */
  private async getScheduledEmail(emailId: number, userId: string): Promise<any> {
    const [email] = await db
      .select()
      .from(scheduledEmails)
      .where(and(
        eq(scheduledEmails.id, emailId),
        eq(scheduledEmails.userId, userId)
      ))
      .limit(1);
    
    return email;
  }
  
  /**
   * Detects recipient timezone from email address domain and historical patterns
   */
  async detectRecipientTimezone(recipientEmail: string, userId: string): Promise<TimezoneInfo> {
    // First check if we have analytics for this recipient
    const analytics = await db
      .select()
      .from(recipientTimeAnalytics)
      .where(and(
        eq(recipientTimeAnalytics.userId, userId),
        eq(recipientTimeAnalytics.recipientEmail, recipientEmail)
      ))
      .limit(1);

    if (analytics.length > 0 && analytics[0].detectedTimezone) {
      return {
        timezone: analytics[0].detectedTimezone,
        offset: this.getTimezoneOffset(analytics[0].detectedTimezone),
        name: this.getTimezoneDisplayName(analytics[0].detectedTimezone)
      };
    }

    // Fallback: Detect from email domain (simplified approach)
    const domain = recipientEmail.split('@')[1]?.toLowerCase();
    const timezone = this.detectTimezoneFromDomain(domain || 'gmail.com');
    
    return {
      timezone,
      offset: this.getTimezoneOffset(timezone),
      name: this.getTimezoneDisplayName(timezone)
    };
  }

  /**
   * Analyzes recipient's response patterns to determine optimal send times
   */
  async analyzeRecipientOptimalTimes(recipientEmail: string, userId: string): Promise<OptimalSendTime> {
    const analytics = await db
      .select()
      .from(recipientTimeAnalytics)
      .where(and(
        eq(recipientTimeAnalytics.userId, userId),
        eq(recipientTimeAnalytics.recipientEmail, recipientEmail)
      ))
      .limit(1);

    if (analytics.length === 0 || analytics[0].totalEmailsSent < 3) {
      // Not enough data, return general best practices
      return {
        hour: 10, // 10 AM generally optimal
        confidence: 0.3,
        reason: "General best practice (insufficient data)"
      };
    }

    const recipient = analytics[0];
    const mostActiveHours = recipient.mostActiveHours as number[] || [];
    
    if (mostActiveHours.length === 0) {
      return {
        hour: 14, // 2 PM as fallback
        confidence: 0.5,
        reason: "Average business hours"
      };
    }

    // Find the hour with highest activity
    const optimalHour = mostActiveHours[0];
    const confidence = Math.min(0.95, recipient.confidenceScore ? parseFloat(recipient.confidenceScore.toString()) : 0.6);

    return {
      hour: optimalHour,
      confidence,
      reason: `Based on ${recipient.totalEmailsSent} emails sent, ${recipient.totalResponses} responses`
    };
  }

  /**
   * Suggests the best time to send an email considering timezone and recipient patterns
   */
  async suggestOptimalSendTime(
    recipientEmail: string, 
    userId: string, 
    preferredSendTime?: Date
  ): Promise<{
    suggestedTime: Date;
    timezone: string;
    reason: string;
    confidence: number;
  }> {
    const [timezoneInfo, optimalTime] = await Promise.all([
      this.detectRecipientTimezone(recipientEmail, userId),
      this.analyzeRecipientOptimalTimes(recipientEmail, userId)
    ]);

    const now = new Date();
    const suggestedDate = preferredSendTime || new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow by default
    
    // Set the optimal hour in recipient's timezone
    const suggestedTime = new Date(suggestedDate);
    suggestedTime.setHours(optimalTime.hour, 0, 0, 0);

    // Adjust for timezone difference
    const timezoneOffset = this.getTimezoneOffset(timezoneInfo.timezone);
    const userTimezoneOffset = now.getTimezoneOffset(); // User's timezone offset in minutes
    const adjustmentMinutes = (timezoneOffset * 60) - userTimezoneOffset;
    suggestedTime.setMinutes(suggestedTime.getMinutes() + adjustmentMinutes);

    return {
      suggestedTime,
      timezone: timezoneInfo.timezone,
      reason: `${optimalTime.reason} in ${timezoneInfo.name}`,
      confidence: optimalTime.confidence
    };
  }

  /**
   * Schedules an email to be sent at a specific time
   */
  async scheduleEmail(emailData: {
    userId: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    content: string;
    scheduledFor: Date;
    emailAccountId?: number;
    automationRuleId?: number;
  }): Promise<ScheduledEmail> {
    const suggestion = await this.suggestOptimalSendTime(
      emailData.recipientEmail, 
      emailData.userId, 
      emailData.scheduledFor
    );

    const insertData: InsertScheduledEmail = {
      userId: emailData.userId,
      recipientEmail: emailData.recipientEmail,
      recipientName: emailData.recipientName,
      subject: emailData.subject,
      content: emailData.content,
      scheduledFor: emailData.scheduledFor,
      timezoneSuggestion: suggestion.timezone,
      optimalTimeSuggestion: suggestion.suggestedTime.toISOString(),
      scheduleReason: suggestion.reason,
      emailAccountId: emailData.emailAccountId,
      automationRuleId: emailData.automationRuleId,
      status: "scheduled"
    };

    const [scheduled] = await db.insert(scheduledEmails).values(insertData).returning();
    return scheduled;
  }

  /**
   * Gets all scheduled emails for a user
   */
  async getScheduledEmails(userId: string, status?: string): Promise<ScheduledEmail[]> {
    if (status) {
      return db
        .select()
        .from(scheduledEmails)
        .where(and(
          eq(scheduledEmails.userId, userId),
          eq(scheduledEmails.status, status)
        ))
        .orderBy(asc(scheduledEmails.scheduledFor));
    }

    return db
      .select()
      .from(scheduledEmails)
      .where(eq(scheduledEmails.userId, userId))
      .orderBy(asc(scheduledEmails.scheduledFor));
  }

  /**
   * Updates recipient analytics based on sent email and response
   */
  async updateRecipientAnalytics(
    userId: string,
    recipientEmail: string,
    emailSentAt: Date,
    responseReceivedAt?: Date
  ): Promise<void> {
    const existing = await db
      .select()
      .from(recipientTimeAnalytics)
      .where(and(
        eq(recipientTimeAnalytics.userId, userId),
        eq(recipientTimeAnalytics.recipientEmail, recipientEmail)
      ))
      .limit(1);

    const sentHour = emailSentAt.getHours();
    const sentDay = emailSentAt.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    if (existing.length === 0) {
      // Create new analytics record
      const insertData: InsertRecipientTimeAnalytics = {
        userId,
        recipientEmail,
        totalEmailsSent: 1,
        totalResponses: responseReceivedAt ? 1 : 0,
        responseRate: responseReceivedAt ? "100.00" : "0.00",
        mostActiveHours: [sentHour],
        bestResponseDays: responseReceivedAt ? [sentDay] : [],
        lastEmailSent: emailSentAt,
        lastResponse: responseReceivedAt,
        confidenceScore: "0.10", // Low confidence with just one data point
      };

      await db.insert(recipientTimeAnalytics).values(insertData);
    } else {
      // Update existing record
      const current = existing[0];
      const newTotalSent = (current.totalEmailsSent || 0) + 1;
      const newTotalResponses = (current.totalResponses || 0) + (responseReceivedAt ? 1 : 0);
      const newResponseRate = ((newTotalResponses / newTotalSent) * 100).toFixed(2);
      
      // Update active hours
      const currentHours = current.mostActiveHours as number[] || [];
      const updatedHours = [...currentHours, sentHour];
      const hourFrequency = this.calculateHourFrequency(updatedHours);
      const topHours = Object.entries(hourFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([hour]) => parseInt(hour));

      // Calculate confidence based on data points
      const confidence = Math.min(0.95, newTotalSent * 0.1);

      await db
        .update(recipientTimeAnalytics)
        .set({
          totalEmailsSent: newTotalSent,
          totalResponses: newTotalResponses,
          responseRate: newResponseRate,
          mostActiveHours: topHours,
          lastEmailSent: emailSentAt,
          lastResponse: responseReceivedAt || current.lastResponse,
          confidenceScore: confidence.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(recipientTimeAnalytics.id, current.id));
    }
  }

  /**
   * Cancels a scheduled email
   */
  async cancelScheduledEmail(emailId: number, userId: string): Promise<boolean> {
    const result = await db
      .update(scheduledEmails)
      .set({ 
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(and(
        eq(scheduledEmails.id, emailId),
        eq(scheduledEmails.userId, userId),
        eq(scheduledEmails.status, "scheduled")
      ))
      .returning();

    return result.length > 0;
  }

  /**
   * Gets emails that are ready to be sent (past their scheduled time)
   */
  async getEmailsReadyToSend(): Promise<ScheduledEmail[]> {
    const now = new Date();
    return db
      .select()
      .from(scheduledEmails)
      .where(and(
        eq(scheduledEmails.status, "scheduled"),
        lte(scheduledEmails.scheduledFor, now)
      ))
      .orderBy(asc(scheduledEmails.scheduledFor));
  }

  // Private helper methods
  private detectTimezoneFromDomain(domain: string): string {
    // Simplified domain-to-timezone mapping
    const domainTimezones: Record<string, string> = {
      // US domains
      'gmail.com': 'America/New_York',
      'yahoo.com': 'America/New_York',
      'hotmail.com': 'America/New_York',
      'outlook.com': 'America/New_York',
      
      // European domains
      'gmail.co.uk': 'Europe/London',
      'yahoo.co.uk': 'Europe/London',
      'outlook.co.uk': 'Europe/London',
      'gmail.de': 'Europe/Berlin',
      'yahoo.de': 'Europe/Berlin',
      'gmail.fr': 'Europe/Paris',
      'yahoo.fr': 'Europe/Paris',
      
      // Asian domains
      'gmail.com.au': 'Australia/Sydney',
      'yahoo.com.au': 'Australia/Sydney',
      'gmail.co.jp': 'Asia/Tokyo',
      'yahoo.co.jp': 'Asia/Tokyo',
      'gmail.com.cn': 'Asia/Shanghai',
      'qq.com': 'Asia/Shanghai',
      '163.com': 'Asia/Shanghai',
      'gmail.co.in': 'Asia/Kolkata',
      'yahoo.co.in': 'Asia/Kolkata',
    };

    return domainTimezones[domain] || 'America/New_York'; // Default to EST
  }

  private getTimezoneOffset(timezone: string): number {
    // Returns offset in hours from UTC
    const timezoneOffsets: Record<string, number> = {
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Asia/Tokyo': 9,
      'Asia/Shanghai': 8,
      'Asia/Kolkata': 5.5,
      'Australia/Sydney': 11,
    };

    return timezoneOffsets[timezone] || -5; // Default to EST
  }

  private getTimezoneDisplayName(timezone: string): string {
    const timezoneNames: Record<string, string> = {
      'America/New_York': 'Eastern Time',
      'America/Chicago': 'Central Time',
      'America/Denver': 'Mountain Time',
      'America/Los_Angeles': 'Pacific Time',
      'Europe/London': 'GMT',
      'Europe/Paris': 'Central European Time',
      'Europe/Berlin': 'Central European Time',
      'Asia/Tokyo': 'Japan Standard Time',
      'Asia/Shanghai': 'China Standard Time',
      'Asia/Kolkata': 'India Standard Time',
      'Australia/Sydney': 'Australian Eastern Time',
    };

    return timezoneNames[timezone] || 'Eastern Time';
  }

  private calculateHourFrequency(hours: number[]): Record<number, number> {
    const frequency: Record<number, number> = {};
    hours.forEach(hour => {
      frequency[hour] = (frequency[hour] || 0) + 1;
    });
    return frequency;
  }
}

export const emailSchedulingService = new EmailSchedulingService();