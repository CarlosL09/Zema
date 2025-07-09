import { storage } from '../storage';

export class CRMService {
  private salesforceApiBase = 'https://login.salesforce.com';
  private hubspotApiBase = 'https://api.hubapi.com';
  private pipedriveApiBase = 'https://api.pipedrive.com/v1';

  async getAuthUrl(platform: 'salesforce' | 'hubspot' | 'pipedrive'): Promise<string> {
    switch (platform) {
      case 'salesforce':
        return this.getSalesforceAuthUrl();
      case 'hubspot':
        return this.getHubSpotAuthUrl();
      case 'pipedrive':
        return this.getPipedriveAuthUrl();
      default:
        throw new Error(`Unsupported CRM platform: ${platform}`);
    }
  }

  private getSalesforceAuthUrl(): string {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const redirectUri = process.env.SALESFORCE_REDIRECT_URI || 'http://localhost:5000/auth/salesforce/callback';
    
    return `${this.salesforceApiBase}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=full`;
  }

  private getHubSpotAuthUrl(): string {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:5000/auth/hubspot/callback';
    const scopes = 'contacts crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write';
    
    return `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  }

  private getPipedriveAuthUrl(): string {
    const clientId = process.env.PIPEDRIVE_CLIENT_ID;
    const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI || 'http://localhost:5000/auth/pipedrive/callback';
    
    return `https://oauth.pipedrive.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async exchangeCodeForTokens(platform: 'salesforce' | 'hubspot' | 'pipedrive', code: string, userId: string): Promise<void> {
    switch (platform) {
      case 'salesforce':
        return this.exchangeSalesforceCode(code, userId);
      case 'hubspot':
        return this.exchangeHubSpotCode(code, userId);
      case 'pipedrive':
        return this.exchangePipedriveCode(code, userId);
      default:
        throw new Error(`Unsupported CRM platform: ${platform}`);
    }
  }

