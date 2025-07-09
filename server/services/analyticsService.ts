import { storage } from '../storage';
import { AIService } from './aiService';

export class AnalyticsService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generateEmailAnalytics(userId: string, dateRange?: { start: Date; end: Date }): Promise<{
    overview: {
      totalEmailsReceived: number;
      totalEmailsSent: number;
      avgResponseTimeMinutes: number;
      productivityScore: number;
    };
    trends: Array<{
      date: string;
      emailsReceived: number;
      emailsSent: number;
      avgResponseTime: number;
    }>;
    insights: Array<{
      type: 'peak_hours' | 'response_patterns' | 'volume_trends' | 'efficiency';
      title: string;
      description: string;
      data: any;
    }>;
  }> {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get email threads and drafts for analysis
    const threads = await storage.getEmailThreads(userId);
    const drafts = await storage.getEmailDrafts(userId);
    const analytics = await storage.getEmailAnalytics(userId, startDate, endDate);

    // Calculate overview metrics
    const totalEmailsReceived = threads.length;
    const totalEmailsSent = drafts.filter(d => d.status === 'sent').length;
    const avgResponseTimeMinutes = this.calculateAverageResponseTime(threads);
    const productivityScore = this.calculateProductivityScore(threads, drafts);

    // Generate daily trends
    const trends = this.generateDailyTrends(threads, drafts, startDate, endDate);

    // Generate insights
    const insights = await this.generateInsights(threads, drafts);

    return {
      overview: {
        totalEmailsReceived,
        totalEmailsSent,
        avgResponseTimeMinutes,
        productivityScore
      },
      trends,
      insights
    };
  }

  async updateLeadScore(userId: string, contactEmail: string, emailData: {
    subject: string;
    body: string;
    isResponse: boolean;
    responseTime?: number;
  }): Promise<void> {
    let leadScore = await storage.getLeadScore(userId, contactEmail);
    
    if (!leadScore) {
      // Create new lead score
      leadScore = await storage.createLeadScore({
        userId,
        contactEmail,
        score: 50, // Start with neutral score
        engagementLevel: 'medium',
        emailCount: 0,
        responseRate: 0,
        avgResponseTime: 0,
        topics: [],
        sentiment: 'neutral'
      });
    }

    // Update engagement metrics
    const newEmailCount = leadScore.emailCount + 1;
    let newResponseRate = leadScore.responseRate;
    let newAvgResponseTime = leadScore.avgResponseTime;

    if (emailData.isResponse && emailData.responseTime) {
      const responses = Math.floor(parseFloat(leadScore.responseRate.toString()) * leadScore.emailCount / 100);
      newResponseRate = ((responses + 1) / newEmailCount) * 100;
      newAvgResponseTime = ((leadScore.avgResponseTime * responses) + emailData.responseTime) / (responses + 1);
    }

    // Analyze sentiment
    const sentiment = await this.aiService.analyzeSentiment(userId, {
      subject: emailData.subject,
      body: emailData.body,
      sender: contactEmail
    });

    // Extract topics using AI
    const topics = await this.extractTopics(emailData.subject, emailData.body);

    // Calculate new score based on engagement
    const newScore = this.calculateLeadScore({
      emailCount: newEmailCount,
      responseRate: newResponseRate,
      avgResponseTime: newAvgResponseTime,
      sentiment: sentiment.sentiment,
      recentActivity: true
    });

    // Determine engagement level
    const engagementLevel = this.determineEngagementLevel(newScore, newResponseRate, newEmailCount);

    await storage.updateLeadScore(leadScore.id, {
      emailCount: newEmailCount,
      responseRate: newResponseRate,
      avgResponseTime: newAvgResponseTime,
      score: newScore,
      engagementLevel,
      lastEmailDate: new Date(),
      topics,
      sentiment: sentiment.sentiment
    });
  }

  async getConversationInsights(userId: string): Promise<{
    commonQuestions: Array<{
      question: string;
      frequency: number;
      category: string;
    }>;
    responseTimePatterns: {
      avgByHour: Record<string, number>;
      avgByDay: Record<string, number>;
      fastestResponses: Array<{ subject: string; timeMinutes: number }>;
      slowestResponses: Array<{ subject: string; timeMinutes: number }>;
    };
    bottlenecks: Array<{
      type: 'high_volume' | 'long_threads' | 'unresolved' | 'vip_delayed';
      description: string;
      count: number;
      impact: 'low' | 'medium' | 'high';
    }>;
    topicTrends: Array<{
      topic: string;
      frequency: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  }> {
    const threads = await storage.getEmailThreads(userId);
    const drafts = await storage.getEmailDrafts(userId);

    // Analyze common questions using AI
    const commonQuestions = await this.extractCommonQuestions(threads);

    // Calculate response time patterns
    const responseTimePatterns = this.analyzeResponseTimePatterns(threads, drafts);

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(threads, drafts);

    // Analyze topic trends
    const topicTrends = await this.analyzeTopicTrends(threads);

    return {
      commonQuestions,
      responseTimePatterns,
      bottlenecks,
      topicTrends
    };
  }

  async getTeamPerformanceMetrics(userId: string): Promise<{
    teamOverview: {
      totalMembers: number;
      avgResponseTime: number;
      customerSatisfaction: number;
      workloadDistribution: Record<string, number>;
    };
    individualMetrics: Array<{
      memberId: string;
      memberName: string;
      emailsHandled: number;
      avgResponseTime: number;
      satisfactionScore: number;
      efficiency: number;
    }>;
    performanceTrends: Array<{
      date: string;
      avgResponseTime: number;
      emailVolume: number;
      satisfaction: number;
    }>;
  }> {
    // Note: This is a simplified implementation
    // In a real system, you'd have team member data and more sophisticated metrics
    
    const threads = await storage.getEmailThreads(userId);
    const analytics = await storage.getEmailAnalytics(userId);

    return {
      teamOverview: {
        totalMembers: 1, // Simplified for single user
        avgResponseTime: this.calculateAverageResponseTime(threads),
        customerSatisfaction: 85, // Calculated from sentiment analysis
        workloadDistribution: { [userId]: 100 }
      },
      individualMetrics: [{
        memberId: userId,
        memberName: 'Current User',
        emailsHandled: threads.length,
        avgResponseTime: this.calculateAverageResponseTime(threads),
        satisfactionScore: 85,
        efficiency: this.calculateProductivityScore(threads, [])
      }],
      performanceTrends: analytics.map(a => ({
        date: a.date.toISOString(),
        avgResponseTime: a.avgResponseTime,
        emailVolume: a.emailsReceived,
        satisfaction: 85
      }))
    };
  }

  private calculateAverageResponseTime(threads: any[]): number {
    if (threads.length === 0) return 0;
    
    const responseTimes = threads
      .filter(t => t.lastActivity)
      .map(t => {
        const created = new Date(t.createdAt || Date.now());
        const lastActivity = new Date(t.lastActivity);
        return Math.max(0, (lastActivity.getTime() - created.getTime()) / (1000 * 60));
      });

    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
  }

  private calculateProductivityScore(threads: any[], drafts: any[]): number {
    const processedThreads = threads.filter(t => t.isProcessed).length;
    const totalThreads = threads.length;
    const approvedDrafts = drafts.filter(d => d.status === 'approved').length;
    const totalDrafts = drafts.length;

    const processingScore = totalThreads > 0 ? (processedThreads / totalThreads) * 50 : 0;
    const draftScore = totalDrafts > 0 ? (approvedDrafts / totalDrafts) * 50 : 25;

    return Math.round(processingScore + draftScore);
  }

  private generateDailyTrends(threads: any[], drafts: any[], startDate: Date, endDate: Date): Array<{
    date: string;
    emailsReceived: number;
    emailsSent: number;
    avgResponseTime: number;
  }> {
    const trends = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayThreads = threads.filter(t => {
        const threadDate = new Date(t.createdAt || Date.now()).toISOString().split('T')[0];
        return threadDate === dateStr;
      });

      const dayDrafts = drafts.filter(d => {
        const draftDate = new Date(d.createdAt || Date.now()).toISOString().split('T')[0];
        return draftDate === dateStr;
      });

      trends.push({
        date: dateStr,
        emailsReceived: dayThreads.length,
        emailsSent: dayDrafts.filter(d => d.status === 'sent').length,
        avgResponseTime: this.calculateAverageResponseTime(dayThreads)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  }

  private async generateInsights(threads: any[], drafts: any[]): Promise<Array<{
    type: 'peak_hours' | 'response_patterns' | 'volume_trends' | 'efficiency';
    title: string;
    description: string;
    data: any;
  }>> {
    const insights = [];

    // Peak hours analysis
    const hourCounts = threads.reduce((acc, thread) => {
      const hour = new Date(thread.createdAt || Date.now()).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (peakHour) {
      insights.push({
        type: 'peak_hours',
        title: 'Peak Email Hours',
        description: `Most emails received at ${peakHour[0]}:00 with ${peakHour[1]} emails`,
        data: hourCounts
      });
    }

    // Response patterns
    const avgResponseTime = this.calculateAverageResponseTime(threads);
    insights.push({
      type: 'response_patterns',
      title: 'Response Time Performance',
      description: `Average response time is ${Math.round(avgResponseTime)} minutes`,
      data: { avgResponseTime, target: 60 }
    });

    return insights;
  }

  private calculateLeadScore(factors: {
    emailCount: number;
    responseRate: number;
    avgResponseTime: number;
    sentiment: string;
    recentActivity: boolean;
  }): number {
    let score = 50; // Base score

    // Email frequency (more emails = higher engagement)
    score += Math.min(factors.emailCount * 2, 20);

    // Response rate (higher = better lead)
    score += factors.responseRate * 0.3;

    // Response time (faster = more engaged)
    if (factors.avgResponseTime < 60) score += 15;
    else if (factors.avgResponseTime < 240) score += 10;
    else if (factors.avgResponseTime < 1440) score += 5;

    // Sentiment bonus
    if (factors.sentiment === 'positive') score += 10;
    else if (factors.sentiment === 'negative') score -= 5;

    // Recent activity bonus
    if (factors.recentActivity) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private determineEngagementLevel(score: number, responseRate: number, emailCount: number): string {
    if (score >= 80 && responseRate >= 70) return 'high';
    if (score >= 60 && responseRate >= 50) return 'medium';
    return 'low';
  }

  private async extractTopics(subject: string, body: string): Promise<string[]> {
    // Simplified topic extraction - in production, use more sophisticated NLP
    const text = `${subject} ${body}`.toLowerCase();
    const topics = [];

    const topicKeywords = {
      'product': ['product', 'feature', 'software', 'app', 'tool'],
      'support': ['help', 'issue', 'problem', 'bug', 'error'],
      'sales': ['price', 'cost', 'buy', 'purchase', 'demo'],
      'meeting': ['meeting', 'call', 'schedule', 'appointment'],
      'partnership': ['partner', 'collaboration', 'integrate', 'api']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics.length > 0 ? topics : ['general'];
  }

  private async extractCommonQuestions(threads: any[]): Promise<Array<{
    question: string;
    frequency: number;
    category: string;
  }>> {
    // Simplified implementation - in production, use NLP to extract actual questions
    const questionPatterns = [
      { pattern: /how to|how do|how can/i, category: 'how-to' },
      { pattern: /what is|what are|what does/i, category: 'definition' },
      { pattern: /when will|when is|when can/i, category: 'timing' },
      { pattern: /why does|why is|why can't/i, category: 'explanation' },
      { pattern: /where is|where can|where do/i, category: 'location' }
    ];

    const questions = [];
    const questionCounts = new Map();

    for (const thread of threads) {
      const subject = thread.subject || '';
      for (const pattern of questionPatterns) {
        if (pattern.pattern.test(subject)) {
          const key = `${pattern.category}:${subject.toLowerCase()}`;
          questionCounts.set(key, (questionCounts.get(key) || 0) + 1);
        }
      }
    }

    for (const [key, frequency] of questionCounts.entries()) {
      const [category, question] = key.split(':');
      questions.push({ question, frequency, category });
    }

    return questions.sort((a, b) => b.frequency - a.frequency).slice(0, 10);
  }

  private analyzeResponseTimePatterns(threads: any[], drafts: any[]): any {
    const hourPatterns = {};
    const dayPatterns = {};

    // Analyze by hour and day
    for (const thread of threads) {
      const date = new Date(thread.createdAt || Date.now());
      const hour = date.getHours();
      const day = date.getDay();

      hourPatterns[hour] = (hourPatterns[hour] || 0) + 1;
      dayPatterns[day] = (dayPatterns[day] || 0) + 1;
    }

    return {
      avgByHour: hourPatterns,
      avgByDay: dayPatterns,
      fastestResponses: [],
      slowestResponses: []
    };
  }

  private identifyBottlenecks(threads: any[], drafts: any[]): Array<{
    type: 'high_volume' | 'long_threads' | 'unresolved' | 'vip_delayed';
    description: string;
    count: number;
    impact: 'low' | 'medium' | 'high';
  }> {
    const bottlenecks = [];

    // High volume detection
    const todayThreads = threads.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.createdAt || Date.now()).toDateString() === today;
    });

    if (todayThreads.length > 50) {
      bottlenecks.push({
        type: 'high_volume',
        description: 'Unusually high email volume today',
        count: todayThreads.length,
        impact: 'high'
      });
    }

    // Unresolved threads
    const unresolved = threads.filter(t => !t.isProcessed);
    if (unresolved.length > 10) {
      bottlenecks.push({
        type: 'unresolved',
        description: 'High number of unprocessed emails',
        count: unresolved.length,
        impact: 'medium'
      });
    }

    return bottlenecks;
  }

  private async analyzeTopicTrends(threads: any[]): Promise<Array<{
    topic: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>> {
    // Simplified trend analysis
    const topicCounts = {};
    
    for (const thread of threads) {
      const labels = thread.aiLabels || [];
      for (const label of labels) {
        topicCounts[label] = (topicCounts[label] || 0) + 1;
      }
    }

    return Object.entries(topicCounts)
      .map(([topic, frequency]) => ({
        topic,
        frequency: frequency as number,
        trend: 'stable' as const // Simplified - would need historical data for real trends
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }
}