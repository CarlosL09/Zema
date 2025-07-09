import {
  pgTable,
  text,
  serial,
  timestamp,
  varchar,
  jsonb,
  index,
  boolean,
  integer,
  date,
  decimal,
  real
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User table for authentication  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Email/Password Authentication
  passwordHash: varchar("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  gmailConnected: boolean("gmail_connected").default(false),
  gmailRefreshToken: text("gmail_refresh_token"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("trial"),
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, pro, enterprise
  
  // Admin controls
  isBlocked: boolean("is_blocked").default(false),
  blockedReason: text("blocked_reason"),
  blockedAt: timestamp("blocked_at"),
  blockedBy: varchar("blocked_by"), // admin user ID
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  emailsProcessedThisMonth: integer("emails_processed_this_month").default(0),
  emailLimitPerMonth: integer("email_limit_per_month").default(500),
  billingPeriodStart: timestamp("billing_period_start"),
  
  // AI & Azure Usage Tracking
  aiTokensUsedThisMonth: integer("ai_tokens_used_this_month").default(0),
  aiCostThisMonth: integer("ai_cost_this_month").default(0), // in cents
  azureCreditsUsed: integer("azure_credits_used").default(0), // in cents
  azureCreditsLimit: integer("azure_credits_limit").default(10000), // $100 default limit in cents
  
  // Security fields  
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  
  // MFA fields
  mfaSecret: text("mfa_secret"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaBackupCodes: jsonb("mfa_backup_codes").$type<string[]>(),
  mfaFailedAttempts: integer("mfa_failed_attempts").default(0),
  mfaLastFailedAt: timestamp("mfa_last_failed_at"),
  
  // API access
  apiKey: varchar("api_key"),
  apiKeyCreatedAt: timestamp("api_key_created_at"),
  
  // Calendar Integration
  calendarAccessToken: text("calendar_access_token"),
  calendarRefreshToken: text("calendar_refresh_token"),
  calendarConnected: boolean("calendar_connected").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Email threads table
export const emailThreads = pgTable("email_threads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: varchar("thread_id").notNull(),
  subject: text("subject"),
  participants: jsonb("participants").$type<string[]>(),
  lastActivity: timestamp("last_activity"),
  isProcessed: boolean("is_processed").default(false),
  priority: varchar("priority").default("normal"),
  aiLabels: jsonb("ai_labels").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailThread = typeof emailThreads.$inferSelect;
export type InsertEmailThread = typeof emailThreads.$inferInsert;

// AI-generated email drafts
export const emailDrafts = pgTable("email_drafts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: integer("thread_id").references(() => emailThreads.id),
  originalEmailId: varchar("original_email_id"),
  draftContent: text("draft_content").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  context: jsonb("context"),
  status: varchar("status").default("pending"), // pending, approved, rejected, sent
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailDraft = typeof emailDrafts.$inferSelect;
export type InsertEmailDraft = typeof emailDrafts.$inferInsert;

// Smart rules for email automation
export const smartRules = pgTable("smart_rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  conditions: jsonb("conditions").notNull(),
  actions: jsonb("actions").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SmartRule = typeof smartRules.$inferSelect;
export type InsertSmartRule = typeof smartRules.$inferInsert;

// Usage analytics
export const usageAnalytics = pgTable("usage_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventType: varchar("event_type").notNull(), // email_processed, draft_generated, draft_sent, etc.
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type InsertUsageAnalytic = typeof usageAnalytics.$inferInsert;

// Business integrations
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // slack, calendar, outlook, gmail, etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  settings: jsonb("settings"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

// Email accounts table for multi-account support
export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailAddress: varchar("email_address").notNull(),
  provider: varchar("provider").notNull(), // gmail, outlook, yahoo, other
  displayName: varchar("display_name"),
  // OAuth fields (for Gmail, Outlook)
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  // Password-based authentication fields (for Yahoo, other providers)
  encryptedPassword: text("encrypted_password"), // encrypted app password or regular password
  // IMAP configuration (for other providers)
  imapServer: varchar("imap_server"),
  imapPort: integer("imap_port"),
  imapSecurity: varchar("imap_security").default("SSL/TLS"), // SSL/TLS, STARTTLS, None
  // Common fields
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  settings: jsonb("settings"), // provider-specific settings
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: varchar("sync_status").default("pending") // pending, syncing, completed, error
});

export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = typeof emailAccounts.$inferInsert;

// Keep existing demo and newsletter tables
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  name: true,
  email: true,
  company: true,
  message: true,
});

export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsletterSchema = createInsertSchema(newsletters).pick({
  email: true,
});

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

// Email summaries
export const emailSummaries = pgTable("email_summaries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: varchar("thread_id").notNull(),
  summary: text("summary").notNull(),
  keyPoints: jsonb("key_points").$type<string[]>().default([]),
  actionItems: jsonb("action_items").$type<string[]>().default([]),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailSummary = typeof emailSummaries.$inferSelect;
export type InsertEmailSummary = typeof emailSummaries.$inferInsert;

// Follow-up reminders
export const followUpReminders = pgTable("followup_reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: varchar("thread_id").notNull(),
  emailId: varchar("email_id").notNull(),
  reminderTime: timestamp("reminder_time").notNull(),
  followUpType: varchar("followup_type").notNull(), // response_reminder, status_update, etc.
  reason: text("reason"),
  isCompleted: boolean("is_completed").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FollowUpReminder = typeof followUpReminders.$inferSelect;
export type InsertFollowUpReminder = typeof followUpReminders.$inferInsert;

// Quick replies cache
export const quickRepliesCache = pgTable("quick_replies_cache", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailHash: varchar("email_hash").notNull(), // hash of subject + sender + body snippet
  replies: jsonb("replies").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export type QuickReplyCache = typeof quickRepliesCache.$inferSelect;
export type InsertQuickReplyCache = typeof quickRepliesCache.$inferInsert;

// Business Intelligence - Email Analytics
export const emailAnalytics = pgTable("email_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  emailsReceived: integer("emails_received").default(0),
  emailsSent: integer("emails_sent").default(0),
  avgResponseTime: integer("avg_response_time_minutes").default(0),
  totalProcessingTime: integer("total_processing_time_minutes").default(0),
  vipEmailsCount: integer("vip_emails_count").default(0),
  urgentEmailsCount: integer("urgent_emails_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailAnalytic = typeof emailAnalytics.$inferSelect;
export type InsertEmailAnalytic = typeof emailAnalytics.$inferInsert;

// Lead Scoring
export const leadScores = pgTable("lead_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactEmail: varchar("contact_email").notNull(),
  contactName: varchar("contact_name"),
  company: varchar("company"),
  score: integer("score").default(0), // 0-100
  engagementLevel: varchar("engagement_level"), // high, medium, low
  lastEmailDate: timestamp("last_email_date"),
  emailCount: integer("email_count").default(0),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("0.0"),
  avgResponseTime: integer("avg_response_time_hours").default(0),
  topics: jsonb("topics").$type<string[]>().default([]),
  sentiment: varchar("sentiment").default("neutral"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type LeadScore = typeof leadScores.$inferSelect;
export type InsertLeadScore = typeof leadScores.$inferInsert;

// Security & Compliance
export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailId: varchar("email_id").notNull(),
  threadId: varchar("thread_id"),
  alertType: varchar("alert_type").notNull(), // phishing, pii, financial, compliance, suspicious
  severity: varchar("severity").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  detectedContent: text("detected_content"),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = typeof securityAlerts.$inferInsert;

// Workflow Automation
export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  trigger: jsonb("trigger").notNull(), // conditions that trigger the rule
  actions: jsonb("actions").notNull(), // actions to perform
  isActive: boolean("is_active").default(true),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = typeof automationRules.$inferInsert;

// CRM Integration
export const crmSyncLogs = pgTable("crm_sync_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailId: varchar("email_id").notNull(),
  crmType: varchar("crm_type").notNull(), // salesforce, hubspot, pipedrive, etc
  syncStatus: varchar("sync_status").notNull(), // pending, success, failed
  syncData: jsonb("sync_data"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CrmSyncLog = typeof crmSyncLogs.$inferSelect;
export type InsertCrmSyncLog = typeof crmSyncLogs.$inferInsert;

// Task Management Integration
export const taskIntegrations = pgTable("task_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailId: varchar("email_id").notNull(),
  taskId: varchar("task_id"),
  platform: varchar("platform").notNull(), // asana, trello, jira, etc
  taskTitle: varchar("task_title").notNull(),
  taskDescription: text("task_description"),
  priority: varchar("priority"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("created"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TaskIntegration = typeof taskIntegrations.$inferSelect;
export type InsertTaskIntegration = typeof taskIntegrations.$inferInsert;

// Custom Templates
export const customTemplates = pgTable("custom_templates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  icon: varchar("icon").default("⚡"),
  triggers: jsonb("triggers").notNull(), // Array of trigger conditions
  actions: jsonb("actions").notNull(), // Array of actions to perform
  conditions: jsonb("conditions"), // Optional conditions/filters
  settings: jsonb("settings"), // Template configuration
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(false), // Allow sharing with community
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CustomTemplate = typeof customTemplates.$inferSelect;
export type InsertCustomTemplate = typeof customTemplates.$inferInsert;

// Custom Rules
export const customRules = pgTable("custom_rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  ruleType: varchar("rule_type").notNull(), // email_filter, auto_response, forwarding, etc
  conditions: jsonb("conditions").notNull(), // When to trigger
  actions: jsonb("actions").notNull(), // What to do
  priority: integer("priority").default(100), // Rule execution order
  isActive: boolean("is_active").default(true),
  triggerCount: integer("trigger_count").default(0),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CustomRule = typeof customRules.$inferSelect;
export type InsertCustomRule = typeof customRules.$inferInsert;

// Template Usage Analytics
export const templateUsage = pgTable("template_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").references(() => customTemplates.id),
  systemTemplateId: varchar("system_template_id"), // For system templates
  executionTime: integer("execution_time"), // in milliseconds
  status: varchar("status").notNull(), // success, failed, partial
  errorMessage: text("error_message"),
  triggerData: jsonb("trigger_data"),
  actionResults: jsonb("action_results"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TemplateUsage = typeof templateUsage.$inferSelect;
export type InsertTemplateUsage = typeof templateUsage.$inferInsert;

// Audit log table for security and compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // login, logout, data_read, data_write, etc.
  resource: varchar("resource").notNull(), // user, email, integration, etc.
  details: text("details"), // encrypted JSON with additional context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"), // encrypted
  success: boolean("success").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: varchar("session_id"),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// AI & Azure Usage Tracking Tables
export const aiUsageLog = pgTable("ai_usage_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  service: varchar("service").notNull(), // "openai", "azure-gpt", "azure-vision", etc.
  operation: varchar("operation").notNull(), // "chat-completion", "image-generation", "text-analysis"
  tokensUsed: integer("tokens_used").default(0),
  costInCents: integer("cost_in_cents").default(0),
  requestData: jsonb("request_data"), // Store request details for debugging
  responseData: jsonb("response_data"), // Store response metadata
  timestamp: timestamp("timestamp").defaultNow(),
  billingPeriod: varchar("billing_period").notNull() // "2025-01" format for monthly tracking
});

export const azureUsageLog = pgTable("azure_usage_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  service: varchar("service").notNull(), // "graph-api", "cognitive-services", "storage"
  operation: varchar("operation").notNull(), // "email-read", "calendar-sync", "file-upload"
  creditsUsed: integer("credits_used").default(0), // in cents
  apiCalls: integer("api_calls").default(1),
  dataTransferred: integer("data_transferred").default(0), // in KB
  timestamp: timestamp("timestamp").defaultNow(),
  billingPeriod: varchar("billing_period").notNull(),
  metadata: jsonb("metadata") // Additional service-specific data
});

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  events: varchar("events").array().notNull().default([]),
  headers: jsonb("headers").default({}),
  secret: varchar("secret"),
  platform: varchar("platform").notNull(), // 'notion', 'zapier', 'pabbly', 'custom', etc.
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Email Scheduling Intelligence Tables
export const scheduledEmails = pgTable("scheduled_emails", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientName: varchar("recipient_name"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  timezoneSuggestion: varchar("timezone_suggestion"),
  optimalTimeSuggestion: varchar("optimal_time_suggestion"),
  recipientTimezone: varchar("recipient_timezone"),
  scheduleReason: varchar("schedule_reason"), // "optimal_time", "timezone_adjusted", "user_specified"
  status: varchar("status").notNull().default("scheduled"), // scheduled, sent, cancelled, failed
  emailAccountId: integer("email_account_id").references(() => emailAccounts.id),
  automationRuleId: integer("automation_rule_id").references(() => automationRules.id),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recipientTimeAnalytics = pgTable("recipient_time_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientName: varchar("recipient_name"),
  detectedTimezone: varchar("detected_timezone"),
  avgResponseTime: integer("avg_response_time"), // in minutes
  mostActiveHours: jsonb("most_active_hours").default("[]"), // [9, 10, 11, 14, 15, 16]
  bestResponseDays: jsonb("best_response_days").default("[]"), // ["monday", "tuesday", "wednesday"]
  totalEmailsSent: integer("total_emails_sent").default(0),
  totalResponses: integer("total_responses").default(0),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  lastEmailSent: timestamp("last_email_sent"),
  lastResponse: timestamp("last_response"),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).default("0.00"), // 0.00 to 1.00
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sendTimeOptimization = pgTable("send_time_optimization", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  globalOptimalHours: jsonb("global_optimal_hours").default("[]"), // User's global optimal send times
  globalOptimalDays: jsonb("global_optimal_days").default("[]"), // User's global optimal send days
  avgGlobalResponseRate: decimal("avg_global_response_rate", { precision: 5, scale: 2 }).default("0.00"),
  totalEmailsAnalyzed: integer("total_emails_analyzed").default(0),
  userTimezone: varchar("user_timezone"),
  personalityProfile: varchar("personality_profile"), // "early_bird", "night_owl", "standard_business"
  lastAnalysisRun: timestamp("last_analysis_run"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform integrations with API keys
export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  platform: varchar("platform").notNull(), // 'notion', 'zapier', 'pabbly', 'airtable', etc.
  name: varchar("name").notNull(),
  apiKey: varchar("api_key"), // Encrypted
  apiSecret: varchar("api_secret"), // Encrypted  
  accessToken: varchar("access_token"), // Encrypted
  refreshToken: varchar("refresh_token"), // Encrypted
  config: jsonb("config").default({}), // Platform-specific configuration
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  expiresAt: timestamp("expires_at"), // For tokens that expire
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type AiUsageLog = typeof aiUsageLog.$inferSelect;
export type InsertAiUsageLog = typeof aiUsageLog.$inferInsert;
export type AzureUsageLog = typeof azureUsageLog.$inferSelect;
export type InsertAzureUsageLog = typeof azureUsageLog.$inferInsert;

// Webhook types
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

export type PlatformIntegration = typeof platformIntegrations.$inferSelect;
export type InsertPlatformIntegration = typeof platformIntegrations.$inferInsert;

// Email Scheduling Intelligence types
export type ScheduledEmail = typeof scheduledEmails.$inferSelect;
export type InsertScheduledEmail = typeof scheduledEmails.$inferInsert;
export const insertScheduledEmailSchema = createInsertSchema(scheduledEmails);

export type RecipientTimeAnalytics = typeof recipientTimeAnalytics.$inferSelect;
export type InsertRecipientTimeAnalytics = typeof recipientTimeAnalytics.$inferInsert;
export const insertRecipientTimeAnalyticsSchema = createInsertSchema(recipientTimeAnalytics);

export type SendTimeOptimization = typeof sendTimeOptimization.$inferSelect;
export type InsertSendTimeOptimization = typeof sendTimeOptimization.$inferInsert;
export const insertSendTimeOptimizationSchema = createInsertSchema(sendTimeOptimization);

// Password Reset Token types
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Writing Style Profiles table
export const writingStyleProfiles = pgTable("writing_style_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  styleAnalysis: jsonb("style_analysis").notNull(), // tone, complexity, length, vocabulary, etc.
  examples: jsonb("examples").$type<string[]>().notNull(), // sample emails for training
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Attachment Analysis table  
export const attachmentAnalyses = pgTable("attachment_analyses", {
  id: serial("id").primaryKey(),
  emailId: varchar("email_id").notNull(), // Reference to email
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content"), // Extracted text content
  summary: text("summary"), // AI-generated summary
  keyPoints: jsonb("key_points").$type<string[]>(), // Main findings
  actionItems: jsonb("action_items").$type<string[]>(), // Tasks/actions
  dataExtracted: jsonb("data_extracted"), // Structured data from spreadsheets
  insights: jsonb("insights").$type<string[]>(), // Business insights
  category: varchar("category").notNull(), // document, spreadsheet, image, etc.
  createdAt: timestamp("created_at").defaultNow()
});

// Calendar Events table
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull(), // Google Calendar event ID
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  attendees: jsonb("attendees").$type<string[]>(), // Email addresses
  location: varchar("location"),
  meetingUrl: varchar("meeting_url"), // Zoom, Teams, etc.
  isCreatedByAI: boolean("is_created_by_ai").default(false),
  relatedEmailId: varchar("related_email_id"), // Email that triggered this meeting
  createdAt: timestamp("created_at").defaultNow()
});

// Cross-Account Contact Intelligence table
export const crossAccountContacts = pgTable("cross_account_contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactEmail: varchar("contact_email").notNull(),
  contactName: varchar("contact_name"),
  unifiedContactId: varchar("unified_contact_id").notNull(), // Groups same person across accounts
  connectedAccounts: jsonb("connected_accounts").$type<string[]>().notNull(), // Email accounts this contact appears in
  totalInteractions: integer("total_interactions").default(0),
  lastInteraction: timestamp("last_interaction"),
  relationshipStrength: real("relationship_strength").default(0), // 0-1 score
  businessValue: real("business_value").default(0), // Estimated value
  communicationPatterns: jsonb("communication_patterns"), // Frequency, timing, etc.
  preferredAccount: varchar("preferred_account"), // Best account for this contact
  duplicateConversations: jsonb("duplicate_conversations").$type<string[]>(), // IDs of duplicate threads
  insights: jsonb("insights").$type<string[]>(), // AI-generated insights
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Account Optimization Suggestions table
export const accountOptimizations = pgTable("account_optimizations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactEmail: varchar("contact_email").notNull(),
  currentAccount: varchar("current_account").notNull(),
  recommendedAccount: varchar("recommended_account").notNull(),
  reason: text("reason").notNull(),
  confidenceScore: real("confidence_score").notNull(), // 0-1
  potentialBenefit: varchar("potential_benefit"), // time_saved, better_organization, etc.
  estimatedImpact: real("estimated_impact"), // quantified benefit
  status: varchar("status").default("pending"), // pending, applied, dismissed
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Duplicate Conversation Detection table
export const duplicateConversations = pgTable("duplicate_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  primaryConversationId: varchar("primary_conversation_id").notNull(),
  duplicateConversationId: varchar("duplicate_conversation_id").notNull(),
  primaryAccount: varchar("primary_account").notNull(),
  duplicateAccount: varchar("duplicate_account").notNull(),
  similarityScore: real("similarity_score").notNull(), // 0-1
  detectionMethod: varchar("detection_method").notNull(), // subject, participants, content, timing
  participants: jsonb("participants").$type<string[]>().notNull(),
  subject: varchar("subject"),
  timeFrame: jsonb("time_frame"), // start and end dates
  recommendedAction: varchar("recommended_action"), // merge, archive_duplicate, keep_both
  status: varchar("status").default("detected"), // detected, resolved, ignored
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Writing Style Profile types
export type WritingStyleProfile = typeof writingStyleProfiles.$inferSelect;
export type InsertWritingStyleProfile = typeof writingStyleProfiles.$inferInsert;

// Attachment Analysis types  
export type AttachmentAnalysis = typeof attachmentAnalyses.$inferSelect;
export type InsertAttachmentAnalysis = typeof attachmentAnalyses.$inferInsert;

// Calendar Event types
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// Cross-Account Contact Intelligence types
export type CrossAccountContact = typeof crossAccountContacts.$inferSelect;
export type InsertCrossAccountContact = typeof crossAccountContacts.$inferInsert;

// Account Optimization types
export type AccountOptimization = typeof accountOptimizations.$inferSelect;
export type InsertAccountOptimization = typeof accountOptimizations.$inferInsert;

// Duplicate Conversation types
export type DuplicateConversation = typeof duplicateConversations.$inferSelect;
export type InsertDuplicateConversation = typeof duplicateConversations.$inferInsert;

// Email Sentiment Analysis Tables
export const emailSentimentAnalyses = pgTable("email_sentiment_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  emailId: varchar("email_id").notNull(), // Reference to original email
  fromEmail: varchar("from_email").notNull(),
  subject: varchar("subject"),
  contentPreview: text("content_preview"), // First 500 chars for context
  
  // Sentiment Analysis Results
  sentimentScore: real("sentiment_score").notNull(), // -1 to 1 (negative to positive)
  sentimentLabel: varchar("sentiment_label").notNull(), // "positive", "negative", "neutral"
  confidenceScore: real("confidence_score").notNull(), // 0 to 1
  
  // Emotional Analysis
  emotionalTone: varchar("emotional_tone"), // "angry", "happy", "sad", "frustrated", "excited", etc.
  urgencyLevel: varchar("urgency_level"), // "low", "medium", "high", "critical"
  intentCategory: varchar("intent_category"), // "complaint", "inquiry", "request", "compliment", "urgent", etc.
  
  // AI Analysis Details
  keyEmotionalIndicators: jsonb("key_emotional_indicators"), // Array of phrases/words that indicated emotion
  contextualFactors: jsonb("contextual_factors"), // Additional context that influenced analysis
  relationshipTone: varchar("relationship_tone"), // "professional", "casual", "formal", "personal"
  
  // Response Coaching Data
  suggestedResponseTone: varchar("suggested_response_tone"), // "empathetic", "professional", "urgent", "reassuring"
  responseStrategy: text("response_strategy"), // AI-generated advice for response approach
  recommendedTimeframe: varchar("recommended_timeframe"), // "immediate", "within_hour", "same_day", "next_day"
  
  analysisTimestamp: timestamp("analysis_timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relationship Sentiment Tracking
export const contactSentimentProfiles = pgTable("contact_sentiment_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactName: varchar("contact_name"),
  
  // Aggregate Sentiment Metrics
  averageSentiment: real("average_sentiment").notNull().default(0), // Rolling average
  totalEmailsAnalyzed: integer("total_emails_analyzed").notNull().default(0),
  
  // Recent Trend Analysis
  recentSentimentTrend: varchar("recent_sentiment_trend"), // "improving", "declining", "stable"
  lastSentimentScore: real("last_sentiment_score"),
  lastAnalysisDate: timestamp("last_analysis_date"),
  
  // Relationship Insights
  communicationStyle: varchar("communication_style"), // "formal", "casual", "direct", "detailed"
  preferredResponseTone: varchar("preferred_response_tone"), // Learned from successful interactions
  emotionalPatterns: jsonb("emotional_patterns"), // Common emotional themes from this contact
  
  // Relationship Health Indicators
  relationshipStatus: varchar("relationship_status").default("neutral"), // "positive", "neutral", "at_risk", "problematic"
  riskFactors: jsonb("risk_factors"), // Potential issues identified
  strengthFactors: jsonb("strength_factors"), // Positive relationship indicators
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Response Coaching Analytics
export const responseCoachingAnalytics = pgTable("response_coaching_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  originalEmailId: varchar("original_email_id").notNull(),
  sentimentAnalysisId: integer("sentiment_analysis_id").references(() => emailSentimentAnalyses.id),
  
  // Coaching Provided
  coachingProvided: jsonb("coaching_provided"), // The specific coaching suggestions given
  responseApproachRecommended: varchar("response_approach_recommended"),
  toneGuidance: text("tone_guidance"),
  
  // User Response Tracking (if available)
  userActualResponse: text("user_actual_response"),
  userFollowedSuggestion: boolean("user_followed_suggestion"),
  responseTimeActual: timestamp("response_time_actual"),
  
  // Outcome Tracking
  recipientReply: text("recipient_reply"), // If there was a follow-up
  outcomeAssessment: varchar("outcome_assessment"), // "positive", "neutral", "negative", "no_response"
  relationshipImpact: varchar("relationship_impact"), // "improved", "maintained", "declined"
  
  // Learning Data for AI Improvement
  coachingEffectiveness: real("coaching_effectiveness"), // 0-1 score based on outcome
  userFeedback: text("user_feedback"), // Optional user feedback on coaching quality
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Email Sentiment Analysis types
export type EmailSentimentAnalysis = typeof emailSentimentAnalyses.$inferSelect;
export type InsertEmailSentimentAnalysis = typeof emailSentimentAnalyses.$inferInsert;

// Contact Sentiment Profile types
export type ContactSentimentProfile = typeof contactSentimentProfiles.$inferSelect;
export type InsertContactSentimentProfile = typeof contactSentimentProfiles.$inferInsert;

// Virus Scan Results types
export type VirusScanResult = typeof virusScanResults.$inferSelect;
export type InsertVirusScanResult = typeof virusScanResults.$inferInsert;

// Virus Scan Results
export const virusScanResults = pgTable("virus_scan_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailId: varchar("email_id"), // Reference to email message
  attachmentId: varchar("attachment_id"), // Reference to specific attachment
  filename: varchar("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  
  // Scan Results
  scanProvider: varchar("scan_provider").notNull(), // "cloudmersive", "attachmentscanner", "opswat"
  scanStatus: varchar("scan_status").notNull(), // "clean", "infected", "suspicious", "error", "scanning"
  threatLevel: varchar("threat_level"), // "low", "medium", "high", "critical"
  virusNames: jsonb("virus_names").$type<string[]>(), // Array of detected threat names
  scanEngines: jsonb("scan_engines"), // Multi-engine results
  
  // Scan Metadata
  scanStartedAt: timestamp("scan_started_at").notNull(),
  scanCompletedAt: timestamp("scan_completed_at"),
  scanDuration: integer("scan_duration"), // milliseconds
  quarantined: boolean("quarantined").default(false),
  
  // Actions Taken
  actionTaken: varchar("action_taken"), // "allow", "block", "quarantine", "delete"
  userNotified: boolean("user_notified").default(false),
  adminNotified: boolean("admin_notified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});



// Email Workload Classifications
export const emailWorkloadClassifications = pgTable("email_workload_classifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  emailId: varchar("email_id").notNull().unique(),
  
  // Email Content
  fromEmail: varchar("from_email").notNull(),
  subject: varchar("subject"),
  contentPreview: text("content_preview"),
  
  // AI Workload Analysis
  timeToComplete: varchar("time_to_complete").notNull(), // "2min", "15min", "1hr", "2hr+"
  complexityScore: real("complexity_score").notNull(), // 0-1 score
  taskType: varchar("task_type").notNull(), // "quick_reply", "research_required", "decision_making", "administrative", "creative"
  priorityLevel: varchar("priority_level").notNull(), // "low", "medium", "high", "urgent"
  
  // Batching Recommendations
  batchCategory: varchar("batch_category"), // "quick_responses", "deep_work", "administrative", "meetings"
  suggestedProcessingTime: varchar("suggested_processing_time"), // "morning", "afternoon", "evening"
  focusBlockDuration: integer("focus_block_duration"), // Minutes needed for focus block
  
  // Energy Requirements
  cognitiveLoad: varchar("cognitive_load").notNull(), // "low", "medium", "high"
  energyLevel: varchar("energy_level").notNull(), // "low", "medium", "high"
  
  // AI Analysis Details
  reasoningFactors: jsonb("reasoning_factors"), // Why this classification was made
  confidenceScore: real("confidence_score").notNull(), // 0-1 confidence in classification
  
  // Tracking
  actualTimeSpent: integer("actual_time_spent"), // Minutes actually spent (for learning)
  userFeedback: varchar("user_feedback"), // "accurate", "underestimated", "overestimated"
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User Energy Patterns
export const userEnergyPatterns = pgTable("user_energy_patterns", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Time-based Energy Patterns
  hourOfDay: integer("hour_of_day").notNull(), // 0-23
  dayOfWeek: integer("day_of_week").notNull(), // 1-7 (Monday=1)
  energyLevel: real("energy_level").notNull(), // 0-1 observed energy level
  
  // Performance Metrics
  emailsProcessed: integer("emails_processed").default(0),
  avgResponseTime: real("avg_response_time"), // Minutes
  qualityScore: real("quality_score"), // 0-1 based on follow-ups, errors, etc.
  
  // Context Data
  workload: varchar("workload"), // "light", "medium", "heavy"
  interruptions: integer("interruptions").default(0),
  meetingsBefore: integer("meetings_before").default(0),
  meetingsAfter: integer("meetings_after").default(0),
  
  // Learning Data
  dataPoints: integer("data_points").default(1), // Number of observations contributing to this pattern
  confidence: real("confidence").notNull(), // 0-1 confidence in this pattern
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Email Processing Schedules
export const emailProcessingSchedules = pgTable("email_processing_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Schedule Details
  scheduleName: varchar("schedule_name").notNull(),
  isActive: boolean("is_active").default(true),
  
  // Time Blocks
  timeBlocks: jsonb("time_blocks").notNull(), // Array of {start, end, type, category}
  
  // Focus Block Configuration
  focusBlocks: jsonb("focus_blocks").notNull(), // Array of focus block configurations
  batchingRules: jsonb("batching_rules").notNull(), // Rules for grouping similar emails
  
  // Performance Tracking
  avgDailyEmailCount: integer("avg_daily_email_count"),
  avgCompletionTime: real("avg_completion_time"), // Hours per day
  efficiencyScore: real("efficiency_score"), // 0-1 based on actual vs predicted times
  
  // User Preferences
  preferredStartTime: varchar("preferred_start_time"), // "08:00"
  preferredEndTime: varchar("preferred_end_time"), // "17:00"
  breakDuration: integer("break_duration").default(15), // Minutes between focus blocks
  maxFocusBlockDuration: integer("max_focus_block_duration").default(90), // Minutes
  
  // AI Optimization
  aiOptimizationEnabled: boolean("ai_optimization_enabled").default(true),
  lastOptimized: timestamp("last_optimized").defaultNow(),
  optimizationScore: real("optimization_score"), // 0-1 effectiveness of current schedule
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Workload Analytics
export const workloadAnalytics = pgTable("workload_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: date("date").notNull(),
  
  // Daily Metrics
  totalEmailsProcessed: integer("total_emails_processed").default(0),
  totalTimeSpent: real("total_time_spent").default(0), // Hours
  avgTimePerEmail: real("avg_time_per_email"), // Minutes
  
  // Workload Distribution
  quickTasks: integer("quick_tasks").default(0), // 2min emails
  mediumTasks: integer("medium_tasks").default(0), // 15min emails
  longTasks: integer("long_tasks").default(0), // 1hr+ emails
  
  // Efficiency Metrics
  plannedVsActualTime: real("planned_vs_actual_time"), // Ratio of actual/planned time
  interruptionCount: integer("interruption_count").default(0),
  focusBlockEfficiency: real("focus_block_efficiency"), // 0-1 how well focus blocks worked
  
  // Energy Correlation
  morningProductivity: real("morning_productivity"), // 0-1 productivity score
  afternoonProductivity: real("afternoon_productivity"),
  eveningProductivity: real("evening_productivity"),
  
  // Insights Generated
  insights: jsonb("insights"), // AI-generated insights about the day
  recommendations: jsonb("recommendations"), // Suggestions for improvement
  
  createdAt: timestamp("created_at").defaultNow()
});

// Predictive Email Analytics Tables
export const emailVolumeForecasts = pgTable("email_volume_forecasts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Forecast Details
  forecastDate: date("forecast_date").notNull(),
  predictedVolume: integer("predicted_volume").notNull(),
  confidenceScore: real("confidence_score").notNull(), // 0-1
  
  // Historical Context
  historicalAverage: real("historical_average"),
  trendDirection: varchar("trend_direction"), // "increasing", "decreasing", "stable"
  seasonalFactor: real("seasonal_factor"), // 0.5-2.0 multiplier
  
  // Breakdown by Categories
  urgentEmails: integer("urgent_emails").default(0),
  routineEmails: integer("routine_emails").default(0),
  complexEmails: integer("complex_emails").default(0),
  
  // Model Metadata
  modelVersion: varchar("model_version").notNull(),
  accuracy: real("accuracy"), // Based on previous predictions vs actual
  
  createdAt: timestamp("created_at").defaultNow()
});

export const emailFollowupPredictions = pgTable("email_followup_predictions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  emailId: varchar("email_id").notNull(),
  
  // Prediction Details
  followupProbability: real("followup_probability").notNull(), // 0-1
  predictedFollowupDate: timestamp("predicted_followup_date"),
  urgencyLevel: varchar("urgency_level"), // "low", "medium", "high"
  
  // Reasoning Factors
  reasoningFactors: jsonb("reasoning_factors").notNull(), // Array of factors contributing to prediction
  communicationPattern: varchar("communication_pattern"), // "responsive", "delayed", "inconsistent"
  relationshipStrength: real("relationship_strength"), // 0-1 based on email history
  
  // Context
  emailSubject: text("email_subject"),
  senderDomain: varchar("sender_domain"),
  threadLength: integer("thread_length").default(1),
  timeSinceLastReply: integer("time_since_last_reply"), // Hours
  
  // Outcome Tracking
  actualFollowupOccurred: boolean("actual_followup_occurred"),
  actualFollowupDate: timestamp("actual_followup_date"),
  predictionAccuracy: real("prediction_accuracy"), // Set after outcome is known
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const communicationPatternAnalysis = pgTable("communication_pattern_analysis", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Contact Information
  contactEmail: varchar("contact_email").notNull(),
  contactDomain: varchar("contact_domain"),
  contactType: varchar("contact_type"), // "internal", "client", "vendor", "prospect"
  
  // Communication Patterns
  avgResponseTime: real("avg_response_time"), // Hours
  responseTimeVariability: real("response_time_variability"), // Standard deviation
  emailFrequency: real("email_frequency"), // Emails per week
  threadLengths: jsonb("thread_lengths"), // Array of thread lengths
  
  // Success Metrics
  successfulOutcomes: integer("successful_outcomes").default(0),
  totalInteractions: integer("total_interactions").default(0),
  successRate: real("success_rate"), // successful_outcomes / total_interactions
  
  // Value Indicators
  meetingsScheduled: integer("meetings_scheduled").default(0),
  dealsProgressed: integer("deals_progressed").default(0),
  projectsCompleted: integer("projects_completed").default(0),
  
  // Time Patterns
  preferredContactTime: jsonb("preferred_contact_time"), // {day_of_week, hour_of_day, timezone}
  responsePatterns: jsonb("response_patterns"), // Response time patterns by day/hour
  
  // Relationship Metrics
  relationshipDepth: real("relationship_depth"), // 0-1 based on communication depth
  trustScore: real("trust_score"), // 0-1 based on response consistency
  engagementLevel: varchar("engagement_level"), // "low", "medium", "high"
  
  // Business Value
  estimatedBusinessValue: real("estimated_business_value"), // Dollar value if available
  valueIndicators: jsonb("value_indicators"), // Array of value signals
  priority: varchar("priority"), // "low", "medium", "high", "critical"
  
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const emailRoiAnalysis = pgTable("email_roi_analysis", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Time Period
  analysisDate: date("analysis_date").notNull(),
  periodType: varchar("period_type").notNull(), // "daily", "weekly", "monthly"
  
  // Email Investment Metrics
  totalEmailsSent: integer("total_emails_sent").default(0),
  totalEmailsReceived: integer("total_emails_received").default(0),
  totalTimeSpent: real("total_time_spent"), // Hours
  
  // Outcome Metrics
  meetingsGenerated: integer("meetings_generated").default(0),
  dealsProgressed: integer("deals_progressed").default(0),
  projectsAdvanced: integer("projects_advanced").default(0),
  relationshipsBuilt: integer("relationships_built").default(0),
  
  // Value Calculations
  estimatedRevenue: real("estimated_revenue"),
  timeSavings: real("time_savings"), // Hours saved through efficiency
  opportunityCost: real("opportunity_cost"), // Potential lost value
  netRoi: real("net_roi"), // (Value Generated - Time Cost) / Time Cost
  
  // Categorized ROI
  prospectingRoi: real("prospecting_roi"),
  clientServiceRoi: real("client_service_roi"),
  internalCoordinationRoi: real("internal_coordination_roi"),
  vendorManagementRoi: real("vendor_management_roi"),
  
  // Efficiency Metrics
  emailsPerHour: real("emails_per_hour"),
  responseRate: real("response_rate"), // Percentage of emails that get responses
  conversionRate: real("conversion_rate"), // Percentage leading to desired outcomes
  
  // Quality Indicators
  averageThreadLength: real("average_thread_length"),
  followupRequired: real("followup_required"), // Percentage requiring follow-up
  resolutionRate: real("resolution_rate"), // Percentage resolved in initial exchange
  
  createdAt: timestamp("created_at").defaultNow()
});

export const predictiveAnalyticsInsights = pgTable("predictive_analytics_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Insight Details
  insightType: varchar("insight_type").notNull(), // "volume_trend", "followup_risk", "roi_opportunity", "pattern_change"
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull(), // "low", "medium", "high", "critical"
  
  // Data Sources
  basedOnData: jsonb("based_on_data"), // References to supporting data
  confidenceLevel: real("confidence_level").notNull(), // 0-1
  
  // Actionable Recommendations
  recommendations: jsonb("recommendations"), // Array of recommended actions
  potentialImpact: text("potential_impact"),
  timeframe: varchar("timeframe"), // "immediate", "short_term", "long_term"
  
  // Tracking
  acknowledged: boolean("acknowledged").default(false),
  actionTaken: boolean("action_taken").default(false),
  outcome: text("outcome"),
  
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Email Workload Classification types
export type EmailWorkloadClassification = typeof emailWorkloadClassifications.$inferSelect;
export type InsertEmailWorkloadClassification = typeof emailWorkloadClassifications.$inferInsert;

// User Energy Pattern types
export type UserEnergyPattern = typeof userEnergyPatterns.$inferSelect;
export type InsertUserEnergyPattern = typeof userEnergyPatterns.$inferInsert;

// Email Processing Schedule types
export type EmailProcessingSchedule = typeof emailProcessingSchedules.$inferSelect;
export type InsertEmailProcessingSchedule = typeof emailProcessingSchedules.$inferInsert;

// Workload Analytics types
export type WorkloadAnalytics = typeof workloadAnalytics.$inferSelect;
export type InsertWorkloadAnalytics = typeof workloadAnalytics.$inferInsert;

// Response Coaching Analytics types
export type ResponseCoachingAnalytics = typeof responseCoachingAnalytics.$inferSelect;
export type InsertResponseCoachingAnalytics = typeof responseCoachingAnalytics.$inferInsert;

// Predictive Analytics types
export type EmailVolumeForecast = typeof emailVolumeForecasts.$inferSelect;
export type InsertEmailVolumeForecast = typeof emailVolumeForecasts.$inferInsert;

export type EmailFollowupPrediction = typeof emailFollowupPredictions.$inferSelect;
export type InsertEmailFollowupPrediction = typeof emailFollowupPredictions.$inferInsert;

export type CommunicationPatternAnalysis = typeof communicationPatternAnalysis.$inferSelect;
export type InsertCommunicationPatternAnalysis = typeof communicationPatternAnalysis.$inferInsert;

export type EmailRoiAnalysis = typeof emailRoiAnalysis.$inferSelect;
export type InsertEmailRoiAnalysis = typeof emailRoiAnalysis.$inferInsert;

export type PredictiveAnalyticsInsight = typeof predictiveAnalyticsInsights.$inferSelect;
export type InsertPredictiveAnalyticsInsight = typeof predictiveAnalyticsInsights.$inferInsert;

// Voice Email Assistant Tables

// Voice Commands
export const voiceCommands = pgTable("voice_commands", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  command: text("command").notNull(), // Original transcribed command
  intent: varchar("intent").notNull(), // Detected intent (mark_read, archive, etc.)
  parameters: jsonb("parameters"), // Extracted parameters
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  result: text("result"), // Command execution result
  audioTranscription: text("audio_transcription"), // Full transcription
  confidence: real("confidence"), // AI confidence score
  executionTime: integer("execution_time"), // Time taken to execute in ms
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Voice Responses (Dictated email responses)
export const voiceResponses = pgTable("voice_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  originalEmailId: varchar("original_email_id").notNull(),
  voiceInput: text("voice_input").notNull(), // Original voice input
  enhancedResponse: text("enhanced_response").notNull(), // AI-enhanced response
  audioTranscription: text("audio_transcription").notNull(),
  contextAnalysis: jsonb("context_analysis"), // Analysis of context awareness
  sentimentScore: real("sentiment_score"), // Sentiment of the response
  confidence: real("confidence"), // AI confidence in enhancement
  wordCount: integer("word_count"), // Word count of enhanced response
  improvementNotes: text("improvement_notes"), // What was improved
  userApproved: boolean("user_approved"), // Whether user approved the enhancement
  actualResponseUsed: text("actual_response_used"), // Final response sent (if different)
  createdAt: timestamp("created_at").defaultNow()
});

// Email Audio Summaries
export const emailAudioSummaries = pgTable("email_audio_summaries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  emailId: varchar("email_id").notNull(), // Primary email or summary identifier
  summaryType: varchar("summary_type").notNull().default("daily"), // daily, priority, custom
  summary: text("summary").notNull(), // Text summary
  audioUrl: varchar("audio_url"), // URL to audio file
  duration: integer("duration").notNull(), // Duration in seconds
  keyPoints: jsonb("key_points"), // Array of key points
  actionItems: jsonb("action_items"), // Array of action items
  emailCount: integer("email_count").notNull().default(1), // Number of emails summarized
  voiceModel: varchar("voice_model").default("nova"), // TTS voice model used
  playCount: integer("play_count").notNull().default(0), // How many times played
  userRating: integer("user_rating"), // User rating 1-5
  createdAt: timestamp("created_at").defaultNow()
});

// Voice Settings (User preferences for voice features)
export const voiceSettings = pgTable("voice_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  voiceCommandsEnabled: boolean("voice_commands_enabled").notNull().default(true),
  audioSummariesEnabled: boolean("audio_summaries_enabled").notNull().default(true),
  voiceResponsesEnabled: boolean("voice_responses_enabled").notNull().default(true),
  preferredVoiceModel: varchar("preferred_voice_model").default("nova"), // TTS voice preference
  summaryFrequency: varchar("summary_frequency").default("daily"), // daily, weekly, on-demand
  autoEnhanceResponses: boolean("auto_enhance_responses").notNull().default(true),
  requireConfirmation: boolean("require_confirmation").notNull().default(true), // For destructive commands
  confidenceThreshold: real("confidence_threshold").default(0.7), // Minimum confidence for auto-execution
  language: varchar("language").default("en"), // Voice recognition language
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Voice Command Templates (Predefined voice patterns)
export const voiceCommandTemplates = pgTable("voice_command_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // Template name
  intent: varchar("intent").notNull(), // Associated intent
  patterns: jsonb("patterns"), // Array of voice patterns
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Voice Analytics (Usage tracking and insights)
export const voiceAnalytics = pgTable("voice_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: date("date").notNull(),
  commandsExecuted: integer("commands_executed").notNull().default(0),
  responsesGenerated: integer("responses_generated").notNull().default(0),
  summariesCreated: integer("summaries_created").notNull().default(0),
  averageConfidence: real("average_confidence"),
  totalAudioDuration: integer("total_audio_duration").notNull().default(0), // Total seconds of audio
  timeSaved: integer("time_saved").notNull().default(0), // Estimated time saved in seconds
  mostUsedIntent: varchar("most_used_intent"),
  successRate: real("success_rate"), // Percentage of successful commands
  createdAt: timestamp("created_at").defaultNow()
});

// Voice Email Assistant types
export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = typeof voiceCommands.$inferInsert;

export type VoiceResponse = typeof voiceResponses.$inferSelect;
export type InsertVoiceResponse = typeof voiceResponses.$inferInsert;

export type EmailAudioSummary = typeof emailAudioSummaries.$inferSelect;
export type InsertEmailAudioSummary = typeof emailAudioSummaries.$inferInsert;

export type VoiceSettings = typeof voiceSettings.$inferSelect;
export type InsertVoiceSettings = typeof voiceSettings.$inferInsert;

export type VoiceCommandTemplate = typeof voiceCommandTemplates.$inferSelect;
export type InsertVoiceCommandTemplate = typeof voiceCommandTemplates.$inferInsert;

export type VoiceAnalytics = typeof voiceAnalytics.$inferSelect;
export type InsertVoiceAnalytics = typeof voiceAnalytics.$inferInsert;

// Smart Folder Organization Tables

// Smart Folders (AI-suggested and user-created folders)
export const smartFolders = pgTable("smart_folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  color: varchar("color"), // Hex color code for folder
  icon: varchar("icon"), // Icon name or emoji
  isAiSuggested: boolean("is_ai_suggested").notNull().default(false),
  isAutoCreate: boolean("is_auto_create").notNull().default(false), // Auto-create when criteria met
  parentFolderId: integer("parent_folder_id"), // For nested folders
  folderType: varchar("folder_type").notNull().default("custom"), // custom, project, client, topic
  sortOrder: integer("sort_order").notNull().default(0),
  emailCount: integer("email_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Folder Rules (Criteria for auto-organizing emails)
export const folderRules = pgTable("folder_rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  folderId: integer("folder_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  priority: integer("priority").notNull().default(0), // Higher number = higher priority
  isActive: boolean("is_active").notNull().default(true),
  
  // Rule conditions (JSON structure)
  conditions: jsonb("conditions"), // {sender: [], subject: [], keywords: [], attachments: [], etc}
  
  // Auto-creation criteria
  autoCreateThreshold: integer("auto_create_threshold"), // Number of emails to trigger auto-creation
  autoCreateDays: integer("auto_create_days"), // Days to look back for pattern
  
  // Analytics
  matchCount: integer("match_count").notNull().default(0),
  lastTriggered: timestamp("last_triggered"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Email Folder Assignments (Which emails are in which folders)
export const emailFolderAssignments = pgTable("email_folder_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  emailId: varchar("email_id").notNull(), // External email ID from provider
  folderId: integer("folder_id").notNull(),
  assignmentType: varchar("assignment_type").notNull(), // manual, auto, ai_suggested
  assignedBy: varchar("assigned_by"), // user_id or 'system' for AI
  confidence: real("confidence"), // AI confidence score (0-1)
  createdAt: timestamp("created_at").defaultNow()
});

// Similar Email Groups (For batch processing)
export const similarEmailGroups = pgTable("similar_email_groups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  groupType: varchar("group_type").notNull(), // sender, subject_pattern, content_similarity, thread
  
  // Similarity criteria
  similarityThreshold: real("similarity_threshold").notNull().default(0.8),
  groupingAlgorithm: varchar("grouping_algorithm").notNull().default("content"), // content, sender, subject, thread
  
  // Group metadata
  emailCount: integer("email_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  suggestedActions: jsonb("suggested_actions"), // Array of suggested batch actions
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Email Group Members (Which emails belong to similarity groups)
export const emailGroupMembers = pgTable("email_group_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  groupId: integer("group_id").notNull(),
  emailId: varchar("email_id").notNull(),
  similarityScore: real("similarity_score"), // How similar this email is to the group
  addedBy: varchar("added_by").notNull().default("system"), // system, user
  isRepresentative: boolean("is_representative").notNull().default(false), // Is this email a good representative of the group?
  createdAt: timestamp("created_at").defaultNow()
});

// Folder Suggestions (AI-generated folder recommendations)
export const folderSuggestions = pgTable("folder_suggestions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  suggestedName: varchar("suggested_name").notNull(),
  suggestedDescription: text("suggested_description"),
  suggestedColor: varchar("suggested_color"),
  suggestedIcon: varchar("suggested_icon"),
  folderType: varchar("folder_type").notNull(), // project, client, topic, archive
  
  // Reasoning
  reasoning: text("reasoning"), // Why AI suggested this folder
  triggerEmails: jsonb("trigger_emails"), // Array of email IDs that triggered suggestion
  confidence: real("confidence").notNull(), // AI confidence in suggestion (0-1)
  
  // User interaction
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, auto_created
  userFeedback: text("user_feedback"),
  
  // Implementation
  implementedFolderId: integer("implemented_folder_id"), // ID of created folder if accepted
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Folder Analytics (Usage patterns and insights)
export const folderAnalytics = pgTable("folder_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  folderId: integer("folder_id").notNull(),
  date: date("date").notNull(),
  
  // Daily metrics
  emailsAdded: integer("emails_added").notNull().default(0),
  emailsRemoved: integer("emails_removed").notNull().default(0),
  emailsViewed: integer("emails_viewed").notNull().default(0),
  timeSpentViewing: integer("time_spent_viewing").notNull().default(0), // seconds
  
  // Accuracy metrics
  manualCorrections: integer("manual_corrections").notNull().default(0),
  autoRuleMatches: integer("auto_rule_matches").notNull().default(0),
  aiSuggestionAccuracy: real("ai_suggestion_accuracy"), // 0-1 score
  
  createdAt: timestamp("created_at").defaultNow()
});

// Smart Folder Organization types
export type SmartFolder = typeof smartFolders.$inferSelect;
export type InsertSmartFolder = typeof smartFolders.$inferInsert;

export type FolderRule = typeof folderRules.$inferSelect;
export type InsertFolderRule = typeof folderRules.$inferInsert;

export type EmailFolderAssignment = typeof emailFolderAssignments.$inferSelect;
export type InsertEmailFolderAssignment = typeof emailFolderAssignments.$inferInsert;

export type SimilarEmailGroup = typeof similarEmailGroups.$inferSelect;
export type InsertSimilarEmailGroup = typeof similarEmailGroups.$inferInsert;

export type EmailGroupMember = typeof emailGroupMembers.$inferSelect;
export type InsertEmailGroupMember = typeof emailGroupMembers.$inferInsert;

export type FolderSuggestion = typeof folderSuggestions.$inferSelect;
export type InsertFolderSuggestion = typeof folderSuggestions.$inferInsert;

export type FolderAnalytics = typeof folderAnalytics.$inferSelect;
export type InsertFolderAnalytics = typeof folderAnalytics.$inferInsert;

// Billing Events Table - Track subscription lifecycle events
export const billingEvents = pgTable("billing_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  eventType: varchar("event_type").notNull(), // payment_success, payment_failed, subscription_created, subscription_cancelled, etc.
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeInvoiceId: varchar("stripe_invoice_id"),
  amount: integer("amount"), // Amount in cents
  currency: varchar("currency").default("usd"),
  metadata: jsonb("metadata"), // Additional event data
  createdAt: timestamp("created_at").defaultNow(),
});

export type BillingEvent = typeof billingEvents.$inferSelect;
export type InsertBillingEvent = typeof billingEvents.$inferInsert;