  private async exchangeSalesforceCode(code: string, userId: string): Promise<void> {
    try {
      const clientId = process.env.SALESFORCE_CLIENT_ID;
      const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
      const redirectUri = process.env.SALESFORCE_REDIRECT_URI || 'http://localhost:5000/auth/salesforce/callback';

      const response = await fetch(`${this.salesforceApiBase}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          code
        })
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(`Salesforce OAuth error: ${tokens.error_description || tokens.error}`);
      }

      await storage.createIntegration({
        userId,
        type: 'crm',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        isActive: true,
        settings: {
          provider: 'salesforce',
          instanceUrl: tokens.instance_url,
          signature: tokens.signature
        }
      });
    } catch (error) {
      console.error('Salesforce token exchange failed:', error);
      throw new Error('Failed to connect Salesforce');
    }
  }

  private async exchangeHubSpotCode(code: string, userId: string): Promise<void> {
    try {
      const clientId = process.env.HUBSPOT_CLIENT_ID;
      const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
      const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:5000/auth/hubspot/callback';

      const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          code
        })
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(`HubSpot OAuth error: ${tokens.message || tokens.error}`);
      }

      await storage.createIntegration({
        userId,
        type: 'crm',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
        settings: {
          provider: 'hubspot',
          hubDomain: tokens.hub_domain,
          hubId: tokens.hub_id
        }
      });
    } catch (error) {
      console.error('HubSpot token exchange failed:', error);
      throw new Error('Failed to connect HubSpot');
    }
  }

  private async exchangePipedriveCode(code: string, userId: string): Promise<void> {
    try {
      const clientId = process.env.PIPEDRIVE_CLIENT_ID;
      const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;
      const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI || 'http://localhost:5000/auth/pipedrive/callback';

      const response = await fetch('https://oauth.pipedrive.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          code
        })
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(`Pipedrive OAuth error: ${tokens.error_description || tokens.error}`);
      }

      await storage.createIntegration({
        userId,
        type: 'crm',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
        settings: {
          provider: 'pipedrive',
          apiDomain: tokens.api_domain
        }
      });
    } catch (error) {
      console.error('Pipedrive token exchange failed:', error);
      throw new Error('Failed to connect Pipedrive');
    }
  }

  async syncContactToCRM(userId: string, contactData: {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    leadScore?: number;
    source?: string;
    notes?: string;
  }) {
    const integrations = await storage.getIntegrations(userId);
    const crmIntegration = integrations.find(i => i.type === 'crm' && i.isActive);

    if (!crmIntegration) {
      throw new Error('No CRM integration found');
    }

    const platform = crmIntegration.settings?.provider;

    try {
      let result;
      switch (platform) {
        case 'salesforce':
          result = await this.syncToSalesforce(crmIntegration, contactData);
          break;
        case 'hubspot':
          result = await this.syncToHubSpot(crmIntegration, contactData);
          break;
        case 'pipedrive':
          result = await this.syncToPipedrive(crmIntegration, contactData);
          break;
        default:
          throw new Error(`Unsupported CRM platform: ${platform}`);
      }

      // Log the sync
      await storage.createCrmSyncLog({
        userId,
        emailId: contactData.email,
        crmType: platform,
        syncStatus: 'success',
        syncData: result
      });

      return result;
    } catch (error) {
      // Log the failed sync
      await storage.createCrmSyncLog({
        userId,
        emailId: contactData.email,
        crmType: platform,
        syncStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private async syncToSalesforce(integration: any, contactData: any) {
    const instanceUrl = integration.settings.instanceUrl;
    const accessToken = integration.accessToken;

    // Check if contact exists
    const searchResponse = await fetch(`${instanceUrl}/services/data/v57.0/query?q=SELECT Id FROM Contact WHERE Email='${contactData.email}'`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const searchResult = await searchResponse.json();

    if (searchResult.records && searchResult.records.length > 0) {
      // Update existing contact
      const contactId = searchResult.records[0].Id;
      const updateResponse = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/Contact/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          FirstName: contactData.firstName,
          LastName: contactData.lastName,
          Email: contactData.email,
          Phone: contactData.phone,
          Account: { Name: contactData.company },
          Description: contactData.notes
        })
      });

      return { action: 'updated', contactId, success: updateResponse.ok };
    } else {
      // Create new contact
      const createResponse = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/Contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          FirstName: contactData.firstName,
          LastName: contactData.lastName,
          Email: contactData.email,
          Phone: contactData.phone,
          Account: { Name: contactData.company },
          Description: contactData.notes,
          LeadSource: contactData.source || 'Email'
        })
      });

      const result = await createResponse.json();
      return { action: 'created', contactId: result.id, success: createResponse.ok };
    }
  }

  private async syncToHubSpot(integration: any, contactData: any) {
    const accessToken = integration.accessToken;

    const contactPayload = {
      properties: {
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        company: contactData.company,
        phone: contactData.phone,
        lifecyclestage: 'lead',
        hs_lead_status: 'NEW'
      }
    };

    // Try to create or update contact
    const response = await fetch(`${this.hubspotApiBase}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactPayload)
    });

