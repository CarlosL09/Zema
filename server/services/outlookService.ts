import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { storage } from '../storage';

export class OutlookService {
  private msalApp: ConfidentialClientApplication | null = null;

  constructor() {
    // Only initialize if Azure credentials are available
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
      this.msalApp = new ConfidentialClientApplication({
        auth: {
          clientId: process.env.AZURE_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
          clientSecret: process.env.AZURE_CLIENT_SECRET,
        }
      });
    }
  }

  private ensureInitialized(): void {
    if (!this.msalApp) {
      throw new Error('Outlook service not configured. Please provide Azure credentials.');
    }
  }

  async getAuthUrl(): Promise<string> {
    this.ensureInitialized();
    const authCodeUrlParameters = {
      scopes: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.ReadWrite',
        'https://graph.microsoft.com/User.Read'
      ],
      redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:5000/auth/outlook/callback',
    };

    try {
      const response = await this.msalApp!.getAuthCodeUrl(authCodeUrlParameters);
      return response;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw new Error('Failed to generate authentication URL');
    }
  }

  async exchangeCodeForTokens(code: string, userId: string): Promise<void> {
    this.ensureInitialized();
    const tokenRequest = {
      code: code,
      scopes: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.ReadWrite',
        'https://graph.microsoft.com/User.Read'
      ],
      redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:5000/auth/outlook/callback',
    };

    try {
      const response = await this.msalApp!.acquireTokenByCode(tokenRequest);
      
      // Store the tokens in the database
      await storage.createIntegration({
        userId,
        type: 'outlook',
        accessToken: response.accessToken,
        refreshToken: '', // MSAL handles refresh tokens internally
        expiresAt: response.expiresOn || null,
        settings: {
          account: response.account,
          scopes: response.scopes
        }
      });
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  async getGraphClient(userId: string): Promise<Client> {
    const integrations = await storage.getIntegrations(userId);
    const outlookIntegration = integrations.find(i => i.type === 'outlook');
    
    if (!outlookIntegration) {
      throw new Error('Outlook integration not found');
    }

    // Check if token is expired and refresh if needed
    if (outlookIntegration.expiresAt && outlookIntegration.expiresAt <= new Date()) {
      await this.refreshAccessToken(userId, outlookIntegration.refreshToken || '');
      // Get updated integration
      const updatedIntegrations = await storage.getIntegrations(userId);
      const updatedIntegration = updatedIntegrations.find(i => i.type === 'outlook');
      if (!updatedIntegration) {
        throw new Error('Failed to refresh Outlook token');
      }
      outlookIntegration.accessToken = updatedIntegration.accessToken;
    }

    return Client.init({
      authProvider: (done) => {
        done(null, outlookIntegration.accessToken);
      },
    });
  }

  private async refreshAccessToken(userId: string, refreshToken: string): Promise<void> {
    try {
      // For MSAL, we need to use silent token acquisition with the stored account
      const integrations = await storage.getIntegrations(userId);
      const outlookIntegration = integrations.find(i => i.type === 'outlook');
      
      if (!outlookIntegration || !outlookIntegration.settings) {
        throw new Error('Outlook integration or account info not found');
      }

      const account = (outlookIntegration.settings as any).account;
      
      const silentRequest = {
        account: account,
        scopes: [
          'https://graph.microsoft.com/Mail.Read',
          'https://graph.microsoft.com/Mail.Send',
          'https://graph.microsoft.com/Mail.ReadWrite',
          'https://graph.microsoft.com/User.Read'
        ],
      };

      const response = await this.msalApp!.acquireTokenSilent(silentRequest);
      
      if (response && outlookIntegration) {
        await storage.updateIntegration(outlookIntegration.id, {
          accessToken: response.accessToken,
          expiresAt: response.expiresOn || null,
        });
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async getEmails(userId: string, maxResults = 50) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      const messages = await graphClient
        .api('/me/messages')
        .top(maxResults)
        .select('id,subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments,importance')
        .orderby('receivedDateTime desc')
        .get();

      return messages.value || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails from Outlook');
    }
  }

  async getEmailThread(userId: string, messageId: string) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      const message = await graphClient
        .api(`/me/messages/${messageId}`)
        .select('id,subject,from,toRecipients,receivedDateTime,body,conversationId,hasAttachments')
        .get();

      // Get other messages in the same conversation
      const conversationMessages = await graphClient
        .api('/me/messages')
        .filter(`conversationId eq '${message.conversationId}'`)
        .select('id,subject,from,receivedDateTime,bodyPreview,isRead')
        .orderby('receivedDateTime desc')
        .get();

      return {
        message,
        thread: conversationMessages.value || []
      };
    } catch (error) {
      console.error('Error fetching email thread:', error);
      throw new Error('Failed to fetch email thread from Outlook');
    }
  }

  async sendEmail(userId: string, to: string, subject: string, body: string, replyToMessageId?: string) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      const message = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: body
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      };

      if (replyToMessageId) {
        // Reply to existing message
        await graphClient
          .api(`/me/messages/${replyToMessageId}/reply`)
          .post({
            message: message
          });
      } else {
        // Send new email
        await graphClient
          .api('/me/sendMail')
          .post({
            message: message,
            saveToSentItems: true
          });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email via Outlook');
    }
  }

  async markAsRead(userId: string, messageId: string) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      await graphClient
        .api(`/me/messages/${messageId}`)
        .patch({
          isRead: true
        });
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw new Error('Failed to mark email as read');
    }
  }

  async addLabel(userId: string, messageId: string, categoryName: string) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      // Get current categories
      const message = await graphClient
        .api(`/me/messages/${messageId}`)
        .select('categories')
        .get();

      const currentCategories = message.categories || [];
      const updatedCategories = [...currentCategories, categoryName];

      // Update with new category
      await graphClient
        .api(`/me/messages/${messageId}`)
        .patch({
          categories: updatedCategories
        });
    } catch (error) {
      console.error('Error adding label to email:', error);
      throw new Error('Failed to add label to email');
    }
  }

  async searchEmails(userId: string, query: string, maxResults = 25) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      const messages = await graphClient
        .api('/me/messages')
        .search(query)
        .top(maxResults)
        .select('id,subject,from,receivedDateTime,bodyPreview,isRead,importance')
        .orderby('receivedDateTime desc')
        .get();

      return messages.value || [];
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new Error('Failed to search emails in Outlook');
    }
  }

  async getFolders(userId: string) {
    try {
      const graphClient = await this.getGraphClient(userId);
      
      const folders = await graphClient
        .api('/me/mailFolders')
        .select('id,displayName,totalItemCount,unreadItemCount')
        .get();

      return folders.value || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Failed to fetch Outlook folders');
    }
  }
}