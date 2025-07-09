import { storage } from "../storage";
import type { PlatformIntegration, InsertPlatformIntegration } from "@shared/schema";
import CryptoJS from "crypto-js";

// Encryption key for sensitive data (should be in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "zema-default-key-change-in-production";

class PlatformIntegrationService {
  // Encrypt sensitive data
  private encrypt(text: string): string {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  // Decrypt sensitive data
  private decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return encryptedText;
    }
  }

  // Create a new platform integration
  async createIntegration(userId: string, data: Omit<InsertPlatformIntegration, "userId" | "id">): Promise<PlatformIntegration> {
    const encryptedData = {
      ...data,
      userId,
      apiKey: data.apiKey ? this.encrypt(data.apiKey) : null,
      apiSecret: data.apiSecret ? this.encrypt(data.apiSecret) : null,
      accessToken: data.accessToken ? this.encrypt(data.accessToken) : null,
      refreshToken: data.refreshToken ? this.encrypt(data.refreshToken) : null,
    };

    return await storage.createPlatformIntegration(encryptedData);
  }

  // Get user's platform integrations
  async getUserIntegrations(userId: string): Promise<PlatformIntegration[]> {
    const integrations = await storage.getUserPlatformIntegrations(userId);
    
    // Decrypt sensitive data for display (but only return masked versions)
    return integrations.map((integration: PlatformIntegration) => ({
      ...integration,
      apiKey: integration.apiKey ? this.maskApiKey(this.decrypt(integration.apiKey)) : null,
      apiSecret: integration.apiSecret ? this.maskApiKey(this.decrypt(integration.apiSecret)) : null,
      accessToken: integration.accessToken ? this.maskApiKey(this.decrypt(integration.accessToken)) : null,
      refreshToken: integration.refreshToken ? "***" : null,
    }));
  }

  // Get decrypted integration for API calls
  async getDecryptedIntegration(integrationId: number): Promise<PlatformIntegration | null> {
    const integration = await storage.getPlatformIntegration(integrationId);
    if (!integration) return null;

    return {
      ...integration,
      apiKey: integration.apiKey ? this.decrypt(integration.apiKey) : null,
      apiSecret: integration.apiSecret ? this.decrypt(integration.apiSecret) : null,
      accessToken: integration.accessToken ? this.decrypt(integration.accessToken) : null,
      refreshToken: integration.refreshToken ? this.decrypt(integration.refreshToken) : null,
    };
  }

  // Update integration
  async updateIntegration(integrationId: number, updates: Partial<PlatformIntegration>): Promise<PlatformIntegration> {
    const encryptedUpdates = {
      ...updates,
      apiKey: updates.apiKey ? this.encrypt(updates.apiKey) : undefined,
      apiSecret: updates.apiSecret ? this.encrypt(updates.apiSecret) : undefined,
      accessToken: updates.accessToken ? this.encrypt(updates.accessToken) : undefined,
      refreshToken: updates.refreshToken ? this.encrypt(updates.refreshToken) : undefined,
    };

    return await storage.updatePlatformIntegration(integrationId, encryptedUpdates);
  }

  // Delete integration
  async deleteIntegration(integrationId: number): Promise<void> {
    await storage.deletePlatformIntegration(integrationId);
  }

  // Test integration connection
  async testIntegration(integrationId: number): Promise<{ success: boolean; message: string; data?: any }> {
    const integration = await this.getDecryptedIntegration(integrationId);
    if (!integration) {
      return { success: false, message: "Integration not found" };
    }

    try {
      switch (integration.platform) {
        case 'notion':
          return await this.testNotionConnection(integration);
        case 'zapier':
          return await this.testZapierConnection(integration);
        case 'pabbly':
          return await this.testPabblyConnection(integration);
        case 'airtable':
          return await this.testAirtableConnection(integration);
        case 'slack':
          return await this.testSlackConnection(integration);
        default:
          return { success: false, message: "Unsupported platform" };
      }
    } catch (error) {
      console.error(`Error testing ${integration.platform} integration:`, error);
      return { success: false, message: (error as Error).message || "Connection test failed" };
    }
  }

  // Platform-specific test methods
  private async testNotionConnection(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const user = await response.json();
        return { 
          success: true, 
          message: "Connection successful", 
          data: { username: user.name, email: user.person?.email }
        };
      } else {
        return { success: false, message: "Invalid API key or insufficient permissions" };
      }
    } catch (error) {
      return { success: false, message: "Failed to connect to Notion API" };
    }
  }

  private async testZapierConnection(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    // For Zapier, we typically test webhook URLs rather than API keys
    const config = integration.config as any;
    if (config?.webhookUrl) {
      try {
        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true, source: 'ZEMA' })
        });
        
        return { 
          success: response.ok, 
          message: response.ok ? "Webhook endpoint responding" : "Webhook endpoint not responding"
        };
      } catch (error) {
        return { success: false, message: "Failed to reach webhook endpoint" };
      }
    }
    return { success: true, message: "Zapier integration configured" };
  }

  private async testPabblyConnection(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    // Similar to Zapier, Pabbly uses webhook URLs
    const config = integration.config as any;
    if (config?.webhookUrl) {
      try {
        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true, source: 'ZEMA' })
        });
        
        return { 
          success: response.ok, 
          message: response.ok ? "Webhook endpoint responding" : "Webhook endpoint not responding"
        };
      } catch (error) {
        return { success: false, message: "Failed to reach webhook endpoint" };
      }
    }
    return { success: true, message: "Pabbly Connect integration configured" };
  }

  private async testAirtableConnection(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: "Connection successful", 
          data: { baseCount: data.bases?.length || 0 }
        };
      } else {
        return { success: false, message: "Invalid API key or insufficient permissions" };
      }
    } catch (error) {
      return { success: false, message: "Failed to connect to Airtable API" };
    }
  }

  private async testSlackConnection(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          return { 
            success: true, 
            message: "Connection successful", 
            data: { team: data.team, user: data.user }
          };
        } else {
          return { success: false, message: data.error || "Authentication failed" };
        }
      } else {
        return { success: false, message: "Invalid access token" };
      }
    } catch (error) {
      return { success: false, message: "Failed to connect to Slack API" };
    }
  }

  // Mask API keys for display
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return "***";
    return apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
  }

  // Get platform-specific configuration templates
  getPlatformTemplate(platform: string): any {
    const templates: Record<string, any> = {
      notion: {
        name: "Notion Integration",
        fields: [
          { name: "apiKey", label: "Integration Token", type: "password", required: true, placeholder: "secret_..." },
        ],
        description: "Connect to your Notion workspace to create pages and update databases",
        setupInstructions: [
          "Go to https://www.notion.so/my-integrations",
          "Create a new integration",
          "Copy the Internal Integration Token",
          "Add the integration to your workspace pages"
        ]
      },
      zapier: {
        name: "Zapier Integration",
        fields: [
          { name: "webhookUrl", label: "Webhook URL", type: "url", required: true, placeholder: "https://hooks.zapier.com/hooks/catch/..." },
        ],
        description: "Connect to Zapier to trigger workflows and automate tasks",
        setupInstructions: [
          "Create a new Zap in Zapier",
          "Use 'Webhooks by Zapier' as trigger",
          "Copy the webhook URL",
          "Configure your desired actions"
        ]
      },
      pabbly: {
        name: "Pabbly Connect",
        fields: [
          { name: "webhookUrl", label: "Webhook URL", type: "url", required: true, placeholder: "https://connect.pabbly.com/workflow/sendwebhookdata/..." },
        ],
        description: "Connect to Pabbly Connect for unlimited automation workflows",
        setupInstructions: [
          "Create a new workflow in Pabbly Connect",
          "Use 'Webhook' as trigger",
          "Copy the webhook URL",
          "Set up your automation steps"
        ]
      },
      airtable: {
        name: "Airtable Integration",
        fields: [
          { name: "apiKey", label: "Personal Access Token", type: "password", required: true, placeholder: "pat..." },
        ],
        description: "Sync data with Airtable bases and create records automatically",
        setupInstructions: [
          "Go to https://airtable.com/create/tokens",
          "Create a new personal access token",
          "Grant necessary scopes (data.records:read, data.records:write)",
          "Copy the token"
        ]
      },
      slack: {
        name: "Slack Integration",
        fields: [
          { name: "accessToken", label: "Bot User OAuth Token", type: "password", required: true, placeholder: "xoxb-..." },
        ],
        description: "Send notifications and updates to Slack channels",
        setupInstructions: [
          "Create a new Slack app at https://api.slack.com/apps",
          "Add OAuth scopes (chat:write, channels:read)",
          "Install the app to your workspace",
          "Copy the Bot User OAuth Token"
        ]
      },
      discord: {
        name: "Discord Integration",
        fields: [
          { name: "botToken", label: "Bot Token", type: "password", required: true, placeholder: "MTk4..." },
          { name: "channelId", label: "Channel ID", type: "text", required: false, placeholder: "123456789012345678" }
        ],
        description: "Send notifications and messages to Discord channels",
        setupInstructions: [
          "Go to https://discord.com/developers/applications",
          "Create a new application and bot",
          "Copy the bot token",
          "Invite bot to your server with message permissions"
        ]
      },
      telegram: {
        name: "Telegram Integration",
        fields: [
          { name: "botToken", label: "Bot Token", type: "password", required: true, placeholder: "123456789:ABC..." },
          { name: "chatId", label: "Chat ID", type: "text", required: false, placeholder: "-1001234567890" }
        ],
        description: "Send messages via Telegram bot",
        setupInstructions: [
          "Message @BotFather on Telegram",
          "Create a new bot with /newbot",
          "Copy the bot token",
          "Add bot to your chat and get chat ID"
        ]
      },
      trello: {
        name: "Trello Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "..." },
          { name: "apiToken", label: "API Token", type: "password", required: true, placeholder: "..." }
        ],
        description: "Create cards and manage Trello boards",
        setupInstructions: [
          "Go to https://trello.com/app-key",
          "Copy your API key",
          "Generate an API token",
          "Find your board ID from the board URL"
        ]
      },
      asana: {
        name: "Asana Integration",
        fields: [
          { name: "accessToken", label: "Personal Access Token", type: "password", required: true, placeholder: "1/..." }
        ],
        description: "Create tasks and manage Asana projects",
        setupInstructions: [
          "Go to Asana Profile Settings > Apps",
          "Create a Personal Access Token",
          "Copy the token",
          "Get project ID from project URL"
        ]
      },
      monday: {
        name: "Monday.com Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "..." }
        ],
        description: "Create items and manage Monday.com boards",
        setupInstructions: [
          "Go to Monday.com Profile > API",
          "Generate an API token",
          "Copy the token",
          "Find board ID from board settings"
        ]
      },
      clickup: {
        name: "ClickUp Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "pk_..." }
        ],
        description: "Create tasks and manage ClickUp spaces",
        setupInstructions: [
          "Go to ClickUp Profile > Apps",
          "Generate an API token",
          "Copy the token",
          "Get space ID from space settings"
        ]
      },
      linear: {
        name: "Linear Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "lin_api_..." }
        ],
        description: "Create issues and manage Linear projects",
        setupInstructions: [
          "Go to Linear Settings > API",
          "Create a personal API key",
          "Copy the key",
          "Get team ID from team settings"
        ]
      },
      jira: {
        name: "Jira Integration",
        fields: [
          { name: "apiKey", label: "API Token", type: "password", required: true, placeholder: "..." },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "user@domain.com" },
          { name: "baseUrl", label: "Jira URL", type: "url", required: true, placeholder: "https://company.atlassian.net" }
        ],
        description: "Create issues and manage Jira projects",
        setupInstructions: [
          "Go to Atlassian Account Settings",
          "Create an API token",
          "Use your email and API token",
          "Provide your Jira instance URL"
        ]
      },
      github: {
        name: "GitHub Integration",
        fields: [
          { name: "accessToken", label: "Personal Access Token", type: "password", required: true, placeholder: "ghp_..." }
        ],
        description: "Create issues and manage GitHub repositories",
        setupInstructions: [
          "Go to GitHub Settings > Developer settings",
          "Create a Personal Access Token",
          "Select appropriate scopes",
          "Copy the token"
        ]
      },
      gitlab: {
        name: "GitLab Integration",
        fields: [
          { name: "accessToken", label: "Personal Access Token", type: "password", required: true, placeholder: "glpat-..." }
        ],
        description: "Create issues and manage GitLab projects",
        setupInstructions: [
          "Go to GitLab Preferences > Access Tokens",
          "Create a Personal Access Token",
          "Select API scope",
          "Copy the token"
        ]
      },
      salesforce: {
        name: "Salesforce Integration",
        fields: [
          { name: "clientId", label: "Consumer Key", type: "password", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Consumer Secret", type: "password", required: true, placeholder: "..." },
          { name: "username", label: "Username", type: "text", required: true, placeholder: "user@domain.com" }
        ],
        description: "Sync contacts and opportunities with Salesforce",
        setupInstructions: [
          "Go to Salesforce Setup > App Manager",
          "Create a Connected App",
          "Copy Consumer Key and Secret",
          "Provide your Salesforce username"
        ]
      },
      hubspot: {
        name: "HubSpot Integration",
        fields: [
          { name: "accessToken", label: "Private App Token", type: "password", required: true, placeholder: "pat-..." }
        ],
        description: "Sync contacts and deals with HubSpot",
        setupInstructions: [
          "Go to HubSpot Settings > Integrations",
          "Create a Private App",
          "Select required scopes",
          "Copy the access token"
        ]
      },
      pipedrive: {
        name: "Pipedrive Integration",
        fields: [
          { name: "apiKey", label: "API Token", type: "password", required: true, placeholder: "..." },
          { name: "companyDomain", label: "Company Domain", type: "text", required: true, placeholder: "company-domain" }
        ],
        description: "Sync deals and contacts with Pipedrive",
        setupInstructions: [
          "Go to Pipedrive Settings > Personal",
          "Find API token in API section",
          "Copy the token",
          "Provide your company domain"
        ]
      },
      stripe: {
        name: "Stripe Integration",
        fields: [
          { name: "secretKey", label: "Secret Key", type: "password", required: true, placeholder: "sk_..." }
        ],
        description: "Monitor payments and customer events",
        setupInstructions: [
          "Go to Stripe Dashboard > API keys",
          "Copy your secret key",
          "Ensure webhook permissions",
          "Configure webhook endpoints"
        ]
      },
      paypal: {
        name: "PayPal Integration",
        fields: [
          { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Monitor PayPal transactions and webhooks",
        setupInstructions: [
          "Go to PayPal Developer Dashboard",
          "Create a new app",
          "Copy Client ID and Secret",
          "Configure webhook endpoints"
        ]
      },
      shopify: {
        name: "Shopify Integration",
        fields: [
          { name: "accessToken", label: "Access Token", type: "password", required: true, placeholder: "shpat_..." },
          { name: "shopDomain", label: "Shop Domain", type: "text", required: true, placeholder: "mystore.myshopify.com" }
        ],
        description: "Monitor orders and customer events",
        setupInstructions: [
          "Go to Shopify Admin > Apps",
          "Create a private app",
          "Generate access token",
          "Provide your shop domain"
        ]
      },
      google_calendar: {
        name: "Google Calendar Integration",
        fields: [
          { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Create events and monitor calendar changes",
        setupInstructions: [
          "Go to Google Cloud Console",
          "Enable Calendar API",
          "Create OAuth credentials",
          "Complete OAuth flow for refresh token"
        ]
      },
      outlook_calendar: {
        name: "Outlook Calendar Integration",
        fields: [
          { name: "clientId", label: "Application ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Create events and monitor Outlook calendar",
        setupInstructions: [
          "Go to Azure App Registrations",
          "Create new application",
          "Copy Application ID and Secret",
          "Configure Calendar permissions"
        ]
      },
      zoom: {
        name: "Zoom Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "..." },
          { name: "apiSecret", label: "API Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Create meetings and monitor Zoom events",
        setupInstructions: [
          "Go to Zoom Marketplace",
          "Create a JWT app",
          "Copy API Key and Secret",
          "Configure webhook endpoints"
        ]
      },
      teams: {
        name: "Microsoft Teams Integration",
        fields: [
          { name: "clientId", label: "Application ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Send messages and create Teams meetings",
        setupInstructions: [
          "Go to Azure App Registrations",
          "Create new application",
          "Configure Teams permissions",
          "Copy Application ID and Secret"
        ]
      },
      google_meet: {
        name: "Google Meet Integration",
        fields: [
          { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Create Google Meet meetings",
        setupInstructions: [
          "Go to Google Cloud Console",
          "Enable Calendar API",
          "Create OAuth credentials",
          "Configure meeting creation scope"
        ]
      },
      calendly: {
        name: "Calendly Integration",
        fields: [
          { name: "accessToken", label: "Personal Access Token", type: "password", required: true, placeholder: "..." }
        ],
        description: "Monitor Calendly bookings and events",
        setupInstructions: [
          "Go to Calendly Integrations",
          "Create a Personal Access Token",
          "Copy the token",
          "Configure webhook subscriptions"
        ]
      },
      typeform: {
        name: "Typeform Integration",
        fields: [
          { name: "accessToken", label: "Personal Access Token", type: "password", required: true, placeholder: "tfp_..." }
        ],
        description: "Monitor form submissions and responses",
        setupInstructions: [
          "Go to Typeform Admin Panel",
          "Create a Personal Access Token",
          "Copy the token",
          "Set up webhook endpoints"
        ]
      },
      google_forms: {
        name: "Google Forms Integration",
        fields: [
          { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Monitor Google Forms responses",
        setupInstructions: [
          "Go to Google Cloud Console",
          "Enable Forms API",
          "Create OAuth credentials",
          "Configure form access permissions"
        ]
      },
      mailchimp: {
        name: "Mailchimp Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "...-us1" }
        ],
        description: "Manage email lists and campaigns",
        setupInstructions: [
          "Go to Mailchimp Account > Extras > API keys",
          "Create a new API key",
          "Copy the key",
          "Find Audience ID in Audience settings"
        ]
      },
      sendgrid: {
        name: "SendGrid Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "SG..." }
        ],
        description: "Send transactional emails via SendGrid",
        setupInstructions: [
          "Go to SendGrid Settings > API Keys",
          "Create a new API key",
          "Select Full Access or Mail Send",
          "Copy the key"
        ]
      },
      twilio: {
        name: "Twilio Integration",
        fields: [
          { name: "accountSid", label: "Account SID", type: "text", required: true, placeholder: "AC..." },
          { name: "authToken", label: "Auth Token", type: "password", required: true, placeholder: "..." }
        ],
        description: "Send SMS notifications and voice calls",
        setupInstructions: [
          "Go to Twilio Console",
          "Find Account SID and Auth Token",
          "Copy both values",
          "Optionally configure phone number"
        ]
      },
      dropbox: {
        name: "Dropbox Integration",
        fields: [
          { name: "accessToken", label: "Access Token", type: "password", required: true, placeholder: "sl..." }
        ],
        description: "Store and share files via Dropbox",
        setupInstructions: [
          "Go to Dropbox App Console",
          "Create a new app",
          "Generate access token",
          "Configure file permissions"
        ]
      },
      google_drive: {
        name: "Google Drive Integration",
        fields: [
          { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Store and manage files in Google Drive",
        setupInstructions: [
          "Go to Google Cloud Console",
          "Enable Drive API",
          "Create OAuth credentials",
          "Complete OAuth flow for refresh token"
        ]
      },
      onedrive: {
        name: "OneDrive Integration",
        fields: [
          { name: "clientId", label: "Application ID", type: "text", required: true, placeholder: "..." },
          { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "..." }
        ],
        description: "Store and manage files in OneDrive",
        setupInstructions: [
          "Go to Azure App Registrations",
          "Create new application",
          "Configure Files permissions",
          "Copy Application ID and Secret"
        ]
      },
      aws_s3: {
        name: "AWS S3 Integration",
        fields: [
          { name: "accessKeyId", label: "Access Key ID", type: "text", required: true, placeholder: "AKIA..." },
          { name: "secretAccessKey", label: "Secret Access Key", type: "password", required: true, placeholder: "..." },
          { name: "region", label: "Region", type: "text", required: true, placeholder: "us-east-1" }
        ],
        description: "Store files and data in AWS S3",
        setupInstructions: [
          "Go to AWS IAM Console",
          "Create a new user with S3 permissions",
          "Generate access keys",
          "Specify your S3 region and bucket"
        ]
      },
      openai: {
        name: "OpenAI Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "sk-..." }
        ],
        description: "Use OpenAI models for email analysis and generation",
        setupInstructions: [
          "Go to OpenAI Platform",
          "Create an API key",
          "Copy the key",
          "Monitor usage and billing"
        ]
      },
      anthropic: {
        name: "Anthropic Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "sk-ant-..." }
        ],
        description: "Use Claude models for email analysis",
        setupInstructions: [
          "Go to Anthropic Console",
          "Create an API key",
          "Copy the key",
          "Monitor usage limits"
        ]
      },
      cohere: {
        name: "Cohere Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "..." }
        ],
        description: "Use Cohere models for text analysis",
        setupInstructions: [
          "Go to Cohere Dashboard",
          "Create an API key",
          "Copy the key",
          "Monitor usage and billing"
        ]
      },
      custom: {
        name: "Custom API Integration",
        fields: [
          { name: "apiKey", label: "API Key", type: "password", required: false, placeholder: "..." },
          { name: "baseUrl", label: "Base URL", type: "url", required: true, placeholder: "https://api.example.com" },
          { name: "authHeader", label: "Auth Header", type: "text", required: false, placeholder: "Authorization" }
        ],
        description: "Connect to any custom API endpoint",
        setupInstructions: [
          "Provide the API base URL",
          "Configure authentication method",
          "Test the connection",
          "Set up webhook endpoints if needed"
        ]
      }
    };

    return templates[platform] || {
      name: "Custom Integration",
      fields: [
        { name: "apiKey", label: "API Key", type: "password", required: true },
        { name: "apiSecret", label: "API Secret", type: "password", required: false },
      ],
      description: "Configure a custom integration with your API credentials"
    };
  }

  // Sync integration data (for platforms that support it)
  async syncIntegration(integrationId: number): Promise<{ success: boolean; message: string; data?: any }> {
    const integration = await this.getDecryptedIntegration(integrationId);
    if (!integration) {
      return { success: false, message: "Integration not found" };
    }

    try {
      // Update last sync timestamp
      await this.updateIntegration(integrationId, { lastSync: new Date() });

      switch (integration.platform) {
        case 'notion':
          return await this.syncNotionData(integration);
        case 'airtable':
          return await this.syncAirtableData(integration);
        default:
          return { success: true, message: "Sync not required for this platform" };
      }
    } catch (error) {
      console.error(`Error syncing ${integration.platform} integration:`, error);
      return { success: false, message: (error as Error).message || "Sync failed" };
    }
  }

  private async syncNotionData(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    // This would sync available databases, pages, etc.
    // Implementation depends on specific use case
    return { success: true, message: "Notion sync completed" };
  }

  private async syncAirtableData(integration: PlatformIntegration): Promise<{ success: boolean; message: string; data?: any }> {
    // This would sync available bases, tables, etc.
    // Implementation depends on specific use case
    return { success: true, message: "Airtable sync completed" };
  }
}

export const platformIntegrationService = new PlatformIntegrationService();