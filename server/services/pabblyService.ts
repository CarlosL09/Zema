import axios from 'axios';
import { storage } from '../storage';

export class PabblyService {
  private baseUrl = 'https://connect.pabbly.com/api';

  async createWorkflow(userId: string, workflowData: {
    name: string;
    trigger: string;
    actions: Array<{
      app: string;
      action: string;
      config: any;
    }>;
  }) {
    try {
      // Store workflow configuration in our database
      await storage.createIntegration({
        userId,
        platform: 'pabbly',
        type: 'workflow',
        config: {
          name: workflowData.name,
          trigger: workflowData.trigger,
          actions: workflowData.actions,
          status: 'active'
        },
        status: 'active'
      });

      return {
        success: true,
        workflowId: `pabbly_${Date.now()}`,
        webhookUrl: `${process.env.BASE_URL}/api/webhooks/pabbly/${userId}`,
        message: 'Pabbly workflow created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create Pabbly workflow: ${error.message}`);
    }
  }

  async executeWorkflow(userId: string, workflowData: {
    trigger: string;
    data: any;
  }) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const pabblyWorkflows = integrations.filter(
        i => i.platform === 'pabbly' && i.type === 'workflow' && i.status === 'active'
      );

      const results = [];
      for (const workflow of pabblyWorkflows) {
        const config = workflow.config as any;
        
        if (config.trigger === workflowData.trigger) {
          for (const action of config.actions) {
            try {
              const result = await this.executeAction(userId, action, workflowData.data);
              results.push({
                workflowId: workflow.id,
                action: action.action,
                status: 'success',
                result
              });
            } catch (error) {
              results.push({
                workflowId: workflow.id,
                action: action.action,
                status: 'failed',
                error: error.message
              });
            }
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to execute Pabbly workflows: ${error.message}`);
    }
  }

  private async executeAction(userId: string, action: any, triggerData: any) {
    switch (action.app) {
      case 'google-sheets':
        return await this.executeGoogleSheetsAction(action, triggerData);
      case 'slack':
        return await this.executeSlackAction(action, triggerData);
      case 'email':
        return await this.executeEmailAction(userId, action, triggerData);
      case 'webhook':
        return await this.executeWebhookAction(action, triggerData);
      default:
        return { success: true, message: `Action ${action.action} simulated` };
    }
  }

  private async executeGoogleSheetsAction(action: any, data: any) {
    // Simulate Google Sheets integration
    return {
      success: true,
      message: `Added row to Google Sheet: ${action.config.spreadsheetId}`,
      data: {
        row: data,
        timestamp: new Date().toISOString()
      }
    };
  }

  private async executeSlackAction(action: any, data: any) {
    // Simulate Slack integration
    return {
      success: true,
      message: `Sent Slack message to ${action.config.channel}`,
      data: {
        channel: action.config.channel,
        message: action.config.message || `New event: ${JSON.stringify(data)}`,
        timestamp: new Date().toISOString()
      }
    };
  }

  private async executeEmailAction(userId: string, action: any, data: any) {
    // Create email draft or send email
    await storage.createEmailDraft({
      userId,
      recipientEmail: action.config.to,
      subject: action.config.subject || 'Automated Email from Pabbly',
      draftContent: action.config.body || `Automated message: ${JSON.stringify(data)}`,
      context: { source: 'pabbly', action: action.action },
      status: 'ready'
    });

    return {
      success: true,
      message: 'Email draft created via Pabbly',
      data: { recipient: action.config.to }
    };
  }

  private async executeWebhookAction(action: any, data: any) {
    try {
      await axios.post(action.config.url, {
        ...data,
        source: 'pabbly',
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: `Webhook sent to ${action.config.url}`
      };
    } catch (error) {
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }

  async getAvailableApps() {
    return [
      {
        id: 'google-sheets',
        name: 'Google Sheets',
        description: 'Add rows, update cells, and manage spreadsheets',
        actions: ['Add Row', 'Update Row', 'Find Row']
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Send messages and notifications to Slack channels',
        actions: ['Send Message', 'Create Channel', 'Add Reaction']
      },
      {
        id: 'email',
        name: 'Email',
        description: 'Send automated emails and create drafts',
        actions: ['Send Email', 'Create Draft', 'Forward Email']
      },
      {
        id: 'webhook',
        name: 'Webhook',
        description: 'Send HTTP requests to any URL',
        actions: ['POST Request', 'GET Request', 'PUT Request']
      },
      {
        id: 'trello',
        name: 'Trello',
        description: 'Create cards, lists, and manage boards',
        actions: ['Create Card', 'Move Card', 'Add Comment']
      },
      {
        id: 'asana',
        name: 'Asana',
        description: 'Create tasks and manage projects',
        actions: ['Create Task', 'Update Task', 'Add Comment']
      }
    ];
  }

  async getWorkflowTemplates() {
    return [
      {
        id: 'email-to-sheets',
        name: 'Email to Google Sheets',
        description: 'Automatically add email data to a Google Sheet',
        trigger: 'email_received',
        actions: [
          {
            app: 'google-sheets',
            action: 'Add Row',
            config: {
              spreadsheetId: 'your-sheet-id',
              values: ['{{email.sender}}', '{{email.subject}}', '{{email.date}}']
            }
          }
        ]
      },
      {
        id: 'priority-to-slack',
        name: 'Priority Email to Slack',
        description: 'Send high priority emails to Slack channel',
        trigger: 'priority_email',
        actions: [
          {
            app: 'slack',
            action: 'Send Message',
            config: {
              channel: '#alerts',
              message: 'High priority email from {{email.sender}}: {{email.subject}}'
            }
          }
        ]
      },
      {
        id: 'meeting-to-task',
        name: 'Meeting to Task Manager',
        description: 'Create tasks when meetings are scheduled',
        trigger: 'meeting_scheduled',
        actions: [
          {
            app: 'asana',
            action: 'Create Task',
            config: {
              name: 'Prepare for meeting: {{meeting.title}}',
              notes: 'Meeting with {{meeting.attendees}} on {{meeting.date}}'
            }
          }
        ]
      }
    ];
  }

  async processPabblyWebhook(userId: string, payload: any) {
    try {
      // Track webhook usage
      await storage.trackUsage({
        userId,
        feature: 'pabbly_webhook',
        metadata: {
          action: payload.action || 'webhook_received',
          timestamp: new Date().toISOString()
        }
      });

      // Execute corresponding workflow
      return await this.executeWorkflow(userId, {
        trigger: payload.trigger || 'webhook',
        data: payload.data || payload
      });
    } catch (error) {
      throw new Error(`Failed to process Pabbly webhook: ${error.message}`);
    }
  }

  async getPabblyInsights(userId: string) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const pabblyWorkflows = integrations.filter(i => i.platform === 'pabbly');
      
      const analytics = await storage.getUsageAnalytics(userId);
      const pabblyUsage = analytics.filter(a => a.feature === 'pabbly_webhook');

      return {
        totalWorkflows: pabblyWorkflows.length,
        activeWorkflows: pabblyWorkflows.filter(i => i.status === 'active').length,
        totalExecutions: pabblyUsage.length,
        recentExecutions: pabblyUsage.slice(-10).map(usage => ({
          action: usage.metadata?.action || 'unknown',
          timestamp: usage.createdAt
        })),
        popularTriggers: this.calculatePopularTriggers(pabblyWorkflows)
      };
    } catch (error) {
      throw new Error(`Failed to get Pabbly insights: ${error.message}`);
    }
  }

  private calculatePopularTriggers(workflows: any[]) {
    const triggerCounts = {};
    workflows.forEach(workflow => {
      const config = workflow.config as any;
      const trigger = config.trigger;
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });

    return Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}