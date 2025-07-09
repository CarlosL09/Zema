import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}

export class OAuthService {
  private gmailConfig: OAuthConfig;
  private outlookConfig: OAuthConfig;

  constructor() {
    // Get the current domain from Replit environment
    const currentDomain = process.env.REPLIT_DOMAINS || 'localhost:5000';
    const baseUrl = currentDomain.includes('replit.dev') ? `https://${currentDomain}` : `http://${currentDomain}`;
    
    this.gmailConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/oauth/gmail/callback`,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    };

    this.outlookConfig = {
      clientId: process.env.AZURE_CLIENT_ID || '',
      clientSecret: process.env.AZURE_CLIENT_SECRET || '',
      redirectUri: process.env.AZURE_REDIRECT_URI || `${baseUrl}/api/oauth/outlook/callback`,
      scopes: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.ReadWrite'
      ]
    };
  }

  /**
   * Generate OAuth authorization URL for Gmail
   */
  getGmailAuthUrl(state?: string): string {
    if (!this.gmailConfig.clientId || !this.gmailConfig.clientSecret) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }

    const oauth2Client = new google.auth.OAuth2(
      this.gmailConfig.clientId,
      this.gmailConfig.clientSecret,
      this.gmailConfig.redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.gmailConfig.scopes,
      state: state,
      prompt: 'consent'
    });

    return authUrl;
  }

  /**
   * Generate OAuth authorization URL for Outlook
   */
  getOutlookAuthUrl(state?: string): string {
    if (!this.outlookConfig.clientId || !this.outlookConfig.clientSecret) {
      throw new Error('Microsoft OAuth credentials not configured. Please set AZURE_CLIENT_ID and AZURE_CLIENT_SECRET environment variables.');
    }

    const baseUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    const params = new URLSearchParams({
      client_id: this.outlookConfig.clientId,
      response_type: 'code',
      redirect_uri: this.outlookConfig.redirectUri,
      scope: this.outlookConfig.scopes.join(' '),
      response_mode: 'query',
      state: state || ''
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for Gmail tokens
   */
  async exchangeGmailCode(code: string): Promise<OAuthTokens> {
    const oauth2Client = new google.auth.OAuth2(
      this.gmailConfig.clientId,
      this.gmailConfig.clientSecret,
      this.gmailConfig.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date || undefined
    };
  }

  /**
   * Exchange authorization code for Outlook tokens
   */
  async exchangeOutlookCode(code: string): Promise<OAuthTokens> {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: this.outlookConfig.clientId,
      client_secret: this.outlookConfig.clientSecret,
      code: code,
      redirect_uri: this.outlookConfig.redirectUri,
      grant_type: 'authorization_code'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiryDate: data.expires_in ? Date.now() + (data.expires_in * 1000) : undefined
    };
  }

  /**
   * Get user email address from Gmail tokens
   */
  async getGmailUserEmail(tokens: OAuthTokens): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    return profile.data.emailAddress || '';
  }

  /**
   * Get user email address from Outlook tokens
   */
  async getOutlookUserEmail(tokens: OAuthTokens): Promise<string> {
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, tokens.accessToken);
      }
    });

    const user = await graphClient.api('/me').get();
    return user.mail || user.userPrincipalName || '';
  }

  /**
   * Refresh Gmail access token
   */
  async refreshGmailToken(refreshToken: string): Promise<OAuthTokens> {
    const oauth2Client = new google.auth.OAuth2(
      this.gmailConfig.clientId,
      this.gmailConfig.clientSecret,
      this.gmailConfig.redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || refreshToken,
      expiryDate: credentials.expiry_date || undefined
    };
  }

  /**
   * Refresh Outlook access token
   */
  async refreshOutlookToken(refreshToken: string): Promise<OAuthTokens> {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: this.outlookConfig.clientId,
      client_secret: this.outlookConfig.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiryDate: data.expires_in ? Date.now() + (data.expires_in * 1000) : undefined
    };
  }
}

export const oauthService = new OAuthService();