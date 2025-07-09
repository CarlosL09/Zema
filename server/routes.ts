import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { automationAI } from "./services/automationAI";
import { subscriptionService } from "./services/subscriptionService";
import { GmailService } from "./services/gmailService";
import { OutlookService } from "./services/outlookService";
import { AIService } from "./services/aiService";
import { SlackService } from "./services/slackService";
import { EmailProcessor } from "./services/emailProcessor";
import { AnalyticsService } from "./services/analyticsService";
import { SecurityService } from "./services/securityService";
import { SecurityService as EnterpriseSecurityService } from "./security/index";
import { AutomationService } from "./services/automationService";
import { CalendarService } from "./services/calendarService";
import { VideoMeetingService } from "./services/videoMeetingService";
import { CRMService } from "./services/crmService";
import { ZapierService } from "./services/zapierService";
import { PabblyService } from "./services/pabblyService";
import { NotionService } from "./services/notionService";
import { AirtableService } from "./services/airtableService";
import { ProjectManagementService } from "./services/projectManagementService";
import { TrialService } from "./services/trial";
import { webhookService } from "./services/webhookService";
import { platformIntegrationService } from "./services/platformIntegrationService";
import { emailSchedulingService } from "./email-scheduling-service";
import { registerSentimentAnalysisRoutes } from "./sentiment-analysis-routes";
import { registerWorkloadManagementRoutes } from "./workload-management-routes";
import { voiceEmailService } from "./voice-email-service";
import { crossAccountIntelligenceService } from "./cross-account-intelligence-service";
import { smartFolderService } from "./smart-folder-service";
import { emailPerformanceService } from "./email-performance-service";
import { billingService } from "./services/billing-service";
import { insertDemoRequestSchema, insertNewsletterSchema } from "@shared/schema";
import { emailService, generateSecureToken } from "./services/emailService";
import { oauthService } from "./oauth-service";
import bcrypt from "bcrypt";
import express from "express";

// Initialize services
const gmailService = new GmailService();
const outlookService = new OutlookService();
const aiService = new AIService();
const slackService = new SlackService();
const emailProcessor = new EmailProcessor();
const analyticsService = new AnalyticsService();
const securityService = new SecurityService();
const automationService = new AutomationService();
const calendarService = new CalendarService();
const videoMeetingService = new VideoMeetingService();
const crmService = new CRMService();
const zapierService = new ZapierService();
const pabblyService = new PabblyService();
const notionService = new NotionService();
const airtableService = new AirtableService();
const projectManagementService = new ProjectManagementService();

