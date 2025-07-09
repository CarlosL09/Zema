import { WebClient } from "@slack/web-api";
import { storage } from "../storage";

export class SlackService {
  async sendNotification(
    userId: string,
    channelId: string,
    message: string,
    metadata?: any
  ): Promise<string | undefined> {
    try {
      // Get user's Slack integration
      const integrations = await storage.getIntegrations(userId);
      const slackIntegration = integrations.find(i => i.type === 'slack' && i.isActive);

      if (!slackIntegration?.accessToken) {
        throw new Error('Slack integration not found or inactive');
      }

      const slack = new WebClient(slackIntegration.accessToken);

      const response = await slack.chat.postMessage({
        channel: channelId,
        text: message,
        blocks: metadata?.blocks || undefined,
        attachments: metadata?.attachments || undefined
      });

      // Track usage
      await storage.trackUsage({
        userId,
        eventType: 'slack_notification_sent',
        metadata: { channel: channelId, messageId: response.ts }
      });

      return response.ts;
    } catch (error) {
      console.error('Slack notification failed:', error);
      throw error;
    }
  }

  async sendEmailAlert(
    userId: string,
    emailSummary: {
      subject: string;
      sender: string;
      priority: string;
      labels: string[];
    }
  ): Promise<void> {
    const integrations = await storage.getIntegrations(userId);
    const slackIntegration = integrations.find(i => i.type === 'slack' && i.isActive);

    if (!slackIntegration) return;

    const settings = slackIntegration.settings as any;
    const alertChannel = settings?.alertChannel || settings?.defaultChannel;

    if (!alertChannel) return;

    const priorityEmoji = {
      low: '🔵',
      normal: '🟡',
      high: '🟠',
      urgent: '🔴'
    }[emailSummary.priority] || '⚪';

    const message = `${priorityEmoji} *New Email Alert*\n\n` +
      `*From:* ${emailSummary.sender}\n` +
      `*Subject:* ${emailSummary.subject}\n` +
      `*Priority:* ${emailSummary.priority}\n` +
      `*Labels:* ${emailSummary.labels.join(', ')}`;

    await this.sendNotification(userId, alertChannel, message);
  }

  async createSlackIntegration(
    userId: string,
    accessToken: string,
    settings: {
      defaultChannel?: string;
      alertChannel?: string;
      notificationTypes?: string[];
    }
  ): Promise<void> {
    await storage.createIntegration({
      userId,
      type: 'slack',
      accessToken,
      settings,
      isActive: true
    });
  }

  async updateSlackSettings(
    userId: string,
    settings: any
  ): Promise<void> {
    const integrations = await storage.getIntegrations(userId);
    const slackIntegration = integrations.find(i => i.type === 'slack');

    if (slackIntegration) {
      const currentSettings = slackIntegration.settings || {};
      await storage.updateIntegration(slackIntegration.id, {
        settings: Object.assign({}, currentSettings, settings)
      });
    }
  }

  async getSlackChannels(userId: string): Promise<any[]> {
    const integrations = await storage.getIntegrations(userId);
    const slackIntegration = integrations.find(i => i.type === 'slack' && i.isActive);

    if (!slackIntegration?.accessToken) {
      return [];
    }

    try {
      const slack = new WebClient(slackIntegration.accessToken);
      const response = await slack.conversations.list({
        types: 'public_channel,private_channel'
      });

      return response.channels || [];
    } catch (error) {
      console.error('Failed to fetch Slack channels:', error);
      return [];
    }
  }
}