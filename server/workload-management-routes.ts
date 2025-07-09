import { Express } from "express";
import { storage } from "./storage";
import { workloadManagementService } from "./workload-management-service";

export function registerWorkloadManagementRoutes(app: Express) {
  // Classify email workload
  app.post("/api/workload/classify", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { emailId, fromEmail, subject, content, threadContext } = req.body;
      const userId = req.user!.id as string;

      const emailContent = {
        id: emailId,
        fromEmail,
        fromName: req.body.fromName,
        subject,
        content,
        timestamp: new Date(),
        threadContext
      };

      const classification = await workloadManagementService.classifyEmailWorkload(emailContent, userId);
      res.json(classification);
    } catch (error) {
      console.error("Error classifying email workload:", error);
      res.status(500).json({ message: "Failed to classify email workload" });
    }
  });

  // Get email workload classifications
  app.get("/api/workload/classifications", async (req, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { completed, date, limit } = req.query;

      const filters: any = {};
      if (completed !== undefined) filters.completed = completed === 'true';
      if (date) filters.date = date as string;
      if (limit) filters.limit = parseInt(limit as string);

      const classifications = await storage.getEmailWorkloadClassifications(userId, filters);
      res.json(classifications);
    } catch (error) {
      console.error("Error fetching workload classifications:", error);
      res.status(500).json({ message: "Failed to fetch workload classifications" });
    }
  });

  // Update email completion
  app.patch("/api/workload/classifications/:id/complete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const classificationId = parseInt(req.params.id);
      const { actualTimeSpent, userFeedback } = req.body;

      const updated = await storage.updateEmailWorkloadCompletion(
        classificationId, 
        actualTimeSpent, 
        userFeedback
      );
      res.json(updated);
    } catch (error) {
      console.error("Error updating email completion:", error);
      res.status(500).json({ message: "Failed to update email completion" });
    }
  });

  // Analyze energy patterns
  app.get("/api/workload/energy-patterns", async (req, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const patterns = await workloadManagementService.analyzeEnergyPatterns(userId);
      res.json(patterns);
    } catch (error) {
      console.error("Error analyzing energy patterns:", error);
      res.status(500).json({ message: "Failed to analyze energy patterns" });
    }
  });

  // Generate optimal schedule
  app.post("/api/workload/schedule", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id as string;
      const preferences = req.body.preferences;

      const schedule = await workloadManagementService.generateOptimalSchedule(userId, preferences);
      res.json(schedule);
    } catch (error) {
      console.error("Error generating optimal schedule:", error);
      res.status(500).json({ message: "Failed to generate optimal schedule" });
    }
  });

  // Get active schedule
  app.get("/api/workload/schedule/active", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id as string;
      const schedule = await storage.getActiveEmailProcessingSchedule(userId);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching active schedule:", error);
      res.status(500).json({ message: "Failed to fetch active schedule" });
    }
  });

  // Create focus blocks
  app.post("/api/workload/focus-blocks", async (req, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { date } = req.body;

      const focusBlocks = await workloadManagementService.createFocusBlocks(
        userId, 
        date ? new Date(date) : new Date()
      );
      res.json(focusBlocks);
    } catch (error) {
      console.error("Error creating focus blocks:", error);
      res.status(500).json({ message: "Failed to create focus blocks" });
    }
  });

  // Track daily workload
  app.post("/api/workload/analytics", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id as string;
      const { date } = req.body;

      const analytics = await workloadManagementService.trackDailyWorkload(
        userId, 
        date ? new Date(date) : new Date()
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error tracking daily workload:", error);
      res.status(500).json({ message: "Failed to track daily workload" });
    }
  });

  // Get workload analytics
  app.get("/api/workload/analytics", async (req, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { limit, dateFrom, dateTo } = req.query;

      const filters: any = {};
      if (limit) filters.limit = parseInt(limit as string);
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;

      const analytics = await storage.getWorkloadAnalytics(userId, filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching workload analytics:", error);
      res.status(500).json({ message: "Failed to fetch workload analytics" });
    }
  });

  // Get workload recommendations
  app.get("/api/workload/recommendations", async (req, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const recommendations = await workloadManagementService.getWorkloadRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching workload recommendations:", error);
      res.status(500).json({ message: "Failed to fetch workload recommendations" });
    }
  });

  // Demo endpoint to simulate email processing
  app.post("/api/workload/demo/process-email", async (req, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Demo email content
      const demoEmails = [
        {
          id: "demo-1",
          fromEmail: "client@example.com",
          fromName: "John Client",
          subject: "Quick question about pricing",
          content: "Hi there, I have a quick question about your pricing plans. Could you send me more details?",
          timestamp: new Date(),
          threadContext: []
        },
        {
          id: "demo-2", 
          fromEmail: "partner@bigcorp.com",
          fromName: "Sarah Partner",
          subject: "Quarterly business review - strategic planning needed",
          content: "We need to schedule our quarterly business review and discuss the strategic direction for next year. This will require significant preparation and analysis of market trends.",
          timestamp: new Date(),
          threadContext: []
        },
        {
          id: "demo-3",
          fromEmail: "admin@supplier.com", 
          fromName: "Admin Team",
          subject: "Invoice #12345 - Payment confirmation",
          content: "Please confirm receipt of payment for invoice #12345. The payment was processed on [date] for $2,500.",
          timestamp: new Date(),
          threadContext: []
        }
      ];

      const classifications = [];
      for (const email of demoEmails) {
        const classification = await workloadManagementService.classifyEmailWorkload(email, userId);
        classifications.push(classification);
      }

      res.json({
        message: "Demo emails processed successfully",
        classifications,
        insights: {
          totalEmails: classifications.length,
          avgProcessingTime: classifications.reduce((sum, c) => sum + c.estimatedTimeMinutes, 0) / classifications.length,
          complexityDistribution: {
            low: classifications.filter(c => c.complexityScore <= 3).length,
            medium: classifications.filter(c => c.complexityScore > 3 && c.complexityScore <= 7).length,
            high: classifications.filter(c => c.complexityScore > 7).length
          }
        }
      });
    } catch (error) {
      console.error("Error processing demo emails:", error);
      res.status(500).json({ message: "Failed to process demo emails" });
    }
  });
}