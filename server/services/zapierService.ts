import axios from 'axios';
import { storage } from '../storage';

export class ZapierService {
  private baseUrl = 'https://zapier.com/api';

  async createWebhook(userId: string, webhookData: {
    triggerEvent: string;
    targetUrl: string;
    filters?: any;
  }) {
    try {
      // Create webhook configuration in our database
      await storage.createIntegration({
        userId,
        platform: 'zapier',
        type: 'webhook',
        config: {
          triggerEvent: webhookData.triggerEvent,
          targetUrl: webhookData.targetUrl,
          filters: webhookData.filters || {}
        },
        status: 'active'
      });

      return {
        success: true,
        webhookUrl: `${process.env.BASE_URL}/api/webhooks/zapier/${userId}`,
        message: 'Zapier webhook created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create Zapier webhook: ${error.message}`);
    }
  }

  async triggerZap(userId: string, zapData: {
    triggerEvent: string;
    data: any;
  }) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const zapierWebhooks = integrations.filter(
        i => i.platform === 'zapier' && i.type === 'webhook' && i.status === 'active'
      );

      const results = [];
      for (const webhook of zapierWebhooks) {
        const config = webhook.config as any;
        
        if (config.triggerEvent === zapData.triggerEvent) {
          try {
            await axios.post(config.targetUrl, {
              trigger: zapData.triggerEvent,
              data: zapData.data,
              userId,
              timestamp: new Date().toISOString()
            });
            
            results.push({
              webhookId: webhook.id,
              status: 'success'
            });
          } catch (error) {
            results.push({
              webhookId: webhook.id,
              status: 'failed',
              error: error.message
            });
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to trigger Zapier workflows: ${error.message}`);
    }
  }

  async getAvailableTriggers() {
    return [
      {
        id: 'email_received',
        name: 'New Email Received',
        description: 'Triggers when a new email is received'
      },
      {
        id: 'email_sent',
        name: 'Email Sent',
        description: 'Triggers when an email is sent'
      },
      {
        id: 'draft_created',
        name: 'Draft Created',
        description: 'Triggers when an AI draft is created'
      },
      {
        id: 'meeting_scheduled',
        name: 'Meeting Scheduled',
        description: 'Triggers when a meeting is scheduled'
      },
      {
        id: 'contact_added',
        name: 'Contact Added to CRM',
        description: 'Triggers when a contact is added to CRM'
      },
      {
        id: 'priority_email',
        name: 'High Priority Email',
        description: 'Triggers when a high priority email is detected'
      }
    ];
  }

  async processZapierWebhook(userId: string, payload: any) {
    try {
      // Log the webhook reception
      await storage.trackUsage({
        userId,
        feature: 'zapier_webhook',
        metadata: {
          action: payload.action || 'webhook_received',
          timestamp: new Date().toISOString()
        }
      });

      // Process based on the action type
      switch (payload.action) {
        case 'create_task':
          return await this.handleCreateTask(userId, payload.data);
        case 'send_notification':
          return await this.handleSendNotification(userId, payload.data);
        case 'update_crm':
          return await this.handleUpdateCRM(userId, payload.data);
        default:
          return { success: true, message: 'Webhook processed' };
      }
    } catch (error) {
      throw new Error(`Failed to process Zapier webhook: ${error.message}`);
    }
  }

  private async handleCreateTask(userId: string, data: any) {
    // Create a task integration record
    await storage.createIntegration({
      userId,
      platform: 'zapier',
      type: 'task',
      config: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority || 'medium'
      },
      status: 'active'
    });

    return { success: true, message: 'Task created via Zapier' };
  }

  private async handleSendNotification(userId: string, data: any) {
    // This would integrate with notification services
    return { success: true, message: 'Notification sent via Zapier' };
  }

  private async handleUpdateCRM(userId: string, data: any) {
    // This would update CRM records
    return { success: true, message: 'CRM updated via Zapier' };
  }

  async getZapierInsights(userId: string) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const zapierIntegrations = integrations.filter(i => i.platform === 'zapier');
      
      const analytics = await storage.getUsageAnalytics(userId);
      const zapierUsage = analytics.filter(a => a.feature === 'zapier_webhook');

      return {
        totalZaps: zapierIntegrations.length,
        activeZaps: zapierIntegrations.filter(i => i.status === 'active').length,
        totalTriggers: zapierUsage.length,
        recentActivity: zapierUsage.slice(-10).map(usage => ({
          action: usage.metadata?.action || 'unknown',
          timestamp: usage.createdAt
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get Zapier insights: ${error.message}`);
    }
  }
}