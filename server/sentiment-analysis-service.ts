import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' | 'frustrated';
  confidence: number;
  emotion: string;
  reasoning: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  tone: string;
  keyPhrases: string[];
}

export interface EmailSentimentData {
  emailId: string;
  subject: string;
  content: string;
  sender: string;
  timestamp: Date;
  analysis: SentimentAnalysisResult;
}

export class SentimentAnalysisService {
  /**
   * Analyze sentiment of email content using OpenAI GPT-4o
   */
  async analyzeEmailSentiment(emailContent: string, subject?: string): Promise<SentimentAnalysisResult> {
    try {
      const prompt = `Analyze the sentiment and emotional tone of this email:

Subject: ${subject || 'No subject'}
Content: ${emailContent}

Provide a detailed sentiment analysis in JSON format with these fields:
- sentiment: "positive", "neutral", "negative", "urgent", or "frustrated"
- confidence: number between 0 and 1
- emotion: primary emotion detected (happy, sad, angry, excited, worried, etc.)
- reasoning: brief explanation of the sentiment classification
- urgencyLevel: "low", "medium", or "high" based on language urgency
- tone: overall communication tone (professional, casual, formal, friendly, etc.)
- keyPhrases: array of 3-5 key phrases that indicate the sentiment

Consider:
- Word choice and emotional language
- Punctuation patterns (exclamation marks, caps)
- Context and implied meaning
- Professional vs personal communication style
- Urgency indicators and action requests`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert sentiment analysis AI that provides accurate emotional and tonal analysis of email communications. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        sentiment: result.sentiment || 'neutral',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        emotion: result.emotion || 'neutral',
        reasoning: result.reasoning || 'Analysis completed',
        urgencyLevel: result.urgencyLevel || 'low',
        tone: result.tone || 'professional',
        keyPhrases: Array.isArray(result.keyPhrases) ? result.keyPhrases.slice(0, 5) : []
      };
    } catch (error) {
      console.error('Error analyzing email sentiment:', error);
      
      // Fallback sentiment analysis based on basic keyword detection
      return this.basicSentimentAnalysis(emailContent);
    }
  }

  /**
   * Batch analyze multiple emails
   */
  async analyzeMultipleEmails(emails: Array<{ id: string; content: string; subject?: string; sender: string }>): Promise<EmailSentimentData[]> {
    const results: EmailSentimentData[] = [];
    
    for (const email of emails) {
      const analysis = await this.analyzeEmailSentiment(email.content, email.subject);
      results.push({
        emailId: email.id,
        subject: email.subject || '',
        content: email.content,
        sender: email.sender,
        timestamp: new Date(),
        analysis
      });
    }
    
    return results;
  }

  /**
   * Get sentiment statistics for a user's emails
   */
  async getSentimentStatistics(emailAnalyses: EmailSentimentData[]): Promise<{
    positive: number;
    neutral: number;
    negative: number;
    urgent: number;
    frustrated: number;
    totalAnalyzed: number;
    averageConfidence: number;
    topEmotions: Array<{ emotion: string; count: number }>;
    trendData: Array<{ date: string; sentiment: string; count: number }>;
  }> {
    const stats = {
      positive: 0,
      neutral: 0,
      negative: 0,
      urgent: 0,
      frustrated: 0,
      totalAnalyzed: emailAnalyses.length,
      averageConfidence: 0,
      topEmotions: [] as Array<{ emotion: string; count: number }>,
      trendData: [] as Array<{ date: string; sentiment: string; count: number }>
    };

    if (emailAnalyses.length === 0) return stats;

    // Count sentiments
    const emotionCounts: Record<string, number> = {};
    let totalConfidence = 0;

    emailAnalyses.forEach(email => {
      const sentiment = email.analysis.sentiment;
      stats[sentiment as keyof typeof stats]++;
      
      totalConfidence += email.analysis.confidence;
      
      const emotion = email.analysis.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    stats.averageConfidence = totalConfidence / emailAnalyses.length;

    // Get top emotions
    stats.topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate trend data (last 7 days)
    const trendMap: Record<string, Record<string, number>> = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap[dateStr] = { positive: 0, neutral: 0, negative: 0, urgent: 0, frustrated: 0 };
    }

    emailAnalyses.forEach(email => {
      const dateStr = email.timestamp.toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr][email.analysis.sentiment]++;
      }
    });

    stats.trendData = Object.entries(trendMap).flatMap(([date, sentiments]) =>
      Object.entries(sentiments).map(([sentiment, count]) => ({ date, sentiment, count }))
    );

    return stats;
  }

  /**
   * Detect urgent emails requiring immediate attention
   */
  async detectUrgentEmails(emails: Array<{ id: string; content: string; subject?: string; sender: string }>): Promise<Array<EmailSentimentData & { urgencyScore: number }>> {
    const analyses = await this.analyzeMultipleEmails(emails);
    
    return analyses
      .map(email => ({
        ...email,
        urgencyScore: this.calculateUrgencyScore(email.analysis)
      }))
      .filter(email => email.analysis.urgencyLevel === 'high' || email.urgencyScore > 0.7)
      .sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  /**
   * Generate sentiment insights and recommendations
   */
  async generateSentimentInsights(emailAnalyses: EmailSentimentData[]): Promise<{
    insights: string[];
    recommendations: string[];
    alertEmails: EmailSentimentData[];
    positiveHighlights: EmailSentimentData[];
  }> {
    const stats = await this.getSentimentStatistics(emailAnalyses);
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Generate insights
    const positivePercentage = (stats.positive / stats.totalAnalyzed) * 100;
    const negativePercentage = (stats.negative / stats.totalAnalyzed) * 100;
    const urgentPercentage = (stats.urgent / stats.totalAnalyzed) * 100;
    
    if (positivePercentage > 60) {
      insights.push(`Strong positive communication: ${positivePercentage.toFixed(0)}% of emails show positive sentiment`);
    }
    
    if (negativePercentage > 20) {
      insights.push(`High negative sentiment detected: ${negativePercentage.toFixed(0)}% of emails require attention`);
    }
    
    if (urgentPercentage > 15) {
      insights.push(`Many urgent communications: ${urgentPercentage.toFixed(0)}% of emails marked as urgent`);
      recommendations.push('Consider prioritizing urgent email responses to improve communication flow');
    }
    
    if (stats.averageConfidence > 0.8) {
      insights.push(`High confidence analysis: ${(stats.averageConfidence * 100).toFixed(0)}% average accuracy`);
    }

    // Generate recommendations
    if (negativePercentage > 15) {
      recommendations.push('Review negative sentiment emails for potential issues requiring immediate attention');
    }
    
    if (stats.frustrated > 0) {
      recommendations.push('Address frustrated communications promptly to maintain positive relationships');
    }
    
    const alertEmails = emailAnalyses.filter(email => 
      email.analysis.sentiment === 'negative' || 
      email.analysis.sentiment === 'frustrated' ||
      email.analysis.urgencyLevel === 'high'
    );
    
    const positiveHighlights = emailAnalyses
      .filter(email => email.analysis.sentiment === 'positive' && email.analysis.confidence > 0.8)
      .slice(0, 3);

    return {
      insights,
      recommendations,
      alertEmails,
      positiveHighlights
    };
  }

  /**
   * Basic sentiment analysis fallback
   */
  private basicSentimentAnalysis(content: string): SentimentAnalysisResult {
    const text = content.toLowerCase();
    
    const positiveWords = ['thank', 'great', 'excellent', 'good', 'appreciate', 'wonderful', 'amazing', 'perfect'];
    const negativeWords = ['urgent', 'asap', 'immediately', 'problem', 'issue', 'error', 'wrong', 'bad', 'terrible'];
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'deadline'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    let urgentScore = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });
    
    urgentWords.forEach(word => {
      if (text.includes(word)) urgentScore++;
    });
    
    let sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' | 'frustrated' = 'neutral';
    let emotion = 'neutral';
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (urgentScore > 0) {
      sentiment = 'urgent';
      emotion = 'stressed';
      urgencyLevel = 'high';
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      emotion = 'concerned';
      urgencyLevel = negativeScore > 2 ? 'high' : 'medium';
    } else if (positiveScore > 0) {
      sentiment = 'positive';
      emotion = 'happy';
    }
    
    return {
      sentiment,
      confidence: 0.6,
      emotion,
      reasoning: 'Basic keyword-based analysis',
      urgencyLevel,
      tone: 'professional',
      keyPhrases: []
    };
  }

  /**
   * Calculate urgency score based on analysis
   */
  private calculateUrgencyScore(analysis: SentimentAnalysisResult): number {
    let score = 0;
    
    if (analysis.urgencyLevel === 'high') score += 0.4;
    else if (analysis.urgencyLevel === 'medium') score += 0.2;
    
    if (analysis.sentiment === 'urgent') score += 0.3;
    if (analysis.sentiment === 'frustrated') score += 0.2;
    if (analysis.sentiment === 'negative') score += 0.1;
    
    score += analysis.confidence * 0.3;
    
    return Math.min(1, score);
  }

  /**
   * Generate demo sentiment data for testing
   */
  generateDemoSentimentData(): EmailSentimentData[] {
    return [
      {
        emailId: 'demo-1',
        subject: 'Thank you for the great meeting!',
        content: 'Hi there! I wanted to thank you for taking the time to meet with me yesterday. The discussion was incredibly valuable and I appreciate your insights.',
        sender: 'client@company.com',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        analysis: {
          sentiment: 'positive',
          confidence: 0.92,
          emotion: 'grateful',
          reasoning: 'Expresses gratitude and appreciation with positive language',
          urgencyLevel: 'low',
          tone: 'friendly',
          keyPhrases: ['thank you', 'great meeting', 'incredibly valuable', 'appreciate']
        }
      },
      {
        emailId: 'demo-2',
        subject: 'URGENT: System down - need immediate help',
        content: 'Our main system is completely down and we need immediate assistance. This is blocking all our operations and we need this fixed ASAP!',
        sender: 'support@emergency.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        analysis: {
          sentiment: 'urgent',
          confidence: 0.95,
          emotion: 'stressed',
          reasoning: 'Contains urgent language, system failure, and demands immediate action',
          urgencyLevel: 'high',
          tone: 'urgent',
          keyPhrases: ['URGENT', 'completely down', 'immediate assistance', 'ASAP']
        }
      },
      {
        emailId: 'demo-3',
        subject: 'Weekly project update',
        content: 'Here is the weekly update on our project progress. Everything is on track and we should meet our deadlines without any issues.',
        sender: 'project@team.com',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        analysis: {
          sentiment: 'neutral',
          confidence: 0.88,
          emotion: 'professional',
          reasoning: 'Factual update with neutral tone and positive progress indicators',
          urgencyLevel: 'low',
          tone: 'professional',
          keyPhrases: ['weekly update', 'on track', 'meet deadlines', 'no issues']
        }
      },
      {
        emailId: 'demo-4',
        subject: 'Frustrated with constant delays',
        content: 'I am really frustrated with these constant delays. This is the third time this month that deadlines have been missed and it\'s affecting our entire workflow.',
        sender: 'frustrated@client.com',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        analysis: {
          sentiment: 'frustrated',
          confidence: 0.89,
          emotion: 'frustrated',
          reasoning: 'Explicitly expresses frustration with ongoing issues and missed deadlines',
          urgencyLevel: 'medium',
          tone: 'critical',
          keyPhrases: ['really frustrated', 'constant delays', 'third time', 'affecting workflow']
        }
      },
      {
        emailId: 'demo-5',
        subject: 'Quick question about invoice',
        content: 'Hi! I have a quick question about the invoice you sent. Could you clarify the payment terms when you have a moment? Thanks!',
        sender: 'billing@vendor.com',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        analysis: {
          sentiment: 'neutral',
          confidence: 0.85,
          emotion: 'polite',
          reasoning: 'Polite inquiry with friendly tone and reasonable request',
          urgencyLevel: 'low',
          tone: 'polite',
          keyPhrases: ['quick question', 'when you have a moment', 'Thanks']
        }
      }
    ];
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();