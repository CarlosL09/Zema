import { storage } from "../storage";
import { Webhook, InsertWebhook } from "@shared/schema";

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  userId: string;
  webhookId: number;
}

export interface WebhookEvent {
  type: 'email.received' | 'email.sent' | 'email.automated' | 'template.used' | 'rule.triggered' | 'integration.connected' | 'trial.started' | 'subscription.created' | 'user.created';
  userId: string;
  data: any;
}

export class WebhookService {
  private static instance: WebhookService;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  // Create a new webhook
  async createWebhook(userId: string, webhookData: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
    secret?: string;
    platform: 'notion' | 'zapier' | 'pabbly' | 'custom' | 'slack' | 'discord' | 'teams';
    isActive?: boolean;
  }): Promise<Webhook> {
    const webhook: InsertWebhook = {
      userId,
      name: webhookData.name,
      url: webhookData.url,
      events: webhookData.events,
      headers: webhookData.headers || {},
      secret: webhookData.secret,
      platform: webhookData.platform,
      isActive: webhookData.isActive ?? true,
      lastTriggered: null,
      successCount: 0,
      failureCount: 0
    };

    return await storage.createWebhook(webhook);
  }

  // Get all webhooks for a user
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    return await storage.getUserWebhooks(userId);
  }

  // Update webhook
  async updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook> {
    return await storage.updateWebhook(id, updates);
  }

  // Delete webhook
  async deleteWebhook(id: number): Promise<void> {
    return await storage.deleteWebhook(id);
  }

  // Test webhook with a ping event
  async testWebhook(webhookId: number): Promise<{ success: boolean; response?: any; error?: string }> {
    const webhook = await storage.getWebhook(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const payload: WebhookPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from ZEMA' },
      userId: webhook.userId,
      webhookId: webhook.id
    };

    return await this.sendWebhook(webhook, payload);
  }

  // Trigger webhooks for an event
  async triggerWebhooks(event: WebhookEvent): Promise<void> {
    const webhooks = await storage.getUserWebhooks(event.userId);
    const activeWebhooks = webhooks.filter(w => w.isActive && w.events.includes(event.type));

    const payload: WebhookPayload = {
      event: event.type,
      timestamp: new Date().toISOString(),
      data: event.data,
      userId: event.userId,
      webhookId: 0 // Will be set for each webhook
    };

    // Send webhooks in parallel
    const promises = activeWebhooks.map(webhook => {
      const webhookPayload = { ...payload, webhookId: webhook.id };
      return this.sendWebhook(webhook, webhookPayload);
    });

    await Promise.allSettled(promises);
  }

  // Send individual webhook with retry logic
  private async sendWebhook(webhook: Webhook, payload: WebhookPayload): Promise<{ success: boolean; response?: any; error?: string }> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'ZEMA-Webhook/1.0',
          ...webhook.headers
        };

        // Add signature if secret is provided
        if (webhook.secret) {
          const signature = await this.generateSignature(JSON.stringify(payload), webhook.secret);
          headers['X-ZEMA-Signature'] = signature;
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          // Update success count and last triggered
          await storage.updateWebhook(webhook.id, {
            successCount: webhook.successCount + 1,
            lastTriggered: new Date()
          });

          const responseData = await response.text();
          return { success: true, response: responseData };
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    // Update failure count
    await storage.updateWebhook(webhook.id, {
      failureCount: webhook.failureCount + 1
    });

    return { success: false, error: lastError };
  }

  // Generate HMAC signature for webhook security
  private async generateSignature(payload: string, secret: string): Promise<string> {
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  // Platform-specific webhook templates
  getWebhookTemplate(platform: string): { name: string; events: string[]; headers?: Record<string, string> } {
    const templates: Record<string, any> = {
      notion: {
        name: 'Notion Integration',
        events: ['email.received', 'email.automated', 'template.used'],
        headers: {
          'Notion-Version': '2022-06-28'
        }
      },
      zapier: {
        name: 'Zapier Integration',
        events: ['email.received', 'email.sent', 'email.automated', 'template.used', 'rule.triggered'],
        headers: {}
      },
      pabbly: {
        name: 'Pabbly Connect Integration',
        events: ['email.received', 'email.sent', 'email.automated', 'template.used', 'rule.triggered'],
        headers: {}
      },
      slack: {
        name: 'Slack Integration',
        events: ['email.received', 'rule.triggered', 'integration.connected'],
        headers: {}
      },
      discord: {
        name: 'Discord Integration',
        events: ['email.received', 'rule.triggered', 'integration.connected'],
        headers: {}
      },
      teams: {
        name: 'Microsoft Teams Integration',
        events: ['email.received', 'rule.triggered', 'integration.connected'],
        headers: {}
      },
      custom: {
        name: 'Custom Webhook',
        events: ['email.received', 'email.sent', 'email.automated'],
        headers: {}
      }
    };

    return templates[platform] || templates.custom;
  }

  // Get webhook statistics
  async getWebhookStats(userId: string): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    totalEvents: number;
    successRate: number;
    recentEvents: Array<{ webhookName: string; event: string; status: string; timestamp: Date }>;
  }> {
    const webhooks = await storage.getUserWebhooks(userId);
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter(w => w.isActive).length;
    
    const totalSuccesses = webhooks.reduce((sum, w) => sum + w.successCount, 0);
    const totalFailures = webhooks.reduce((sum, w) => sum + w.failureCount, 0);
    const totalEvents = totalSuccesses + totalFailures;
    const successRate = totalEvents > 0 ? (totalSuccesses / totalEvents) * 100 : 0;

    // Get recent webhook events (this would come from webhook logs in a real implementation)
    const recentEvents = webhooks
      .filter(w => w.lastTriggered)
      .sort((a, b) => new Date(b.lastTriggered!).getTime() - new Date(a.lastTriggered!).getTime())
      .slice(0, 10)
      .map(w => ({
        webhookName: w.name,
        event: w.events[0] || 'unknown',
        status: 'success',
        timestamp: w.lastTriggered!
      }));

    return {
      totalWebhooks,
      activeWebhooks,
      totalEvents,
      successRate,
      recentEvents
    };
  }
}

export const webhookService = WebhookService.getInstance();