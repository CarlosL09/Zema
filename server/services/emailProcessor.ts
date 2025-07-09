import { GmailService } from './gmailService';
import { OutlookService } from './outlookService';
import { AIService } from './aiService';
import { SlackService } from './slackService';
import { storage } from '../storage';

export class EmailProcessor {
  private gmailService: GmailService;
  private outlookService: OutlookService;
  private aiService: AIService;
  private slackService: SlackService;

  constructor() {
    this.gmailService = new GmailService();
    this.outlookService = new OutlookService();
    this.aiService = new AIService();
    this.slackService = new SlackService();
  }

  async processUserEmails(userId: string): Promise<{
    processed: number;
    draftsGenerated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    let draftsGenerated = 0;

    try {
      // Get user's integrations to determine which email services to process
      const integrations = await storage.getIntegrations(userId);
      const hasGmail = integrations.some(i => i.type === 'gmail' && i.isActive);
      const hasOutlook = integrations.some(i => i.type === 'outlook' && i.isActive);

      // Process Gmail emails if integration exists
      if (hasGmail) {
        try {
          const threads = await this.gmailService.getThreads(userId, 25);
          
          for (const thread of threads) {
            try {
              await this.processEmailThread(userId, thread.id!);
              processed++;
            } catch (error) {
              errors.push(`Gmail thread ${thread.id}: ${error}`);
            }
          }
        } catch (error) {
          errors.push(`Gmail processing failed: ${error}`);
        }
      }

      // Process Outlook emails if integration exists
      if (hasOutlook) {
        try {
          const emails = await this.outlookService.getEmails(userId, 25);
          
          for (const email of emails) {
            try {
              await this.processOutlookEmail(userId, email.id);
              processed++;
            } catch (error) {
              errors.push(`Outlook email ${email.id}: ${error}`);
            }
          }
        } catch (error) {
          errors.push(`Outlook processing failed: ${error}`);
        }
      }

      // Track overall processing
      await storage.trackUsage({
        userId,
        eventType: 'email_batch_processed',
        metadata: { 
          threadsProcessed: processed,
          draftsGenerated,
          errors: errors.length,
          hasGmail,
          hasOutlook
        }
      });

      return { processed, draftsGenerated, errors };
    } catch (error) {
      errors.push(`Batch processing failed: ${error}`);
      return { processed, draftsGenerated, errors };
    }
  }

  async processEmailThread(userId: string, threadId: string): Promise<void> {
    // Get full thread details
    const thread = await this.gmailService.getThread(userId, threadId);
    
    if (!thread.messages || thread.messages.length === 0) {
      return;
    }

    const latestMessage = thread.messages[thread.messages.length - 1];
    const headers = latestMessage.payload?.headers || [];
    
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    
    // Extract email body
    const body = this.extractEmailBody(latestMessage);
    
    // Store thread in database
    const storedThread = await storage.createEmailThread({
      userId,
      threadId,
      subject,
      participants: [from, to],
      lastActivity: new Date(),
      isProcessed: false,
      priority: 'normal',
      aiLabels: []
    });

    // AI categorization
    const { labels, priority } = await this.aiService.categorizeEmail(userId, {
      subject,
      body,
      sender: from
    });

    // Update thread with AI insights
    await storage.updateEmailThread(storedThread.id, {
      aiLabels: labels,
      priority,
      isProcessed: true
    });

    // Check if we should generate a draft
    if (this.shouldGenerateDraft(labels, priority)) {
      await this.generateEmailDraft(userId, storedThread.id, {
        originalMessage: body,
        subject,
        sender: from,
        recipient: to,
        threadHistory: thread.messages.slice(0, -1).map(m => this.extractEmailBody(m))
      });
    }

    // Check smart rules
    await this.applySmartRules(userId, {
      subject,
      sender: from,
      body,
      labels,
      priority
    });

    // Send Slack notification if configured
    if (priority === 'high' || priority === 'urgent') {
      try {
        await this.slackService.sendEmailAlert(userId, {
          subject,
          sender: from,
          priority,
          labels
        });
      } catch (error) {
        console.log('Slack notification failed:', error);
      }
    }
  }

