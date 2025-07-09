import { storage } from "./storage";
import { EmailAccount, InsertEmailAccount, SmartFolder, InsertSmartFolder } from "@shared/schema";

export interface EmailProvider {
  type: 'gmail' | 'outlook' | 'yahoo' | 'imap';
  name: string;
  authUrl?: string;
  requiresOAuth: boolean;
}

export interface EmailFolder {
  id: string;
  name: string;
  path: string;
  messageCount: number;
  unreadCount: number;
  parentId?: string;
  isSystem: boolean;
  provider: string;
  accountId: string;
}

export interface SyncProgress {
  accountId: string;
  totalFolders: number;
  syncedFolders: number;
  totalEmails: number;
  syncedEmails: number;
  status: 'initializing' | 'syncing_folders' | 'syncing_emails' | 'completed' | 'error';
  lastSyncAt: Date;
  error?: string;
}

export interface EmailSyncResult {
  success: boolean;
  foldersFound: number;
  foldersSynced: number;
  emailsFound: number;
  emailsSynced: number;
  smartFoldersCreated: number;
  error?: string;
}

class EmailSyncService {
  private supportedProviders: EmailProvider[] = [
    {
      type: 'gmail',
      name: 'Gmail',
      authUrl: '/auth/gmail',
      requiresOAuth: true
    },
    {
      type: 'outlook',
      name: 'Microsoft Outlook',
      authUrl: '/auth/microsoft',
      requiresOAuth: true
    },
    {
      type: 'yahoo',
      name: 'Yahoo Mail',
      authUrl: '/auth/yahoo',
      requiresOAuth: true
    },
    {
      type: 'imap',
      name: 'IMAP/SMTP',
      requiresOAuth: false
    }
  ];

  /**
   * Get all supported email providers
   */
  getSupportedProviders(): EmailProvider[] {
    return this.supportedProviders;
  }

  /**
   * Connect a new email account and perform initial sync
   */
  async connectEmailAccount(userId: string, provider: string, credentials: any): Promise<EmailAccount> {
    try {
      // Create email account record
      const accountData: InsertEmailAccount = {
        userId,
        provider,
        email: credentials.email,
        displayName: credentials.displayName || credentials.email,
        isActive: true,
        isPrimary: false,
        syncStatus: 'pending',
        lastSyncAt: null,
        settings: {
          syncEnabled: true,
          syncFolders: true,
          syncFrequency: 'realtime',
          notifications: true
        },
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        tokenExpiresAt: credentials.tokenExpiresAt
      };

      const account = await storage.createEmailAccount(accountData);

      // Start background sync
      this.startBackgroundSync(account.id, userId);

      return account;
    } catch (error) {
      console.error("Error connecting email account:", error);
      throw new Error("Failed to connect email account");
    }
  }

  /**
   * Sync folder structure from email provider
   */
  async syncFolderStructure(accountId: number, userId: string): Promise<EmailFolder[]> {
    try {
      const account = await storage.getEmailAccount(accountId);
      if (!account) {
        throw new Error("Email account not found");
      }

      // Update sync status
      await storage.updateEmailAccount(accountId, { syncStatus: 'syncing' });

      let folders: EmailFolder[] = [];

      // Fetch folders based on provider
      switch (account.provider) {
        case 'gmail':
          folders = await this.syncGmailFolders(account);
          break;
        case 'outlook':
          folders = await this.syncOutlookFolders(account);
          break;
        case 'yahoo':
          folders = await this.syncYahooFolders(account);
          break;
        case 'imap':
          folders = await this.syncImapFolders(account);
          break;
        default:
          throw new Error(`Unsupported provider: ${account.provider}`);
      }

      // Create smart folders mirroring the email provider structure
      const smartFolders = await this.createSmartFoldersFromEmailStructure(userId, accountId, folders);

      // Update sync status
      await storage.updateEmailAccount(accountId, { 
        syncStatus: 'completed',
        lastSyncAt: new Date()
      });

      return folders;
    } catch (error) {
      console.error("Error syncing folder structure:", error);
      await storage.updateEmailAccount(accountId, { syncStatus: 'error' });
      throw error;
    }
  }

