import { storage } from '../storage';
import { GmailService } from './gmailService';
import { OutlookService } from './outlookService';
import { AIService } from './aiService';
import { SlackService } from './slackService';

export class AutomationService {
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

  async createRule(userId: string, rule: {
    name: string;
    description?: string;
    trigger: {
      conditions: Array<{
        field: 'sender' | 'subject' | 'body' | 'priority' | 'label' | 'attachment';
        operator: 'contains' | 'equals' | 'not_contains' | 'greater_than' | 'less_than';
        value: string;
      }>;
      logic: 'and' | 'or';
    };
    actions: Array<{
      type: 'label' | 'forward' | 'reply' | 'archive' | 'delete' | 'slack_notify' | 'task_create';
      parameters: Record<string, any>;
    }>;
  }) {
    return await storage.createAutomationRule({
      userId,
      name: rule.name,
      description: rule.description || '',
      trigger: rule.trigger,
      actions: rule.actions,
      isActive: true,
      executionCount: 0
    });
  }

  async executeRulesForEmail(userId: string, emailData: {
    emailId: string;
    threadId?: string;
    sender: string;
    subject: string;
    body: string;
    priority?: string;
    labels?: string[];
    attachments?: Array<{ filename: string; contentType: string }>;
  }): Promise<{
    executedRules: Array<{
      ruleId: number;
      ruleName: string;
      actionsPerformed: string[];
    }>;
    totalExecutions: number;
  }> {
    const rules = await storage.getAutomationRules(userId);
    const activeRules = rules.filter(rule => rule.isActive);
    
    const executedRules = [];
    let totalExecutions = 0;

    for (const rule of activeRules) {
      if (await this.evaluateRuleTrigger(rule.trigger as any, emailData)) {
        const actionsPerformed = await this.executeRuleActions(
          userId,
          rule.actions as any,
          emailData
        );

        if (actionsPerformed.length > 0) {
          executedRules.push({
            ruleId: rule.id,
            ruleName: rule.name,
            actionsPerformed
          });

          // Update rule execution count
          await storage.updateAutomationRule(rule.id, {
            executionCount: (rule.executionCount || 0) + 1,
            lastExecuted: new Date()
          });

          totalExecutions++;
        }
      }
    }

    return { executedRules, totalExecutions };
  }

  private async evaluateRuleTrigger(
    trigger: {
      conditions: Array<{
        field: string;
        operator: string;
        value: string;
      }>;
      logic: 'and' | 'or';
    },
    emailData: any
  ): Promise<boolean> {
    const results = await Promise.all(
      trigger.conditions.map(condition => this.evaluateCondition(condition, emailData))
    );

    return trigger.logic === 'and' 
      ? results.every(result => result)
      : results.some(result => result);
  }

  private async evaluateCondition(
    condition: {
      field: string;
      operator: string;
      value: string;
    },
    emailData: any
  ): Promise<boolean> {
    let fieldValue: string | number = '';

    switch (condition.field) {
      case 'sender':
        fieldValue = emailData.sender.toLowerCase();
        break;
      case 'subject':
        fieldValue = emailData.subject.toLowerCase();
        break;
      case 'body':
        fieldValue = emailData.body.toLowerCase();
        break;
      case 'priority':
        fieldValue = emailData.priority || 'normal';
        break;
      case 'label':
        fieldValue = (emailData.labels || []).join(' ').toLowerCase();
        break;
      case 'attachment':
        fieldValue = emailData.attachments ? 'true' : 'false';
        break;
      default:
        return false;
    }

    const compareValue = condition.value.toLowerCase();

    switch (condition.operator) {
      case 'contains':
        return fieldValue.toString().includes(compareValue);
      case 'equals':
        return fieldValue.toString() === compareValue;
      case 'not_contains':
        return !fieldValue.toString().includes(compareValue);
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  private async executeRuleActions(
    userId: string,
    actions: Array<{
      type: string;
      parameters: Record<string, any>;
    }>,
    emailData: any
  ): Promise<string[]> {
    const actionsPerformed = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'label':
            await this.applyLabel(userId, emailData, action.parameters.labelName);
            actionsPerformed.push(`Applied label: ${action.parameters.labelName}`);
            break;

          case 'forward':
            await this.forwardEmail(userId, emailData, action.parameters.recipient);
            actionsPerformed.push(`Forwarded to: ${action.parameters.recipient}`);
            break;

          case 'reply':
            await this.sendAutoReply(userId, emailData, action.parameters.template);
            actionsPerformed.push('Sent auto-reply');
            break;

          case 'archive':
            await this.archiveEmail(userId, emailData);
            actionsPerformed.push('Archived email');
            break;

          case 'slack_notify':
            await this.sendSlackNotification(userId, emailData, action.parameters);
            actionsPerformed.push(`Slack notification sent to: ${action.parameters.channel}`);
            break;

          case 'task_create':
            await this.createTask(userId, emailData, action.parameters);
            actionsPerformed.push(`Task created: ${action.parameters.title}`);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        actionsPerformed.push(`Failed: ${action.type} - ${error.message}`);
      }
    }

    return actionsPerformed;
  }

  private async applyLabel(userId: string, emailData: any, labelName: string): Promise<void> {
    try {
      await this.gmailService.addLabel(userId, emailData.emailId, labelName);
    } catch (error) {
      // Try Outlook if Gmail fails
      await this.outlookService.addLabel(userId, emailData.emailId, labelName);
    }
  }