// Initialize Stripe if secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware first (includes session setup)
  await setupAuth(app);
  
  // Traditional Authentication Endpoints (public)
  
  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, company } = req.body;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user using existing method
      const user = await storage.createUserWithPassword(email, hashedPassword, firstName, lastName);
      
      // Return user without password
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Login endpoint  
  app.post("/api/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      req.session.userId = user.id;
      
      // Return user without password hash
      const { passwordHash: _, ...userResponse } = user;
      res.status(200).json(userResponse);
      
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully" });
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Newsletter subscription (public)
  app.post("/api/newsletter", async (req, res) => {
    try {
      const newsletterData = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.createNewsletter(newsletterData);
      res.status(201).json(newsletter);
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(400).json({ message: "Email already subscribed" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  });

  // Demo request (public)
  app.post("/api/demo-request", async (req, res) => {
    try {
      const demoRequestData = insertDemoRequestSchema.parse(req.body);
      const demoRequest = await storage.createDemoRequest(demoRequestData);
      res.status(201).json(demoRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Public endpoints (before authentication setup)
  
  // Automation Templates API - Public for demo
  const { AutomationTemplateService } = await import('./services/automationTemplateService.js');
  const automationTemplateService = new AutomationTemplateService();

  app.get("/api/automation-templates", async (req, res) => {
    try {
      const { category, popular } = req.query;
      let templates;
      
      if (popular === 'true') {
        templates = automationTemplateService.getPopularTemplates(parseInt(req.query.limit as string) || 5);
      } else if (category) {
        templates = automationTemplateService.getTemplatesByCategory(category as string);
      } else {
        templates = automationTemplateService.getTemplates();
      }
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching automation templates:', error);
      res.status(500).json({ error: 'Failed to fetch automation templates' });
    }
  });

  app.post("/api/automation-templates/:templateId/create", async (req: any, res) => {
    try {
      const { templateId } = req.params;
      const { customSettings } = req.body;
      
      // For demo purposes, return a success response
      const template = automationTemplateService.getTemplates().find(t => t.id === templateId);
      const mockAutomationRule = {
        id: Date.now(),
        userId: 'demo-user',
        name: template?.name || `Template: ${templateId}`,
        description: template?.description || 'Automation rule created from template',
        triggers: template?.triggers || ['email_received'],
        actions: template?.actions || ['classify', 'move_to_folder'],
        conditions: customSettings?.conditions || template?.conditions || {},
        settings: customSettings?.settings || template?.settings || {},
        isActive: true,
        priority: 'medium',
        successRate: (template?.popularity || 85) / 100,
        timeSaved: template?.estimatedTimeSaved || '2-3 hours/week',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log(`✓ Created automation rule from template: ${templateId}`);
      res.json(mockAutomationRule);
    } catch (error) {
      console.error('Error creating automation from template:', error);
      res.status(500).json({ error: 'Failed to create automation rule' });
    }
  });

  // Dashboard stats endpoint (public for demo)
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // Disable caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const stats = {
        emailsProcessed: 1247,
        activeRules: 12,
        timeSaved: 15.3,
        automationRate: 0.87,
        unreadEmails: 23,
        priorityEmails: 5,
        efficiency: 0.92,
        weeklyTrend: 0.15,
        lastUpdated: Date.now()
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Auth middleware was already set up at the beginning

  // Auth routes - supports both Replit Auth and traditional session auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId;
      let user;

      // Check for traditional session authentication first
      if (req.session?.userId) {
        userId = req.session.userId;
        user = await storage.getUser(userId);
      }
      // Fallback to Replit Auth if available
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        user = await storage.getUser(userId);
      }
      else {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If this is a new user with no trial info, start their trial
      if (user && !user.trialEndsAt && user.subscriptionStatus === "trial") {
        await TrialService.startTrial(userId);
        const updatedUser = await storage.getUser(userId);
        res.json(updatedUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Trial Management Routes
  app.get('/api/trial/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const trialStatus = TrialService.getTrialStatus(user);
      const emailQuota = TrialService.getRemainingEmailQuota(user);
      const progress = TrialService.getTrialProgress(user);
      
      res.json({
        ...trialStatus,
        emailQuota,
        progress,
        emailsProcessedThisMonth: user.emailsProcessedThisMonth || 0
      });
    } catch (error) {
      console.error("Error fetching trial status:", error);
      res.status(500).json({ message: "Failed to fetch trial status" });
    }
  });

  app.post('/api/trial/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await TrialService.startTrial(userId);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error starting trial:", error);
      res.status(500).json({ message: "Failed to start trial" });
    }
  });

  app.post('/api/trial/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      
      const user = await TrialService.convertTrialToSubscription(userId, plan);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error upgrading trial:", error);
      res.status(500).json({ message: "Failed to upgrade trial" });
    }
  });

  // Admin authentication middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.session?.isAdmin) {
      return next();
    }
    return res.status(401).json({ message: "Admin access required" });
  };

  // Admin login route
  app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    
    // Simple password check (you can make this more secure)
    const adminPassword = "Luna0906!";
    
    if (password === adminPassword) {
      (req.session as any).isAdmin = true;
      res.json({ success: true, message: "Admin access granted" });
    } else {
      res.status(401).json({ message: "Invalid admin password" });
    }
  });

  // Admin logout route
  app.post('/api/admin/logout', (req, res) => {
    (req.session as any).isAdmin = false;
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Check admin status
  app.get('/api/admin/status', (req: any, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // Admin Routes (now protected)
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/recent-signups', isAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const recentSignups = await storage.getRecentSignups(days);
      res.json(recentSignups);
    } catch (error) {
      console.error("Error fetching recent signups:", error);
      res.status(500).json({ message: "Failed to fetch recent signups" });
    }
  });

  // Admin User Management Routes
  app.delete('/api/admin/users/:userId', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Delete user and all related data
      await storage.deleteUser(userId);
      
      res.json({ 
        success: true, 
        message: `User ${user.email} has been deleted successfully` 
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post('/api/admin/users/:userId/reset-password', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update user password
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ 
        success: true, 
        message: `Password reset successfully for ${user.email}` 
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.patch('/api/admin/users/:userId/status', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { subscriptionStatus, subscriptionPlan } = req.body;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user status
      const updatedUser = await storage.updateUserSubscription(userId, {
        subscriptionStatus,
        subscriptionPlan
      });
      
      res.json({ 
        success: true, 
        message: `User status updated successfully`,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // AI & Azure Usage Tracking Routes
  app.post('/api/track-ai-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { service, operation, tokensUsed, costInCents, requestData, responseData } = req.body;
      
      const currentDate = new Date();
      const billingPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Track in usage log
      await storage.trackAiUsage({
        userId,
        service,
        operation,
        tokensUsed,
        costInCents,
        requestData,
        responseData,
        billingPeriod
      });
      
      // Update user totals
      const user = await storage.updateUserAiCosts(userId, tokensUsed, costInCents);
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error tracking AI usage:", error);
      res.status(500).json({ message: "Failed to track AI usage" });
    }
  });

  app.post('/api/track-azure-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { service, operation, creditsUsed, apiCalls, dataTransferred, metadata } = req.body;
      
      const currentDate = new Date();
      const billingPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Track in usage log
      await storage.trackAzureUsage({
        userId,
        service,
        operation,
        creditsUsed,
        apiCalls,
        dataTransferred,
        billingPeriod,
        metadata
      });
      
      // Update user totals
      const user = await storage.updateUserAzureCosts(userId, creditsUsed);
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error tracking Azure usage:", error);
      res.status(500).json({ message: "Failed to track Azure usage" });
    }
  });

  app.get('/api/ai-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingPeriod = req.query.period as string;
      
      const usage = await storage.getAiUsageByUser(userId, billingPeriod);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching AI usage:", error);
      res.status(500).json({ message: "Failed to fetch AI usage" });
    }
  });

  app.get('/api/azure-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingPeriod = req.query.period as string;
      
      const usage = await storage.getAzureUsageByUser(userId, billingPeriod);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching Azure usage:", error);
      res.status(500).json({ message: "Failed to fetch Azure usage" });
    }
  });

  app.post('/api/generate-sample-usage', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { UsageTrackingService } = await import('./services/usageTracking');
      
      const result = await UsageTrackingService.generateSampleUsageData(userId);
      res.json(result);
    } catch (error) {
      console.error("Error generating sample usage:", error);
      res.status(500).json({ message: "Failed to generate sample usage data" });
    }
  });

  app.get('/api/usage-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingPeriod = req.query.period as string;
      const { UsageTrackingService } = await import('./services/usageTracking');
      
      const summary = await UsageTrackingService.getUserUsageSummary(userId, billingPeriod);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching usage summary:", error);
      res.status(500).json({ message: "Failed to fetch usage summary" });
    }
  });

  // Gmail Integration
  app.get('/api/gmail/auth-url', isAuthenticated, async (req: any, res) => {
    try {
      const authUrl = await gmailService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  });

  app.post('/api/gmail/callback', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.claims.sub;
      await gmailService.exchangeCodeForTokens(code, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to connect Gmail' });
    }
  });

  app.get('/api/gmail/threads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const threads = await storage.getEmailThreads(userId);
      res.json(threads);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch email threads' });
    }
  });

  app.post('/api/gmail/process', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await emailProcessor.processUserEmails(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process emails' });
    }
  });

  // Outlook Integration
  app.get('/api/outlook/auth-url', isAuthenticated, async (req: any, res) => {
    try {
      const authUrl = await outlookService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate Outlook auth URL' });
    }
  });

  app.post('/api/outlook/callback', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.claims.sub;
      await outlookService.exchangeCodeForTokens(code, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to connect Outlook' });
    }
  });

  app.get('/api/outlook/emails', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const maxResults = parseInt(req.query.maxResults as string) || 50;
      const emails = await outlookService.getEmails(userId, maxResults);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Outlook emails' });
    }
  });

  app.get('/api/outlook/thread/:messageId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      const thread = await outlookService.getEmailThread(userId, messageId);
      res.json(thread);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Outlook email thread' });
    }
  });

  app.post('/api/outlook/send', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { to, subject, body, replyToMessageId } = req.body;
      await outlookService.sendEmail(userId, to, subject, body, replyToMessageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send Outlook email' });
    }
  });

  app.get('/api/outlook/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folders = await outlookService.getFolders(userId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Outlook folders' });
    }
  });

  app.post('/api/outlook/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, maxResults } = req.body;
      const emails = await outlookService.searchEmails(userId, query, maxResults);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search Outlook emails' });
    }
  });

  // Email Drafts
  app.get('/api/drafts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drafts = await storage.getEmailDrafts(userId);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch drafts' });
    }
  });

  app.post('/api/drafts/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const draft = await storage.updateEmailDraftStatus(parseInt(id), 'approved');
      res.json(draft);
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve draft' });
    }
  });

  app.post('/api/drafts/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Get draft details
      const drafts = await storage.getEmailDrafts(userId);
      const draft = drafts.find(d => d.id === parseInt(id));
      
      if (!draft) {
        return res.status(404).json({ error: 'Draft not found' });
      }

      // Send email via Gmail
      const context = draft.context as any;
      await gmailService.sendEmail(
        userId,
        context.sender,
        `Re: ${context.subject}`,
        draft.draftContent,
        context.threadId
      );

      // Update draft status
      await storage.updateEmailDraftStatus(parseInt(id), 'sent');
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Smart Rules
  app.get('/api/smart-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rules = await storage.getSmartRules(userId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch smart rules' });
    }
  });

  app.post('/api/smart-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rule = await storage.createSmartRule({
        userId,
        ...req.body
      });
      res.json(rule);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create smart rule' });
    }
  });

  // Slack Integration
  app.post('/api/integrations/slack', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accessToken, settings } = req.body;
      await slackService.createSlackIntegration(userId, accessToken, settings);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to setup Slack integration' });
    }
  });

  app.get('/api/integrations/slack/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channels = await slackService.getSlackChannels(userId);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Slack channels' });
    }
  });

  // Quick Win Features

  // Email Summarization
  app.post('/api/emails/summarize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { threadId, messages } = req.body;

      // Check if summary already exists
      const existingSummary = await storage.getEmailSummary(userId, threadId);
      if (existingSummary) {
        return res.json(existingSummary);
      }

      const summary = await aiService.summarizeEmailThread(userId, messages);
      
      // Store the summary
      const storedSummary = await storage.createEmailSummary({
        userId,
        threadId,
        summary: summary.summary,
        keyPoints: summary.keyPoints,
        actionItems: summary.actionItems,
        messageCount: messages.length
      });

      res.json(storedSummary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to summarize email thread' });
    }
  });

  // Smart Scheduling Detection
  app.post('/api/emails/detect-scheduling', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, body, sender } = req.body;

      const result = await aiService.detectSchedulingRequest(userId, { subject, body, sender });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to detect scheduling request' });
    }
  });

  // Quick Replies Generation
  app.post('/api/emails/quick-replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, body, sender } = req.body;

      // Create a hash of the email content for caching
      const emailHash = Buffer.from(`${subject}${sender}${body.substring(0, 100)}`).toString('base64');
      
      // Check cache first
      const cached = await storage.getQuickRepliesCache(userId, emailHash);
      if (cached) {
        return res.json({ replies: cached.replies });
      }

      const replies = await aiService.generateQuickReplies(userId, { subject, body, sender });
      
      // Cache the replies
      await storage.cacheQuickReplies({
        userId,
        emailHash,
        replies
      });

      res.json({ replies });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate quick replies' });
    }
  });

  // Priority Scoring
  app.post('/api/emails/calculate-priority', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, sender, body, hasAttachments, isReply } = req.body;

      const priority = await aiService.calculatePriorityScore(userId, {
        subject,
        sender,
        body,
        hasAttachments: hasAttachments || false,
        isReply: isReply || false
      });

      res.json(priority);
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate email priority' });
    }
  });

  // Follow-up Detection
  app.post('/api/emails/detect-followup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, body, sender, timestamp, threadId, emailId } = req.body;

      const followUp = await aiService.detectFollowUpNeeded(userId, {
        subject,
        body,
        sender,
        timestamp
      });

      if (followUp.needsFollowUp) {
        // Schedule the follow-up reminder
        const reminderTime = new Date(Date.now() + followUp.suggestedDelay * 60 * 60 * 1000);
        
        await storage.createFollowUpReminder({
          userId,
          threadId,
          emailId,
          reminderTime,
          followUpType: followUp.followUpType,
          reason: followUp.reason
        });
      }

      res.json(followUp);
    } catch (error) {
      res.status(500).json({ error: 'Failed to detect follow-up needs' });
    }
  });

  // Get Follow-up Reminders
  app.get('/api/followups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getFollowUpReminders(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch follow-up reminders' });
    }
  });

  // Mark Follow-up as Complete
  app.post('/api/followups/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const reminder = await storage.updateFollowUpReminder(parseInt(id), { 
        isCompleted: true,
        isActive: false
      });
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete follow-up reminder' });
    }
  });

  // Analytics
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUsageAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Stripe Payment Integration
  if (stripe) {
    app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe!.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res
          .status(500)
          .json({ message: "Error creating payment intent: " + error.message });
      }
    });

    app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);

        if (!user?.email) {
          return res.status(400).json({ error: 'User email not found' });
        }

        if (user.stripeSubscriptionId) {
          const subscription = await stripe!.subscriptions.retrieve(user.stripeSubscriptionId);
          res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
          return;
        }

        const customer = await stripe!.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });

        const subscription = await stripe!.subscriptions.create({
          customer: customer.id,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_default',
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  // Demo request endpoint (public)
  app.post("/api/demo-request", async (req, res) => {
    try {
      const validatedData = insertDemoRequestSchema.parse(req.body);
      const demoRequest = await storage.createDemoRequest(validatedData);
      res.json({ success: true, data: demoRequest });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });

  // Newsletter subscription endpoint (public)
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(validatedData);
      res.json({ success: true, data: subscription });
    } catch (error) {
      if (error instanceof Error && error.message === "Email already subscribed") {
        res.status(409).json({ 
          success: false, 
          error: "Email is already subscribed to our newsletter" 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: error instanceof Error ? error.message : "Invalid email address" 
        });
      }
    }
  });

  // Custom Templates API
  app.get('/api/custom-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await storage.getCustomTemplates(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch custom templates' });
    }
  });

  app.post('/api/custom-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templateData = { ...req.body, userId };
      const template = await storage.createCustomTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create custom template' });
    }
  });

  app.put('/api/custom-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const template = await storage.updateCustomTemplate(parseInt(id), req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update custom template' });
    }
  });

  app.delete('/api/custom-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomTemplate(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete custom template' });
    }
  });

  app.get('/api/public-templates', async (req, res) => {
    try {
      const templates = await storage.getPublicTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch public templates' });
    }
  });

  // Custom Rules API
  app.get('/api/custom-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rules = await storage.getCustomRules(userId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch custom rules' });
    }
  });

  app.post('/api/custom-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ruleData = { ...req.body, userId };
      const rule = await storage.createCustomRule(ruleData);
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create custom rule' });
    }
  });

  app.put('/api/custom-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const rule = await storage.updateCustomRule(parseInt(id), req.body);
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update custom rule' });
    }
  });

  app.delete('/api/custom-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomRule(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete custom rule' });
    }
  });

  // Template Usage Tracking
  app.post('/api/template-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usageData = { ...req.body, userId };
      const usage = await storage.trackTemplateUsage(usageData);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to track template usage' });
    }
  });

  app.get('/api/template-usage/:templateId?', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { templateId } = req.params;
      const stats = await storage.getTemplateUsageStats(userId, templateId ? parseInt(templateId) : undefined);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template usage stats' });
    }
  });

  // AI Automation Assistant
  app.post('/api/ai/suggest-automation', async (req: any, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { userRequest } = req.body;
      const suggestions = await automationAI.suggestAutomationTemplate(userRequest);
      res.json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate automation suggestions' });
    }
  });

  app.post('/api/ai/suggest-rule', async (req: any, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { userRequest } = req.body;
      const suggestions = await automationAI.suggestAutomationRule(userRequest);
      res.json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate rule suggestions' });
    }
  });

  app.post('/api/ai/analyze-patterns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailData } = req.body;
      const analysis = await automationAI.analyzeAndSuggestOptimizations(emailData || []);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to analyze email patterns' });
    }
  });

  app.post('/api/ai/guidance', async (req: any, res) => {
    try {
      // Support both authentication types: Replit OAuth and demo user sessions
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { userQuery, currentStep, context } = req.body;
      const guidance = await automationAI.getAutomationGuidance(userQuery, currentStep, context);
      res.json(guidance);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to provide automation guidance' });
    }
  });

  // AI-powered automation creation from suggestions
  app.post('/api/ai/create-from-suggestion', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      const { suggestion, type } = req.body;

      if (type === 'template') {
        const templateData = {
          ...suggestion,
          userId,
          triggers: JSON.stringify(suggestion.triggers),
          actions: JSON.stringify(suggestion.actions),
          usageCount: 0
        };
        const template = await storage.createCustomTemplate(templateData);
        res.json({ template, message: 'AI-generated template created successfully' });
      } else if (type === 'rule') {
        const ruleData = {
          ...suggestion,
          userId,
          isActive: true
        };
        const rule = await storage.createCustomRule(ruleData);
        res.json({ rule, message: 'AI-generated rule created successfully' });
      } else {
        res.status(400).json({ error: 'Invalid suggestion type' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create automation from suggestion' });
    }
  });

  // Admin endpoints (protected)
  app.get("/api/demo-requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getDemoRequests();
      res.json({ success: true, data: requests });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch demo requests" 
      });
    }
  });

  app.get("/api/newsletters", isAuthenticated, async (req, res) => {
    try {
      const subscriptions = await storage.getNewsletterSubscriptions();
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch newsletter subscriptions" 
      });
    }
  });

  // Calendar Integration Routes
  app.get('/api/calendar/auth-url', isAuthenticated, async (req: any, res) => {
    try {
      const authUrl = await calendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calendar/exchange-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      await calendarService.exchangeCodeForTokens(code, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calendar/create-event', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await calendarService.createEvent(userId, req.body);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/calendar/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startTime, endTime } = req.query;
      const availability = await calendarService.getAvailability(
        userId, 
        new Date(startTime as string), 
        new Date(endTime as string)
      );
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Video Meeting Integration Routes
  app.get('/api/video/auth-url/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const authUrl = await videoMeetingService.getAuthUrl(platform as 'zoom' | 'teams');
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video/exchange-code/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.params;
      const { code } = req.body;
      await videoMeetingService.exchangeCodeForTokens(platform as 'zoom' | 'teams', code, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video/create-meeting/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.params;
      const meeting = await videoMeetingService.createMeeting(userId, platform as 'zoom' | 'teams', req.body);
      res.json(meeting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video/generate-link/:platform', async (req: any, res) => {
    try {
      const { platform } = req.params;
      const link = await videoMeetingService.generateMeetingLink(platform as any, req.body);
      res.json({ link });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CRM Integration Routes
  app.get('/api/crm/auth-url/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const authUrl = await crmService.getAuthUrl(platform as 'salesforce' | 'hubspot' | 'pipedrive');
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/crm/exchange-code/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.params;
      const { code } = req.body;
      await crmService.exchangeCodeForTokens(platform as 'salesforce' | 'hubspot' | 'pipedrive', code, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/crm/sync-contact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await crmService.syncContactToCRM(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/crm/create-deal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deal = await crmService.createDeal(userId, req.body);
      res.json(deal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/crm/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await crmService.getCRMInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Zapier Integration Routes
  app.post('/api/zapier/create-webhook', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await zapierService.createWebhook(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/zapier/triggers', async (req, res) => {
    try {
      const triggers = await zapierService.getAvailableTriggers();
      res.json(triggers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/webhooks/zapier/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await zapierService.processZapierWebhook(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/zapier/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await zapierService.getZapierInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pabbly Connect Integration Routes
  app.post('/api/pabbly/create-workflow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await pabblyService.createWorkflow(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/pabbly/apps', async (req, res) => {
    try {
      const apps = await pabblyService.getAvailableApps();
      res.json(apps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/pabbly/templates', async (req, res) => {
    try {
      const templates = await pabblyService.getWorkflowTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/webhooks/pabbly/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await pabblyService.processPabblyWebhook(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/pabbly/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await pabblyService.getPabblyInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notion Integration Routes
  app.post('/api/notion/sync-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await notionService.syncEmailToNotion(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notion/create-task', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await notionService.createTaskFromEmail(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notion/sync-contact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await notionService.syncContactToNotion(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/notion/databases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const databases = await notionService.getNotionDatabases(userId);
      res.json(databases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/notion/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await notionService.getNotionInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Airtable Integration Routes
  app.post('/api/airtable/sync-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailData, config } = req.body;
      const result = await airtableService.syncEmailToAirtable(userId, emailData, config);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/airtable/sync-contact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactData, config } = req.body;
      const result = await airtableService.syncContactToAirtable(userId, contactData, config);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/airtable/bases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bases = await airtableService.getAirtableBases(userId);
      res.json(bases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/airtable/tables/:baseId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { baseId } = req.params;
      const tables = await airtableService.getAirtableTables(userId, baseId);
      res.json(tables);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Project Management Integration Routes
  app.post('/api/project-management/create-task', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailData, platform, config } = req.body;
      const result = await projectManagementService.createTaskFromEmail(userId, emailData, platform, config);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/project-management/platforms', async (req, res) => {
    try {
      const platforms = await projectManagementService.getAvailablePlatforms();
      res.json(platforms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/project-management/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await projectManagementService.getProjectManagementInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });



  app.get("/api/automation-analytics/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Mock analytics for demo
      const analytics = {
        totalRules: 12,
        activeRules: 9,
        emailsProcessed: 1247,
        timeSaved: '15.3 hours',
        successRate: 0.92,
        topPerformingRules: [
          { name: 'Smart Classifier', executions: 324, successRate: 0.95 },
          { name: 'Priority Detector', executions: 267, successRate: 0.89 },
          { name: 'Auto Responder', executions: 198, successRate: 0.91 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching automation analytics:', error);
      res.status(500).json({ error: 'Failed to fetch automation analytics' });
    }
  });

  // Subscription routes
  app.get("/api/subscription/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const status = subscriptionService.getSubscriptionStatus(user);
      res.json(status);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.get("/api/subscription/pricing", async (req, res) => {
    try {
      const pricing = subscriptionService.getPricingInfo();
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching pricing info:", error);
      res.status(500).json({ message: "Failed to fetch pricing info" });
    }
  });

  app.post("/api/subscription/start-trial", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan = 'starter' } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate plan
      if (!['starter', 'professional', 'enterprise'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan specified" });
      }

      // Check if user already has a trial or subscription
      if (user.subscriptionStatus && user.subscriptionStatus !== 'trial') {
        return res.status(400).json({ message: "User already has a subscription" });
      }

      // Create mock customer and subscription
      const customer = await subscriptionService.createCustomer(user.email!, `${user.firstName} ${user.lastName}`);
      const subscription = await subscriptionService.createSubscription(customer.id);
      
      // Calculate trial end date
      const trialEnd = subscriptionService.calculateTrialEndDate();
      
      // Update user with subscription info and set the plan
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
      await storage.updateUserSubscriptionStatus(userId, 'trialing', trialEnd);
      await storage.updateUserSubscriptionPlan(userId, plan);

      res.json({
        success: true,
        plan,
        trialEndsAt: trialEnd,
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error("Error starting trial:", error);
      res.status(500).json({ message: "Failed to start trial" });
    }
  });

  app.post("/api/subscription/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ message: "No subscription found" });
      }

      // Cancel subscription with Stripe
      await subscriptionService.cancelSubscription(user.stripeSubscriptionId);
      
      // Update user status
      await storage.cancelUserSubscription(userId);

      res.json({ success: true, message: "Subscription canceled successfully" });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  app.get("/api/subscription/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const status = subscriptionService.getSubscriptionStatus(user);
      res.json(status);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.get("/api/subscription/pricing", isAuthenticated, async (req: any, res) => {
    try {
      const pricing = subscriptionService.getPricingInfo();
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching pricing info:", error);
      res.status(500).json({ message: "Failed to fetch pricing info" });
    }
  });

  // Enterprise Security API routes
  app.get("/api/security/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const metrics = await EnterpriseSecurityService.getSecurityMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error getting security metrics:", error);
      res.status(500).json({ message: "Failed to get security metrics" });
    }
  });

  app.get("/api/security/settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = EnterpriseSecurityService.getSecuritySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting security settings:", error);
      res.status(500).json({ message: "Failed to get security settings" });
    }
  });

  app.post("/api/security/validate-password", async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const validation = EnterpriseSecurityService.validatePassword(password);
      res.json(validation);
    } catch (error) {
      console.error("Error validating password:", error);
      res.status(500).json({ message: "Failed to validate password" });
    }
  });

  app.get("/api/security/compliance", isAuthenticated, async (req: any, res) => {
    try {
      const compliance = EnterpriseSecurityService.getComplianceStatus();
      res.json(compliance);
    } catch (error) {
      console.error("Error getting compliance status:", error);
      res.status(500).json({ message: "Failed to get compliance status" });
    }
  });

  app.post("/api/security/generate-api-key", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKey = EnterpriseSecurityService.generateApiKey();
      
      // Log the API key generation
      await EnterpriseSecurityService.logSecurityEvent(userId, 'api_key_generated', 'success');
      
      res.json({ apiKey });
    } catch (error) {
      console.error("Error generating API key:", error);
      res.status(500).json({ message: "Failed to generate API key" });
    }
  });

  app.post("/api/subscription/upgrade-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan specified" });
      }

      // Update user's subscription plan
      await storage.updateUserSubscriptionPlan(userId, plan);

      res.json({ success: true, message: "Plan updated successfully" });
    } catch (error) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({ message: "Failed to upgrade plan" });
    }
  });

  // Password Reset Routes
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent." });
      }

      // Generate secure reset token
      const resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store token in database
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

      // Send password reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Verify reset token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await storage.updateUserPassword(resetToken.userId, passwordHash);

      // Mark token as used
      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.status(200).json({ message: "Password successfully reset" });
    } catch (error) {
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email/Password Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await storage.createUserWithPassword(email, passwordHash, firstName, lastName);

      // Send welcome email
      await emailService.sendWelcomeEmail(email, firstName);

      res.status(201).json({ 
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email/Password Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Traditional logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Failed to logout" });
          }
          res.clearCookie('connect.sid'); // Clear the session cookie
          res.status(200).json({ message: "Logout successful" });
        });
      } else {
        res.status(200).json({ message: "No session to logout" });
      }
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Webhook API routes
  app.get('/api/webhooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const webhooks = await webhookService.getUserWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post('/api/webhooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, url, events, platform, headers, secret } = req.body;
      
      if (!name || !url || !events || !platform) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const webhook = await webhookService.createWebhook(userId, {
        name,
        url,
        events,
        platform,
        headers: headers || {},
        secret
      });

      res.status(201).json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  app.put('/api/webhooks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const updates = req.body;
      
      const webhook = await webhookService.updateWebhook(webhookId, updates);
      res.json(webhook);
    } catch (error) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ message: "Failed to update webhook" });
    }
  });

  app.delete('/api/webhooks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      await webhookService.deleteWebhook(webhookId);
      res.json({ message: "Webhook deleted successfully" });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });

  app.post('/api/webhooks/:id/test', isAuthenticated, async (req: any, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const result = await webhookService.testWebhook(webhookId);
      res.json(result);
    } catch (error) {
      console.error("Error testing webhook:", error);
      res.status(500).json({ message: "Failed to test webhook" });
    }
  });

  app.get('/api/webhooks/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await webhookService.getWebhookStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching webhook stats:", error);
      res.status(500).json({ message: "Failed to fetch webhook stats" });
    }
  });

  app.get('/api/webhooks/templates/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const platform = req.params.platform;
      const template = webhookService.getWebhookTemplate(platform);
      res.json(template);
    } catch (error) {
      console.error("Error fetching webhook template:", error);
      res.status(500).json({ message: "Failed to fetch webhook template" });
    }
  });

  // Platform Integration API routes
  app.get('/api/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const integrations = await platformIntegrationService.getUserIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post('/api/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, platform, apiKey, apiSecret, accessToken, refreshToken, config } = req.body;
      
      if (!name || !platform) {
        return res.status(400).json({ message: "Missing required fields: name and platform" });
      }

      const integration = await platformIntegrationService.createIntegration(userId, {
        name,
        platform,
        apiKey,
        apiSecret,
        accessToken,
        refreshToken,
        config: config || {}
      });

      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });

  app.put('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const updates = req.body;
      
      const integration = await platformIntegrationService.updateIntegration(integrationId, updates);
      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ message: "Failed to update integration" });
    }
  });

  app.delete('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      await platformIntegrationService.deleteIntegration(integrationId);
      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  app.post('/api/integrations/:id/test', isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const result = await platformIntegrationService.testIntegration(integrationId);
      res.json(result);
    } catch (error) {
      console.error("Error testing integration:", error);
      res.status(500).json({ message: "Failed to test integration" });
    }
  });

  app.post('/api/integrations/:id/sync', isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const result = await platformIntegrationService.syncIntegration(integrationId);
      res.json(result);
    } catch (error) {
      console.error("Error syncing integration:", error);
      res.status(500).json({ message: "Failed to sync integration" });
    }
  });

  app.get('/api/integrations/templates/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const platform = req.params.platform;
      const template = platformIntegrationService.getPlatformTemplate(platform);
      res.json(template);
    } catch (error) {
      console.error("Error fetching integration template:", error);
      res.status(500).json({ message: "Failed to fetch integration template" });
    }
  });

  // Email Accounts Management
  app.get('/api/email-accounts', async (req: any, res) => {
    try {
      // For demo purposes, use test user ID
      const userId = 'demo-user-123';

      const accounts = await storage.getEmailAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching email accounts:", error);
      res.status(500).json({ message: "Failed to fetch email accounts" });
    }
  });

  app.post('/api/email-accounts', async (req: any, res) => {
    try {
      // Support both Replit OAuth and session authentication
      let userId = req.user?.claims?.sub || req.session?.userId;
      
      // Fallback for demo user
      if (!userId && req.session) {
        userId = 'demo-user-123'; // Demo user ID
      }
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { emailAddress, provider, displayName, password, imapServer, imapPort } = req.body;

      if (!emailAddress || !provider) {
        return res.status(400).json({ message: "Email address and provider are required" });
      }

      // For non-OAuth providers, password is required
      if ((provider === 'yahoo' || provider === 'other') && !password) {
        return res.status(400).json({ message: "Password is required for this provider" });
      }

      // For 'other' provider, IMAP settings are required
      if (provider === 'other' && (!imapServer || !imapPort)) {
        return res.status(400).json({ message: "IMAP server and port are required for custom providers" });
      }

      // Check if account already exists
      const existingAccounts = await storage.getEmailAccounts(userId);
      const accountExists = existingAccounts.some(acc => acc.emailAddress === emailAddress);
      
      if (accountExists) {
        return res.status(400).json({ message: "Email account already connected" });
      }

      const accountData = {
        userId,
        emailAddress,
        provider,
        displayName: displayName || null,
        encryptedPassword: password ? password : null, // In production, this should be encrypted
        imapServer: imapServer || null,
        imapPort: imapPort ? parseInt(imapPort) : null,
        isActive: true,
        isPrimary: existingAccounts.length === 0, // First account is primary
        syncStatus: 'pending'
      };

      const account = await storage.createEmailAccount(accountData);
      
      // For OAuth providers (Gmail, Outlook), initiate OAuth flow
      if (provider === 'gmail' || provider === 'outlook') {
        // Return OAuth URL for frontend to redirect
        const oauthUrl = `/api/auth/${provider}?accountId=${account.id}`;
        return res.json({ 
          account, 
          requiresOAuth: true, 
          oauthUrl 
        });
      }

      res.status(201).json({ account });
    } catch (error) {
      console.error("Error creating email account:", error);
      res.status(500).json({ message: "Failed to create email account" });
    }
  });

  app.delete('/api/email-accounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const accountId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await storage.deleteEmailAccount(accountId, userId);
      res.json({ message: "Email account deleted successfully" });
    } catch (error) {
      console.error("Error deleting email account:", error);
      res.status(500).json({ message: "Failed to delete email account" });
    }
  });

  app.post('/api/email-accounts/:id/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const accountId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Start email sync process
      await storage.startEmailSync(accountId, userId);
      res.json({ message: "Email sync started successfully" });
    } catch (error) {
      console.error("Error starting email sync:", error);
      res.status(500).json({ message: "Failed to start email sync" });
    }
  });

  app.post('/api/email-accounts/:id/set-primary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const accountId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await storage.setPrimaryEmailAccount(accountId, userId);
      res.json({ message: "Primary account updated successfully" });
    } catch (error) {
      console.error("Error setting primary account:", error);
      res.status(500).json({ message: "Failed to set primary account" });
    }
  });

  // OAuth Authentication Routes
  app.get('/api/oauth/:provider/auth', async (req: any, res) => {
    try {
      const { provider } = req.params;
      // Support both Replit auth and demo session
      const userId = req.user?.claims?.sub || req.session?.userId || 'demo-user-123';
      const { email } = req.query;

      // For demo purposes, allow demo user
      if (!userId && !req.headers.authorization) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!email) {
        return res.status(400).json({ message: "Email parameter is required" });
      }

      let authUrl: string;
      const state = `${userId}:${email}:${provider}`;

      try {
        if (provider === 'gmail') {
          authUrl = oauthService.getGmailAuthUrl(state);
        } else if (provider === 'outlook') {
          authUrl = oauthService.getOutlookAuthUrl(state);
        } else {
          return res.status(400).json({ message: "Unsupported provider" });
        }

        res.json({ authUrl });
      } catch (error: any) {
        if (error.message.includes('credentials not configured')) {
          res.status(503).json({ 
            message: "OAuth not configured",
            details: "OAuth credentials are not set up for this provider. Please contact support."
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error generating OAuth URL:", error);
      res.status(500).json({ message: "Failed to generate OAuth URL" });
    }
  });

  app.get('/api/oauth/:provider/callback', async (req, res) => {
    try {
      const { provider } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`/email-accounts?error=${encodeURIComponent(error as string)}`);
      }

      if (!code || !state) {
        return res.redirect('/email-accounts?error=Invalid OAuth response');
      }

      // Decode state to get user info
      const [userId, email, originalProvider] = (state as string).split(':');
      
      if (provider !== originalProvider) {
        return res.redirect('/email-accounts?error=Provider mismatch');
      }

      try {
        let tokens;
        let userEmail;

        if (provider === 'gmail') {
          tokens = await oauthService.exchangeGmailCode(code as string);
          userEmail = await oauthService.getGmailUserEmail(tokens);
        } else if (provider === 'outlook') {
          tokens = await oauthService.exchangeOutlookCode(code as string);
          userEmail = await oauthService.getOutlookUserEmail(tokens);
        } else {
          return res.redirect('/email-accounts?error=Unsupported provider');
        }

        // Verify the email matches what user intended to connect
        if (userEmail.toLowerCase() !== email.toLowerCase()) {
          return res.redirect(`/email-accounts?error=Email mismatch. Expected ${email}, got ${userEmail}`);
        }

        // Check if account already exists
        const existingAccounts = await storage.getEmailAccounts(userId);
        const accountExists = existingAccounts.some(acc => acc.emailAddress === userEmail);
        
        if (accountExists) {
          return res.redirect('/email-accounts?error=Email account already connected');
        }

        // Store the account with OAuth tokens
        const accountData = {
          userId,
          emailAddress: userEmail,
          provider,
          displayName: userEmail,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null,
          isActive: true,
          isPrimary: existingAccounts.length === 0,
          syncStatus: 'pending'
        };

        await storage.createEmailAccount(accountData);
        res.redirect('/email-accounts?success=Email account connected successfully');
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        res.redirect(`/email-accounts?error=${encodeURIComponent(error.message || 'OAuth authentication failed')}`);
      }
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      res.redirect('/email-accounts?error=Authentication failed');
    }
  });

  // Email Scheduling Intelligence API Routes
  app.post('/api/email-scheduling/schedule', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { recipientEmail, recipientName, subject, content, scheduledFor, emailAccountId, automationRuleId } = req.body;

      if (!recipientEmail || !subject || !content || !scheduledFor) {
        return res.status(400).json({ message: "Required fields: recipientEmail, subject, content, scheduledFor" });
      }

      const scheduled = await emailSchedulingService.scheduleEmail({
        userId,
        recipientEmail,
        recipientName,
        subject,
        content,
        scheduledFor: new Date(scheduledFor),
        emailAccountId,
        automationRuleId
      });

      res.status(201).json(scheduled);
    } catch (error) {
      console.error("Error scheduling email:", error);
      res.status(500).json({ message: "Failed to schedule email" });
    }
  });

  app.get('/api/email-scheduling/scheduled', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { status } = req.query;
      const emails = await emailSchedulingService.getScheduledEmails(userId, status as string);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching scheduled emails:", error);
      res.status(500).json({ message: "Failed to fetch scheduled emails" });
    }
  });

  app.post('/api/email-scheduling/suggest-time', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { recipientEmail, preferredSendTime } = req.body;
      if (!recipientEmail) {
        return res.status(400).json({ message: "Recipient email is required" });
      }

      const suggestion = await emailSchedulingService.suggestOptimalSendTime(
        recipientEmail,
        userId,
        preferredSendTime ? new Date(preferredSendTime) : undefined
      );

      res.json(suggestion);
    } catch (error) {
      console.error("Error suggesting optimal time:", error);
      res.status(500).json({ message: "Failed to suggest optimal time" });
    }
  });

  app.delete('/api/email-scheduling/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const emailId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const cancelled = await emailSchedulingService.cancelScheduledEmail(emailId, userId);
      if (!cancelled) {
        return res.status(404).json({ message: "Scheduled email not found or already processed" });
      }

      res.json({ message: "Email cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling email:", error);
      res.status(500).json({ message: "Failed to cancel email" });
    }
  });

  app.post('/api/email-scheduling/update-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { recipientEmail, emailSentAt, responseReceivedAt } = req.body;
      if (!recipientEmail || !emailSentAt) {
        return res.status(400).json({ message: "Recipient email and sent time are required" });
      }

      await emailSchedulingService.updateRecipientAnalytics(
        userId,
        recipientEmail,
        new Date(emailSentAt),
        responseReceivedAt ? new Date(responseReceivedAt) : undefined
      );

      res.json({ message: "Analytics updated successfully" });
    } catch (error) {
      console.error("Error updating analytics:", error);
      res.status(500).json({ message: "Failed to update analytics" });
    }
  });

  app.get('/api/email-scheduling/analytics/:email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const recipientEmail = req.params.email;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get timezone and optimal time suggestions
      const [timezoneInfo, optimalTime] = await Promise.all([
        emailSchedulingService.detectRecipientTimezone(recipientEmail, userId),
        emailSchedulingService.analyzeRecipientOptimalTimes(recipientEmail, userId)
      ]);

      res.json({
        recipientEmail,
        timezone: timezoneInfo,
        optimalTime,
        analytics: {
          timezone: timezoneInfo.timezone,
          timezoneDisplayName: timezoneInfo.name,
          optimalHour: optimalTime.hour,
          confidence: optimalTime.confidence,
          reason: optimalTime.reason
        }
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Inbox API Routes
  app.get('/api/inbox/threads', async (req, res) => {
    try {
      // Mock email threads data for demo
      const mockThreads = [
        {
          id: "1",
          subject: "Project proposal review needed",
          sender: "Sarah Johnson",
          senderEmail: "sarah@company.com",
          preview: "Hi team, I've attached the updated project proposal for Q2. Please review and provide feedback by Friday...",
          timestamp: "2 hours ago",
          isRead: false,
          isStarred: true,
          hasAttachments: true,
          labels: ["work", "urgent"],
          priority: "high",
          accountId: 1,
          messageCount: 3
        },
        {
          id: "2",
          subject: "Marketing campaign results",
          sender: "Mike Chen",
          senderEmail: "mike@marketing.com",
          preview: "The Q4 campaign exceeded expectations with a 25% increase in conversion rates. Here's the detailed breakdown...",
          timestamp: "4 hours ago",
          isRead: true,
          isStarred: false,
          hasAttachments: false,
          labels: ["marketing"],
          priority: "medium",
          accountId: 1,
          messageCount: 1
        },
        {
          id: "3",
          subject: "Weekly team standup notes",
          sender: "Team Lead",
          senderEmail: "lead@team.com",
          preview: "Here are this week's action items and progress updates from our standup meetings...",
          timestamp: "1 day ago",
          isRead: true,
          isStarred: false,
          hasAttachments: false,
          labels: ["team", "weekly"],
          priority: "low",
          accountId: 2,
          messageCount: 2
        }
      ];

      res.json(mockThreads);
    } catch (error) {
      console.error("Error fetching inbox threads:", error);
      res.status(500).json({ message: "Failed to fetch inbox threads" });
    }
  });

  // Automation Rules API Routes
  app.get('/api/automation-rules', async (req, res) => {
    try {
      // Mock automation rules data for demo
      const mockRules = [
        {
          id: 1,
          name: "Auto-archive newsletters",
          trigger: "Email from newsletter sender",
          action: "Archive and mark as read",
          isActive: true,
          conditions: { senderContains: "newsletter", subjectContains: "unsubscribe" },
          createdAt: "2025-01-01"
        },
        {
          id: 2,
          name: "Priority flag for urgent emails",
          trigger: "Subject contains 'urgent' or 'ASAP'",
          action: "Mark as high priority and star",
          isActive: true,
          conditions: { subjectContains: ["urgent", "ASAP"], priority: "high" },
          createdAt: "2025-01-02"
        },
        {
          id: 3,
          name: "Team meeting auto-response",
          trigger: "Meeting invitations from team@company.com",
          action: "Auto-accept and add to calendar",
          isActive: false,
          conditions: { senderContains: "team@company.com", subjectContains: "meeting" },
          createdAt: "2025-01-03"
        }
      ];

      res.json(mockRules);
    } catch (error) {
      console.error("Error fetching automation rules:", error);
      res.status(500).json({ message: "Failed to fetch automation rules" });
    }
  });

  app.post('/api/automation-rules', async (req, res) => {
    try {
      const { name, trigger, action, conditions } = req.body;

      // Validate required fields
      if (!name || !trigger || !action) {
        return res.status(400).json({ message: "Name, trigger, and action are required" });
      }

      // In a real implementation, this would be saved to database
      const newRule = {
        id: Date.now(), // Simple ID generation for demo
        name,
        trigger,
        action,
        conditions: conditions || {},
        isActive: true,
        createdAt: new Date().toISOString()
      };

      console.log("Created new automation rule:", newRule);
      res.status(201).json(newRule);
    } catch (error) {
      console.error("Error creating automation rule:", error);
      res.status(500).json({ message: "Failed to create automation rule" });
    }
  });

  // Writing Style Learning Routes
  app.post('/api/writing-style/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailSamples } = req.body;
      const writingStyleService = await import('./services/writingStyleService');
      const profile = await writingStyleService.writingStyleService.analyzeWritingStyle(userId, emailSamples);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/writing-style/generate-draft', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const writingStyleService = await import('./services/writingStyleService');
      const draft = await writingStyleService.writingStyleService.generateStyledDraft(userId, req.body);
      res.json({ draft });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/writing-style/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const writingStyleService = await import('./services/writingStyleService');
      const profile = await writingStyleService.writingStyleService.getWritingStyleProfile(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Attachment Analysis Routes
  app.post('/api/attachments/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { attachments } = req.body; // Array of attachments with filename, mimeType, size, data
      const attachmentService = await import('./services/attachmentService');
      const analyses = await attachmentService.attachmentService.analyzeAttachments(attachments);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/attachments/analysis/:emailId', isAuthenticated, async (req: any, res) => {
    try {
      const { emailId } = req.params;
      const analysis = await storage.getAttachmentAnalysis(emailId);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/attachments/user-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getAttachmentAnalysisByUser(userId);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Calendar Integration Routes
  app.get('/api/calendar/auth-url', isAuthenticated, async (req: any, res) => {
    try {
      const calendarService = await import('./services/calendarService');
      const authUrl = await calendarService.calendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calendar/exchange-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      const calendarService = await import('./services/calendarService');
      await calendarService.calendarService.exchangeCodeForTokens(code, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/calendar/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      const calendarService = await import('./services/calendarService');
      const availability = await calendarService.calendarService.getAvailability(userId, startDate as string, endDate as string);
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calendar/create-event', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calendarService = await import('./services/calendarService');
      const eventId = await calendarService.calendarService.createEvent(userId, req.body);
      res.json({ eventId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calendar/detect-meeting', isAuthenticated, async (req: any, res) => {
    try {
      const { emailContent, subject } = req.body;
      const calendarService = await import('./services/calendarService');
      const meetingRequest = await calendarService.calendarService.detectMeetingRequest(emailContent, subject);
      res.json(meetingRequest);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calendar/suggest-times', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calendarService = await import('./services/calendarService');
      const suggestions = await calendarService.calendarService.suggestMeetingTimes(userId, req.body);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserCalendarEvents(userId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Register sentiment analysis routes
  registerSentimentAnalysisRoutes(app);

  // Register workload management routes
  registerWorkloadManagementRoutes(app);

  // Smart Folder Organization API routes
  app.post('/api/smart-folders/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emails } = req.body;
      
      // Analyze email patterns and suggest folder structures
      const suggestions = await smartFolderService.analyzeFolderStructure(userId, emails);
      
      // Create folder suggestions for user review
      const folderSuggestions = await smartFolderService.createFolderSuggestions(userId, suggestions);
      
      res.json({ 
        suggestions: folderSuggestions,
        analysisCount: emails.length 
      });
    } catch (error: any) {
      console.error("Error analyzing folder structure:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/smart-folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folders = await storage.getSmartFolders(userId);
      res.json(folders);
    } catch (error: any) {
      console.error("Error fetching smart folders:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smart-folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderData = { ...req.body, userId };
      const folder = await storage.createSmartFolder(folderData);
      res.status(201).json(folder);
    } catch (error: any) {
      console.error("Error creating smart folder:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/smart-folders/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestions = await storage.getFolderSuggestions(userId);
      res.json(suggestions);
    } catch (error: any) {
      console.error("Error fetching folder suggestions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smart-folders/suggestions/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestionId = parseInt(req.params.id);
      
      const folder = await smartFolderService.acceptFolderSuggestion(suggestionId, userId);
      
      res.json({ 
        message: 'Folder suggestion accepted',
        folder 
      });
    } catch (error: any) {
      console.error("Error accepting folder suggestion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smart-folders/emails/group-similar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emails } = req.body;
      
      // Find similar email groups for batch processing
      const suggestions = await smartFolderService.findSimilarEmailGroups(userId, emails);
      
      // Create similar email groups
      const groups = await smartFolderService.createSimilarEmailGroups(userId, suggestions);
      
      res.json({ 
        groups,
        groupsCount: groups.length 
      });
    } catch (error: any) {
      console.error("Error grouping similar emails:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/smart-folders/email-groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getSimilarEmailGroups(userId);
      res.json(groups);
    } catch (error: any) {
      console.error("Error fetching email groups:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smart-folders/emails/assign', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailId, folderId, assignmentType = 'manual', confidence } = req.body;
      
      const assignment = await smartFolderService.assignEmailToFolder(
        userId, 
        emailId, 
        folderId, 
        assignmentType,
        confidence
      );
      
      res.json({ 
        message: 'Email assigned to folder',
        assignment 
      });
    } catch (error: any) {
      console.error("Error assigning email to folder:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smart-folders/auto-create/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { email } = req.body;
      
      // Check for auto-creation opportunities
      const autoCreatedFolders = await smartFolderService.checkAutoCreateFolders(userId, email);
      
      res.json({ 
        autoCreatedFolders,
        count: autoCreatedFolders.length 
      });
    } catch (error: any) {
      console.error("Error checking auto-create folders:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Email Performance Insights API routes
  app.get('/api/email-performance/contact/:contactEmail', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactEmail } = req.params;
      
      const performance = await emailPerformanceService.analyzeContactPerformance(userId, contactEmail);
      res.json(performance);
    } catch (error: any) {
      console.error("Error analyzing contact performance:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/email-performance/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await emailPerformanceService.generateCommunicationInsights(userId);
      res.json({ insights });
    } catch (error: any) {
      console.error("Error generating communication insights:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/email-performance/thread/:threadId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { threadId } = req.params;
      
      const analysis = await emailPerformanceService.analyzeEmailThread(userId, threadId);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing email thread:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/email-performance/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emailData = req.body;
      
      await emailPerformanceService.updateContactMetrics(userId, emailData);
      res.json({ message: 'Email performance tracked successfully' });
    } catch (error: any) {
      console.error("Error tracking email performance:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/email-performance/demo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate demo performance data for showcase
      const demoContacts = [
        {
          contactEmail: 'sarah.johnson@techcorp.com',
          contactName: 'Sarah Johnson',
          totalEmailsSent: 12,
          totalEmailsReceived: 8,
          responseRate: 66.7,
          avgResponseTime: 4.2,
          communicationEfficiencyScore: 78,
          lastInteractionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          preferredCommunicationTime: 'morning (around 9:00)',
          engagementTrend: 'increasing' as const,
          recommendedActions: [
            'Continue current communication approach',
            'Consider scheduling morning meetings',
            'Send follow-ups within 24 hours'
          ],
          channelSwitchSuggestion: {
            suggested: false,
            reason: 'Email communication is effective',
            alternativeChannel: 'phone' as const,
            urgencyLevel: 'low' as const
          }
        },
        {
          contactEmail: 'mike.chen@startup.io',
          contactName: 'Mike Chen',
          totalEmailsSent: 15,
          totalEmailsReceived: 3,
          responseRate: 20,
          avgResponseTime: 48.5,
          communicationEfficiencyScore: 32,
          lastInteractionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          preferredCommunicationTime: undefined,
          engagementTrend: 'decreasing' as const,
          recommendedActions: [
            'Switch to phone or video call',
            'Simplify email content',
            'Try different timing approach'
          ],
          channelSwitchSuggestion: {
            suggested: true,
            reason: 'Low response rate and slow responses suggest email fatigue',
            alternativeChannel: 'phone' as const,
            urgencyLevel: 'high' as const
          }
        }
      ];

      const demoInsights = [
        {
          type: 'response_rate' as const,
          title: 'Low Response Rate Contacts',
          description: '3 contacts have response rates below 25%',
          impact: 'negative' as const,
          severity: 'medium' as const,
          actionItems: [
            'Consider switching to phone or video calls',
            'Review email content and timing',
            'Personalize outreach approach'
          ],
          affectedContacts: ['mike.chen@startup.io', 'alex.wong@enterprise.com', 'lisa.park@agency.co'],
          metrics: {
            contactCount: 3,
            avgResponseRate: 18.5
          }
        },
        {
          type: 'timing' as const,
          title: 'Optimal Send Time Identified',
          description: 'Emails sent at 9:00 have 72.3% response rate',
          impact: 'positive' as const,
          severity: 'low' as const,
          actionItems: [
            'Schedule emails for 9:00 when possible',
            'Avoid sending during low-response hours',
            'Use email scheduling features'
          ],
          affectedContacts: [],
          metrics: {
            optimalHour: 9,
            optimalResponseRate: 72.3,
            avgResponseRate: 45.2
          }
        }
      ];

      res.json({
        contacts: demoContacts,
        insights: demoInsights,
        summary: {
          totalContacts: demoContacts.length,
          avgResponseRate: 43.4,
          avgEfficiencyScore: 55,
          channelSwitchCandidates: 1
        }
      });
    } catch (error: any) {
      console.error("Error generating demo performance data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Predictive Analytics API routes
  app.get('/api/predictive-analytics/forecasts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { predictiveAnalyticsService } = await import('./predictive-analytics-service');
      
      // Generate demo analytics data for showcase
      const analyticsData = await predictiveAnalyticsService.processDemoAnalytics(userId);
      res.json(analyticsData);
    } catch (error: any) {
      console.error("Error fetching predictive analytics:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/predictive-analytics/volume-forecasts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const forecasts = await storage.getEmailVolumeForecasts(userId, 7);
      res.json(forecasts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/predictive-analytics/followup-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { highRiskOnly, limit } = req.query;
      const predictions = await storage.getEmailFollowupPredictions(userId, {
        highRiskOnly: highRiskOnly === 'true',
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(predictions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/predictive-analytics/communication-patterns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { priority, limit } = req.query;
      const patterns = await storage.getCommunicationPatternAnalysis(userId, {
        priority: priority as string,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(patterns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/predictive-analytics/roi-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { periodType, limit } = req.query;
      const roiData = await storage.getEmailRoiAnalysis(
        userId, 
        periodType as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(roiData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/predictive-analytics/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { acknowledged, priority, limit } = req.query;
      const insights = await storage.getPredictiveAnalyticsInsights(userId, {
        acknowledged: acknowledged !== undefined ? acknowledged === 'true' : undefined,
        priority: priority as string,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/predictive-analytics/insights/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const insight = await storage.updatePredictiveAnalyticsInsight(parseInt(id), updates);
      res.json(insight);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cross-Account Intelligence API Routes
  app.get('/api/cross-account/overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const overview = await crossAccountIntelligenceService.getCrossAccountOverview(userId);
      res.json(overview);
    } catch (error: any) {
      console.error("Error fetching cross-account overview:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/cross-account/contact-intelligence', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await crossAccountIntelligenceService.analyzeContactIntelligence(userId);
      res.json(contacts);
    } catch (error: any) {
      console.error("Error analyzing contact intelligence:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/cross-account/duplicate-conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplicates = await crossAccountIntelligenceService.detectDuplicateConversations(userId);
      res.json(duplicates);
    } catch (error: any) {
      console.error("Error detecting duplicate conversations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/cross-account/optimizations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const optimizations = await crossAccountIntelligenceService.generateAccountOptimizations(userId);
      res.json(optimizations);
    } catch (error: any) {
      console.error("Error generating account optimizations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/cross-account/apply-optimization/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const optimization = await storage.updateAccountOptimization(parseInt(id), { status: "applied", appliedAt: new Date() });
      res.json(optimization);
    } catch (error: any) {
      console.error("Error applying optimization:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/cross-account/dismiss-optimization/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const optimization = await storage.updateAccountOptimization(parseInt(id), { status: "dismissed" });
      res.json(optimization);
    } catch (error: any) {
      console.error("Error dismissing optimization:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/cross-account/resolve-duplicate/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'merge' or 'keep-separate'
      const duplicate = await storage.updateDuplicateConversation(parseInt(id), { 
        status: action === 'merge' ? 'merged' : 'resolved',
        resolvedAt: new Date()
      });
      res.json(duplicate);
    } catch (error: any) {
      console.error("Error resolving duplicate conversation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Voice Email Assistant API routes
  app.post('/api/voice/command', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { audioBuffer } = req.body; // Expecting base64 encoded audio
      
      if (!audioBuffer) {
        return res.status(400).json({ error: "Audio data is required" });
      }

      // Convert base64 to buffer
      const audioData = Buffer.from(audioBuffer, 'base64');
      
      const result = await voiceEmailService.processVoiceCommand(userId, audioData);
      res.json(result);
    } catch (error: any) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/voice/response', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { originalEmailId, voiceInput, conversationContext } = req.body;
      
      if (!originalEmailId || !voiceInput) {
        return res.status(400).json({ error: "Original email ID and voice input are required" });
      }

      const result = await voiceEmailService.generateVoiceResponse(
        userId,
        originalEmailId,
        voiceInput,
        conversationContext
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error generating voice response:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/voice/audio-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailIds, summaryType = 'daily' } = req.body;
      
      if (!emailIds || !Array.isArray(emailIds)) {
        return res.status(400).json({ error: "Email IDs array is required" });
      }

      const result = await voiceEmailService.generateEmailAudioSummary(
        userId,
        emailIds,
        summaryType
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error generating audio summary:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/voice/ai-draft', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { originalEmailId, emailContent, responseType = 'professional' } = req.body;
      
      if (!originalEmailId || !emailContent) {
        return res.status(400).json({ error: "Original email ID and content are required" });
      }

      const result = await voiceEmailService.generateAIDraftResponse(
        userId,
        originalEmailId,
        emailContent,
        responseType
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error generating AI draft:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/voice/commands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const commands = await voiceEmailService.getVoiceCommandHistory(userId, limit);
      res.json(commands);
    } catch (error: any) {
      console.error("Error fetching voice commands:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/voice/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const responses = await voiceEmailService.getVoiceResponseHistory(userId, limit);
      res.json(responses);
    } catch (error: any) {
      console.error("Error fetching voice responses:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/voice/audio-summaries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const summaries = await voiceEmailService.getAudioSummaries(userId, limit);
      res.json(summaries);
    } catch (error: any) {
      console.error("Error fetching audio summaries:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/voice/demo/commands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const demoCommands = voiceEmailService.generateDemoVoiceCommands(userId);
      res.json(demoCommands);
    } catch (error: any) {
      console.error("Error generating demo voice commands:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/voice/demo/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const demoResponses = voiceEmailService.generateDemoVoiceResponses(userId);
      res.json(demoResponses);
    } catch (error: any) {
      console.error("Error generating demo voice responses:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/voice/demo/audio-summaries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const demoSummaries = voiceEmailService.generateDemoAudioSummaries(userId);
      res.json(demoSummaries);
    } catch (error: any) {
      console.error("Error generating demo audio summaries:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Email Scheduling Intelligence routes
  app.post("/api/scheduling/recipient-analysis", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipients } = req.body;
      
      if (!recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ message: "Recipients array is required" });
      }

      const analysis = await emailSchedulingService.analyzeRecipients(recipients, userId);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing recipients:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scheduling/optimal-time", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipients, emailContent, currentTime } = req.body;
      
      if (!recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ message: "Recipients array is required" });
      }

      const optimalTime = await emailSchedulingService.findOptimalSendTime(
        recipients, 
        emailContent || "", 
        userId
      );
      res.json(optimalTime);
    } catch (error: any) {
      console.error("Error finding optimal send time:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scheduling/schedule", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipients, subject, content, scheduledFor, useSmartTiming, reason } = req.body;
      
      if (!recipients || !subject || !content || !scheduledFor) {
        return res.status(400).json({ message: "Recipients, subject, content, and scheduled time are required" });
      }

      const scheduledEmail = await emailSchedulingService.scheduleEmailWithCancellation({
        userId,
        recipients,
        subject,
        content,
        scheduledFor: new Date(scheduledFor),
        useSmartTiming,
        reason
      });
      res.json(scheduledEmail);
    } catch (error: any) {
      console.error("Error scheduling email:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scheduling/send-delayed", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipients, subject, content, delayMinutes, scheduledFor } = req.body;
      
      if (!recipients || !subject || !content || !delayMinutes) {
        return res.status(400).json({ message: "Recipients, subject, content, and delay are required" });
      }

      const delayedEmail = await emailSchedulingService.scheduleEmailWithCancellation({
        userId,
        recipients,
        subject,
        content,
        scheduledFor: new Date(scheduledFor),
        cancellationWindowMinutes: delayMinutes,
        reason: `Delayed send with ${delayMinutes} minute cancellation window`
      });
      res.json(delayedEmail);
    } catch (error: any) {
      console.error("Error sending delayed email:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scheduling/cancel/:emailId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const emailId = parseInt(req.params.emailId);
      
      if (!emailId) {
        return res.status(400).json({ message: "Email ID is required" });
      }

      const result = await emailSchedulingService.cancelScheduledEmail(emailId, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error cancelling scheduled email:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Email Sync Service Routes
  app.get("/api/email-sync/providers", (req, res) => {
    const { emailSyncService } = require("./email-sync-service");
    res.json(emailSyncService.getSupportedProviders());
  });

  app.post("/api/email-sync/connect", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { emailSyncService } = require("./email-sync-service");
      const { provider, credentials } = req.body;
      const userId = req.user.id;

      const account = await emailSyncService.connectEmailAccount(userId, provider, credentials);
      res.status(201).json(account);
    } catch (error: any) {
      console.error("Error connecting email account:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/email-sync/accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user.id;
      const accounts = await storage.getEmailAccounts(userId);
      res.json(accounts);
    } catch (error: any) {
      console.error("Error fetching email accounts:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/email-sync/accounts/:accountId/sync", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { emailSyncService } = require("./email-sync-service");
      const { accountId } = req.params;
      const userId = req.user.id;

      const folders = await emailSyncService.syncFolderStructure(parseInt(accountId), userId);
      res.json({ success: true, folders });
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/email-sync/accounts/:accountId/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { emailSyncService } = require("./email-sync-service");
      const { accountId } = req.params;

      const progress = await emailSyncService.getSyncProgress(parseInt(accountId));
      res.json(progress);
    } catch (error: any) {
      console.error("Error getting sync progress:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/email-sync/folders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { emailSyncService } = require("./email-sync-service");
      const userId = req.user.id;

      const folders = await emailSyncService.getAllSyncedFolders(userId);
      res.json(folders);
    } catch (error: any) {
      console.error("Error fetching synced folders:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/email-sync/accounts/:accountId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { emailSyncService } = require("./email-sync-service");
      const { accountId } = req.params;
      const userId = req.user.id;

      await emailSyncService.disconnectEmailAccount(parseInt(accountId), userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error disconnecting email account:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Demo endpoint for email sync functionality
  app.get("/api/email-sync/demo", (req, res) => {
    const { emailSyncService } = require("./email-sync-service");
    
    // Demo data showing email account synchronization
    const demoData = {
      connectedAccounts: [
        {
          id: 1,
          provider: 'gmail',
          email: 'user@gmail.com',
          displayName: 'Personal Gmail',
          syncStatus: 'completed',
          lastSyncAt: new Date(),
          folderCount: 6,
          emailCount: 1247
        },
        {
          id: 2,
          provider: 'outlook',
          email: 'user@company.com',
          displayName: 'Work Outlook',
          syncStatus: 'completed',
          lastSyncAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          folderCount: 8,
          emailCount: 892
        }
      ],
      syncedFolders: [
        {
          id: 'gmail_inbox',
          name: 'Inbox (Gmail)',
          provider: 'gmail',
          messageCount: 150,
          unreadCount: 12,
          smartFolderId: 101
        },
        {
          id: 'gmail_work',
          name: 'Work Projects (Gmail)',
          provider: 'gmail',
          messageCount: 67,
          unreadCount: 8,
          smartFolderId: 102
        },
        {
          id: 'outlook_inbox',
          name: 'Inbox (Outlook)',
          provider: 'outlook',
          messageCount: 203,
          unreadCount: 18,
          smartFolderId: 103
        },
        {
          id: 'outlook_clients',
          name: 'Clients (Outlook)',
          provider: 'outlook',
          messageCount: 89,
          unreadCount: 11,
          smartFolderId: 104
        }
      ],
      totalSyncedEmails: 2139,
      totalUnreadEmails: 49,
      supportedProviders: emailSyncService.getSupportedProviders()
    };

    res.json(demoData);
  });

  // Cleanup expired tokens periodically
  setInterval(async () => {
    try {
      await storage.cleanupExpiredTokens();
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  }, 60 * 60 * 1000); // Run every hour

  // Subscription Management Routes (protected)
  app.post('/api/subscription/create', isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const subscription = await billingService.createSubscription(userId, planId);
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.post('/api/subscription/cancel', isAuthenticated, async (req, res) => {
    try {
      const { immediate } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      await billingService.cancelSubscription(userId, immediate);
      res.json({ success: true });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  app.get('/api/subscription/usage', async (req: any, res) => {
    try {
      let userId;



      // Check for traditional session authentication first
      if (req.session?.userId) {
        userId = req.session.userId;
      }
      // Fallback to Replit Auth if available
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      else {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const usage = await billingService.enforceUsageLimits(userId);
      res.json(usage);
    } catch (error) {
      console.error('Error checking usage:', error);
      res.status(500).json({ message: 'Failed to check usage' });
    }
  });

  app.get('/api/billing/events', async (req: any, res) => {
    try {
      let userId;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Check for traditional session authentication first
      if (req.session?.userId) {
        userId = req.session.userId;
      }
      // Fallback to Replit Auth if available
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      else {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const events = await storage.getBillingEvents(userId, limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching billing events:', error);
      res.status(500).json({ message: 'Failed to fetch billing events' });
    }
  });

  // Stripe Webhook Routes
  app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).send('Webhook secret not configured');
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await billingService.handleInvoicePaymentSucceeded(
            event.data.object.id,
            event.data.object.subscription,
            event.data.object.customer
          );
          break;
        case 'invoice.payment_failed':
          await billingService.handlePaymentFailed(
            event.data.object.subscription,
            event.data.object.customer
          );
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await billingService.handlePaymentSuccess(
            event.data.object.id,
            event.data.object.customer
          );
          break;
        case 'customer.subscription.deleted':
          await billingService.handleSubscriptionCanceled(
            event.data.object.id,
            event.data.object.customer
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(400).send('Webhook error');
    }
  });

  // Email Threat Detection Routes
  app.post('/api/email/analyze-threat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { EmailThreatDetectionService } = await import('./email-threat-detection-service.js');
      const threatService = new EmailThreatDetectionService(storage);
      
      const analysis = await threatService.analyzeEmailThreat(userId, req.body);
      res.json(analysis);
    } catch (error: any) {
      console.error('Email threat analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze email threat' });
    }
  });

  app.post('/api/email/analyze-sender', isAuthenticated, async (req: any, res) => {
    try {
      const { EmailThreatDetectionService } = await import('./email-threat-detection-service.js');
      const threatService = new EmailThreatDetectionService(storage);
      
      const { emailAddress } = req.body;
      const reputation = await threatService.analyzeSenderReputation(emailAddress);
      res.json(reputation);
    } catch (error: any) {
      console.error('Sender reputation analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze sender reputation' });
    }
  });

  app.post('/api/email/batch-analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { EmailThreatDetectionService } = await import('./email-threat-detection-service.js');
      const threatService = new EmailThreatDetectionService(storage);
      
      const { emails } = req.body;
      const analyses = await threatService.batchAnalyzeEmails(userId, emails);
      res.json(analyses);
    } catch (error: any) {
      console.error('Batch email analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze emails' });
    }
  });

  app.get('/api/email/threat-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { EmailThreatDetectionService } = await import('./email-threat-detection-service.js');
      const threatService = new EmailThreatDetectionService(storage);
      
      const stats = await threatService.getThreatStatistics(userId);
      res.json(stats);
    } catch (error: any) {
      console.error('Threat statistics error:', error);
      res.status(500).json({ error: 'Failed to get threat statistics' });
    }
  });

  app.get('/api/security/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { status } = req.query;
      const alerts = await storage.getSecurityAlertsByUser(userId, status);
      res.json(alerts);
    } catch (error: any) {
      console.error('Security alerts error:', error);
      res.status(500).json({ error: 'Failed to get security alerts' });
    }
  });

  app.patch('/api/security/alerts/:alertId/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { alertId } = req.params;
      await storage.updateSecurityAlert(parseInt(alertId), {
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  });

  // Admin User Management Routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is admin (simplified - in production, you'd have proper role checking)
      const adminUser = await storage.getUser(userId);
      if (!adminUser || adminUser.email !== 'admin@zema.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { limit = 50, offset = 0 } = req.query;
      const users = await storage.getAllUsers(parseInt(limit), parseInt(offset));
      res.json(users);
    } catch (error: any) {
      console.error('Admin get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  app.get('/api/admin/users-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is admin
      const adminUser = await storage.getUser(userId);
      if (!adminUser || adminUser.email !== 'admin@zema.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const stats = await storage.getUsersStats();
      
      // Transform the data to match frontend expectations
      const adminStats = {
        totalUsers: stats.total,
        activeSubscribers: stats.active,
        trialUsers: stats.trial,
        expiredTrials: 0, // Calculate expired trials
        totalRevenue: stats.pro * 19 + stats.enterprise * 49, // Simplified revenue calculation
        monthlyRevenue: stats.pro * 19 + stats.enterprise * 49,
        totalEmailsProcessed: 0, // Will need to calculate from user data
        averageEmailsPerUser: 0,
        totalAiCosts: 0,
        totalAzureCosts: 0,
        averageAiCostPerUser: 0,
        averageAzureCostPerUser: 0
      };
      
      res.json(adminStats);
    } catch (error: any) {
      console.error('Admin get user stats error:', error);
      res.status(500).json({ error: 'Failed to get user statistics' });
    }
  });

  app.patch('/api/admin/users/:userId/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub || req.session?.userId;
      if (!adminUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is admin
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || adminUser.email !== 'admin@zema.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId } = req.params;
      const { plan, status } = req.body;

      if (!plan || !status) {
        return res.status(400).json({ error: 'Plan and status are required' });
      }

      if (!['free', 'pro', 'enterprise'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan. Must be free, pro, or enterprise' });
      }

      if (!['trial', 'active', 'cancelled', 'expired'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updatedUser = await storage.adminUpdateUserSubscription(userId, plan, status, adminUserId);
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Admin update subscription error:', error);
      res.status(500).json({ error: 'Failed to update user subscription' });
    }
  });

  app.patch('/api/admin/users/:userId/block', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub || req.session?.userId;
      if (!adminUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is admin
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || adminUser.email !== 'admin@zema.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Block reason is required' });
      }

      const blockedUser = await storage.adminBlockUser(userId, reason, adminUserId);
      res.json(blockedUser);
    } catch (error: any) {
      console.error('Admin block user error:', error);
      res.status(500).json({ error: 'Failed to block user' });
    }
  });

  app.patch('/api/admin/users/:userId/unblock', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub || req.session?.userId;
      if (!adminUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is admin
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || adminUser.email !== 'admin@zema.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId } = req.params;
      const unblockedUser = await storage.adminUnblockUser(userId, adminUserId);
      res.json(unblockedUser);
    } catch (error: any) {
      console.error('Admin unblock user error:', error);
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  });

  // Register additional routes
  registerSentimentAnalysisRoutes(app);
  registerWorkloadManagementRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