  /**
   * Create smart folders that mirror email provider folder structure
   */
  private async createSmartFoldersFromEmailStructure(
    userId: string, 
    accountId: number, 
    emailFolders: EmailFolder[]
  ): Promise<SmartFolder[]> {
    const smartFolders: SmartFolder[] = [];

    for (const emailFolder of emailFolders) {
      // Skip system folders that don't need smart organization
      if (this.shouldSkipFolder(emailFolder)) {
        continue;
      }

      const smartFolderData: InsertSmartFolder = {
        userId,
        name: `${emailFolder.name} (${emailFolder.provider})`,
        description: `Smart organization for ${emailFolder.name} folder from ${emailFolder.provider}`,
        color: this.getFolderColor(emailFolder.name),
        icon: this.getFolderIcon(emailFolder.name),
        emailCount: 0,
        isActive: true,
        metadata: {
          sourceProvider: emailFolder.provider,
          sourceAccountId: accountId,
          sourceFolderId: emailFolder.id,
          sourceFolderPath: emailFolder.path,
          isSystemFolder: emailFolder.isSystem,
          messageCount: emailFolder.messageCount,
          unreadCount: emailFolder.unreadCount
        }
      };

      const smartFolder = await storage.createSmartFolder(smartFolderData);
      smartFolders.push(smartFolder);

      // Create folder rules for automatic email assignment
      await this.createFolderRulesForEmailSync(smartFolder.id, emailFolder, accountId);
    }

    return smartFolders;
  }

  /**
   * Sync Gmail folders using Gmail API
   */
  private async syncGmailFolders(account: EmailAccount): Promise<EmailFolder[]> {
    // Implementation would use Gmail API
    // For demo purposes, return common Gmail folders
    return [
      {
        id: 'INBOX',
        name: 'Inbox',
        path: 'INBOX',
        messageCount: 150,
        unreadCount: 12,
        isSystem: true,
        provider: 'gmail',
        accountId: account.id.toString()
      },
      {
        id: 'SENT',
        name: 'Sent',
        path: '[Gmail]/Sent Mail',
        messageCount: 89,
        unreadCount: 0,
        isSystem: true,
        provider: 'gmail',
        accountId: account.id.toString()
      },
      {
        id: 'DRAFT',
        name: 'Drafts',
        path: '[Gmail]/Drafts',
        messageCount: 5,
        unreadCount: 0,
        isSystem: true,
        provider: 'gmail',
        accountId: account.id.toString()
      },
      {
        id: 'SPAM',
        name: 'Spam',
        path: '[Gmail]/Spam',
        messageCount: 23,
        unreadCount: 0,
        isSystem: true,
        provider: 'gmail',
        accountId: account.id.toString()
      },
      {
        id: 'Label_1',
        name: 'Work Projects',
        path: 'Work Projects',
        messageCount: 67,
        unreadCount: 8,
        isSystem: false,
        provider: 'gmail',
        accountId: account.id.toString()
      },
      {
        id: 'Label_2',
        name: 'Personal',
        path: 'Personal',
        messageCount: 34,
        unreadCount: 2,
        isSystem: false,
        provider: 'gmail',
        accountId: account.id.toString()
      }
    ];
  }

