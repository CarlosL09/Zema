import { storage } from '../storage.js';
import { GmailService } from './gmailService.js';
import { OutlookService } from './outlookService.js';
import type { EmailAccount, InsertEmailAccount } from '../../shared/schema.js';

export class EmailAccountService {
  private gmailService: GmailService;
  private outlookService: OutlookService;

  constructor() {
    this.gmailService = new GmailService();
    this.outlookService = new OutlookService();
  }

  async addEmailAccount(userId: string, accountData: {
    emailAddress: string;
    provider: 'gmail' | 'outlook';
    displayName?: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    settings?: any;
  }): Promise<EmailAccount> {
    // Check if this is the user's first account, if so make it primary
    const existingAccounts = await storage.getEmailAccounts(userId);
    const isPrimary = existingAccounts.length === 0;

    const account = await storage.createEmailAccount({
      userId,
      emailAddress: accountData.emailAddress,
      provider: accountData.provider,
      displayName: accountData.displayName || accountData.emailAddress,
      accessToken: accountData.accessToken,
      refreshToken: accountData.refreshToken,
      expiresAt: accountData.expiresAt,
      isPrimary,
      settings: accountData.settings,
      syncStatus: 'pending'
    });

    // Start initial sync
    await this.syncEmailAccount(account.id);

    return account;
  }

  async getAccountsByUser(userId: string): Promise<EmailAccount[]> {
    return await storage.getEmailAccounts(userId);
  }

  async getPrimaryAccount(userId: string): Promise<EmailAccount | null> {
    const accounts = await storage.getEmailAccounts(userId);
    return accounts.find(account => account.isPrimary) || null;
  }

  async setPrimaryAccount(userId: string, accountId: number): Promise<void> {
    await storage.setPrimaryEmailAccount(userId, accountId);
  }

  async removeEmailAccount(userId: string, accountId: number): Promise<void> {
    const accounts = await storage.getEmailAccounts(userId);
    const accountToDelete = accounts.find(acc => acc.id === accountId);
    
    if (!accountToDelete) {
      throw new Error('Account not found');
    }

    if (accountToDelete.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await storage.deleteEmailAccount(accountId);

    // If this was the primary account, set another account as primary
    if (accountToDelete.isPrimary) {
      const remainingAccounts = accounts.filter(acc => acc.id !== accountId);
      if (remainingAccounts.length > 0) {
        await storage.setPrimaryEmailAccount(userId, remainingAccounts[0].id);
      }
    }
  }

  async syncEmailAccount(accountId: number): Promise<void> {
    const accounts = await storage.getEmailAccounts(''); // We'll need to get the account first
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      await storage.updateEmailAccount(accountId, { syncStatus: 'syncing' });

      if (account.provider === 'gmail') {
        await this.gmailService.syncEmails(account.userId, account.accessToken!, account.refreshToken);
      } else if (account.provider === 'outlook') {
        await this.outlookService.syncEmails(account.userId, account.accessToken!, account.refreshToken);
      }

      await storage.updateEmailAccount(accountId, { 
        syncStatus: 'completed',
        lastSyncAt: new Date()
      });
    } catch (error) {
      await storage.updateEmailAccount(accountId, { syncStatus: 'error' });
      throw error;
    }
  }

  async syncAllUserAccounts(userId: string): Promise<void> {
    const accounts = await storage.getEmailAccounts(userId);
    
    for (const account of accounts.filter(acc => acc.isActive)) {
      try {
        await this.syncEmailAccount(account.id);
      } catch (error) {
        console.error(`Failed to sync account ${account.id}:`, error);
      }
    }
  }

  async getAccountSyncStatus(userId: string): Promise<Array<{
    accountId: number;
    emailAddress: string;
    provider: string;
    syncStatus: string;
    lastSyncAt: Date | null;
    isPrimary: boolean;
  }>> {
    const accounts = await storage.getEmailAccounts(userId);
    
    return accounts.map(account => ({
      accountId: account.id,
      emailAddress: account.emailAddress,
      provider: account.provider,
      syncStatus: account.syncStatus || 'pending',
      lastSyncAt: account.lastSyncAt,
      isPrimary: account.isPrimary || false
    }));
  }

  async updateAccountSettings(accountId: number, settings: any): Promise<EmailAccount> {
    return await storage.updateEmailAccount(accountId, { settings });
  }

  async refreshAccountTokens(accountId: number): Promise<void> {
    const accounts = await storage.getEmailAccounts(''); // We'll need to fix this
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account || !account.refreshToken) {
      throw new Error('Account not found or no refresh token available');
    }

    try {
      let newTokens;
      
      if (account.provider === 'gmail') {
        newTokens = await this.gmailService.refreshToken(account.refreshToken);
      } else if (account.provider === 'outlook') {
        newTokens = await this.outlookService.refreshToken(account.refreshToken);
      } else {
        throw new Error('Unsupported provider');
      }

      await storage.updateEmailAccount(accountId, {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || account.refreshToken,
        expiresAt: new Date(Date.now() + (newTokens.expires_in * 1000))
      });
    } catch (error) {
      console.error(`Failed to refresh tokens for account ${accountId}:`, error);
      throw new Error('Failed to refresh account tokens');
    }
  }

  // Cross-account email operations
  async searchAcrossAccounts(userId: string, query: string): Promise<any[]> {
    const accounts = await storage.getEmailAccounts(userId);
    const results = [];

    for (const account of accounts.filter(acc => acc.isActive)) {
      try {
        let emails;
        if (account.provider === 'gmail') {
          emails = await this.gmailService.searchEmails(account.accessToken!, query);
        } else if (account.provider === 'outlook') {
          emails = await this.outlookService.searchEmails(account.accessToken!, query);
        }

        if (emails) {
          results.push({
            accountId: account.id,
            emailAddress: account.emailAddress,
            provider: account.provider,
            emails: emails
          });
        }
      } catch (error) {
        console.error(`Search failed for account ${account.id}:`, error);
      }
    }

    return results;
  }

  async getUnifiedInbox(userId: string, limit: number = 50): Promise<any[]> {
    const accounts = await storage.getEmailAccounts(userId);
    const allEmails = [];

    for (const account of accounts.filter(acc => acc.isActive)) {
      try {
        let emails;
        if (account.provider === 'gmail') {
          emails = await this.gmailService.getEmails(account.accessToken!, limit);
        } else if (account.provider === 'outlook') {
          emails = await this.outlookService.getEmails(account.accessToken!, limit);
        }

        if (emails) {
          allEmails.push(...emails.map(email => ({
            ...email,
            accountId: account.id,
            accountEmail: account.emailAddress,
            provider: account.provider
          })));
        }
      } catch (error) {
        console.error(`Failed to fetch emails for account ${account.id}:`, error);
      }
    }

    // Sort by date (most recent first)
    return allEmails.sort((a, b) => 
      new Date(b.receivedAt || b.date).getTime() - new Date(a.receivedAt || a.date).getTime()
    ).slice(0, limit);
  }
}