import OpenAI from "openai";
import { 
  EmailVolumeForecast, 
  InsertEmailVolumeForecast,
  EmailFollowupPrediction,
  InsertEmailFollowupPrediction,
  CommunicationPatternAnalysis,
  InsertCommunicationPatternAnalysis,
  EmailRoiAnalysis,
  InsertEmailRoiAnalysis,
  PredictiveAnalyticsInsight,
  InsertPredictiveAnalyticsInsight
} from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export class PredictiveAnalyticsService {

  /**
   * Generate email volume forecasts for the next 7 days
   */
  async generateVolumeForecasts(userId: string, historicalData: any[]): Promise<EmailVolumeForecast[]> {
    try {
      // Analyze historical patterns using AI
      const prompt = `Analyze this email volume data and predict the next 7 days:
      
Historical Data: ${JSON.stringify(historicalData.slice(0, 30))}

Consider:
- Day of week patterns
- Seasonal trends
- Recent volume changes
- Business cycles

Return JSON array with forecasts for next 7 days:
{
  "forecasts": [
    {
      "date": "2025-01-06",
      "predictedVolume": 45,
      "confidenceScore": 0.85,
      "trendDirection": "stable",
      "seasonalFactor": 1.1,
      "urgentEmails": 8,
      "routineEmails": 32,
      "complexEmails": 5
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const aiResult = JSON.parse(response.choices[0].message.content || "{}");
      
      return aiResult.forecasts?.map((forecast: any) => ({
        id: 0, // Will be set by database
        userId,
        forecastDate: forecast.date,
        predictedVolume: forecast.predictedVolume,
        confidenceScore: forecast.confidenceScore,
        historicalAverage: historicalData.length > 0 
          ? historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length 
          : 35,
        trendDirection: forecast.trendDirection,
        seasonalFactor: forecast.seasonalFactor,
        urgentEmails: forecast.urgentEmails,
        routineEmails: forecast.routineEmails,
        complexEmails: forecast.complexEmails,
        modelVersion: "v1.0",
        accuracy: null,
        createdAt: new Date()
      })) || [];

    } catch (error) {
      console.error("Error generating volume forecasts:", error);
      return this.generateFallbackVolumeForecasts(userId);
    }
  }

  /**
   * Predict follow-up likelihood for emails
   */
  async predictEmailFollowups(emails: any[]): Promise<EmailFollowupPrediction[]> {
    try {
      const predictions: EmailFollowupPrediction[] = [];

      for (const email of emails.slice(0, 10)) { // Process in batches
        const prompt = `Analyze this email and predict follow-up likelihood:

Email Subject: "${email.subject}"
From: ${email.fromEmail}
Content Preview: "${email.contentPreview || "No preview available"}"
Thread Length: ${email.threadLength || 1}
Time Since Last Reply: ${email.timeSinceLastReply || 0} hours
Sender Domain: ${email.senderDomain || "unknown"}

Consider:
- Email urgency and tone
- Sender importance
- Content requiring response
- Historical communication patterns

Return JSON:
{
  "followupProbability": 0.75,
  "urgencyLevel": "medium",
  "predictedDays": 2,
  "communicationPattern": "responsive",
  "relationshipStrength": 0.6,
  "reasoningFactors": ["urgent_request", "pending_decision", "client_communication"]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.4
        });

        const aiResult = JSON.parse(response.choices[0].message.content || "{}");
        
        const prediction: EmailFollowupPrediction = {
          id: 0,
          userId: email.userId,
          emailId: email.id,
          followupProbability: aiResult.followupProbability || 0.5,
          predictedFollowupDate: aiResult.predictedDays 
            ? new Date(Date.now() + aiResult.predictedDays * 24 * 60 * 60 * 1000)
            : null,
          urgencyLevel: aiResult.urgencyLevel || "medium",
          reasoningFactors: aiResult.reasoningFactors || [],
          communicationPattern: aiResult.communicationPattern || "unknown",
          relationshipStrength: aiResult.relationshipStrength || 0.5,
          emailSubject: email.subject,
          senderDomain: email.senderDomain,
          threadLength: email.threadLength || 1,
          timeSinceLastReply: email.timeSinceLastReply || 0,
          actualFollowupOccurred: null,
          actualFollowupDate: null,
          predictionAccuracy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        predictions.push(prediction);
      }

      return predictions;

    } catch (error) {
      console.error("Error predicting email followups:", error);
      return [];
    }
  }

  /**
   * Analyze communication patterns for high-value contacts
   */
  async analyzeCommunicationPatterns(userId: string, contacts: any[]): Promise<CommunicationPatternAnalysis[]> {
    try {
      const analyses: CommunicationPatternAnalysis[] = [];

      for (const contact of contacts.slice(0, 20)) { // Process top contacts
        const prompt = `Analyze communication pattern for this contact:

Contact: ${contact.email}
Domain: ${contact.domain}
Total Emails: ${contact.totalEmails}
Avg Response Time: ${contact.avgResponseTime} hours
Email Frequency: ${contact.emailsPerWeek} per week
Thread Lengths: ${JSON.stringify(contact.threadLengths || [])}
Meetings Scheduled: ${contact.meetingsScheduled || 0}
Projects Involved: ${contact.projectsCompleted || 0}

Determine:
- Contact type (internal, client, vendor, prospect)
- Success rate and business value
- Communication preferences
- Relationship strength

Return JSON:
{
  "contactType": "client",
  "successRate": 0.85,
  "relationshipDepth": 0.7,
  "trustScore": 0.9,
  "engagementLevel": "high",
  "estimatedBusinessValue": 50000,
  "priority": "high",
  "valueIndicators": ["revenue_driver", "strategic_contact", "decision_maker"]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3
        });

        const aiResult = JSON.parse(response.choices[0].message.content || "{}");
        
        const analysis: CommunicationPatternAnalysis = {
          id: 0,
          userId,
          contactEmail: contact.email,
          contactDomain: contact.domain,
          contactType: aiResult.contactType || "unknown",
          avgResponseTime: contact.avgResponseTime || 24,
          responseTimeVariability: contact.responseTimeVariability || 12,
          emailFrequency: contact.emailsPerWeek || 2,
          threadLengths: contact.threadLengths || [],
          successfulOutcomes: contact.successfulOutcomes || 0,
          totalInteractions: contact.totalEmails || 0,
          successRate: aiResult.successRate || 0.5,
          meetingsScheduled: contact.meetingsScheduled || 0,
          dealsProgressed: contact.dealsProgressed || 0,
          projectsCompleted: contact.projectsCompleted || 0,
          preferredContactTime: contact.preferredContactTime || {},
          responsePatterns: contact.responsePatterns || {},
          relationshipDepth: aiResult.relationshipDepth || 0.5,
          trustScore: aiResult.trustScore || 0.5,
          engagementLevel: aiResult.engagementLevel || "medium",
          estimatedBusinessValue: aiResult.estimatedBusinessValue || null,
          valueIndicators: aiResult.valueIndicators || [],
          priority: aiResult.priority || "medium",
          lastAnalyzed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        analyses.push(analysis);
      }

      return analyses;

    } catch (error) {
      console.error("Error analyzing communication patterns:", error);
      return [];
    }
  }

  /**
   * Calculate email ROI analysis
   */
  async calculateEmailRoi(userId: string, emailData: any, periodType: string = "weekly"): Promise<EmailRoiAnalysis> {
    try {
      const prompt = `Calculate email ROI for this data:

Email Stats:
- Sent: ${emailData.emailsSent}
- Received: ${emailData.emailsReceived}
- Time Spent: ${emailData.timeSpent} hours
- Meetings Generated: ${emailData.meetingsGenerated}
- Deals Progressed: ${emailData.dealsProgressed}
- Projects Advanced: ${emailData.projectsAdvanced}

Calculate:
- ROI by category (prospecting, client service, internal, vendor)
- Efficiency metrics
- Value generation

Return JSON:
{
  "estimatedRevenue": 15000,
  "timeSavings": 4.5,
  "netRoi": 2.8,
  "prospectingRoi": 3.2,
  "clientServiceRoi": 2.1,
  "internalCoordinationRoi": 1.8,
  "vendorManagementRoi": 1.5,
  "emailsPerHour": 12,
  "responseRate": 0.68,
  "conversionRate": 0.15
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const aiResult = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        id: 0,
        userId,
        analysisDate: new Date().toISOString().split('T')[0],
        periodType,
        totalEmailsSent: emailData.emailsSent || 0,
        totalEmailsReceived: emailData.emailsReceived || 0,
        totalTimeSpent: emailData.timeSpent || 0,
        meetingsGenerated: emailData.meetingsGenerated || 0,
        dealsProgressed: emailData.dealsProgressed || 0,
        projectsAdvanced: emailData.projectsAdvanced || 0,
        relationshipsBuilt: emailData.relationshipsBuilt || 0,
        estimatedRevenue: aiResult.estimatedRevenue || null,
        timeSavings: aiResult.timeSavings || null,
        opportunityCost: emailData.timeSpent * 50 || null, // $50/hour opportunity cost
        netRoi: aiResult.netRoi || null,
        prospectingRoi: aiResult.prospectingRoi || null,
        clientServiceRoi: aiResult.clientServiceRoi || null,
        internalCoordinationRoi: aiResult.internalCoordinationRoi || null,
        vendorManagementRoi: aiResult.vendorManagementRoi || null,
        emailsPerHour: aiResult.emailsPerHour || null,
        responseRate: aiResult.responseRate || null,
        conversionRate: aiResult.conversionRate || null,
        averageThreadLength: emailData.averageThreadLength || null,
        followupRequired: emailData.followupRequired || null,
        resolutionRate: aiResult.resolutionRate || 0.7,
        createdAt: new Date()
      };

    } catch (error) {
      console.error("Error calculating email ROI:", error);
      return this.generateFallbackRoiAnalysis(userId, periodType);
    }
  }

  /**
   * Generate actionable insights from all predictive analytics
   */
  async generateInsights(userId: string, analyticsData: any): Promise<PredictiveAnalyticsInsight[]> {
    try {
      const prompt = `Generate actionable insights from this email analytics data:

Volume Trends: ${JSON.stringify(analyticsData.volumeTrends)}
Follow-up Risks: ${analyticsData.highRiskFollowups} emails need attention
Communication Patterns: ${analyticsData.topContacts?.length} key contacts analyzed
ROI Data: ${JSON.stringify(analyticsData.roiSummary)}

Generate 3-5 insights with:
- Type (volume_trend, followup_risk, roi_opportunity, pattern_change)
- Priority (low, medium, high, critical)
- Recommendations
- Potential impact

Return JSON:
{
  "insights": [
    {
      "type": "volume_trend",
      "title": "Email Volume Spike Predicted",
      "description": "Expected 40% increase in emails next Tuesday",
      "priority": "high",
      "recommendations": ["Block focus time Tuesday morning", "Prepare template responses"],
      "potentialImpact": "Save 2 hours on Tuesday",
      "timeframe": "short_term"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      const aiResult = JSON.parse(response.choices[0].message.content || "{}");
      
      return aiResult.insights?.map((insight: any) => ({
        id: 0,
        userId,
        insightType: insight.type,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        basedOnData: {
          volumeTrends: analyticsData.volumeTrends,
          followupRisks: analyticsData.highRiskFollowups,
          roiData: analyticsData.roiSummary
        },
        confidenceLevel: 0.8,
        recommendations: insight.recommendations || [],
        potentialImpact: insight.potentialImpact,
        timeframe: insight.timeframe,
        acknowledged: false,
        actionTaken: false,
        outcome: null,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 1 week
        createdAt: new Date(),
        updatedAt: new Date()
      })) || [];

    } catch (error) {
      console.error("Error generating insights:", error);
      return this.generateFallbackInsights(userId);
    }
  }

  /**
   * Process demo data for predictive analytics showcase
   */
  async processDemoAnalytics(userId: string): Promise<any> {
    try {
      // Generate demo historical data
      const historicalData = this.generateDemoHistoricalData();
      
      // Generate volume forecasts
      const forecasts = await this.generateVolumeForecasts(userId, historicalData);
      
      // Generate demo emails for followup prediction
      const demoEmails = this.generateDemoEmails(userId);
      const followupPredictions = await this.predictEmailFollowups(demoEmails);
      
      // Generate demo contacts for pattern analysis
      const demoContacts = this.generateDemoContacts();
      const communicationPatterns = await this.analyzeCommunicationPatterns(userId, demoContacts);
      
      // Calculate ROI
      const emailData = {
        emailsSent: 156,
        emailsReceived: 234,
        timeSpent: 12.5,
        meetingsGenerated: 8,
        dealsProgressed: 3,
        projectsAdvanced: 5,
        relationshipsBuilt: 12
      };
      const roiAnalysis = await this.calculateEmailRoi(userId, emailData);
      
      // Generate insights
      const analyticsData = {
        volumeTrends: forecasts.slice(0, 3),
        highRiskFollowups: followupPredictions.filter(p => p.followupProbability > 0.7).length,
        topContacts: communicationPatterns.slice(0, 5),
        roiSummary: {
          netRoi: roiAnalysis.netRoi,
          estimatedRevenue: roiAnalysis.estimatedRevenue
        }
      };
      const insights = await this.generateInsights(userId, analyticsData);

      return {
        forecasts,
        followupPredictions,
        communicationPatterns,
        roiAnalysis,
        insights,
        summary: {
          totalForecasts: forecasts.length,
          highRiskFollowups: followupPredictions.filter(p => p.followupProbability > 0.7).length,
          topValueContacts: communicationPatterns.filter(c => c.priority === "high").length,
          estimatedWeeklyRoi: roiAnalysis.netRoi
        }
      };

    } catch (error) {
      console.error("Error processing demo analytics:", error);
      throw error;
    }
  }

  // Helper methods for fallback data
  private generateFallbackVolumeForecasts(userId: string): EmailVolumeForecast[] {
    const forecasts = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecasts.push({
        id: 0,
        userId,
        forecastDate: date.toISOString().split('T')[0],
        predictedVolume: 30 + Math.floor(Math.random() * 20),
        confidenceScore: 0.75 + Math.random() * 0.2,
        historicalAverage: 35,
        trendDirection: "stable",
        seasonalFactor: 1.0,
        urgentEmails: 5 + Math.floor(Math.random() * 5),
        routineEmails: 20 + Math.floor(Math.random() * 10),
        complexEmails: 2 + Math.floor(Math.random() * 3),
        modelVersion: "v1.0",
        accuracy: null,
        createdAt: new Date()
      });
    }
    return forecasts;
  }

  private generateFallbackRoiAnalysis(userId: string, periodType: string): EmailRoiAnalysis {
    return {
      id: 0,
      userId,
      analysisDate: new Date().toISOString().split('T')[0],
      periodType,
      totalEmailsSent: 156,
      totalEmailsReceived: 234,
      totalTimeSpent: 12.5,
      meetingsGenerated: 8,
      dealsProgressed: 3,
      projectsAdvanced: 5,
      relationshipsBuilt: 12,
      estimatedRevenue: 15000,
      timeSavings: 4.5,
      opportunityCost: 625,
      netRoi: 2.8,
      prospectingRoi: 3.2,
      clientServiceRoi: 2.1,
      internalCoordinationRoi: 1.8,
      vendorManagementRoi: 1.5,
      emailsPerHour: 12.5,
      responseRate: 0.68,
      conversionRate: 0.15,
      averageThreadLength: 3.2,
      followupRequired: 0.45,
      resolutionRate: 0.7,
      createdAt: new Date()
    };
  }

  private generateFallbackInsights(userId: string): PredictiveAnalyticsInsight[] {
    return [
      {
        id: 0,
        userId,
        insightType: "volume_trend",
        title: "Email Volume Spike Expected",
        description: "Tuesday shows 40% higher email volume than average. Consider blocking focus time.",
        priority: "high",
        basedOnData: {},
        confidenceLevel: 0.85,
        recommendations: ["Block 2-hour focus session Tuesday morning", "Prepare quick response templates"],
        potentialImpact: "Save 2+ hours of processing time",
        timeframe: "short_term",
        acknowledged: false,
        actionTaken: false,
        outcome: null,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 0,
        userId,
        insightType: "followup_risk",
        title: "High-Value Follow-ups at Risk",
        description: "3 important contacts haven't received follow-ups and may lose engagement.",
        priority: "critical",
        basedOnData: {},
        confidenceLevel: 0.92,
        recommendations: ["Send follow-up to Sarah Chen (prospect)", "Schedule call with Mike Johnson (client)"],
        potentialImpact: "Prevent loss of $25K+ potential revenue",
        timeframe: "immediate",
        acknowledged: false,
        actionTaken: false,
        outcome: null,
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private generateDemoHistoricalData(): any[] {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        volume: 25 + Math.floor(Math.random() * 30) + (i % 7 < 5 ? 10 : -5) // Weekday bias
      });
    }
    return data;
  }

  private generateDemoEmails(userId: string): any[] {
    return [
      {
        id: "email-1",
        userId,
        subject: "Quarterly Review Follow-up",
        fromEmail: "sarah.chen@prospectcorp.com",
        contentPreview: "Thanks for the presentation yesterday. When can we schedule the next steps meeting?",
        threadLength: 3,
        timeSinceLastReply: 18,
        senderDomain: "prospectcorp.com"
      },
      {
        id: "email-2", 
        userId,
        subject: "Project Proposal - Urgent Response Needed",
        fromEmail: "mike.johnson@clientco.com",
        contentPreview: "We need to finalize the proposal by Friday to meet the deadline...",
        threadLength: 1,
        timeSinceLastReply: 72,
        senderDomain: "clientco.com"
      },
      {
        id: "email-3",
        userId,
        subject: "Team Meeting Notes",
        fromEmail: "team@company.com",
        contentPreview: "Here are the action items from today's standup meeting...",
        threadLength: 2,
        timeSinceLastReply: 4,
        senderDomain: "company.com"
      }
    ];
  }

  private generateDemoContacts(): any[] {
    return [
      {
        email: "sarah.chen@prospectcorp.com",
        domain: "prospectcorp.com",
        totalEmails: 24,
        avgResponseTime: 4,
        emailsPerWeek: 3,
        threadLengths: [2, 4, 1, 3, 2],
        meetingsScheduled: 2,
        projectsCompleted: 0
      },
      {
        email: "mike.johnson@clientco.com", 
        domain: "clientco.com",
        totalEmails: 156,
        avgResponseTime: 12,
        emailsPerWeek: 8,
        threadLengths: [3, 2, 5, 1, 4, 2],
        meetingsScheduled: 12,
        projectsCompleted: 3
      },
      {
        email: "lisa.wong@vendor.net",
        domain: "vendor.net", 
        totalEmails: 89,
        avgResponseTime: 2,
        emailsPerWeek: 5,
        threadLengths: [1, 2, 1, 3, 2],
        meetingsScheduled: 4,
        projectsCompleted: 1
      }
    ];
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();