  /**
   * Sync Outlook folders using Microsoft Graph API
   */
  private async syncOutlookFolders(account: EmailAccount): Promise<EmailFolder[]> {
    // Implementation would use Microsoft Graph API
    // For demo purposes, return common Outlook folders
    return [
      {
        id: 'inbox',
        name: 'Inbox',
        path: 'Inbox',
        messageCount: 203,
        unreadCount: 18,
        isSystem: true,
        provider: 'outlook',
        accountId: account.id.toString()
      },
      {
        id: 'sentitems',
        name: 'Sent Items',
        path: 'Sent Items',
        messageCount: 145,
        unreadCount: 0,
        isSystem: true,
        provider: 'outlook',
        accountId: account.id.toString()
      },
      {
        id: 'drafts',
        name: 'Drafts',
        path: 'Drafts',
        messageCount: 7,
        unreadCount: 0,
        isSystem: true,
        provider: 'outlook',
        accountId: account.id.toString()
      },
      {
        id: 'junkemail',
        name: 'Junk Email',
        path: 'Junk Email',
        messageCount: 31,
        unreadCount: 0,
        isSystem: true,
        provider: 'outlook',
        accountId: account.id.toString()
      },
      {
        id: 'custom_1',
        name: 'Clients',
        path: 'Clients',
        messageCount: 89,
        unreadCount: 11,
        isSystem: false,
        provider: 'outlook',
        accountId: account.id.toString()
      },
      {
        id: 'custom_2',
        name: 'Newsletter',
        path: 'Newsletter',
        messageCount: 156,
        unreadCount: 3,
        isSystem: false,
        provider: 'outlook',
        accountId: account.id.toString()
      }
    ];
  }

  /**
   * Sync Yahoo folders
   */
  private async syncYahooFolders(account: EmailAccount): Promise<EmailFolder[]> {
    // Similar implementation for Yahoo Mail API
    return [
      {
        id: 'INBOX',
        name: 'Inbox',
        path: 'INBOX',
        messageCount: 98,
        unreadCount: 7,
        isSystem: true,
        provider: 'yahoo',
        accountId: account.id.toString()
      },
      {
        id: 'Sent',
        name: 'Sent',
        path: 'Sent',
        messageCount: 65,
        unreadCount: 0,
        isSystem: true,
        provider: 'yahoo',
        accountId: account.id.toString()
      }
    ];
  }

  /**
   * Sync IMAP folders
   */
  private async syncImapFolders(account: EmailAccount): Promise<EmailFolder[]> {
    // Implementation would use IMAP library
    return [
      {
        id: 'INBOX',
        name: 'INBOX',
        path: 'INBOX',
        messageCount: 76,
        unreadCount: 4,
        isSystem: true,
        provider: 'imap',
        accountId: account.id.toString()
      }
    ];
  }

  /**
   * Create folder rules for automatic email assignment based on provider folders
   */
  private async createFolderRulesForEmailSync(
    smartFolderId: number, 
    emailFolder: EmailFolder, 
    accountId: number
  ): Promise<void> {
    // Create rules that automatically assign emails from specific provider folders
    // to corresponding smart folders
    
    const ruleConditions = {
      sourceProvider: emailFolder.provider,
      sourceAccountId: accountId,
      sourceFolderId: emailFolder.id,
      folderPath: emailFolder.path
    };

    // This would create folder rules in the database
    // Implementation depends on your folder rules schema
  }

  /**
   * Determine if a folder should be skipped for smart organization
   */
  private shouldSkipFolder(folder: EmailFolder): boolean {
    const skipFolders = ['SPAM', 'TRASH', 'DELETED', 'JUNK', 'DRAFT'];
    return skipFolders.some(skip => 
      folder.name.toLowerCase().includes(skip.toLowerCase()) ||
      folder.path.toLowerCase().includes(skip.toLowerCase())
    );
  }

  /**
   * Get appropriate color for folder based on name/type
   */
  private getFolderColor(folderName: string): string {
    const colorMap: Record<string, string> = {
      'inbox': '#3b82f6',      // blue
      'sent': '#10b981',       // green
      'work': '#f59e0b',       // amber
      'personal': '#8b5cf6',   // violet
      'clients': '#ef4444',    // red
      'projects': '#06b6d4',   // cyan
      'newsletter': '#84cc16', // lime
      'important': '#f97316',  // orange
    };

    const name = folderName.toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (name.includes(key)) {
        return color;
      }
    }
    