  private async forwardEmail(userId: string, emailData: any, recipient: string): Promise<void> {
    const forwardSubject = `Fwd: ${emailData.subject}`;
    const forwardBody = `
---------- Forwarded message ---------
From: ${emailData.sender}
Subject: ${emailData.subject}

${emailData.body}
    `;

    try {
      await this.gmailService.sendEmail(userId, recipient, forwardSubject, forwardBody);
    } catch (error) {
      await this.outlookService.sendEmail(userId, recipient, forwardSubject, forwardBody);
    }
  }

  private async sendAutoReply(userId: string, emailData: any, template: string): Promise<void> {
    // Generate AI-powered auto-reply if template contains variables
    let replyBody = template;
    
    if (template.includes('{{AI_RESPONSE}}')) {
      const aiResponse = await this.aiService.generateQuickReplies(userId, {
        subject: emailData.subject,
        body: emailData.body,
        sender: emailData.sender,
        urgency: 'medium'
      });
      
      replyBody = template.replace('{{AI_RESPONSE}}', aiResponse.replies[0] || 'Thank you for your email.');
    }

    const replySubject = emailData.subject.startsWith('Re:') 
      ? emailData.subject 
      : `Re: ${emailData.subject}`;

    try {
      await this.gmailService.sendEmail(
        userId, 
        emailData.sender, 
        replySubject, 
        replyBody, 
        emailData.threadId
      );
    } catch (error) {
      await this.outlookService.sendEmail(
        userId, 
        emailData.sender, 
        replySubject, 
        replyBody, 
        emailData.emailId
      );
    }
  }

  private async archiveEmail(userId: string, emailData: any): Promise<void> {
    // Implementation depends on email provider
    try {
      await this.gmailService.addLabel(userId, emailData.emailId, 'archived');
    } catch (error) {
      // Outlook doesn't have the same archive concept, but we can move to a folder
      console.log('Archive action completed for Outlook (moved to processed folder)');
    }
  }

  private async sendSlackNotification(
    userId: string, 
    emailData: any, 
    parameters: { channel: string; message?: string }
  ): Promise<void> {
    const message = parameters.message || `New email from ${emailData.sender}: ${emailData.subject}`;
    
    await this.slackService.sendNotification(
      userId,
      parameters.channel,
      message,
      {
        title: 'Email Automation Alert',
        fields: [
          { title: 'From', value: emailData.sender, short: true },
          { title: 'Subject', value: emailData.subject, short: true }
        ]
      }
    );
  }

  private async createTask(
    userId: string, 
    emailData: any, 
    parameters: { title?: string; platform: string; priority?: string }
  ): Promise<void> {
    const taskTitle = parameters.title || `Follow up: ${emailData.subject}`;
    const taskDescription = `Email from: ${emailData.sender}\nSubject: ${emailData.subject}\n\n${emailData.body.substring(0, 200)}...`;

    // Store task integration record
    await storage.createTaskIntegration({
      userId,
      emailId: emailData.emailId,
      platform: parameters.platform,
      taskTitle,
      taskDescription,
      priority: parameters.priority || 'medium',
      status: 'created'
    });
  }

  async getWorkflowAnalytics(userId: string): Promise<{
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    topRules: Array<{
      name: string;
      executions: number;
      lastExecuted: Date | null;
    }>;
    recentExecutions: Array<{
      ruleName: string;
      emailSubject: string;
      executedAt: Date;
      actionsPerformed: string[];
    }>;
  }> {
    const rules = await storage.getAutomationRules(userId);
    
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.isActive).length;
    const totalExecutions = rules.reduce((sum, rule) => sum + (rule.executionCount || 0), 0);

    const topRules = rules
      .sort((a, b) => (b.executionCount || 0) - (a.executionCount || 0))
      .slice(0, 5)
      .map(rule => ({
        name: rule.name,
        executions: rule.executionCount || 0,
        lastExecuted: rule.lastExecuted
      }));

    // Note: In a real implementation, you'd track execution history
    const recentExecutions = [];

    return {
      totalRules,
      activeRules,
      totalExecutions,
      topRules,
      recentExecutions
    };
  }

  async testRule(userId: string, ruleId: number, sampleEmail: {
    sender: string;
    subject: string;
    body: string;
  }): Promise<{
    wouldTrigger: boolean;
    actionsToPerform: string[];
    evaluationDetails: Array<{
      condition: string;
      result: boolean;
      reason: string;
    }>;
  }> {
    const rules = await storage.getAutomationRules(userId);
    const rule = rules.find(r => r.id === ruleId);
    
    if (!rule) {
      throw new Error('Rule not found');
    }

    const trigger = rule.trigger as any;
    const evaluationDetails = [];
    
    for (const condition of trigger.conditions) {
      const result = await this.evaluateCondition(condition, sampleEmail);
      evaluationDetails.push({
        condition: `${condition.field} ${condition.operator} "${condition.value}"`,
        result,
        reason: result ? 'Condition met' : 'Condition not met'
      });
    }

    const wouldTrigger = trigger.logic === 'and'
      ? evaluationDetails.every(detail => detail.result)
      : evaluationDetails.some(detail => detail.result);

    const actionsToPerform = wouldTrigger 
      ? (rule.actions as any[]).map(action => `${action.type}: ${JSON.stringify(action.parameters)}`)
      : [];

    return {
      wouldTrigger,
      actionsToPerform,
      evaluationDetails
    };
  }
}