  async processOutlookEmail(userId: string, messageId: string): Promise<void> {
    // Get full message details
    const emailThread = await this.outlookService.getEmailThread(userId, messageId);
    
    if (!emailThread.message) {
      return;
    }

    const message = emailThread.message;
    const subject = message.subject || '';
    const from = message.from?.emailAddress?.address || '';
    const to = message.toRecipients?.[0]?.emailAddress?.address || '';
    
    // Extract email body
    const body = message.body?.content || message.bodyPreview || '';
    
    // Store thread in database
    const storedThread = await storage.createEmailThread({
      userId,
      threadId: messageId,
      subject,
      participants: [from, to],
      lastActivity: new Date(message.receivedDateTime),
      isProcessed: false,
      priority: 'normal',
      aiLabels: []
    });

    // Use AI to categorize and analyze the email
    const { labels, priority } = await this.aiService.categorizeEmail(userId, {
      subject,
      body,
      sender: from
    });

    // Calculate priority score with enhanced AI
    const priorityScore = await this.aiService.calculatePriorityScore(userId, {
      subject,
      sender: from,
      body,
      hasAttachments: latestMessage.payload?.parts?.some(p => p.filename) || false,
      isReply: subject.toLowerCase().includes('re:')
    });

    // Detect scheduling requests
    const schedulingInfo = await this.aiService.detectSchedulingRequest(userId, {
      subject,
      body,
      sender: from
    });

    // Detect follow-up needs
    const followUpInfo = await this.aiService.detectFollowUpNeeded(userId, {
      subject,
      body,
      sender: from,
      timestamp: new Date().toISOString()
    });

    // Update thread with AI labels, priority, and enhanced metadata
    await storage.updateEmailThread(storedThread.id, {
      priority: priorityScore.priority,
      aiLabels: [...labels, ...(schedulingInfo.isSchedulingRequest ? ['scheduling'] : [])],
      isProcessed: true
    });

    // Schedule follow-up if needed
    if (followUpInfo.needsFollowUp) {
      const reminderTime = new Date(Date.now() + followUpInfo.suggestedDelay * 60 * 60 * 1000);
      
      await storage.createFollowUpReminder({
        userId,
        threadId: storedThread.id.toString(),
        emailId: latestMessage.id || threadId,
        reminderTime,
        followUpType: followUpInfo.followUpType,
        reason: followUpInfo.reason
      });
    }

    // Generate draft if needed
    if (this.shouldGenerateDraft(labels, priority)) {
      await this.generateEmailDraft(userId, storedThread.id, {
        originalMessage: body,
        subject,
        sender: from,
        recipient: to,
        threadHistory: emailThread.thread.slice(0, -1).map(m => m.bodyPreview || '')
      });
    }

    // Check smart rules
    await this.applySmartRules(userId, {
      subject,
      sender: from,
      body,
      labels,
      priority
    });

    // Send Slack notification if configured
    if (priority === 'high' || priority === 'urgent') {
      try {
        await this.slackService.sendEmailAlert(userId, {
          subject,
          sender: from,
          priority,
          labels
        });
      } catch (error) {
        console.log('Slack notification failed:', error);
      }
    }
  }

  private extractEmailBody(message: any): string {
    if (!message.payload) return '';

    // Try to get plain text first
    if (message.payload.body?.data) {
      return Buffer.from(message.payload.body.data, 'base64').toString();
    }

    // Check parts for text content
    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
      
      // Fallback to HTML
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return '';
  }

  private shouldGenerateDraft(labels: string[], priority: string): boolean {
    // Generate drafts for emails that likely need responses
    const responseLabels = ['client', 'support', 'partnership', 'response_needed', 'action_required'];
    return labels.some(label => responseLabels.includes(label)) || 
           priority === 'high' || priority === 'urgent';
  }

  async generateEmailDraft(
    userId: string,
    threadId: number,
    emailContext: {
      originalMessage: string;
      subject: string;
      sender: string;
      recipient: string;
      threadHistory?: string[];
    }
  ): Promise<void> {
    const { content, confidence } = await this.aiService.generateEmailDraft(userId, emailContext);

    await storage.createEmailDraft({
      userId,
      threadId,
      originalEmailId: emailContext.sender,
      draftContent: content,
      confidence: confidence.toString(),
      context: emailContext,
      status: 'pending'
    });
  }

  async applySmartRules(
    userId: string,
    emailData: {
      subject: string;
      sender: string;
      body: string;
      labels: string[];
      priority: string;
    }
  ): Promise<void> {
    const rules = await storage.getSmartRules(userId);
    
    for (const rule of rules) {
      if (!rule.isActive) continue;

      const conditions = rule.conditions as any;
      let matches = true;

      // Check conditions
      if (conditions.sender_contains && !emailData.sender.toLowerCase().includes(conditions.sender_contains.toLowerCase())) {
        matches = false;
      }
      if (conditions.subject_contains && !emailData.subject.toLowerCase().includes(conditions.subject_contains.toLowerCase())) {
        matches = false;
      }
      if (conditions.has_label && !emailData.labels.includes(conditions.has_label)) {
        matches = false;
      }
      if (conditions.priority && emailData.priority !== conditions.priority) {
        matches = false;
      }

      if (matches) {
        await this.executeRuleActions(userId, rule.actions as any, emailData);
      }
    }
  }

  private async executeRuleActions(
    userId: string,
    actions: any,
    emailData: {
      subject: string;
      sender: string;
      body: string;
      labels: string[];
      priority: string;
    }
  ): Promise<void> {
    // Execute various rule actions
    if (actions.slack_notify && actions.slack_channel) {
      try {
        await this.slackService.sendNotification(
          userId,
          actions.slack_channel,
          `Rule triggered: ${emailData.subject} from ${emailData.sender}`
        );
      } catch (error) {
        console.log('Rule Slack notification failed:', error);
      }
    }

    if (actions.auto_reply && actions.reply_template) {
      // Could implement auto-reply functionality here
      console.log('Auto-reply would be sent:', actions.reply_template);
    }

    // Track rule execution
    await storage.trackUsage({
      userId,
      eventType: 'smart_rule_executed',
      metadata: { actions, emailSubject: emailData.subject }
    });
  }

  async startRealTimeProcessing(userId: string): Promise<void> {
    // In a real implementation, this would set up Gmail push notifications
    // For now, we'll use polling
    const processEmails = async () => {
      try {
        await this.processUserEmails(userId);
      } catch (error) {
        console.error('Real-time processing error:', error);
      }
    };

    // Process emails every 5 minutes
    setInterval(processEmails, 5 * 60 * 1000);
    
    // Process immediately
    await processEmails();
  }
}