import axios from 'axios';
import { storage } from '../storage';

export class AirtableService {
  private baseUrl = 'https://api.airtable.com/v0';

  async createRecord(userId: string, recordData: {
    baseId: string;
    tableId: string;
    fields: Record<string, any>;
  }) {
    try {
      // Get user's Airtable API key from integrations
      const integrations = await storage.getIntegrations(userId);
      const airtableIntegration = integrations.find(i => i.type === 'airtable');
      
      if (!airtableIntegration?.accessToken) {
        throw new Error('Airtable integration not configured');
      }

      const response = await axios.post(
        `${this.baseUrl}/${recordData.baseId}/${recordData.tableId}`,
        {
          fields: recordData.fields
        },
        {
          headers: {
            'Authorization': `Bearer ${airtableIntegration.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        recordId: response.data.id,
        data: response.data
      };
    } catch (error: any) {
      throw new Error(`Failed to create Airtable record: ${error.message}`);
    }
  }

  async syncEmailToAirtable(userId: string, emailData: {
    sender: string;
    subject: string;
    body: string;
    receivedDate: Date;
    priority?: string;
  }, config: {
    baseId: string;
    tableId: string;
  }) {
    try {
      const fields = {
        'Sender': emailData.sender,
        'Subject': emailData.subject,
        'Body': emailData.body.substring(0, 100000), // Airtable field limit
        'Received Date': emailData.receivedDate.toISOString(),
        'Priority': emailData.priority || 'Medium',
        'Status': 'New'
      };

      return await this.createRecord(userId, {
        baseId: config.baseId,
        tableId: config.tableId,
        fields
      });
    } catch (error: any) {
      throw new Error(`Failed to sync email to Airtable: ${error.message}`);
    }
  }

  async syncContactToAirtable(userId: string, contactData: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
  }, config: {
    baseId: string;
    tableId: string;
  }) {
    try {
      const fields: Record<string, any> = {
        'Name': contactData.name,
        'Email': contactData.email,
        'First Contact': new Date().toISOString(),
        'Status': 'Active'
      };

      if (contactData.company) fields['Company'] = contactData.company;
      if (contactData.phone) fields['Phone'] = contactData.phone;
      if (contactData.notes) fields['Notes'] = contactData.notes;

      return await this.createRecord(userId, {
        baseId: config.baseId,
        tableId: config.tableId,
        fields
      });
    } catch (error: any) {
      throw new Error(`Failed to sync contact to Airtable: ${error.message}`);
    }
  }

  async getAirtableBases(userId: string) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const airtableIntegration = integrations.find(i => i.type === 'airtable');
      
      if (!airtableIntegration?.accessToken) {
        throw new Error('Airtable integration not configured');
      }

      const response = await axios.get(`${this.baseUrl}/meta/bases`, {
        headers: {
          'Authorization': `Bearer ${airtableIntegration.accessToken}`
        }
      });

      return response.data.bases.map((base: any) => ({
        id: base.id,
        name: base.name,
        permissionLevel: base.permissionLevel
      }));
    } catch (error: any) {
      throw new Error(`Failed to get Airtable bases: ${error.message}`);
    }
  }

  async getAirtableTables(userId: string, baseId: string) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const airtableIntegration = integrations.find(i => i.type === 'airtable');
      
      if (!airtableIntegration?.accessToken) {
        throw new Error('Airtable integration not configured');
      }

      const response = await axios.get(`${this.baseUrl}/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${airtableIntegration.accessToken}`
        }
      });

      return response.data.tables.map((table: any) => ({
        id: table.id,
        name: table.name,
        primaryFieldId: table.primaryFieldId,
        fields: table.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type
        }))
      }));
    } catch (error: any) {
      throw new Error(`Failed to get Airtable tables: ${error.message}`);
    }
  }

  async getAirtableInsights(userId: string) {
    try {
      const analytics = await storage.getUsageAnalytics(userId);
      const airtableUsage = analytics.filter(a => a.eventType.includes('airtable'));

      return {
        totalRecords: airtableUsage.length,
        recentActivity: airtableUsage.slice(-10).map(usage => ({
          action: usage.eventType,
          timestamp: usage.createdAt
        })),
        integrationStatus: 'connected'
      };
    } catch (error: any) {
      throw new Error(`Failed to get Airtable insights: ${error.message}`);
    }
  }
}