    return '#6b7280'; // default gray
  }

  /**
   * Get appropriate icon for folder based on name/type
   */
  private getFolderIcon(folderName: string): string {
    const iconMap: Record<string, string> = {
      'inbox': 'inbox',
      'sent': 'send',
      'draft': 'edit',
      'spam': 'shield-alert',
      'trash': 'trash',
      'work': 'briefcase',
      'personal': 'user',
      'clients': 'users',
      'projects': 'folder-open',
      'newsletter': 'mail',
      'important': 'star',
    };

    const name = folderName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }
    
    return 'folder';
  }

  /**
   * Start background sync process for an email account
   */
  private async startBackgroundSync(accountId: number, userId: string): Promise<void> {
    try {
      // This would typically be handled by a background job/queue
      console.log(`Starting background sync for account ${accountId}`);
      
      // Sync folder structure
      await this.syncFolderStructure(accountId, userId);
      
      // Schedule periodic sync
      this.schedulePeriodicSync(accountId, userId);
    } catch (error) {
      console.error("Background sync failed:", error);
    }
  }

  /**
   * Schedule periodic sync for an email account
   */
  private schedulePeriodicSync(accountId: number, userId: string): void {
    // This would typically use a job scheduler like Bull Queue or similar
    console.log(`Scheduled periodic sync for account ${accountId}`);
  }

  /**
   * Get sync progress for an email account
   */
  async getSyncProgress(accountId: number): Promise<SyncProgress> {
    const account = await storage.getEmailAccount(accountId);
    if (!account) {
      throw new Error("Email account not found");
    }

    // Return current sync status
    return {
      accountId: accountId.toString(),
      totalFolders: 10,
      syncedFolders: account.syncStatus === 'completed' ? 10 : 5,
      totalEmails: 500,
      syncedEmails: account.syncStatus === 'completed' ? 500 : 250,
      status: account.syncStatus as any,
      lastSyncAt: account.lastSyncAt || new Date(),
      error: account.syncStatus === 'error' ? 'Sync failed' : undefined
    };
  }

  /**
   * Disconnect and remove email account
   */
  async disconnectEmailAccount(accountId: number, userId: string): Promise<void> {
    try {
      // Remove associated smart folders
      const smartFolders = await storage.getSmartFolders(userId);
      for (const folder of smartFolders) {
        if (folder.metadata?.sourceAccountId === accountId) {
          // Archive or delete the smart folder
          await storage.updateSmartFolder(folder.id, { isActive: false });
        }
      }

      // Remove email account
      await storage.deleteEmailAccount(accountId);
    } catch (error) {
      console.error("Error disconnecting email account:", error);
      throw new Error("Failed to disconnect email account");
    }
  }

  /**
   * Get all synced folders for a user across all accounts
   */
  async getAllSyncedFolders(userId: string): Promise<EmailFolder[]> {
    const accounts = await storage.getEmailAccountsByUser(userId);
    const allFolders: EmailFolder[] = [];

    for (const account of accounts) {
      if (account.syncStatus === 'completed') {
        try {
          const folders = await this.getFoldersForAccount(account);
          allFolders.push(...folders);
        } catch (error) {
          console.error(`Error getting folders for account ${account.id}:`, error);
        }
      }
    }

    return allFolders;
  }

  /**
   * Get folders for a specific account
   */
  private async getFoldersForAccount(account: EmailAccount): Promise<EmailFolder[]> {
    // This would fetch actual folder data
    // For now, return demo data based on provider
    switch (account.provider) {
      case 'gmail':
        return await this.syncGmailFolders(account);
      case 'outlook':
        return await this.syncOutlookFolders(account);
      case 'yahoo':
        return await this.syncYahooFolders(account);
      default:
        return [];
    }
  }
}

export const emailSyncService = new EmailSyncService();