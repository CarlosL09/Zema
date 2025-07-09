import OpenAI from "openai";
import { storage } from "./storage";
import { 
  EmailAnalytic,
  InsertEmailAnalytic,
  ContactSentimentProfile,
  InsertContactSentimentProfile,
  LeadScore,
  InsertLeadScore
} from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContactPerformanceMetrics {
  contactEmail: string;
  contactName?: string;
  totalEmailsSent: number;
  totalEmailsReceived: number;
  responseRate: number;
  avgResponseTime: number; // in hours
  communicationEfficiencyScore: number;
  lastInteractionDate: Date;
  preferredCommunicationTime?: string;
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
  recommendedActions: string[];
  channelSwitchSuggestion?: {
    suggested: boolean;
    reason: string;
    alternativeChannel: 'phone' | 'video' | 'in-person' | 'slack' | 'teams';
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

export interface CommunicationInsight {
  type: 'response_rate' | 'efficiency' | 'engagement' | 'channel_switch' | 'timing';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  actionItems: string[];
  affectedContacts: string[];
  metrics: Record<string, number>;
}

export interface EmailThreadAnalysis {
  threadId: string;
  participants: string[];
  messageCount: number;
  avgResponseTime: number;
  responseRate: number;
  engagementScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgencyLevel: 'low' | 'medium' | 'high';
  suggestedNextAction: string;
  channelRecommendation?: string;
}

export class EmailPerformanceService {
  /**
   * Analyze response rates and communication patterns for a specific contact
   */
  async analyzeContactPerformance(userId: string, contactEmail: string): Promise<ContactPerformanceMetrics> {
    try {
      // Get email analytics for this contact
      const analytics = await storage.getEmailAnalyticsByContact(userId, contactEmail);
      const sentimentProfile = await storage.getContactSentimentProfile(userId, contactEmail);
      
      if (!analytics.length) {
        return this.createEmptyContactMetrics(contactEmail);
      }

      // Calculate basic metrics
      const sentEmails = analytics.filter(a => a.direction === 'sent');
      const receivedEmails = analytics.filter(a => a.direction === 'received');
      const responseRate = this.calculateResponseRate(sentEmails, receivedEmails);
      const avgResponseTime = this.calculateAverageResponseTime(analytics);
      
      // Calculate communication efficiency score (0-100)
      const efficiencyScore = this.calculateEfficiencyScore({
        responseRate,
        avgResponseTime,
        sentimentScore: sentimentProfile?.averageSentiment || 0.5,
        engagementLevel: this.calculateEngagementLevel(analytics)
      });

      // Determine engagement trend
      const engagementTrend = this.analyzeEngagementTrend(analytics);
      
      // Get AI-powered recommendations
      const recommendations = await this.generateRecommendations(
        contactEmail, 
        analytics, 
        sentimentProfile
      );

      // Determine if channel switch is needed
      const channelSwitchSuggestion = this.evaluateChannelSwitch({
        responseRate,
        avgResponseTime,
        efficiencyScore,
        sentimentTrend: sentimentProfile?.sentimentTrend || 'stable',
        lastInteraction: analytics[0]?.timestamp || new Date()
      });

      return {
        contactEmail,
        contactName: analytics[0]?.contactName,
        totalEmailsSent: sentEmails.length,
        totalEmailsReceived: receivedEmails.length,
        responseRate,
        avgResponseTime,
        communicationEfficiencyScore: efficiencyScore,
        lastInteractionDate: analytics[0]?.timestamp || new Date(),
        preferredCommunicationTime: this.identifyPreferredTime(analytics),
        engagementTrend,
        recommendedActions: recommendations.slice(0, 3),
        channelSwitchSuggestion
      };
    } catch (error) {
      console.error('Error analyzing contact performance:', error);
      return this.createEmptyContactMetrics(contactEmail);
    }
  }

  /**
   * Generate comprehensive communication insights for a user
   */
  async generateCommunicationInsights(userId: string): Promise<CommunicationInsight[]> {
    try {
      const insights: CommunicationInsight[] = [];
      
      // Get recent email analytics
      const recentAnalytics = await storage.getRecentEmailAnalytics(userId, 30);
      const contactGroups = this.groupAnalyticsByContact(recentAnalytics);

      // Analyze response rate trends
      const responseRateInsights = this.analyzeResponseRateTrends(contactGroups);
      insights.push(...responseRateInsights);

      // Analyze communication efficiency
      const efficiencyInsights = this.analyzeEfficiencyPatterns(contactGroups);
      insights.push(...efficiencyInsights);

      // Identify contacts requiring channel switch
      const channelSwitchInsights = await this.identifyChannelSwitchOpportunities(contactGroups);
      insights.push(...channelSwitchInsights);

      // Timing optimization insights
      const timingInsights = this.analyzeTimingPatterns(recentAnalytics);
      insights.push(...timingInsights);

      // Sort by severity and impact
      return insights.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    } catch (error) {
      console.error('Error generating communication insights:', error);
      return [];
    }
  }

  /**
   * Analyze email thread performance and suggest optimizations
   */
  async analyzeEmailThread(userId: string, threadId: string): Promise<EmailThreadAnalysis> {
    try {
      // Get thread analytics
      const threadAnalytics = await storage.getEmailAnalyticsByThread(userId, threadId);
      
      if (!threadAnalytics.length) {
        throw new Error('Thread not found');
      }

      const participants = [...new Set(threadAnalytics.map(a => a.contactEmail))];
      const messageCount = threadAnalytics.length;
      
      // Calculate thread-specific metrics
      const responseRate = this.calculateThreadResponseRate(threadAnalytics);
      const avgResponseTime = this.calculateAverageResponseTime(threadAnalytics);
      const engagementScore = this.calculateThreadEngagement(threadAnalytics);
      
      // Analyze sentiment
      const overallSentiment = this.calculateThreadSentiment(threadAnalytics);
      
      // Determine urgency based on content and timing
      const urgencyLevel = this.assessThreadUrgency(threadAnalytics);
      
      // Get AI-powered next action suggestion
      const suggestedNextAction = await this.suggestNextAction(threadAnalytics);
      
      // Channel recommendation based on thread performance
      const channelRecommendation = this.recommendChannel({
        responseRate,
        avgResponseTime,
        urgencyLevel,
        participantCount: participants.length,
        messageCount
      });

      return {
        threadId,
        participants,
        messageCount,
        avgResponseTime,
        responseRate,
        engagementScore,
        sentiment: overallSentiment,
        urgencyLevel,
        suggestedNextAction,
        channelRecommendation
      };
    } catch (error) {
      console.error('Error analyzing email thread:', error);
      throw error;
    }
  }

  /**
   * Track and update contact performance metrics
   */
  async updateContactMetrics(userId: string, emailData: {
    contactEmail: string;
    direction: 'sent' | 'received';
    timestamp: Date;
    responseTime?: number;
    opened?: boolean;
    clicked?: boolean;
    replied?: boolean;
  }): Promise<void> {
    try {
      // Create email analytic record
      const analyticData: InsertEmailAnalytic = {
        userId,
        contactEmail: emailData.contactEmail,
        direction: emailData.direction,
        timestamp: emailData.timestamp,
        responseTime: emailData.responseTime,
        opened: emailData.opened || false,
        clicked: emailData.clicked || false,
        replied: emailData.replied || false,
        engagementScore: this.calculateEmailEngagement(emailData)
      };

      await storage.createEmailAnalytic(analyticData);

      // Update or create contact sentiment profile
      await this.updateContactSentiment(userId, emailData.contactEmail);
      
    } catch (error) {
      console.error('Error updating contact metrics:', error);
    }
  }

  // Helper methods

  private createEmptyContactMetrics(contactEmail: string): ContactPerformanceMetrics {
    return {
      contactEmail,
      totalEmailsSent: 0,
      totalEmailsReceived: 0,
      responseRate: 0,
      avgResponseTime: 0,
      communicationEfficiencyScore: 50,
      lastInteractionDate: new Date(),
      engagementTrend: 'stable',
      recommendedActions: ['Start email communication to build metrics'],
      channelSwitchSuggestion: {
        suggested: false,
        reason: 'Insufficient data for analysis',
        alternativeChannel: 'phone',
        urgencyLevel: 'low'
      }
    };
  }

  private calculateResponseRate(sentEmails: EmailAnalytic[], receivedEmails: EmailAnalytic[]): number {
    if (sentEmails.length === 0) return 0;
    
    // Count replied emails within 48 hours
    let responses = 0;
    for (const sent of sentEmails) {
      const response = receivedEmails.find(received => 
        received.timestamp > sent.timestamp &&
        received.timestamp.getTime() - sent.timestamp.getTime() < 48 * 60 * 60 * 1000
      );
      if (response) responses++;
    }
    
    return (responses / sentEmails.length) * 100;
  }

  private calculateAverageResponseTime(analytics: EmailAnalytic[]): number {
    const responseTimes = analytics
      .filter(a => a.responseTime && a.responseTime > 0)
      .map(a => a.responseTime!);
    
    if (responseTimes.length === 0) return 0;
    
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private calculateEfficiencyScore(params: {
    responseRate: number;
    avgResponseTime: number;
    sentimentScore: number;
    engagementLevel: number;
  }): number {
    const { responseRate, avgResponseTime, sentimentScore, engagementLevel } = params;
    
    // Normalize response time (lower is better, max 24 hours)
    const responseTimeScore = Math.max(0, 100 - (avgResponseTime / 24) * 100);
    
    // Weight the different factors
    const score = (
      responseRate * 0.3 +
      responseTimeScore * 0.25 +
      sentimentScore * 100 * 0.25 +
      engagementLevel * 0.2
    );
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateEngagementLevel(analytics: EmailAnalytic[]): number {
    if (analytics.length === 0) return 0;
    
    const engagementScores = analytics.map(a => a.engagementScore || 0);
    return engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
  }

  private analyzeEngagementTrend(analytics: EmailAnalytic[]): 'increasing' | 'decreasing' | 'stable' {
    if (analytics.length < 4) return 'stable';
    
    // Sort by timestamp
    const sorted = analytics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Compare first half vs second half engagement
    const midPoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midPoint);
    const secondHalf = sorted.slice(midPoint);
    
    const firstAvg = firstHalf.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 0.1) return 'increasing';
    if (diff < -0.1) return 'decreasing';
    return 'stable';
  }

  private async generateRecommendations(
    contactEmail: string, 
    analytics: EmailAnalytic[], 
    sentimentProfile: ContactSentimentProfile | undefined
  ): Promise<string[]> {
    try {
      const analyticsData = analytics.slice(0, 10).map(a => ({
        direction: a.direction,
        timestamp: a.timestamp.toISOString(),
        opened: a.opened,
        replied: a.replied,
        responseTime: a.responseTime,
        engagementScore: a.engagementScore
      }));

      const prompt = `
        Analyze communication patterns with ${contactEmail} and provide 3-5 specific recommendations.
        
        Analytics Data:
        ${JSON.stringify(analyticsData, null, 2)}
        
        Sentiment Profile: ${sentimentProfile ? JSON.stringify({
          averageSentiment: sentimentProfile.averageSentiment,
          sentimentTrend: sentimentProfile.sentimentTrend,
          communicationStyle: sentimentProfile.communicationStyle
        }) : 'No sentiment data available'}
        
        Provide actionable recommendations to improve communication effectiveness.
        Focus on timing, content style, frequency, and engagement strategies.
        
        Return JSON format:
        {
          "recommendations": [
            "Specific actionable recommendation 1",
            "Specific actionable recommendation 2"
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['Review communication patterns', 'Optimize timing', 'Improve engagement'];
    }
  }

  private evaluateChannelSwitch(params: {
    responseRate: number;
    avgResponseTime: number;
    efficiencyScore: number;
    sentimentTrend: string;
    lastInteraction: Date;
  }): ContactPerformanceMetrics['channelSwitchSuggestion'] {
    const { responseRate, avgResponseTime, efficiencyScore, sentimentTrend, lastInteraction } = params;
    
    // Check if channel switch is needed
    const daysSinceLastInteraction = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
    
    let suggested = false;
    let reason = 'Email communication is effective';
    let alternativeChannel: 'phone' | 'video' | 'in-person' | 'slack' | 'teams' = 'phone';
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low';

    if (responseRate < 20 && avgResponseTime > 48) {
      suggested = true;
      reason = 'Low response rate and slow responses suggest email fatigue';
      alternativeChannel = 'phone';
      urgencyLevel = 'high';
    } else if (efficiencyScore < 30) {
      suggested = true;
      reason = 'Poor communication efficiency, try direct conversation';
      alternativeChannel = 'video';
      urgencyLevel = 'medium';
    } else if (sentimentTrend === 'declining' && responseRate < 50) {
      suggested = true;
      reason = 'Declining sentiment requires more personal touch';
      alternativeChannel = 'video';
      urgencyLevel = 'medium';
    } else if (daysSinceLastInteraction > 14 && responseRate < 40) {
      suggested = true;
      reason = 'Long silence period, personal outreach recommended';
      alternativeChannel = 'phone';
      urgencyLevel = 'medium';
    }

    return {
      suggested,
      reason,
      alternativeChannel,
      urgencyLevel
    };
  }

  private identifyPreferredTime(analytics: EmailAnalytic[]): string | undefined {
    if (analytics.length < 5) return undefined;
    
    // Group by hour of day for received emails (when they respond)
    const receivedEmails = analytics.filter(a => a.direction === 'received');
    const hourCounts: { [hour: number]: number } = {};
    
    receivedEmails.forEach(email => {
      const hour = email.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Find peak hour
    const peakHour = Object.entries(hourCounts)
      .reduce((max, [hour, count]) => count > max.count ? { hour: parseInt(hour), count } : max, { hour: 9, count: 0 });
    
    if (peakHour.count >= 2) {
      const period = peakHour.hour < 12 ? 'morning' : peakHour.hour < 17 ? 'afternoon' : 'evening';
      return `${period} (around ${peakHour.hour}:00)`;
    }
    
    return undefined;
  }

  private groupAnalyticsByContact(analytics: EmailAnalytic[]): Map<string, EmailAnalytic[]> {
    const grouped = new Map<string, EmailAnalytic[]>();
    
    analytics.forEach(analytic => {
      const existing = grouped.get(analytic.contactEmail) || [];
      existing.push(analytic);
      grouped.set(analytic.contactEmail, existing);
    });
    
    return grouped;
  }

  private analyzeResponseRateTrends(contactGroups: Map<string, EmailAnalytic[]>): CommunicationInsight[] {
    const insights: CommunicationInsight[] = [];
    const lowResponseContacts: string[] = [];
    
    for (const [contactEmail, analytics] of contactGroups.entries()) {
      const sentEmails = analytics.filter(a => a.direction === 'sent');
      const receivedEmails = analytics.filter(a => a.direction === 'received');
      const responseRate = this.calculateResponseRate(sentEmails, receivedEmails);
      
      if (responseRate < 25 && sentEmails.length >= 3) {
        lowResponseContacts.push(contactEmail);
      }
    }
    
    if (lowResponseContacts.length > 0) {
      insights.push({
        type: 'response_rate',
        title: 'Low Response Rate Contacts',
        description: `${lowResponseContacts.length} contacts have response rates below 25%`,
        impact: 'negative',
        severity: lowResponseContacts.length > 5 ? 'high' : 'medium',
        actionItems: [
          'Consider switching to phone or video calls',
          'Review email content and timing',
          'Personalize outreach approach'
        ],
        affectedContacts: lowResponseContacts,
        metrics: {
          contactCount: lowResponseContacts.length,
          avgResponseRate: 0
        }
      });
    }
    
    return insights;
  }

  private analyzeEfficiencyPatterns(contactGroups: Map<string, EmailAnalytic[]>): CommunicationInsight[] {
    const insights: CommunicationInsight[] = [];
    let totalEfficiency = 0;
    let contactCount = 0;
    
    for (const [contactEmail, analytics] of contactGroups.entries()) {
      const responseRate = this.calculateResponseRate(
        analytics.filter(a => a.direction === 'sent'),
        analytics.filter(a => a.direction === 'received')
      );
      const avgResponseTime = this.calculateAverageResponseTime(analytics);
      const engagementLevel = this.calculateEngagementLevel(analytics);
      
      const efficiency = this.calculateEfficiencyScore({
        responseRate,
        avgResponseTime,
        sentimentScore: 0.7, // Default neutral
        engagementLevel
      });
      
      totalEfficiency += efficiency;
      contactCount++;
    }
    
    const avgEfficiency = contactCount > 0 ? totalEfficiency / contactCount : 50;
    
    if (avgEfficiency < 40) {
      insights.push({
        type: 'efficiency',
        title: 'Overall Communication Efficiency Low',
        description: `Average communication efficiency is ${avgEfficiency.toFixed(1)}%`,
        impact: 'negative',
        severity: 'high',
        actionItems: [
          'Review email templates and messaging',
          'Optimize send timing',
          'Consider alternative communication channels',
          'Implement response tracking'
        ],
        affectedContacts: Array.from(contactGroups.keys()),
        metrics: {
          avgEfficiency,
          contactsAnalyzed: contactCount
        }
      });
    }
    
    return insights;
  }

  private async identifyChannelSwitchOpportunities(contactGroups: Map<string, EmailAnalytic[]>): Promise<CommunicationInsight[]> {
    const insights: CommunicationInsight[] = [];
    const switchCandidates: string[] = [];
    
    for (const [contactEmail, analytics] of contactGroups.entries()) {
      const sentEmails = analytics.filter(a => a.direction === 'sent');
      const receivedEmails = analytics.filter(a => a.direction === 'received');
      const responseRate = this.calculateResponseRate(sentEmails, receivedEmails);
      const avgResponseTime = this.calculateAverageResponseTime(analytics);
      
      // Identify candidates for channel switch
      if ((responseRate < 30 && sentEmails.length >= 3) || avgResponseTime > 72) {
        switchCandidates.push(contactEmail);
      }
    }
    
    if (switchCandidates.length > 0) {
      insights.push({
        type: 'channel_switch',
        title: 'Channel Switch Recommended',
        description: `${switchCandidates.length} contacts would benefit from alternative communication channels`,
        impact: 'positive',
        severity: 'medium',
        actionItems: [
          'Schedule phone calls with low-response contacts',
          'Set up video meetings for complex discussions',
          'Use instant messaging for quick questions'
        ],
        affectedContacts: switchCandidates,
        metrics: {
          candidateCount: switchCandidates.length
        }
      });
    }
    
    return insights;
  }

  private analyzeTimingPatterns(analytics: EmailAnalytic[]): CommunicationInsight[] {
    const insights: CommunicationInsight[] = [];
    
    // Analyze send times vs response rates
    const hourlyStats: { [hour: number]: { sent: number; responded: number } } = {};
    
    analytics.forEach(analytic => {
      const hour = analytic.timestamp.getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { sent: 0, responded: 0 };
      }
      
      if (analytic.direction === 'sent') {
        hourlyStats[hour].sent++;
      } else if (analytic.direction === 'received') {
        hourlyStats[hour].responded++;
      }
    });
    
    // Find optimal sending times
    const hourlyResponseRates = Object.entries(hourlyStats)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        responseRate: stats.sent > 0 ? (stats.responded / stats.sent) * 100 : 0,
        volume: stats.sent
      }))
      .filter(h => h.volume >= 2); // Only consider hours with sufficient data
    
    if (hourlyResponseRates.length > 0) {
      const bestHour = hourlyResponseRates.reduce((best, current) => 
        current.responseRate > best.responseRate ? current : best
      );
      
      const avgResponseRate = hourlyResponseRates.reduce((sum, h) => sum + h.responseRate, 0) / hourlyResponseRates.length;
      
      if (bestHour.responseRate > avgResponseRate * 1.5) {
        insights.push({
          type: 'timing',
          title: 'Optimal Send Time Identified',
          description: `Emails sent at ${bestHour.hour}:00 have ${bestHour.responseRate.toFixed(1)}% response rate`,
          impact: 'positive',
          severity: 'low',
          actionItems: [
            `Schedule emails for ${bestHour.hour}:00 when possible`,
            'Avoid sending during low-response hours',
            'Use email scheduling features'
          ],
          affectedContacts: [],
          metrics: {
            optimalHour: bestHour.hour,
            optimalResponseRate: bestHour.responseRate,
            avgResponseRate
          }
        });
      }
    }
    
    return insights;
  }

  private calculateThreadResponseRate(analytics: EmailAnalytic[]): number {
    const participants = [...new Set(analytics.map(a => a.contactEmail))];
    const sentToParticipants = analytics.filter(a => a.direction === 'sent');
    const receivedFromParticipants = analytics.filter(a => a.direction === 'received');
    
    if (sentToParticipants.length === 0) return 0;
    
    return (receivedFromParticipants.length / sentToParticipants.length) * 100;
  }

  private calculateThreadEngagement(analytics: EmailAnalytic[]): number {
    if (analytics.length === 0) return 0;
    
    const engagementScores = analytics.map(a => a.engagementScore || 0);
    return engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
  }

  private calculateThreadSentiment(analytics: EmailAnalytic[]): 'positive' | 'neutral' | 'negative' {
    // This would typically use sentiment analysis on email content
    // For now, we'll use engagement scores as a proxy
    const avgEngagement = this.calculateThreadEngagement(analytics);
    
    if (avgEngagement > 0.7) return 'positive';
    if (avgEngagement < 0.3) return 'negative';
    return 'neutral';
  }

  private assessThreadUrgency(analytics: EmailAnalytic[]): 'low' | 'medium' | 'high' {
    const recentEmails = analytics.filter(a => 
      Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    const avgResponseTime = this.calculateAverageResponseTime(analytics);
    
    if (recentEmails.length > 3 || avgResponseTime < 2) return 'high';
    if (recentEmails.length > 1 || avgResponseTime < 12) return 'medium';
    return 'low';
  }

  private async suggestNextAction(analytics: EmailAnalytic[]): Promise<string> {
    try {
      const recentAnalytics = analytics.slice(0, 5).map(a => ({
        direction: a.direction,
        timestamp: a.timestamp.toISOString(),
        responseTime: a.responseTime,
        engagementScore: a.engagementScore
      }));

      const prompt = `
        Based on this email thread analysis, suggest the best next action:
        
        Recent Activity:
        ${JSON.stringify(recentAnalytics, null, 2)}
        
        Provide a specific, actionable next step. Be concise and practical.
        
        Return JSON format:
        {
          "action": "Specific next action recommendation"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"action": "Follow up with a summary email"}');
      return result.action;
    } catch (error) {
      console.error('Error suggesting next action:', error);
      return 'Follow up with participants to continue the conversation';
    }
  }

  private recommendChannel(params: {
    responseRate: number;
    avgResponseTime: number;
    urgencyLevel: string;
    participantCount: number;
    messageCount: number;
  }): string | undefined {
    const { responseRate, avgResponseTime, urgencyLevel, participantCount, messageCount } = params;
    
    if (urgencyLevel === 'high' && responseRate < 50) {
      return participantCount > 2 ? 'Schedule a group video call' : 'Make a phone call';
    }
    
    if (messageCount > 10 && avgResponseTime > 24) {
      return 'Consider a meeting to resolve this efficiently';
    }
    
    if (participantCount > 3 && messageCount > 5) {
      return 'Schedule a group meeting to align everyone';
    }
    
    return undefined;
  }

  private calculateEmailEngagement(emailData: {
    opened?: boolean;
    clicked?: boolean;
    replied?: boolean;
  }): number {
    let score = 0;
    if (emailData.opened) score += 0.3;
    if (emailData.clicked) score += 0.3;
    if (emailData.replied) score += 0.4;
    return score;
  }

  private async updateContactSentiment(userId: string, contactEmail: string): Promise<void> {
    try {
      const existingProfile = await storage.getContactSentimentProfile(userId, contactEmail);
      const recentAnalytics = await storage.getEmailAnalyticsByContact(userId, contactEmail, 10);
      
      if (recentAnalytics.length === 0) return;
      
      // Calculate average sentiment and engagement
      const avgEngagement = this.calculateEngagementLevel(recentAnalytics);
      const avgSentiment = Math.min(1, Math.max(0, avgEngagement)); // Normalize to 0-1
      
      if (existingProfile) {
        await storage.updateContactSentimentProfile(existingProfile.id, {
          averageSentiment: avgSentiment,
          lastAnalyzed: new Date(),
          interactionCount: recentAnalytics.length
        });
      } else {
        const profileData: InsertContactSentimentProfile = {
          userId,
          contactEmail,
          averageSentiment: avgSentiment,
          sentimentTrend: 'stable',
          lastAnalyzed: new Date(),
          interactionCount: recentAnalytics.length,
          communicationStyle: avgSentiment > 0.7 ? 'positive' : avgSentiment < 0.3 ? 'formal' : 'neutral'
        };
        
        await storage.createContactSentimentProfile(profileData);
      }
    } catch (error) {
      console.error('Error updating contact sentiment:', error);
    }
  }
}

export const emailPerformanceService = new EmailPerformanceService();