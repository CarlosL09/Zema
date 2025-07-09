import { google } from 'googleapis';
import { storage } from '../storage';

export class GmailService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async getAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string, userId: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getAccessToken(code);
    
    // Store refresh token for the user
    if (tokens.refresh_token) {
      await storage.upsertUser({
        id: userId,
        gmailConnected: true,
        gmailRefreshToken: tokens.refresh_token
      });
    }
  }

  async getGmailClient(userId: string) {
    const user = await storage.getUser(userId);
    if (!user?.gmailRefreshToken) {
      throw new Error('Gmail not connected for user');
    }

    this.oauth2Client.setCredentials({
      refresh_token: user.gmailRefreshToken
    });

    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async getThreads(userId: string, maxResults = 50) {
    const gmail = await this.getGmailClient(userId);
    
    const response = await gmail.users.threads.list({
      userId: 'me',
      maxResults,
      q: 'is:unread'
    });

    return response.data.threads || [];
  }

  async getThread(userId: string, threadId: string) {
    const gmail = await this.getGmailClient(userId);
    
    const response = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full'
    });

    return response.data;
  }

  async sendEmail(userId: string, to: string, subject: string, body: string, threadId?: string) {
    const gmail = await this.getGmailClient(userId);

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      threadId ? `In-Reply-To: ${threadId}` : '',
      `Content-Type: text/html; charset=utf-8`,
      '',
      body
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId
      }
    });

    return response.data;
  }

  async markAsRead(userId: string, messageId: string) {
    const gmail = await this.getGmailClient(userId);
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }

  async addLabel(userId: string, messageId: string, labelId: string) {
    const gmail = await this.getGmailClient(userId);
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId]
      }
    });
  }
}