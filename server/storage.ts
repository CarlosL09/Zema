import {
  users,
  passwordResetTokens,
  emailThreads,
  emailDrafts,
  smartRules,
  usageAnalytics,
  integrations,
  emailAccounts,
  demoRequests,
  newsletters,
  emailSummaries,
  followUpReminders,
  quickRepliesCache,
  emailAnalytics,
  leadScores,
  securityAlerts,
  automationRules,
  taskIntegrations,
  crmSyncLogs,
  customTemplates,
  customRules,
  templateUsage,
  auditLogs,
  aiUsageLog,
  azureUsageLog,
  webhooks,
  platformIntegrations,
  writingStyleProfiles,
  attachmentAnalyses,
  calendarEvents,
  crossAccountContacts,
  accountOptimizations,
  duplicateConversations,
  emailSentimentAnalyses,
  contactSentimentProfiles,
  responseCoachingAnalytics,
  scheduledEmails,
  recipientTimeAnalytics,
  sendTimeOptimization,
  emailWorkloadClassifications,
  userEnergyPatterns,
  emailProcessingSchedules,
  workloadAnalytics,
  emailVolumeForecasts,
  emailFollowupPredictions,
  communicationPatternAnalysis,
  emailRoiAnalysis,
  predictiveAnalyticsInsights,
  voiceCommands,
  voiceResponses,
  emailAudioSummaries,
  voiceSettings,
  voiceCommandTemplates,
  voiceAnalytics,
  smartFolders,
  folderRules,
  emailFolderAssignments,
  similarEmailGroups,
  emailGroupMembers,
  folderSuggestions,
  folderAnalytics,
  billingEvents,
  type User,
  type AuditLog,
  type InsertAuditLog,
  type UpsertUser,
  type EmailThread,
  type InsertEmailThread,
  type EmailDraft,
  type InsertEmailDraft,
  type SmartRule,
  type InsertSmartRule,
  type UsageAnalytic,
  type InsertUsageAnalytic,
  type Integration,
  type InsertIntegration,
  type EmailAccount,
  type InsertEmailAccount,
  type DemoRequest,
  type InsertDemoRequest,
  type Newsletter,
  type InsertNewsletter,
  type EmailSummary,
  type InsertEmailSummary,
  type FollowUpReminder,
  type InsertFollowUpReminder,
  type QuickReplyCache,
  type InsertQuickReplyCache,
  type EmailAnalytic,
  type InsertEmailAnalytic,
  type LeadScore,
  type InsertLeadScore,
  type SecurityAlert,
  type InsertSecurityAlert,
  type AutomationRule,
  type InsertAutomationRule,
  type TaskIntegration,
  type InsertTaskIntegration,
  type CrmSyncLog,
  type InsertCrmSyncLog,
  type CustomTemplate,
  type InsertCustomTemplate,
  type CustomRule,
  type InsertCustomRule,
  type TemplateUsage,
  type InsertTemplateUsage,
  type AiUsageLog,
  type InsertAiUsageLog,
  type AzureUsageLog,
  type InsertAzureUsageLog,
  type Webhook,
  type InsertWebhook,
  type PlatformIntegration,
  type InsertPlatformIntegration,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type WritingStyleProfile,
  type InsertWritingStyleProfile,
  type AttachmentAnalysis,
  type InsertAttachmentAnalysis,
  type CalendarEvent,
  type InsertCalendarEvent,
  type EmailSentimentAnalysis,
  type InsertEmailSentimentAnalysis,
  type ContactSentimentProfile,
  type InsertContactSentimentProfile,
  type ResponseCoachingAnalytics,
  type InsertResponseCoachingAnalytics,
  type EmailWorkloadClassification,
  type InsertEmailWorkloadClassification,
  type UserEnergyPattern,
  type InsertUserEnergyPattern,
  type EmailProcessingSchedule,
  type InsertEmailProcessingSchedule,
  type WorkloadAnalytics,
  type InsertWorkloadAnalytics,
  type EmailVolumeForecast,
  type InsertEmailVolumeForecast,
  type EmailFollowupPrediction,
  type InsertEmailFollowupPrediction,
  type CommunicationPatternAnalysis,
  type InsertCommunicationPatternAnalysis,
  type EmailRoiAnalysis,
  type InsertEmailRoiAnalysis,
  type PredictiveAnalyticsInsight,
  type InsertPredictiveAnalyticsInsight,
  type CrossAccountContact,
  type InsertCrossAccountContact,
  type AccountOptimization,
  type InsertAccountOptimization,
  type DuplicateConversation,
  type InsertDuplicateConversation,
  type VoiceCommand,
  type InsertVoiceCommand,
  type VoiceResponse,
  type InsertVoiceResponse,
  type EmailAudioSummary,
  type InsertEmailAudioSummary,
  type VoiceSettings,
  type InsertVoiceSettings,
  type VoiceCommandTemplate,
  type InsertVoiceCommandTemplate,
  type VoiceAnalytics,
  type InsertVoiceAnalytics,
  type SmartFolder,
  type InsertSmartFolder,
  type FolderRule,
  type InsertFolderRule,
  type EmailFolderAssignment,
  type InsertEmailFolderAssignment,
  type SimilarEmailGroup,
  type InsertSimilarEmailGroup,
  type EmailGroupMember,
  type InsertEmailGroupMember,
  type FolderSuggestion,
  type InsertFolderSuggestion,
  type FolderAnalytics,
  type InsertFolderAnalytics,
  type BillingEvent,
  type InsertBillingEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, or } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  updateUserSubscriptionStatus(userId: string, status: string, trialEndsAt?: Date, subscriptionEndsAt?: Date): Promise<User>;
  updateUserSubscriptionPlan(userId: string, plan: string): Promise<User>;
  incrementEmailUsage(userId: string): Promise<User>;
  resetMonthlyEmailUsage(userId: string): Promise<User>;
  cancelUserSubscription(userId: string): Promise<User>;
  
  // Admin operations
  adminUpdateUserSubscription(userId: string, plan: string, status: string, adminId: string): Promise<User>;
  adminBlockUser(userId: string, reason: string, adminId: string): Promise<User>;
  adminUnblockUser(userId: string, adminId: string): Promise<User>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getUsersStats(): Promise<{ total: number; active: number; blocked: number; trial: number; free: number; pro: number; enterprise: number }>;

  // Email/Password Authentication
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<User>;
  updateUserEmailVerification(userId: string, verified: boolean): Promise<User>;

  // Password Reset Tokens
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(tokenId: number): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;

  // Email operations
  createEmailThread(thread: InsertEmailThread): Promise<EmailThread>;
  getEmailThreads(userId: string): Promise<EmailThread[]>;
  updateEmailThread(id: number, updates: Partial<EmailThread>): Promise<EmailThread>;

  // Draft operations
  createEmailDraft(draft: InsertEmailDraft): Promise<EmailDraft>;
  getEmailDrafts(userId: string): Promise<EmailDraft[]>;
  updateEmailDraftStatus(id: number, status: string): Promise<EmailDraft>;

  // Smart rules
  createSmartRule(rule: InsertSmartRule): Promise<SmartRule>;
  getSmartRules(userId: string): Promise<SmartRule[]>;
  updateSmartRule(id: number, updates: Partial<SmartRule>): Promise<SmartRule>;

  // Analytics
  trackUsage(analytics: InsertUsageAnalytic): Promise<UsageAnalytic>;
  getUsageAnalytics(userId: string): Promise<UsageAnalytic[]>;

  // Integrations
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  getIntegrations(userId: string): Promise<Integration[]>;
  updateIntegration(id: number, updates: Partial<Integration>): Promise<Integration>;

  // Email summaries and quick wins
  createEmailSummary(summary: InsertEmailSummary): Promise<EmailSummary>;
  getEmailSummary(userId: string, threadId: string): Promise<EmailSummary | undefined>;
  createFollowUpReminder(reminder: InsertFollowUpReminder): Promise<FollowUpReminder>;
  getFollowUpReminders(userId: string): Promise<FollowUpReminder[]>;
  updateFollowUpReminder(id: number, updates: Partial<FollowUpReminder>): Promise<FollowUpReminder>;
  cacheQuickReplies(cache: InsertQuickReplyCache): Promise<QuickReplyCache>;
  getQuickRepliesCache(userId: string, emailHash: string): Promise<QuickReplyCache | undefined>;

  // Analytics and Business Intelligence
  createEmailAnalytic(analytic: InsertEmailAnalytic): Promise<EmailAnalytic>;
  getEmailAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<EmailAnalytic[]>;
  createLeadScore(leadScore: InsertLeadScore): Promise<LeadScore>;
  getLeadScore(userId: string, contactEmail: string): Promise<LeadScore | undefined>;
  updateLeadScore(id: number, updates: Partial<LeadScore>): Promise<LeadScore>;

  // Security and Compliance
  createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert>;
  getSecurityAlerts(userId: string): Promise<SecurityAlert[]>;
  updateSecurityAlert(id: number, updates: Partial<SecurityAlert>): Promise<SecurityAlert>;

  // Automation and Workflows
  createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  getAutomationRules(userId: string): Promise<AutomationRule[]>;
  updateAutomationRule(id: number, updates: Partial<AutomationRule>): Promise<AutomationRule>;

  // Demo and newsletter (legacy)
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequests(): Promise<DemoRequest[]>;
  subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  getNewsletterSubscriptions(): Promise<Newsletter[]>;

  // CRM sync logs
  createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog>;
  getCrmSyncLogs(userId: string): Promise<CrmSyncLog[]>;

  // Email account management
  createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount>;
  getEmailAccounts(userId: string): Promise<EmailAccount[]>;
  updateEmailAccount(id: number, updates: Partial<EmailAccount>): Promise<EmailAccount>;
  deleteEmailAccount(id: number, userId: string): Promise<void>;
  startEmailSync(accountId: number, userId: string): Promise<void>;
  setPrimaryEmailAccount(accountId: number, userId: string): Promise<void>;

  // Custom templates
  createCustomTemplate(template: InsertCustomTemplate): Promise<CustomTemplate>;
  getCustomTemplates(userId: string): Promise<CustomTemplate[]>;
  updateCustomTemplate(id: number, updates: Partial<CustomTemplate>): Promise<CustomTemplate>;
  deleteCustomTemplate(id: number): Promise<void>;
  getPublicTemplates(): Promise<CustomTemplate[]>;

  // Custom rules
  createCustomRule(rule: InsertCustomRule): Promise<CustomRule>;
  getCustomRules(userId: string): Promise<CustomRule[]>;
  updateCustomRule(id: number, updates: Partial<CustomRule>): Promise<CustomRule>;
  deleteCustomRule(id: number): Promise<void>;
  
  // Template usage tracking
  trackTemplateUsage(usage: InsertTemplateUsage): Promise<TemplateUsage>;
  getTemplateUsageStats(userId: string, templateId?: number): Promise<TemplateUsage[]>;

  // Security and audit methods
  updateUserMFASettings(userId: string, settings: Partial<User>): Promise<User>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters: { userId?: string; startDate?: Date; endDate?: Date; action?: string }): Promise<AuditLog[]>;
  getRecentAuditLogs(userId: string, hoursBack: number): Promise<AuditLog[]>;

  // AI and Azure usage tracking
  trackAiUsage(usage: InsertAiUsageLog): Promise<AiUsageLog>;
  trackAzureUsage(usage: InsertAzureUsageLog): Promise<AzureUsageLog>;
  getAiUsageByUser(userId: string, billingPeriod?: string): Promise<AiUsageLog[]>;
  getAzureUsageByUser(userId: string, billingPeriod?: string): Promise<AzureUsageLog[]>;
  updateUserAiCosts(userId: string, tokensUsed: number, costInCents: number): Promise<User>;
  updateUserAzureCosts(userId: string, creditsUsed: number): Promise<User>;

  // Webhook operations
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getWebhook(id: number): Promise<Webhook | undefined>;
  getUserWebhooks(userId: string): Promise<Webhook[]>;
  updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook>;
  deleteWebhook(id: number): Promise<void>;

  // Platform integration operations
  createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration>;
  getPlatformIntegration(id: number): Promise<PlatformIntegration | undefined>;
  getUserPlatformIntegrations(userId: string): Promise<PlatformIntegration[]>;
  updatePlatformIntegration(id: number, updates: Partial<PlatformIntegration>): Promise<PlatformIntegration>;
  deletePlatformIntegration(id: number): Promise<void>;

  // Writing Style Profile operations
  saveWritingStyleProfile(profile: { userId: string; styleAnalysis: any; examples: string[] }): Promise<WritingStyleProfile>;
  getWritingStyleProfile(userId: string): Promise<WritingStyleProfile | null>;
  updateWritingStyleProfile(userId: string, updates: Partial<WritingStyleProfile>): Promise<WritingStyleProfile>;

  // Attachment Analysis operations  
  saveAttachmentAnalysis(analysis: InsertAttachmentAnalysis): Promise<AttachmentAnalysis>;
  getAttachmentAnalysis(emailId: string): Promise<AttachmentAnalysis[]>;
  getAttachmentAnalysisByUser(userId: string): Promise<AttachmentAnalysis[]>;

  // Calendar Event operations
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  getUserCalendarEvents(userId: string): Promise<CalendarEvent[]>;
  updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;

  // Cross-Account Intelligence operations
  createCrossAccountContact(contact: InsertCrossAccountContact): Promise<CrossAccountContact>;
  getCrossAccountContactByEmail(userId: string, contactEmail: string): Promise<CrossAccountContact | undefined>;
  getCrossAccountContactsByUserId(userId: string): Promise<CrossAccountContact[]>;
  updateCrossAccountContact(id: number, updates: Partial<CrossAccountContact>): Promise<CrossAccountContact>;
  deleteCrossAccountContact(id: number): Promise<void>;

  // Account Optimization operations
  createAccountOptimization(optimization: InsertAccountOptimization): Promise<AccountOptimization>;
  getAccountOptimizationByContact(userId: string, contactEmail: string): Promise<AccountOptimization | undefined>;
  getAccountOptimizations(userId: string): Promise<AccountOptimization[]>;
  updateAccountOptimization(id: number, updates: Partial<AccountOptimization>): Promise<AccountOptimization>;

  // Duplicate Conversation operations
  createDuplicateConversation(duplicate: InsertDuplicateConversation): Promise<DuplicateConversation>;
  getDuplicateConversationByIds(userId: string, primaryId: string, duplicateId: string): Promise<DuplicateConversation | undefined>;
  getDuplicateConversations(userId: string): Promise<DuplicateConversation[]>;
  updateDuplicateConversation(id: number, updates: Partial<DuplicateConversation>): Promise<DuplicateConversation>;

  // Email account helper method
  getEmailAccountsByUserId(userId: string): Promise<EmailAccount[]>;

  // Email Sentiment Analysis operations
  createEmailSentimentAnalysis(analysis: InsertEmailSentimentAnalysis): Promise<EmailSentimentAnalysis>;
  getEmailSentimentAnalysis(id: number): Promise<EmailSentimentAnalysis | undefined>;
  getSentimentAnalysesByDate(userId: string, date: Date): Promise<EmailSentimentAnalysis[]>;
  getRecentSentimentAnalyses(userId: string, contactEmail: string, limit: number): Promise<EmailSentimentAnalysis[]>;
  getTopEmotionalTones(userId: string, days: number): Promise<Array<{ tone: string; count: number }>>;
  
  // Contact Sentiment Profile operations
  createContactSentimentProfile(profile: InsertContactSentimentProfile): Promise<ContactSentimentProfile>;
  getContactSentimentProfile(userId: string, contactEmail: string): Promise<ContactSentimentProfile | undefined>;
  updateContactSentimentProfile(id: number, updates: Partial<ContactSentimentProfile>): Promise<ContactSentimentProfile>;
  getAtRiskContacts(userId: string): Promise<Array<{ email: string; reason: string; lastScore: number }>>;

  // Response Coaching Analytics operations
  createResponseCoachingAnalytics(analytics: InsertResponseCoachingAnalytics): Promise<ResponseCoachingAnalytics>;
  getResponseCoachingStats(userId: string, days: number): Promise<{
    totalCoachingSessions: number;
    avgResponseTime: number;
    successfulOutcomes: number;
  }>;

  // Email Workload Management operations
  createEmailWorkloadClassification(classification: InsertEmailWorkloadClassification): Promise<EmailWorkloadClassification>;
  getEmailWorkloadClassifications(userId: string, filters?: { completed?: boolean; date?: string; limit?: number }): Promise<EmailWorkloadClassification[]>;
  updateEmailWorkloadCompletion(classificationId: number, actualTimeSpent: number, userFeedback?: string): Promise<EmailWorkloadClassification>;
  
  // User Energy Pattern operations
  getUserEnergyPatterns(userId: string): Promise<UserEnergyPattern[]>;
  upsertUserEnergyPattern(pattern: InsertUserEnergyPattern): Promise<UserEnergyPattern>;
  
  // Email Processing Schedule operations
  createEmailProcessingSchedule(schedule: InsertEmailProcessingSchedule): Promise<EmailProcessingSchedule>;
  getActiveEmailProcessingSchedule(userId: string): Promise<EmailProcessingSchedule | null>;
  updateEmailProcessingSchedule(scheduleId: number, updates: Partial<InsertEmailProcessingSchedule>): Promise<EmailProcessingSchedule>;
  
  // Workload Analytics operations
  createWorkloadAnalytics(analytics: InsertWorkloadAnalytics): Promise<WorkloadAnalytics>;
  getWorkloadAnalytics(userId: string, filters?: { limit?: number; dateFrom?: string; dateTo?: string }): Promise<WorkloadAnalytics[]>;

  // Predictive Analytics
  createEmailVolumeForecast(forecast: InsertEmailVolumeForecast): Promise<EmailVolumeForecast>;
  getEmailVolumeForecasts(userId: string, limit?: number): Promise<EmailVolumeForecast[]>;
  
  createEmailFollowupPrediction(prediction: InsertEmailFollowupPrediction): Promise<EmailFollowupPrediction>;
  getEmailFollowupPredictions(userId: string, filters?: { highRiskOnly?: boolean; limit?: number }): Promise<EmailFollowupPrediction[]>;
  updateEmailFollowupPrediction(id: number, updates: Partial<EmailFollowupPrediction>): Promise<EmailFollowupPrediction>;
  
  createCommunicationPatternAnalysis(analysis: InsertCommunicationPatternAnalysis): Promise<CommunicationPatternAnalysis>;
  getCommunicationPatternAnalysis(userId: string, filters?: { priority?: string; limit?: number }): Promise<CommunicationPatternAnalysis[]>;
  updateCommunicationPatternAnalysis(id: number, updates: Partial<CommunicationPatternAnalysis>): Promise<CommunicationPatternAnalysis>;
  
  createEmailRoiAnalysis(analysis: InsertEmailRoiAnalysis): Promise<EmailRoiAnalysis>;
  getEmailRoiAnalysis(userId: string, periodType?: string, limit?: number): Promise<EmailRoiAnalysis[]>;
  
  createPredictiveAnalyticsInsight(insight: InsertPredictiveAnalyticsInsight): Promise<PredictiveAnalyticsInsight>;
  getPredictiveAnalyticsInsights(userId: string, filters?: { acknowledged?: boolean; priority?: string; limit?: number }): Promise<PredictiveAnalyticsInsight[]>;
  updatePredictiveAnalyticsInsight(id: number, updates: Partial<PredictiveAnalyticsInsight>): Promise<PredictiveAnalyticsInsight>;

  // Voice Email Assistant operations
  createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
  getVoiceCommands(userId: string, limit?: number): Promise<VoiceCommand[]>;
  updateVoiceCommand(id: number, updates: Partial<VoiceCommand>): Promise<VoiceCommand>;
  
  createVoiceResponse(response: InsertVoiceResponse): Promise<VoiceResponse>;
  getVoiceResponses(userId: string, limit?: number): Promise<VoiceResponse[]>;
  updateVoiceResponse(id: number, updates: Partial<VoiceResponse>): Promise<VoiceResponse>;
  
  createEmailAudioSummary(summary: InsertEmailAudioSummary): Promise<EmailAudioSummary>;
  getEmailAudioSummaries(userId: string, limit?: number): Promise<EmailAudioSummary[]>;
  updateEmailAudioSummary(id: number, updates: Partial<EmailAudioSummary>): Promise<EmailAudioSummary>;
  
  getVoiceSettings(userId: string): Promise<VoiceSettings | undefined>;
  upsertVoiceSettings(settings: InsertVoiceSettings): Promise<VoiceSettings>;
  
  createVoiceCommandTemplate(template: InsertVoiceCommandTemplate): Promise<VoiceCommandTemplate>;
  getVoiceCommandTemplates(): Promise<VoiceCommandTemplate[]>;
  updateVoiceCommandTemplate(id: number, updates: Partial<VoiceCommandTemplate>): Promise<VoiceCommandTemplate>;
  
  getVoiceAnalytics(userId: string, days?: number): Promise<VoiceAnalytics[]>;
  upsertVoiceAnalytics(analytics: InsertVoiceAnalytics): Promise<VoiceAnalytics>;

  // Smart Folder Organization operations
  createSmartFolder(folder: InsertSmartFolder): Promise<SmartFolder>;
  getSmartFolders(userId: string): Promise<SmartFolder[]>;
  getSmartFolder(id: number): Promise<SmartFolder | undefined>;
  updateSmartFolder(id: number, updates: Partial<SmartFolder>): Promise<SmartFolder>;
  incrementFolderEmailCount(folderId: number): Promise<void>;
  
  createFolderRule(rule: InsertFolderRule): Promise<FolderRule>;
  getFolderRules(): Promise<FolderRule[]>;
  getFolderRulesByUser(userId: string): Promise<FolderRule[]>;
  updateFolderRule(id: number, updates: Partial<FolderRule>): Promise<FolderRule>;
  
  createEmailFolderAssignment(assignment: InsertEmailFolderAssignment): Promise<EmailFolderAssignment>;
  getEmailFolderAssignments(userId: string, folderId?: number): Promise<EmailFolderAssignment[]>;
  
  createSimilarEmailGroup(group: InsertSimilarEmailGroup): Promise<SimilarEmailGroup>;
  getSimilarEmailGroups(userId: string): Promise<SimilarEmailGroup[]>;
  getSimilarEmailGroup(id: number): Promise<SimilarEmailGroup | undefined>;
  updateSimilarEmailGroup(id: number, updates: Partial<SimilarEmailGroup>): Promise<SimilarEmailGroup>;
  
  createEmailGroupMember(member: InsertEmailGroupMember): Promise<EmailGroupMember>;
  getEmailGroupMembers(groupId: number): Promise<EmailGroupMember[]>;
  
  createFolderSuggestion(suggestion: InsertFolderSuggestion): Promise<FolderSuggestion>;
  getFolderSuggestions(userId: string): Promise<FolderSuggestion[]>;
  getFolderSuggestion(id: number): Promise<FolderSuggestion | undefined>;
  updateFolderSuggestion(id: number, updates: Partial<FolderSuggestion>): Promise<FolderSuggestion>;
  
  createFolderAnalytics(analytics: InsertFolderAnalytics): Promise<FolderAnalytics>;
  getFolderAnalytics(userId: string, folderId?: number): Promise<FolderAnalytics[]>;

  // Email Performance Insights operations
  createEmailAnalytic(analytic: InsertEmailAnalytic): Promise<EmailAnalytic>;
  getEmailAnalyticsByContact(userId: string, contactEmail: string, limit?: number): Promise<EmailAnalytic[]>;
  getEmailAnalyticsByThread(userId: string, threadId: string): Promise<EmailAnalytic[]>;
  getRecentEmailAnalytics(userId: string, days: number): Promise<EmailAnalytic[]>;
  
  createContactSentimentProfile(profile: InsertContactSentimentProfile): Promise<ContactSentimentProfile>;
  getContactSentimentProfile(userId: string, contactEmail: string): Promise<ContactSentimentProfile | undefined>;
  updateContactSentimentProfile(id: number, updates: Partial<ContactSentimentProfile>): Promise<ContactSentimentProfile>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  getRecentSignups(days?: number): Promise<User[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    trialUsers: number;
    expiredTrials: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalEmailsProcessed: number;
    averageEmailsPerUser: number;
    totalAiCosts: number;
    totalAzureCosts: number;
    averageAiCostPerUser: number;
    averageAzureCostPerUser: number;
  }>;
  
  // Admin user management methods
  deleteUser(userId: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User>;
  updateUserSubscription(userId: string, updates: { subscriptionStatus?: string; subscriptionPlan?: string; subscriptionEndsAt?: Date; billingPeriodStart?: Date; stripeSubscriptionId?: string }): Promise<User>;

  // Billing and subscription operations
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string | null): Promise<User>;
  resetUserMonthlyUsage(userId: string): Promise<void>;
  createBillingEvent(event: InsertBillingEvent): Promise<BillingEvent>;
  getBillingEvents(userId: string, limit?: number): Promise<BillingEvent[]>;
  incrementUserEmailUsage(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user by id:", error);
      // Fallback to basic user query if there are missing columns
      try {
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            passwordHash: users.passwordHash,
            emailVerified: users.emailVerified,
            subscriptionStatus: users.subscriptionStatus,
            subscriptionPlan: users.subscriptionPlan,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
          })
          .from(users)
          .where(eq(users.id, id));
        return user as User;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return undefined;
      }
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscriptionStatus(userId: string, status: string, trialEndsAt?: Date, subscriptionEndsAt?: Date): Promise<User> {
    const updateData: any = {
      subscriptionStatus: status,
      updatedAt: new Date(),
    };
    
    if (trialEndsAt !== undefined) {
      updateData.trialEndsAt = trialEndsAt;
    }
    
    if (subscriptionEndsAt !== undefined) {
      updateData.subscriptionEndsAt = subscriptionEndsAt;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async cancelUserSubscription(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionStatus: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscriptionPlan(userId: string, plan: string): Promise<User> {
    // Set email limits based on plan
    const emailLimits = {
      'starter': 500,
      'professional': 2000,
      'enterprise': 10000
    };

    const [user] = await db
      .update(users)
      .set({
        subscriptionPlan: plan,
        emailLimitPerMonth: emailLimits[plan as keyof typeof emailLimits] || 500,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async incrementEmailUsage(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        emailsProcessedThisMonth: sql`${users.emailsProcessedThisMonth} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async resetMonthlyEmailUsage(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        emailsProcessedThisMonth: 0,
        billingPeriodStart: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Email operations
  async createEmailThread(thread: InsertEmailThread): Promise<EmailThread> {
    const [newThread] = await db.insert(emailThreads).values(thread).returning();
    return newThread;
  }

  async getEmailThreads(userId: string): Promise<EmailThread[]> {
    return await db
      .select()
      .from(emailThreads)
      .where(eq(emailThreads.userId, userId))
      .orderBy(desc(emailThreads.lastActivity));
  }

  async updateEmailThread(id: number, updates: Partial<EmailThread>): Promise<EmailThread> {
    const [updatedThread] = await db
      .update(emailThreads)
      .set(updates)
      .where(eq(emailThreads.id, id))
      .returning();
    return updatedThread;
  }

  // Draft operations
  async createEmailDraft(draft: InsertEmailDraft): Promise<EmailDraft> {
    const [newDraft] = await db.insert(emailDrafts).values(draft).returning();
    return newDraft;
  }

  async getEmailDrafts(userId: string): Promise<EmailDraft[]> {
    return await db
      .select()
      .from(emailDrafts)
      .where(eq(emailDrafts.userId, userId))
      .orderBy(desc(emailDrafts.createdAt));
  }

  async updateEmailDraftStatus(id: number, status: string): Promise<EmailDraft> {
    const [updatedDraft] = await db
      .update(emailDrafts)
      .set({ status })
      .where(eq(emailDrafts.id, id))
      .returning();
    return updatedDraft;
  }

  // Smart rules
  async createSmartRule(rule: InsertSmartRule): Promise<SmartRule> {
    const [newRule] = await db.insert(smartRules).values(rule).returning();
    return newRule;
  }

  async getSmartRules(userId: string): Promise<SmartRule[]> {
    return await db
      .select()
      .from(smartRules)
      .where(eq(smartRules.userId, userId))
      .orderBy(desc(smartRules.createdAt));
  }

  async updateSmartRule(id: number, updates: Partial<SmartRule>): Promise<SmartRule> {
    const [updatedRule] = await db
      .update(smartRules)
      .set(updates)
      .where(eq(smartRules.id, id))
      .returning();
    return updatedRule;
  }

  // Analytics
  async trackUsage(analytics: InsertUsageAnalytic): Promise<UsageAnalytic> {
    const [newAnalytic] = await db.insert(usageAnalytics).values(analytics).returning();
    return newAnalytic;
  }

  async getUsageAnalytics(userId: string): Promise<UsageAnalytic[]> {
    return await db
      .select()
      .from(usageAnalytics)
      .where(eq(usageAnalytics.userId, userId))
      .orderBy(desc(usageAnalytics.createdAt));
  }

  // Integrations
  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [newIntegration] = await db.insert(integrations).values(integration).returning();
    return newIntegration;
  }

  async getIntegrations(userId: string): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .orderBy(desc(integrations.createdAt));
  }

  async updateIntegration(id: number, updates: Partial<Integration>): Promise<Integration> {
    const [updatedIntegration] = await db
      .update(integrations)
      .set(updates)
      .where(eq(integrations.id, id))
      .returning();
    return updatedIntegration;
  }

  // Demo and newsletter (legacy)
  async createDemoRequest(insertRequest: InsertDemoRequest): Promise<DemoRequest> {
    const [request] = await db.insert(demoRequests).values({
      ...insertRequest,
      company: insertRequest.company || null,
      message: insertRequest.message || null
    }).returning();
    return request;
  }

  async getDemoRequests(): Promise<DemoRequest[]> {
    return await db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt));
  }

  async subscribeToNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    try {
      const [newsletter] = await db.insert(newsletters).values(insertNewsletter).returning();
      return newsletter;
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error("Email already subscribed");
      }
      throw error;
    }
  }

  async getNewsletterSubscriptions(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  // Email summaries and quick wins implementation
  async createEmailSummary(summary: InsertEmailSummary): Promise<EmailSummary> {
    const [created] = await db.insert(emailSummaries).values(summary).returning();
    return created;
  }

  async getEmailSummary(userId: string, threadId: string): Promise<EmailSummary | undefined> {
    const [summary] = await db
      .select()
      .from(emailSummaries)
      .where(and(eq(emailSummaries.userId, userId), eq(emailSummaries.threadId, threadId)));
    return summary;
  }

  async createFollowUpReminder(reminder: InsertFollowUpReminder): Promise<FollowUpReminder> {
    const [created] = await db.insert(followUpReminders).values(reminder).returning();
    return created;
  }

  async getFollowUpReminders(userId: string): Promise<FollowUpReminder[]> {
    return await db
      .select()
      .from(followUpReminders)
      .where(and(eq(followUpReminders.userId, userId), eq(followUpReminders.isActive, true)))
      .orderBy(followUpReminders.reminderTime);
  }

  async updateFollowUpReminder(id: number, updates: Partial<FollowUpReminder>): Promise<FollowUpReminder> {
    const [updated] = await db
      .update(followUpReminders)
      .set(updates)
      .where(eq(followUpReminders.id, id))
      .returning();
    return updated;
  }

  async cacheQuickReplies(cache: InsertQuickReplyCache): Promise<QuickReplyCache> {
    const [created] = await db.insert(quickRepliesCache).values(cache).returning();
    return created;
  }

  async getQuickRepliesCache(userId: string, emailHash: string): Promise<QuickReplyCache | undefined> {
    const [cached] = await db
      .select()
      .from(quickRepliesCache)
      .where(and(eq(quickRepliesCache.userId, userId), eq(quickRepliesCache.emailHash, emailHash)));
    return cached;
  }

  // Analytics and Business Intelligence
  async createEmailAnalytic(analytic: InsertEmailAnalytic): Promise<EmailAnalytic> {
    const [result] = await db.insert(emailAnalytics).values(analytic).returning();
    return result;
  }

  async getEmailAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<EmailAnalytic[]> {
    const conditions = [eq(emailAnalytics.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(emailAnalytics.date, startDate.toISOString().split('T')[0]));
    }
    if (endDate) {
      conditions.push(lte(emailAnalytics.date, endDate.toISOString().split('T')[0]));
    }

    return await db.select().from(emailAnalytics).where(and(...conditions));
  }

  async createLeadScore(leadScore: InsertLeadScore): Promise<LeadScore> {
    const [result] = await db.insert(leadScores).values(leadScore).returning();
    return result;
  }

  async getLeadScore(userId: string, contactEmail: string): Promise<LeadScore | undefined> {
    const [result] = await db
      .select()
      .from(leadScores)
      .where(and(eq(leadScores.userId, userId), eq(leadScores.contactEmail, contactEmail)));
    return result;
  }

  async updateLeadScore(id: number, updates: Partial<LeadScore>): Promise<LeadScore> {
    const [result] = await db
      .update(leadScores)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leadScores.id, id))
      .returning();
    return result;
  }

  // Security and Compliance
  async createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert> {
    const [result] = await db.insert(securityAlerts).values(alert).returning();
    return result;
  }

  async getSecurityAlerts(userId: string): Promise<SecurityAlert[]> {
    return await db
      .select()
      .from(securityAlerts)
      .where(eq(securityAlerts.userId, userId))
      .orderBy(desc(securityAlerts.createdAt));
  }

  async updateSecurityAlert(id: number, updates: Partial<SecurityAlert>): Promise<SecurityAlert> {
    const [result] = await db
      .update(securityAlerts)
      .set(updates)
      .where(eq(securityAlerts.id, id))
      .returning();
    return result;
  }

  // Automation and Workflows
  async createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule> {
    const [result] = await db.insert(automationRules).values(rule).returning();
    return result;
  }

  async getAutomationRules(userId: string): Promise<AutomationRule[]> {
    return await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.userId, userId))
      .orderBy(desc(automationRules.createdAt));
  }

  async updateAutomationRule(id: number, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const [result] = await db
      .update(automationRules)
      .set(updates)
      .where(eq(automationRules.id, id))
      .returning();
    return result;
  }

  async createTaskIntegration(task: InsertTaskIntegration): Promise<TaskIntegration> {
    const [result] = await db.insert(taskIntegrations).values(task).returning();
    return result;
  }

  async createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog> {
    const [result] = await db.insert(crmSyncLogs).values(log).returning();
    return result;
  }

  async getCrmSyncLogs(userId: string): Promise<CrmSyncLog[]> {
    return await db.select()
      .from(crmSyncLogs)
      .where(eq(crmSyncLogs.userId, userId))
      .orderBy(desc(crmSyncLogs.createdAt));
  }

  // Email account management
  async createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount> {
    const [result] = await db.insert(emailAccounts).values(account).returning();
    return result;
  }

  async getEmailAccounts(userId: string): Promise<EmailAccount[]> {
    return await db.select()
      .from(emailAccounts)
      .where(eq(emailAccounts.userId, userId))
      .orderBy(desc(emailAccounts.isPrimary), desc(emailAccounts.createdAt));
  }

  async updateEmailAccount(id: number, updates: Partial<EmailAccount>): Promise<EmailAccount> {
    const [result] = await db.update(emailAccounts)
      .set(updates)
      .where(eq(emailAccounts.id, id))
      .returning();
    return result;
  }

  async deleteEmailAccount(id: number, userId: string): Promise<void> {
    await db.delete(emailAccounts)
      .where(and(eq(emailAccounts.id, id), eq(emailAccounts.userId, userId)));
  }

  async startEmailSync(accountId: number, userId: string): Promise<void> {
    // Update sync status to indicate sync is starting
    await db.update(emailAccounts)
      .set({ syncStatus: 'syncing' })
      .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)));
  }

  async setPrimaryEmailAccount(accountId: number, userId: string): Promise<void> {
    // First, set all accounts for this user to non-primary
    await db.update(emailAccounts)
      .set({ isPrimary: false })
      .where(eq(emailAccounts.userId, userId));
    
    // Then set the specified account as primary
    await db.update(emailAccounts)
      .set({ isPrimary: true })
      .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)));
  }

  // Custom templates
  async createCustomTemplate(template: InsertCustomTemplate): Promise<CustomTemplate> {
    const [result] = await db.insert(customTemplates).values(template).returning();
    return result;
  }

  async getCustomTemplates(userId: string): Promise<CustomTemplate[]> {
    return await db.select().from(customTemplates)
      .where(eq(customTemplates.userId, userId))
      .orderBy(desc(customTemplates.createdAt));
  }

  async updateCustomTemplate(id: number, updates: Partial<CustomTemplate>): Promise<CustomTemplate> {
    const [result] = await db.update(customTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customTemplates.id, id))
      .returning();
    return result;
  }

  async deleteCustomTemplate(id: number): Promise<void> {
    await db.delete(customTemplates).where(eq(customTemplates.id, id));
  }

  async getPublicTemplates(): Promise<CustomTemplate[]> {
    return await db.select().from(customTemplates)
      .where(eq(customTemplates.isPublic, true))
      .orderBy(desc(customTemplates.usageCount));
  }

  // Custom rules
  async createCustomRule(rule: InsertCustomRule): Promise<CustomRule> {
    const [result] = await db.insert(customRules).values(rule).returning();
    return result;
  }

  async getCustomRules(userId: string): Promise<CustomRule[]> {
    return await db.select().from(customRules)
      .where(eq(customRules.userId, userId))
      .orderBy(customRules.priority);
  }

  async updateCustomRule(id: number, updates: Partial<CustomRule>): Promise<CustomRule> {
    const [result] = await db.update(customRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customRules.id, id))
      .returning();
    return result;
  }

  async deleteCustomRule(id: number): Promise<void> {
    await db.delete(customRules).where(eq(customRules.id, id));
  }

  // Template usage tracking
  async trackTemplateUsage(usage: InsertTemplateUsage): Promise<TemplateUsage> {
    const [result] = await db.insert(templateUsage).values(usage).returning();
    return result;
  }

  async getTemplateUsageStats(userId: string, templateId?: number): Promise<TemplateUsage[]> {
    let query = db.select().from(templateUsage)
      .where(eq(templateUsage.userId, userId));
    
    if (templateId) {
      query = query.where(eq(templateUsage.templateId, templateId));
    }
    
    return await query.orderBy(desc(templateUsage.createdAt));
  }

  // Security and audit methods
  async updateUserMFASettings(userId: string, settings: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getAuditLogs(filters: { 
    userId?: string; 
    startDate?: Date; 
    endDate?: Date; 
    action?: string 
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    if (filters.userId) {
      query = query.where(eq(auditLogs.userId, filters.userId));
    }
    if (filters.startDate) {
      query = query.where(gte(auditLogs.timestamp, filters.startDate));
    }
    if (filters.endDate) {
      query = query.where(lte(auditLogs.timestamp, filters.endDate));
    }
    if (filters.action) {
      query = query.where(eq(auditLogs.action, filters.action));
    }
    
    return await query.orderBy(desc(auditLogs.timestamp));
  }

  async getRecentAuditLogs(userId: string, hoursBack: number): Promise<AuditLog[]> {
    const timeThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.userId, userId),
          gte(auditLogs.timestamp, timeThreshold)
        )
      )
      .orderBy(desc(auditLogs.timestamp));
  }

  // AI and Azure usage tracking methods
  async trackAiUsage(usage: InsertAiUsageLog): Promise<AiUsageLog> {
    const [log] = await db.insert(aiUsageLog).values(usage).returning();
    return log;
  }

  async trackAzureUsage(usage: InsertAzureUsageLog): Promise<AzureUsageLog> {
    const [log] = await db.insert(azureUsageLog).values(usage).returning();
    return log;
  }

  async getAiUsageByUser(userId: string, billingPeriod?: string): Promise<AiUsageLog[]> {
    let query = db.select().from(aiUsageLog).where(eq(aiUsageLog.userId, userId));
    
    if (billingPeriod) {
      query = query.where(eq(aiUsageLog.billingPeriod, billingPeriod));
    }
    
    return await query.orderBy(desc(aiUsageLog.timestamp));
  }

  async getAzureUsageByUser(userId: string, billingPeriod?: string): Promise<AzureUsageLog[]> {
    let query = db.select().from(azureUsageLog).where(eq(azureUsageLog.userId, userId));
    
    if (billingPeriod) {
      query = query.where(eq(azureUsageLog.billingPeriod, billingPeriod));
    }
    
    return await query.orderBy(desc(azureUsageLog.timestamp));
  }

  async updateUserAiCosts(userId: string, tokensUsed: number, costInCents: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        aiTokensUsedThisMonth: sql`${users.aiTokensUsedThisMonth} + ${tokensUsed}`,
        aiCostThisMonth: sql`${users.aiCostThisMonth} + ${costInCents}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserAzureCosts(userId: string, creditsUsed: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        azureCreditsUsed: sql`${users.azureCreditsUsed} + ${creditsUsed}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getRecentSignups(days: number = 30): Promise<User[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    return await db
      .select()
      .from(users)
      .where(gte(users.createdAt, dateThreshold))
      .orderBy(desc(users.createdAt));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    trialUsers: number;
    expiredTrials: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalEmailsProcessed: number;
    averageEmailsPerUser: number;
    totalAiCosts: number;
    totalAzureCosts: number;
    averageAiCostPerUser: number;
    averageAzureCostPerUser: number;
  }> {
    const allUsers = await db.select().from(users);
    
    const totalUsers = allUsers.length;
    const activeSubscribers = allUsers.filter(u => u.subscriptionStatus === 'active').length;
    const trialUsers = allUsers.filter(u => u.subscriptionStatus === 'trial' && (!u.trialEndsAt || u.trialEndsAt > new Date())).length;
    const expiredTrials = allUsers.filter(u => u.subscriptionStatus === 'trial_expired').length;
    
    // Calculate revenue (simplified - in real app you'd integrate with payment processor)
    const paidUsers = allUsers.filter(u => u.subscriptionStatus === 'active');
    const monthlyRevenue = paidUsers.reduce((total, user) => {
      const planRevenue = user.subscriptionPlan === 'enterprise' ? 49 : 
                         user.subscriptionPlan === 'professional' ? 19 : 0;
      return total + planRevenue;
    }, 0);
    
    const totalRevenue = monthlyRevenue * 12; // Simplified calculation
    
    const totalEmailsProcessed = allUsers.reduce((total, user) => total + (user.emailsProcessedThisMonth || 0), 0);
    const averageEmailsPerUser = totalUsers > 0 ? totalEmailsProcessed / totalUsers : 0;
    
    // Calculate AI and Azure costs
    const totalAiCosts = allUsers.reduce((total, user) => total + (user.aiCostThisMonth || 0), 0);
    const totalAzureCosts = allUsers.reduce((total, user) => total + (user.azureCreditsUsed || 0), 0);
    const averageAiCostPerUser = totalUsers > 0 ? totalAiCosts / totalUsers : 0;
    const averageAzureCostPerUser = totalUsers > 0 ? totalAzureCosts / totalUsers : 0;
    
    return {
      totalUsers,
      activeSubscribers,
      trialUsers,
      expiredTrials,
      totalRevenue,
      monthlyRevenue,
      totalEmailsProcessed,
      averageEmailsPerUser,
      totalAiCosts,
      totalAzureCosts,
      averageAiCostPerUser,
      averageAzureCostPerUser
    };
  }

  // Email/Password Authentication methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      // Fallback to basic user query if there are missing columns
      try {
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            passwordHash: users.passwordHash,
            emailVerified: users.emailVerified,
            subscriptionStatus: users.subscriptionStatus,
            subscriptionPlan: users.subscriptionPlan,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
          })
          .from(users)
          .where(eq(users.email, email));
        return user as User;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return undefined;
      }
    }
  }

  async createUserWithPassword(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<User> {
    const userId = crypto.randomUUID();
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        passwordHash,
        firstName,
        lastName,
        emailVerified: false,
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserEmailVerification(userId: string, verified: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        emailVerified: verified,
        emailVerificationToken: verified ? null : users.emailVerificationToken
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Password Reset Token methods
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({
        userId,
        token,
        expiresAt,
        used: false
      })
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gte(passwordResetTokens.expiresAt, new Date())
      ));
    return resetToken;
  }

  async markPasswordResetTokenUsed(tokenId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lte(passwordResetTokens.expiresAt, new Date()));
  }

  // Webhook methods
  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [created] = await db
      .insert(webhooks)
      .values(webhook)
      .returning();
    return created;
  }

  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, id));
    return webhook;
  }

  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    return await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhooks.createdAt));
  }

  async updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook> {
    const [updated] = await db
      .update(webhooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return updated;
  }

  async deleteWebhook(id: number): Promise<void> {
    await db
      .delete(webhooks)
      .where(eq(webhooks.id, id));
  }

  // Platform integration operations
  async createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const [created] = await db
      .insert(platformIntegrations)
      .values(integration)
      .returning();
    return created;
  }

  async getPlatformIntegration(id: number): Promise<PlatformIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(platformIntegrations)
      .where(eq(platformIntegrations.id, id));
    return integration;
  }

  async getUserPlatformIntegrations(userId: string): Promise<PlatformIntegration[]> {
    return await db
      .select()
      .from(platformIntegrations)
      .where(eq(platformIntegrations.userId, userId))
      .orderBy(desc(platformIntegrations.createdAt));
  }

  async updatePlatformIntegration(id: number, updates: Partial<PlatformIntegration>): Promise<PlatformIntegration> {
    const [updated] = await db
      .update(platformIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(platformIntegrations.id, id))
      .returning();
    return updated;
  }

  async deletePlatformIntegration(id: number): Promise<void> {
    await db
      .delete(platformIntegrations)
      .where(eq(platformIntegrations.id, id));
  }

  // Writing Style Profile methods
  async saveWritingStyleProfile(profile: { userId: string; styleAnalysis: any; examples: string[] }): Promise<WritingStyleProfile> {
    const [existingProfile] = await db
      .select()
      .from(writingStyleProfiles)
      .where(eq(writingStyleProfiles.userId, profile.userId));

    if (existingProfile) {
      const [updated] = await db
        .update(writingStyleProfiles)
        .set({
          styleAnalysis: profile.styleAnalysis,
          examples: profile.examples,
          lastUpdated: new Date()
        })
        .where(eq(writingStyleProfiles.userId, profile.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(writingStyleProfiles)
        .values({
          userId: profile.userId,
          styleAnalysis: profile.styleAnalysis,
          examples: profile.examples
        })
        .returning();
      return created;
    }
  }

  async getWritingStyleProfile(userId: string): Promise<WritingStyleProfile | null> {
    const [profile] = await db
      .select()
      .from(writingStyleProfiles)
      .where(eq(writingStyleProfiles.userId, userId));
    return profile || null;
  }

  async updateWritingStyleProfile(userId: string, updates: Partial<WritingStyleProfile>): Promise<WritingStyleProfile> {
    const [updated] = await db
      .update(writingStyleProfiles)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(writingStyleProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Attachment Analysis methods
  async saveAttachmentAnalysis(analysis: InsertAttachmentAnalysis): Promise<AttachmentAnalysis> {
    const [created] = await db
      .insert(attachmentAnalyses)
      .values(analysis)
      .returning();
    return created;
  }

  async getAttachmentAnalysis(emailId: string): Promise<AttachmentAnalysis[]> {
    return await db
      .select()
      .from(attachmentAnalyses)
      .where(eq(attachmentAnalyses.emailId, emailId))
      .orderBy(desc(attachmentAnalyses.createdAt));
  }

  async getAttachmentAnalysisByUser(userId: string): Promise<AttachmentAnalysis[]> {
    return await db
      .select()
      .from(attachmentAnalyses)
      .where(eq(attachmentAnalyses.userId, userId))
      .orderBy(desc(attachmentAnalyses.createdAt));
  }

  // Calendar Event methods
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [created] = await db
      .insert(calendarEvents)
      .values(event)
      .returning();
    return created;
  }

  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id));
    return event;
  }

  async getUserCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(desc(calendarEvents.startTime));
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const [updated] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updated;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, id));
  }

  // Email Sentiment Analysis methods
  async createEmailSentimentAnalysis(analysis: InsertEmailSentimentAnalysis): Promise<EmailSentimentAnalysis> {
    const [created] = await db
      .insert(emailSentimentAnalyses)
      .values(analysis)
      .returning();
    return created;
  }

  async getEmailSentimentAnalysis(id: number): Promise<EmailSentimentAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(emailSentimentAnalyses)
      .where(eq(emailSentimentAnalyses.id, id));
    return analysis;
  }

  async getSentimentAnalysesByDate(userId: string, date: Date): Promise<EmailSentimentAnalysis[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(emailSentimentAnalyses)
      .where(and(
        eq(emailSentimentAnalyses.userId, userId),
        gte(emailSentimentAnalyses.createdAt, startOfDay),
        lte(emailSentimentAnalyses.createdAt, endOfDay)
      ))
      .orderBy(desc(emailSentimentAnalyses.createdAt));
  }

  async getRecentSentimentAnalyses(userId: string, contactEmail: string, limit: number): Promise<EmailSentimentAnalysis[]> {
    return await db
      .select()
      .from(emailSentimentAnalyses)
      .where(and(
        eq(emailSentimentAnalyses.userId, userId),
        eq(emailSentimentAnalyses.fromEmail, contactEmail)
      ))
      .orderBy(desc(emailSentimentAnalyses.createdAt))
      .limit(limit);
  }

  async getTopEmotionalTones(userId: string, days: number): Promise<Array<{ tone: string; count: number }>> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const analyses = await db
      .select({
        emotionalTone: emailSentimentAnalyses.emotionalTone
      })
      .from(emailSentimentAnalyses)
      .where(and(
        eq(emailSentimentAnalyses.userId, userId),
        gte(emailSentimentAnalyses.createdAt, dateThreshold)
      ));

    const toneCounts = analyses.reduce((acc, analysis) => {
      const tone = analysis.emotionalTone;
      acc[tone] = (acc[tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(toneCounts)
      .map(([tone, count]) => ({ tone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Contact Sentiment Profile methods
  async createContactSentimentProfile(profile: InsertContactSentimentProfile): Promise<ContactSentimentProfile> {
    const [created] = await db
      .insert(contactSentimentProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async getContactSentimentProfile(userId: string, contactEmail: string): Promise<ContactSentimentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(contactSentimentProfiles)
      .where(and(
        eq(contactSentimentProfiles.userId, userId),
        eq(contactSentimentProfiles.contactEmail, contactEmail)
      ));
    return profile;
  }

  async updateContactSentimentProfile(id: number, updates: Partial<ContactSentimentProfile>): Promise<ContactSentimentProfile> {
    const [updated] = await db
      .update(contactSentimentProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contactSentimentProfiles.id, id))
      .returning();
    return updated;
  }

  async getAtRiskContacts(userId: string): Promise<Array<{ email: string; reason: string; lastScore: number }>> {
    const profiles = await db
      .select()
      .from(contactSentimentProfiles)
      .where(and(
        eq(contactSentimentProfiles.userId, userId),
        or(
          lte(contactSentimentProfiles.averageSentiment, -0.3),
          eq(contactSentimentProfiles.relationshipStatus, 'at_risk')
        )
      ))
      .orderBy(contactSentimentProfiles.averageSentiment)
      .limit(10);

    return profiles.map(profile => ({
      email: profile.contactEmail,
      reason: profile.relationshipStatus === 'at_risk' ? 'Relationship deteriorating' : 'Negative sentiment trend',
      lastScore: profile.averageSentiment
    }));
  }

  // Response Coaching Analytics methods
  async createResponseCoachingAnalytics(analytics: InsertResponseCoachingAnalytics): Promise<ResponseCoachingAnalytics> {
    const [created] = await db
      .insert(responseCoachingAnalytics)
      .values(analytics)
      .returning();
    return created;
  }

  async getResponseCoachingStats(userId: string, days: number): Promise<{
    totalCoachingSessions: number;
    avgResponseTime: number;
    successfulOutcomes: number;
  }> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const stats = await db
      .select({
        id: responseCoachingAnalytics.id,
        responseTime: responseCoachingAnalytics.responseTime,
        outcomeRating: responseCoachingAnalytics.outcomeRating
      })
      .from(responseCoachingAnalytics)
      .where(and(
        eq(responseCoachingAnalytics.userId, userId),
        gte(responseCoachingAnalytics.createdAt, dateThreshold)
      ));

    const totalCoachingSessions = stats.length;
    const avgResponseTime = stats.length > 0 
      ? stats.reduce((sum, stat) => sum + (stat.responseTime || 0), 0) / stats.length 
      : 0;
    const successfulOutcomes = stats.filter(stat => (stat.outcomeRating || 0) >= 4).length;

    return {
      totalCoachingSessions,
      avgResponseTime,
      successfulOutcomes
    };
  }

  // Email Workload Management methods
  async createEmailWorkloadClassification(classification: InsertEmailWorkloadClassification): Promise<EmailWorkloadClassification> {
    const [result] = await db
      .insert(emailWorkloadClassifications)
      .values(classification)
      .returning();
    return result;
  }

  async getEmailWorkloadClassifications(userId: string, filters?: { completed?: boolean; date?: string; limit?: number }): Promise<EmailWorkloadClassification[]> {
    let query = db.select().from(emailWorkloadClassifications).where(eq(emailWorkloadClassifications.userId, userId));
    
    if (filters?.completed !== undefined) {
      query = query.where(eq(emailWorkloadClassifications.completed, filters.completed));
    }
    
    if (filters?.date) {
      const startDate = new Date(filters.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query = query.where(
        and(
          gte(emailWorkloadClassifications.createdAt, startDate),
          lte(emailWorkloadClassifications.createdAt, endDate)
        )
      );
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return query.orderBy(desc(emailWorkloadClassifications.createdAt));
  }

  async updateEmailWorkloadCompletion(classificationId: number, actualTimeSpent: number, userFeedback?: string): Promise<EmailWorkloadClassification> {
    const [result] = await db
      .update(emailWorkloadClassifications)
      .set({
        actualTimeSpent,
        userFeedback,
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(emailWorkloadClassifications.id, classificationId))
      .returning();
    return result;
  }

  // User Energy Pattern methods
  async getUserEnergyPatterns(userId: string): Promise<UserEnergyPattern[]> {
    return db.select().from(userEnergyPatterns)
      .where(eq(userEnergyPatterns.userId, userId))
      .orderBy(userEnergyPatterns.hourOfDay, userEnergyPatterns.dayOfWeek);
  }

  async upsertUserEnergyPattern(pattern: InsertUserEnergyPattern): Promise<UserEnergyPattern> {
    const existing = await db.select().from(userEnergyPatterns)
      .where(
        and(
          eq(userEnergyPatterns.userId, pattern.userId),
          eq(userEnergyPatterns.hourOfDay, pattern.hourOfDay),
          eq(userEnergyPatterns.dayOfWeek, pattern.dayOfWeek)
        )
      );

    if (existing.length > 0) {
      const [result] = await db
        .update(userEnergyPatterns)
        .set({
          ...pattern,
          dataPoints: (existing[0].dataPoints || 0) + 1,
          lastUpdated: new Date()
        })
        .where(eq(userEnergyPatterns.id, existing[0].id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(userEnergyPatterns)
        .values(pattern)
        .returning();
      return result;
    }
  }

  // Email Processing Schedule methods
  async createEmailProcessingSchedule(schedule: InsertEmailProcessingSchedule): Promise<EmailProcessingSchedule> {
    const [result] = await db
      .insert(emailProcessingSchedules)
      .values(schedule)
      .returning();
    return result;
  }

  async getActiveEmailProcessingSchedule(userId: string): Promise<EmailProcessingSchedule | null> {
    const [result] = await db.select().from(emailProcessingSchedules)
      .where(
        and(
          eq(emailProcessingSchedules.userId, userId),
          eq(emailProcessingSchedules.isActive, true)
        )
      )
      .orderBy(desc(emailProcessingSchedules.createdAt))
      .limit(1);
    
    return result || null;
  }

  async updateEmailProcessingSchedule(scheduleId: number, updates: Partial<InsertEmailProcessingSchedule>): Promise<EmailProcessingSchedule> {
    const [result] = await db
      .update(emailProcessingSchedules)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(emailProcessingSchedules.id, scheduleId))
      .returning();
    return result;
  }

  // Workload Analytics methods
  async createWorkloadAnalytics(analytics: InsertWorkloadAnalytics): Promise<WorkloadAnalytics> {
    const [result] = await db
      .insert(workloadAnalytics)
      .values(analytics)
      .returning();
    return result;
  }

  async getWorkloadAnalytics(userId: string, filters?: { limit?: number; dateFrom?: string; dateTo?: string }): Promise<WorkloadAnalytics[]> {
    let query = db.select().from(workloadAnalytics).where(eq(workloadAnalytics.userId, userId));
    
    if (filters?.dateFrom) {
      query = query.where(gte(workloadAnalytics.date, filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      query = query.where(lte(workloadAnalytics.date, filters.dateTo));
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return query.orderBy(desc(workloadAnalytics.date));
  }

  // Predictive Analytics methods
  async createEmailVolumeForecast(forecast: InsertEmailVolumeForecast): Promise<EmailVolumeForecast> {
    const [result] = await db
      .insert(emailVolumeForecasts)
      .values(forecast)
      .returning();
    return result;
  }

  async getEmailVolumeForecasts(userId: string, limit: number = 7): Promise<EmailVolumeForecast[]> {
    return db
      .select()
      .from(emailVolumeForecasts)
      .where(eq(emailVolumeForecasts.userId, userId))
      .orderBy(desc(emailVolumeForecasts.forecastDate))
      .limit(limit);
  }

  async createEmailFollowupPrediction(prediction: InsertEmailFollowupPrediction): Promise<EmailFollowupPrediction> {
    const [result] = await db
      .insert(emailFollowupPredictions)
      .values(prediction)
      .returning();
    return result;
  }

  async getEmailFollowupPredictions(userId: string, filters?: { highRiskOnly?: boolean; limit?: number }): Promise<EmailFollowupPrediction[]> {
    let query = db
      .select()
      .from(emailFollowupPredictions)
      .where(eq(emailFollowupPredictions.userId, userId));

    if (filters?.highRiskOnly) {
      query = query.where(gte(emailFollowupPredictions.followupProbability, 0.7));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query.orderBy(desc(emailFollowupPredictions.followupProbability));
  }

  async updateEmailFollowupPrediction(id: number, updates: Partial<EmailFollowupPrediction>): Promise<EmailFollowupPrediction> {
    const [result] = await db
      .update(emailFollowupPredictions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailFollowupPredictions.id, id))
      .returning();
    return result;
  }

  async createCommunicationPatternAnalysis(analysis: InsertCommunicationPatternAnalysis): Promise<CommunicationPatternAnalysis> {
    const [result] = await db
      .insert(communicationPatternAnalysis)
      .values(analysis)
      .returning();
    return result;
  }

  async getCommunicationPatternAnalysis(userId: string, filters?: { priority?: string; limit?: number }): Promise<CommunicationPatternAnalysis[]> {
    let query = db
      .select()
      .from(communicationPatternAnalysis)
      .where(eq(communicationPatternAnalysis.userId, userId));

    if (filters?.priority) {
      query = query.where(eq(communicationPatternAnalysis.priority, filters.priority));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query.orderBy(desc(communicationPatternAnalysis.estimatedBusinessValue));
  }

  async updateCommunicationPatternAnalysis(id: number, updates: Partial<CommunicationPatternAnalysis>): Promise<CommunicationPatternAnalysis> {
    const [result] = await db
      .update(communicationPatternAnalysis)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communicationPatternAnalysis.id, id))
      .returning();
    return result;
  }

  async createEmailRoiAnalysis(analysis: InsertEmailRoiAnalysis): Promise<EmailRoiAnalysis> {
    const [result] = await db
      .insert(emailRoiAnalysis)
      .values(analysis)
      .returning();
    return result;
  }

  async getEmailRoiAnalysis(userId: string, periodType?: string, limit: number = 10): Promise<EmailRoiAnalysis[]> {
    let query = db
      .select()
      .from(emailRoiAnalysis)
      .where(eq(emailRoiAnalysis.userId, userId));

    if (periodType) {
      query = query.where(eq(emailRoiAnalysis.periodType, periodType));
    }

    return query
      .orderBy(desc(emailRoiAnalysis.analysisDate))
      .limit(limit);
  }

  async createPredictiveAnalyticsInsight(insight: InsertPredictiveAnalyticsInsight): Promise<PredictiveAnalyticsInsight> {
    const [result] = await db
      .insert(predictiveAnalyticsInsights)
      .values(insight)
      .returning();
    return result;
  }

  async getPredictiveAnalyticsInsights(userId: string, filters?: { acknowledged?: boolean; priority?: string; limit?: number }): Promise<PredictiveAnalyticsInsight[]> {
    let query = db
      .select()
      .from(predictiveAnalyticsInsights)
      .where(eq(predictiveAnalyticsInsights.userId, userId));

    if (filters?.acknowledged !== undefined) {
      query = query.where(eq(predictiveAnalyticsInsights.acknowledged, filters.acknowledged));
    }

    if (filters?.priority) {
      query = query.where(eq(predictiveAnalyticsInsights.priority, filters.priority));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query.orderBy(desc(predictiveAnalyticsInsights.createdAt));
  }

  async updatePredictiveAnalyticsInsight(id: number, updates: Partial<PredictiveAnalyticsInsight>): Promise<PredictiveAnalyticsInsight> {
    const [result] = await db
      .update(predictiveAnalyticsInsights)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(predictiveAnalyticsInsights.id, id))
      .returning();
    return result;
  }

  // Cross-Account Intelligence operations
  async createCrossAccountContact(contact: InsertCrossAccountContact): Promise<CrossAccountContact> {
    const [result] = await db
      .insert(crossAccountContacts)
      .values(contact)
      .returning();
    return result;
  }

  async getCrossAccountContactByEmail(userId: string, contactEmail: string): Promise<CrossAccountContact | undefined> {
    const [result] = await db
      .select()
      .from(crossAccountContacts)
      .where(and(
        eq(crossAccountContacts.userId, userId),
        eq(crossAccountContacts.contactEmail, contactEmail)
      ));
    return result;
  }

  async getCrossAccountContactsByUserId(userId: string): Promise<CrossAccountContact[]> {
    return db
      .select()
      .from(crossAccountContacts)
      .where(eq(crossAccountContacts.userId, userId))
      .orderBy(desc(crossAccountContacts.lastInteraction));
  }

  async updateCrossAccountContact(id: number, updates: Partial<CrossAccountContact>): Promise<CrossAccountContact> {
    const [result] = await db
      .update(crossAccountContacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(crossAccountContacts.id, id))
      .returning();
    return result;
  }

  async deleteCrossAccountContact(id: number): Promise<void> {
    await db
      .delete(crossAccountContacts)
      .where(eq(crossAccountContacts.id, id));
  }

  // Account Optimization operations
  async createAccountOptimization(optimization: InsertAccountOptimization): Promise<AccountOptimization> {
    const [result] = await db
      .insert(accountOptimizations)
      .values(optimization)
      .returning();
    return result;
  }

  async getAccountOptimizationByContact(userId: string, contactEmail: string): Promise<AccountOptimization | undefined> {
    const [result] = await db
      .select()
      .from(accountOptimizations)
      .where(and(
        eq(accountOptimizations.userId, userId),
        eq(accountOptimizations.contactEmail, contactEmail),
        eq(accountOptimizations.status, "pending")
      ));
    return result;
  }

  async getAccountOptimizations(userId: string): Promise<AccountOptimization[]> {
    return db
      .select()
      .from(accountOptimizations)
      .where(eq(accountOptimizations.userId, userId))
      .orderBy(desc(accountOptimizations.createdAt));
  }

  async updateAccountOptimization(id: number, updates: Partial<AccountOptimization>): Promise<AccountOptimization> {
    const [result] = await db
      .update(accountOptimizations)
      .set({ ...updates })
      .where(eq(accountOptimizations.id, id))
      .returning();
    return result;
  }

  // Duplicate Conversation operations
  async createDuplicateConversation(duplicate: InsertDuplicateConversation): Promise<DuplicateConversation> {
    const [result] = await db
      .insert(duplicateConversations)
      .values(duplicate)
      .returning();
    return result;
  }

  async getDuplicateConversationByIds(userId: string, primaryId: string, duplicateId: string): Promise<DuplicateConversation | undefined> {
    const [result] = await db
      .select()
      .from(duplicateConversations)
      .where(and(
        eq(duplicateConversations.userId, userId),
        eq(duplicateConversations.primaryConversationId, primaryId),
        eq(duplicateConversations.duplicateConversationId, duplicateId)
      ));
    return result;
  }

  async getDuplicateConversations(userId: string): Promise<DuplicateConversation[]> {
    return db
      .select()
      .from(duplicateConversations)
      .where(eq(duplicateConversations.userId, userId))
      .orderBy(desc(duplicateConversations.similarityScore));
  }

  async updateDuplicateConversation(id: number, updates: Partial<DuplicateConversation>): Promise<DuplicateConversation> {
    const [result] = await db
      .update(duplicateConversations)
      .set({ ...updates })
      .where(eq(duplicateConversations.id, id))
      .returning();
    return result;
  }

  // Email account helper method
  async getEmailAccountsByUserId(userId: string): Promise<EmailAccount[]> {
    return this.getEmailAccounts(userId);
  }

  // Voice Email Assistant operations
  async createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand> {
    const [result] = await db
      .insert(voiceCommands)
      .values(command)
      .returning();
    return result;
  }

  async getVoiceCommands(userId: string, limit: number = 50): Promise<VoiceCommand[]> {
    return db
      .select()
      .from(voiceCommands)
      .where(eq(voiceCommands.userId, userId))
      .orderBy(desc(voiceCommands.createdAt))
      .limit(limit);
  }

  async updateVoiceCommand(id: number, updates: Partial<VoiceCommand>): Promise<VoiceCommand> {
    const [result] = await db
      .update(voiceCommands)
      .set({ ...updates })
      .where(eq(voiceCommands.id, id))
      .returning();
    return result;
  }

  async createVoiceResponse(response: InsertVoiceResponse): Promise<VoiceResponse> {
    const [result] = await db
      .insert(voiceResponses)
      .values(response)
      .returning();
    return result;
  }

  async getVoiceResponses(userId: string, limit: number = 50): Promise<VoiceResponse[]> {
    return db
      .select()
      .from(voiceResponses)
      .where(eq(voiceResponses.userId, userId))
      .orderBy(desc(voiceResponses.createdAt))
      .limit(limit);
  }

  async updateVoiceResponse(id: number, updates: Partial<VoiceResponse>): Promise<VoiceResponse> {
    const [result] = await db
      .update(voiceResponses)
      .set({ ...updates })
      .where(eq(voiceResponses.id, id))
      .returning();
    return result;
  }

  async createEmailAudioSummary(summary: InsertEmailAudioSummary): Promise<EmailAudioSummary> {
    const [result] = await db
      .insert(emailAudioSummaries)
      .values(summary)
      .returning();
    return result;
  }

  async getEmailAudioSummaries(userId: string, limit: number = 50): Promise<EmailAudioSummary[]> {
    return db
      .select()
      .from(emailAudioSummaries)
      .where(eq(emailAudioSummaries.userId, userId))
      .orderBy(desc(emailAudioSummaries.createdAt))
      .limit(limit);
  }

  async updateEmailAudioSummary(id: number, updates: Partial<EmailAudioSummary>): Promise<EmailAudioSummary> {
    const [result] = await db
      .update(emailAudioSummaries)
      .set({ ...updates })
      .where(eq(emailAudioSummaries.id, id))
      .returning();
    return result;
  }

  async getVoiceSettings(userId: string): Promise<VoiceSettings | undefined> {
    const [result] = await db
      .select()
      .from(voiceSettings)
      .where(eq(voiceSettings.userId, userId));
    return result;
  }

  async upsertVoiceSettings(settings: InsertVoiceSettings): Promise<VoiceSettings> {
    const [result] = await db
      .insert(voiceSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: voiceSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date()
        }
      })
      .returning();
    return result;
  }

  async createVoiceCommandTemplate(template: InsertVoiceCommandTemplate): Promise<VoiceCommandTemplate> {
    const [result] = await db
      .insert(voiceCommandTemplates)
      .values(template)
      .returning();
    return result;
  }

  async getVoiceCommandTemplates(): Promise<VoiceCommandTemplate[]> {
    return db
      .select()
      .from(voiceCommandTemplates)
      .where(eq(voiceCommandTemplates.isActive, true))
      .orderBy(desc(voiceCommandTemplates.usageCount));
  }

  async updateVoiceCommandTemplate(id: number, updates: Partial<VoiceCommandTemplate>): Promise<VoiceCommandTemplate> {
    const [result] = await db
      .update(voiceCommandTemplates)
      .set({ ...updates })
      .where(eq(voiceCommandTemplates.id, id))
      .returning();
    return result;
  }

  async getVoiceAnalytics(userId: string, days: number = 30): Promise<VoiceAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return db
      .select()
      .from(voiceAnalytics)
      .where(and(
        eq(voiceAnalytics.userId, userId),
        gte(voiceAnalytics.date, startDate.toISOString().split('T')[0])
      ))
      .orderBy(desc(voiceAnalytics.date));
  }

  async upsertVoiceAnalytics(analytics: InsertVoiceAnalytics): Promise<VoiceAnalytics> {
    const [result] = await db
      .insert(voiceAnalytics)
      .values(analytics)
      .onConflictDoUpdate({
        target: [voiceAnalytics.userId, voiceAnalytics.date],
        set: {
          ...analytics,
          createdAt: new Date()
        }
      })
      .returning();
    return result;
  }

  // Smart Folder Organization operations
  async createSmartFolder(folder: InsertSmartFolder): Promise<SmartFolder> {
    const [result] = await db
      .insert(smartFolders)
      .values(folder)
      .returning();
    return result;
  }

  async getSmartFolders(userId: string): Promise<SmartFolder[]> {
    return await db
      .select()
      .from(smartFolders)
      .where(eq(smartFolders.userId, userId))
      .orderBy(desc(smartFolders.createdAt));
  }

  async getSmartFolder(id: number): Promise<SmartFolder | undefined> {
    const [result] = await db
      .select()
      .from(smartFolders)
      .where(eq(smartFolders.id, id));
    return result;
  }

  async updateSmartFolder(id: number, updates: Partial<SmartFolder>): Promise<SmartFolder> {
    const [result] = await db
      .update(smartFolders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(smartFolders.id, id))
      .returning();
    return result;
  }

  async incrementFolderEmailCount(folderId: number): Promise<void> {
    await db
      .update(smartFolders)
      .set({ 
        emailCount: sql`${smartFolders.emailCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(smartFolders.id, folderId));
  }

  async createFolderRule(rule: InsertFolderRule): Promise<FolderRule> {
    const [result] = await db
      .insert(folderRules)
      .values(rule)
      .returning();
    return result;
  }

  async getFolderRules(): Promise<FolderRule[]> {
    return await db
      .select()
      .from(folderRules)
      .orderBy(desc(folderRules.createdAt));
  }

  async getFolderRulesByUser(userId: string): Promise<FolderRule[]> {
    return await db
      .select()
      .from(folderRules)
      .where(eq(folderRules.userId, userId))
      .orderBy(desc(folderRules.createdAt));
  }

  async updateFolderRule(id: number, updates: Partial<FolderRule>): Promise<FolderRule> {
    const [result] = await db
      .update(folderRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(folderRules.id, id))
      .returning();
    return result;
  }

  async createEmailFolderAssignment(assignment: InsertEmailFolderAssignment): Promise<EmailFolderAssignment> {
    const [result] = await db
      .insert(emailFolderAssignments)
      .values(assignment)
      .returning();
    return result;
  }

  async getEmailFolderAssignments(userId: string, folderId?: number): Promise<EmailFolderAssignment[]> {
    let query = db
      .select()
      .from(emailFolderAssignments)
      .where(eq(emailFolderAssignments.userId, userId));

    if (folderId) {
      query = query.where(eq(emailFolderAssignments.folderId, folderId));
    }

    return await query.orderBy(desc(emailFolderAssignments.createdAt));
  }

  async createSimilarEmailGroup(group: InsertSimilarEmailGroup): Promise<SimilarEmailGroup> {
    const [result] = await db
      .insert(similarEmailGroups)
      .values(group)
      .returning();
    return result;
  }

  async getSimilarEmailGroups(userId: string): Promise<SimilarEmailGroup[]> {
    return await db
      .select()
      .from(similarEmailGroups)
      .where(eq(similarEmailGroups.userId, userId))
      .orderBy(desc(similarEmailGroups.createdAt));
  }

  async getSimilarEmailGroup(id: number): Promise<SimilarEmailGroup | undefined> {
    const [result] = await db
      .select()
      .from(similarEmailGroups)
      .where(eq(similarEmailGroups.id, id));
    return result;
  }

  async updateSimilarEmailGroup(id: number, updates: Partial<SimilarEmailGroup>): Promise<SimilarEmailGroup> {
    const [result] = await db
      .update(similarEmailGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(similarEmailGroups.id, id))
      .returning();
    return result;
  }

  async createEmailGroupMember(member: InsertEmailGroupMember): Promise<EmailGroupMember> {
    const [result] = await db
      .insert(emailGroupMembers)
      .values(member)
      .returning();
    return result;
  }

  async getEmailGroupMembers(groupId: number): Promise<EmailGroupMember[]> {
    return await db
      .select()
      .from(emailGroupMembers)
      .where(eq(emailGroupMembers.groupId, groupId))
      .orderBy(desc(emailGroupMembers.createdAt));
  }

  async createFolderSuggestion(suggestion: InsertFolderSuggestion): Promise<FolderSuggestion> {
    const [result] = await db
      .insert(folderSuggestions)
      .values(suggestion)
      .returning();
    return result;
  }

  async getFolderSuggestions(userId: string): Promise<FolderSuggestion[]> {
    return await db
      .select()
      .from(folderSuggestions)
      .where(eq(folderSuggestions.userId, userId))
      .orderBy(desc(folderSuggestions.createdAt));
  }

  async getFolderSuggestion(id: number): Promise<FolderSuggestion | undefined> {
    const [result] = await db
      .select()
      .from(folderSuggestions)
      .where(eq(folderSuggestions.id, id));
    return result;
  }

  async updateFolderSuggestion(id: number, updates: Partial<FolderSuggestion>): Promise<FolderSuggestion> {
    const [result] = await db
      .update(folderSuggestions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(folderSuggestions.id, id))
      .returning();
    return result;
  }

  async createFolderAnalytics(analytics: InsertFolderAnalytics): Promise<FolderAnalytics> {
    const [result] = await db
      .insert(folderAnalytics)
      .values(analytics)
      .returning();
    return result;
  }

  async getFolderAnalytics(userId: string, folderId?: number): Promise<FolderAnalytics[]> {
    let query = db
      .select()
      .from(folderAnalytics)
      .where(eq(folderAnalytics.userId, userId));

    if (folderId) {
      query = query.where(eq(folderAnalytics.folderId, folderId));
    }

    return await query.orderBy(desc(folderAnalytics.createdAt));
  }

  // Email Performance Insights operations
  async createEmailAnalytic(analytic: InsertEmailAnalytic): Promise<EmailAnalytic> {
    const [result] = await db
      .insert(emailAnalytics)
      .values(analytic)
      .returning();
    return result;
  }

  async getEmailAnalyticsByContact(userId: string, contactEmail: string, limit: number = 50): Promise<EmailAnalytic[]> {
    return await db
      .select()
      .from(emailAnalytics)
      .where(and(
        eq(emailAnalytics.userId, userId),
        eq(emailAnalytics.contactEmail, contactEmail)
      ))
      .orderBy(desc(emailAnalytics.timestamp))
      .limit(limit);
  }

  async getEmailAnalyticsByThread(userId: string, threadId: string): Promise<EmailAnalytic[]> {
    return await db
      .select()
      .from(emailAnalytics)
      .where(and(
        eq(emailAnalytics.userId, userId),
        eq(emailAnalytics.threadId, threadId)
      ))
      .orderBy(asc(emailAnalytics.timestamp));
  }

  async getRecentEmailAnalytics(userId: string, days: number): Promise<EmailAnalytic[]> {
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(emailAnalytics)
      .where(and(
        eq(emailAnalytics.userId, userId),
        gte(emailAnalytics.timestamp, dateThreshold)
      ))
      .orderBy(desc(emailAnalytics.timestamp));
  }

  async createContactSentimentProfile(profile: InsertContactSentimentProfile): Promise<ContactSentimentProfile> {
    const [result] = await db
      .insert(contactSentimentProfiles)
      .values(profile)
      .returning();
    return result;
  }

  async getContactSentimentProfile(userId: string, contactEmail: string): Promise<ContactSentimentProfile | undefined> {
    const [result] = await db
      .select()
      .from(contactSentimentProfiles)
      .where(and(
        eq(contactSentimentProfiles.userId, userId),
        eq(contactSentimentProfiles.contactEmail, contactEmail)
      ));
    return result;
  }

  async updateContactSentimentProfile(id: number, updates: Partial<ContactSentimentProfile>): Promise<ContactSentimentProfile> {
    const [result] = await db
      .update(contactSentimentProfiles)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(contactSentimentProfiles.id, id))
      .returning();
    return result;
  }

  // Admin user management methods
  async deleteUser(userId: string): Promise<void> {
    // Delete all related user data first (if needed)
    // For now, we'll just delete the user record
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result;
  }

  async updateUserSubscription(userId: string, updates: { subscriptionStatus?: string; subscriptionPlan?: string; subscriptionEndsAt?: Date; billingPeriodStart?: Date; stripeSubscriptionId?: string }): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result;
  }

  // Billing and subscription methods
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string | null): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result;
  }

  async resetUserMonthlyUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailsProcessedThisMonth: 0,
        aiTokensUsedThisMonth: 0,
        aiCostThisMonth: 0,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async createBillingEvent(event: InsertBillingEvent): Promise<BillingEvent> {
    const [result] = await db
      .insert(billingEvents)
      .values(event)
      .returning();
    return result;
  }

  async getBillingEvents(userId: string, limit: number = 50): Promise<BillingEvent[]> {
    return await db
      .select()
      .from(billingEvents)
      .where(eq(billingEvents.userId, userId))
      .orderBy(desc(billingEvents.createdAt))
      .limit(limit);
  }

  async incrementUserEmailUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailsProcessedThisMonth: sql`${users.emailsProcessedThisMonth} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string | null): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin operations
  async adminUpdateUserSubscription(userId: string, plan: string, status: string, adminId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionPlan: plan,
        subscriptionStatus: status,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Log the admin action
    await this.createAuditLog({
      userId: adminId,
      action: 'admin_update_subscription',
      resourceType: 'user',
      resourceId: userId,
      details: { plan, status },
      userAgent: 'admin-panel',
      ipAddress: '127.0.0.1'
    });
    
    return user;
  }

  async adminBlockUser(userId: string, reason: string, adminId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isBlocked: true,
        blockedReason: reason,
        blockedAt: new Date(),
        blockedBy: adminId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Log the admin action
    await this.createAuditLog({
      userId: adminId,
      action: 'admin_block_user',
      resourceType: 'user',
      resourceId: userId,
      details: { reason },
      userAgent: 'admin-panel',
      ipAddress: '127.0.0.1'
    });

    return user;
  }

  async adminUnblockUser(userId: string, adminId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        blockedBy: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Log the admin action
    await this.createAuditLog({
      userId: adminId,
      action: 'admin_unblock_user',
      resourceType: 'user',
      resourceId: userId,
      details: {},
      userAgent: 'admin-panel',
      ipAddress: '127.0.0.1'
    });

    return user;
  }

  async getAllUsers(limit: number = 100, offset: number = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUsersStats(): Promise<{ 
    total: number; 
    active: number; 
    blocked: number; 
    trial: number; 
    free: number; 
    pro: number; 
    enterprise: number 
  }> {
    const allUsers = await db.select().from(users);
    
    const total = allUsers.length;
    const active = allUsers.filter(u => !u.isBlocked && u.subscriptionStatus === 'active').length;
    const blocked = allUsers.filter(u => u.isBlocked).length;
    const trial = allUsers.filter(u => u.subscriptionStatus === 'trial').length;
    const free = allUsers.filter(u => u.subscriptionPlan === 'free').length;
    const pro = allUsers.filter(u => u.subscriptionPlan === 'pro').length;
    const enterprise = allUsers.filter(u => u.subscriptionPlan === 'enterprise').length;

    return { total, active, blocked, trial, free, pro, enterprise };
  }
}

export const storage = new DatabaseStorage();
