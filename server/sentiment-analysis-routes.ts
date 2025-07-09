import type { Express } from "express";
import { sentimentAnalysisService } from "./sentiment-analysis-service";
import { storage } from "./storage";

export function registerSentimentAnalysisRoutes(app: Express) {
  // Get sentiment analysis overview for a user
  app.get('/api/sentiment/overview', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId || 'demo-user-123';
      
      // Get demo sentiment data for now
      const sentimentData = sentimentAnalysisService.generateDemoSentimentData();
      
      // Generate statistics and insights
      const stats = await sentimentAnalysisService.getSentimentStatistics(sentimentData);
      const insights = await sentimentAnalysisService.generateSentimentInsights(sentimentData);
      
      res.json({
        stats,
        insights,
        recentAnalyses: sentimentData.slice(0, 10)
      });
    } catch (error) {
      console.error('Error fetching sentiment overview:', error);
      res.status(500).json({ message: 'Failed to fetch sentiment overview' });
    }
  });

  // Analyze sentiment of a single email
  app.post('/api/sentiment/analyze', async (req, res) => {
    try {
      const { content, subject } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Email content is required' });
      }

      const analysis = await sentimentAnalysisService.analyzeEmailSentiment(content, subject);
      
      res.json({ analysis });
    } catch (error) {
      console.error('Error analyzing email sentiment:', error);
      res.status(500).json({ message: 'Failed to analyze email sentiment' });
    }
  });

  // Batch analyze multiple emails
  app.post('/api/sentiment/analyze-batch', async (req, res) => {
    try {
      const { emails } = req.body;
      
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: 'Array of emails is required' });
      }

      const analyses = await sentimentAnalysisService.analyzeMultipleEmails(emails);
      
      res.json({ analyses });
    } catch (error) {
      console.error('Error analyzing emails:', error);
      res.status(500).json({ message: 'Failed to analyze emails' });
    }
  });

  // Get urgent emails based on sentiment analysis
  app.get('/api/sentiment/urgent', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId || 'demo-user-123';
      
      // Get demo emails for urgent analysis
      const demoEmails = [
        {
          id: 'urgent-1',
          content: 'URGENT: The server is down and all our systems are offline. We need immediate assistance to get everything back online. This is blocking all operations!',
          subject: 'CRITICAL: Server Down - Need Help NOW',
          sender: 'support@company.com'
        },
        {
          id: 'urgent-2',
          content: 'I am extremely frustrated with the delayed response. This issue has been ongoing for weeks and nobody seems to care about resolving it.',
          subject: 'Unacceptable service delays',
          sender: 'angry@client.com'
        },
        {
          id: 'urgent-3',
          content: 'Emergency meeting required ASAP. Critical decision needed on the project direction before tomorrow deadline.',
          subject: 'EMERGENCY: Meeting needed TODAY',
          sender: 'ceo@company.com'
        }
      ];
      
      const urgentEmails = await sentimentAnalysisService.detectUrgentEmails(demoEmails);
      
      res.json({ urgentEmails });
    } catch (error) {
      console.error('Error detecting urgent emails:', error);
      res.status(500).json({ message: 'Failed to detect urgent emails' });
    }
  });

  // Get sentiment trends over time
  app.get('/api/sentiment/trends', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId || 'demo-user-123';
      const { days = 7 } = req.query;
      
      // Generate demo trend data
      const sentimentData = sentimentAnalysisService.generateDemoSentimentData();
      const stats = await sentimentAnalysisService.getSentimentStatistics(sentimentData);
      
      res.json({
        trendData: stats.trendData,
        summary: {
          totalAnalyzed: stats.totalAnalyzed,
          averageConfidence: stats.averageConfidence,
          topEmotions: stats.topEmotions
        }
      });
    } catch (error) {
      console.error('Error fetching sentiment trends:', error);
      res.status(500).json({ message: 'Failed to fetch sentiment trends' });
    }
  });

  // Get automated sentiment insights and recommendations
  app.get('/api/sentiment/insights', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId || 'demo-user-123';
      
      const sentimentData = sentimentAnalysisService.generateDemoSentimentData();
      const insights = await sentimentAnalysisService.generateSentimentInsights(sentimentData);
      
      res.json(insights);
    } catch (error) {
      console.error('Error fetching sentiment insights:', error);
      res.status(500).json({ message: 'Failed to fetch sentiment insights' });
    }
  });

  // Test sentiment analysis with custom text
  app.post('/api/sentiment/test', async (req, res) => {
    try {
      const { testText, testSubject } = req.body;
      
      if (!testText) {
        return res.status(400).json({ message: 'Test text is required' });
      }

      const analysis = await sentimentAnalysisService.analyzeEmailSentiment(testText, testSubject);
      
      res.json({
        testText,
        testSubject,
        analysis,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error testing sentiment analysis:', error);
      res.status(500).json({ message: 'Failed to test sentiment analysis' });
    }
  });

  // Auto-process emails for sentiment detection (simulated)
  app.post('/api/sentiment/auto-process', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId || 'demo-user-123';
      
      // Simulate processing user's emails automatically
      const processedCount = Math.floor(Math.random() * 20) + 5;
      const newUrgent = Math.floor(Math.random() * 3) + 1;
      const newNegative = Math.floor(Math.random() * 2) + 1;
      
      // Generate some recent analyses
      const recentAnalyses = sentimentAnalysisService.generateDemoSentimentData().slice(0, 3);
      
      res.json({
        success: true,
        processedCount,
        summary: {
          newUrgent,
          newNegative,
          newPositive: processedCount - newUrgent - newNegative,
          lastProcessed: new Date()
        },
        recentAnalyses
      });
    } catch (error) {
      console.error('Error auto-processing emails:', error);
      res.status(500).json({ message: 'Failed to auto-process emails' });
    }
  });
}