    if (response.status === 409) {
      // Contact exists, update it
      const searchResponse = await fetch(`${this.hubspotApiBase}/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: contactData.email
            }]
          }]
        })
      });

      const searchResult = await searchResponse.json();
      if (searchResult.results.length > 0) {
        const contactId = searchResult.results[0].id;
        const updateResponse = await fetch(`${this.hubspotApiBase}/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactPayload)
        });

        return { action: 'updated', contactId, success: updateResponse.ok };
      }
    }

    const result = await response.json();
    return { action: 'created', contactId: result.id, success: response.ok };
  }

  private async syncToPipedrive(integration: any, contactData: any) {
    const accessToken = integration.accessToken;
    const apiDomain = integration.settings.apiDomain;

    // Check if contact exists
    const searchResponse = await fetch(`${apiDomain}/api/v1/persons/search?term=${encodeURIComponent(contactData.email)}&api_token=${accessToken}`);
    const searchResult = await searchResponse.json();

    const personData = {
      name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
      email: [{ value: contactData.email, primary: true }],
      phone: contactData.phone ? [{ value: contactData.phone, primary: true }] : undefined,
      org_name: contactData.company
    };

    if (searchResult.data && searchResult.data.items.length > 0) {
      // Update existing contact
      const personId = searchResult.data.items[0].item.id;
      const updateResponse = await fetch(`${apiDomain}/api/v1/persons/${personId}?api_token=${accessToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personData)
      });

      const result = await updateResponse.json();
      return { action: 'updated', contactId: personId, success: updateResponse.ok };
    } else {
      // Create new contact
      const createResponse = await fetch(`${apiDomain}/api/v1/persons?api_token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personData)
      });

      const result = await createResponse.json();
      return { action: 'created', contactId: result.data?.id, success: createResponse.ok };
    }
  }

  async createDeal(userId: string, dealData: {
    title: string;
    contactEmail: string;
    value?: number;
    currency?: string;
    stage?: string;
    expectedCloseDate?: Date;
    notes?: string;
  }) {
    const integrations = await storage.getIntegrations(userId);
    const crmIntegration = integrations.find(i => i.type === 'crm' && i.isActive);

    if (!crmIntegration) {
      throw new Error('No CRM integration found');
    }

    const platform = crmIntegration.settings?.provider;

    switch (platform) {
      case 'salesforce':
        return this.createSalesforceDeal(crmIntegration, dealData);
      case 'hubspot':
        return this.createHubSpotDeal(crmIntegration, dealData);
      case 'pipedrive':
        return this.createPipedriveDeal(crmIntegration, dealData);
      default:
        throw new Error(`Unsupported CRM platform: ${platform}`);
    }
  }

  private async createSalesforceDeal(integration: any, dealData: any) {
    const instanceUrl = integration.settings.instanceUrl;
    const accessToken = integration.accessToken;

    const response = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: dealData.title,
        Amount: dealData.value,
        CloseDate: dealData.expectedCloseDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        StageName: dealData.stage || 'Prospecting',
        Description: dealData.notes
      })
    });

    const result = await response.json();
    return { dealId: result.id, success: response.ok };
  }

  private async createHubSpotDeal(integration: any, dealData: any) {
    const accessToken = integration.accessToken;

    const response = await fetch(`${this.hubspotApiBase}/crm/v3/objects/deals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          dealname: dealData.title,
          amount: dealData.value?.toString(),
          dealstage: dealData.stage || 'appointmentscheduled',
          closedate: dealData.expectedCloseDate?.toISOString(),
          pipeline: 'default'
        }
      })
    });

    const result = await response.json();
    return { dealId: result.id, success: response.ok };
  }

  private async createPipedriveDeal(integration: any, dealData: any) {
    const accessToken = integration.accessToken;
    const apiDomain = integration.settings.apiDomain;

    const response = await fetch(`${apiDomain}/api/v1/deals?api_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: dealData.title,
        value: dealData.value,
        currency: dealData.currency || 'USD',
        expected_close_date: dealData.expectedCloseDate?.toISOString().split('T')[0],
        notes: dealData.notes
      })
    });

    const result = await response.json();
    return { dealId: result.data?.id, success: response.ok };
  }

  async getCRMInsights(userId: string) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const crmIntegration = integrations.find(i => i.type === 'crm' && i.isActive);

      if (!crmIntegration) {
        return { connected: false };
      }

      const platform = crmIntegration.settings?.provider;
      
      // Get sync logs for insights
      const syncLogs = await storage.getCrmSyncLogs?.(userId) || [];
      
      const successfulSyncs = syncLogs.filter(log => log.syncStatus === 'success').length;
      const failedSyncs = syncLogs.filter(log => log.syncStatus === 'failed').length;
      
      return {
        connected: true,
        platform,
        syncStats: {
          successful: successfulSyncs,
          failed: failedSyncs,
          total: syncLogs.length,
          successRate: syncLogs.length > 0 ? (successfulSyncs / syncLogs.length) * 100 : 0
        },
        lastSync: syncLogs.length > 0 ? syncLogs[syncLogs.length - 1].createdAt : null
      };
    } catch (error) {
      console.error('Error getting CRM insights:', error);
      return { connected: false, error: 'Failed to get CRM insights' };
    }
  }
}