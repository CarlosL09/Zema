import { notion, NOTION_PAGE_ID, findDatabaseByTitle, createDatabaseIfNotExists } from '../notion';
import { storage } from '../storage';

export class NotionService {
  async syncEmailToNotion(userId: string, emailData: {
    sender: string;
    subject: string;
    body: string;
    receivedDate: Date;
    priority?: string;
  }) {
    try {
      // Find or create Email Log database
      const emailDb = await createDatabaseIfNotExists("Email Log", {
        Sender: { email: {} },
        Subject: { title: {} },
        Body: { rich_text: {} },
        "Received Date": { date: {} },
        Priority: {
          select: {
            options: [
              { name: "High", color: "red" },
              { name: "Medium", color: "yellow" },
              { name: "Low", color: "green" }
            ]
          }
        },
        Status: {
          select: {
            options: [
              { name: "Unread", color: "gray" },
              { name: "Read", color: "blue" },
              { name: "Replied", color: "green" },
              { name: "Archived", color: "brown" }
            ]
          }
        }
      });

      // Create page in the database
      await notion.pages.create({
        parent: {
          database_id: emailDb.id
        },
        properties: {
          Sender: {
            email: emailData.sender
          },
          Subject: {
            title: [
              {
                text: {
                  content: emailData.subject
                }
              }
            ]
          },
          Body: {
            rich_text: [
              {
                text: {
                  content: emailData.body.substring(0, 2000) // Notion has text limits
                }
              }
            ]
          },
          "Received Date": {
            date: {
              start: emailData.receivedDate.toISOString()
            }
          },
          Priority: {
            select: {
              name: emailData.priority || "Medium"
            }
          },
          Status: {
            select: {
              name: "Unread"
            }
          }
        }
      });

      return { success: true, message: 'Email synced to Notion' };
    } catch (error) {
      throw new Error(`Failed to sync email to Notion: ${error.message}`);
    }
  }

  async createTaskFromEmail(userId: string, taskData: {
    title: string;
    description: string;
    dueDate?: Date;
    priority?: string;
    emailContext?: any;
  }) {
    try {
      // Find or create Tasks database
      const tasksDb = await createDatabaseIfNotExists("Tasks", {
        Title: { title: {} },
        Description: { rich_text: {} },
        "Due Date": { date: {} },
        Priority: {
          select: {
            options: [
              { name: "High", color: "red" },
              { name: "Medium", color: "yellow" },
              { name: "Low", color: "green" }
            ]
          }
        },
        Status: {
          select: {
            options: [
              { name: "To Do", color: "gray" },
              { name: "In Progress", color: "blue" },
              { name: "Done", color: "green" }
            ]
          }
        },
        "Created From": {
          select: {
            options: [
              { name: "Email", color: "blue" },
              { name: "Manual", color: "gray" },
              { name: "AI Suggestion", color: "purple" }
            ]
          }
        }
      });

      const properties: any = {
        Title: {
          title: [
            {
              text: {
                content: taskData.title
              }
            }
          ]
        },
        Description: {
          rich_text: [
            {
              text: {
                content: taskData.description
              }
            }
          ]
        },
        Priority: {
          select: {
            name: taskData.priority || "Medium"
          }
        },
        Status: {
          select: {
            name: "To Do"
          }
        },
        "Created From": {
          select: {
            name: "Email"
          }
        }
      };

      if (taskData.dueDate) {
        properties["Due Date"] = {
          date: {
            start: taskData.dueDate.toISOString()
          }
        };
      }

      await notion.pages.create({
        parent: {
          database_id: tasksDb.id
        },
        properties
      });

      return { success: true, message: 'Task created in Notion' };
    } catch (error) {
      throw new Error(`Failed to create task in Notion: ${error.message}`);
    }
  }

  async syncContactToNotion(userId: string, contactData: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
    tags?: string[];
  }) {
    try {
      // Find or create Contacts database
      const contactsDb = await createDatabaseIfNotExists("Contacts", {
        Name: { title: {} },
        Email: { email: {} },
        Company: { rich_text: {} },
        Phone: { phone_number: {} },
        Notes: { rich_text: {} },
        Tags: {
          multi_select: {
            options: [
              { name: "Client", color: "blue" },
              { name: "Prospect", color: "yellow" },
              { name: "Partner", color: "green" },
              { name: "Vendor", color: "orange" },
              { name: "Personal", color: "purple" }
            ]
          }
        },
        "First Contact": { date: {} },
        "Last Communication": { date: {} }
      });

      const properties: any = {
        Name: {
          title: [
            {
              text: {
                content: contactData.name
              }
            }
          ]
        },
        Email: {
          email: contactData.email
        },
        "First Contact": {
          date: {
            start: new Date().toISOString()
          }
        },
        "Last Communication": {
          date: {
            start: new Date().toISOString()
          }
        }
      };

      if (contactData.company) {
        properties.Company = {
          rich_text: [
            {
              text: {
                content: contactData.company
              }
            }
          ]
        };
      }

      if (contactData.phone) {
        properties.Phone = {
          phone_number: contactData.phone
        };
      }

      if (contactData.notes) {
        properties.Notes = {
          rich_text: [
            {
              text: {
                content: contactData.notes
              }
            }
          ]
        };
      }

      if (contactData.tags && contactData.tags.length > 0) {
        properties.Tags = {
          multi_select: contactData.tags.map(tag => ({ name: tag }))
        };
      }

      await notion.pages.create({
        parent: {
          database_id: contactsDb.id
        },
        properties
      });

      return { success: true, message: 'Contact synced to Notion' };
    } catch (error) {
      throw new Error(`Failed to sync contact to Notion: ${error.message}`);
    }
  }

  async createMeetingNotes(userId: string, meetingData: {
    title: string;
    date: Date;
    attendees: string[];
    agenda?: string;
    notes?: string;
    actionItems?: string[];
  }) {
    try {
      // Find or create Meeting Notes database
      const meetingDb = await createDatabaseIfNotExists("Meeting Notes", {
        Title: { title: {} },
        Date: { date: {} },
        Attendees: { multi_select: { options: [] } },
        Agenda: { rich_text: {} },
        Notes: { rich_text: {} },
        "Action Items": { rich_text: {} },
        Status: {
          select: {
            options: [
              { name: "Scheduled", color: "yellow" },
              { name: "Completed", color: "green" },
              { name: "Cancelled", color: "red" }
            ]
          }
        }
      });

      const properties: any = {
        Title: {
          title: [
            {
              text: {
                content: meetingData.title
              }
            }
          ]
        },
        Date: {
          date: {
            start: meetingData.date.toISOString()
          }
        },
        Attendees: {
          multi_select: meetingData.attendees.map(attendee => ({ name: attendee }))
        },
        Status: {
          select: {
            name: "Scheduled"
          }
        }
      };

      if (meetingData.agenda) {
        properties.Agenda = {
          rich_text: [
            {
              text: {
                content: meetingData.agenda
              }
            }
          ]
        };
      }

      if (meetingData.notes) {
        properties.Notes = {
          rich_text: [
            {
              text: {
                content: meetingData.notes
              }
            }
          ]
        };
      }

      if (meetingData.actionItems && meetingData.actionItems.length > 0) {
        properties["Action Items"] = {
          rich_text: [
            {
              text: {
                content: meetingData.actionItems.join('\n• ')
              }
            }
          ]
        };
      }

      await notion.pages.create({
        parent: {
          database_id: meetingDb.id
        },
        properties
      });

      return { success: true, message: 'Meeting notes created in Notion' };
    } catch (error) {
      throw new Error(`Failed to create meeting notes in Notion: ${error.message}`);
    }
  }

  async getNotionDatabases(userId: string) {
    try {
      // Get all databases under the main page
      const databases = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      while (hasMore) {
        const response = await notion.blocks.children.list({
          block_id: NOTION_PAGE_ID,
          start_cursor: startCursor,
        });

        for (const block of response.results) {
          if (block.type === "child_database") {
            try {
              const databaseInfo = await notion.databases.retrieve({
                database_id: block.id,
              });
              databases.push({
                id: databaseInfo.id,
                title: databaseInfo.title?.[0]?.plain_text || 'Untitled Database',
                properties: Object.keys(databaseInfo.properties || {}),
                created: databaseInfo.created_time,
                lastEdited: databaseInfo.last_edited_time
              });
            } catch (error) {
              console.error(`Error retrieving database ${block.id}:`, error);
            }
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
      }

      return databases;
    } catch (error) {
      throw new Error(`Failed to get Notion databases: ${error.message}`);
    }
  }

  async getNotionInsights(userId: string) {
    try {
      const databases = await this.getNotionDatabases(userId);
      
      // Get usage analytics for Notion
      const analytics = await storage.getUsageAnalytics(userId);
      const notionUsage = analytics.filter(a => a.eventType.includes('notion'));

      return {
        totalDatabases: databases.length,
        availableDatabases: databases.map(db => ({
          name: db.title,
          properties: db.properties.length,
          lastUpdated: db.lastEdited
        })),
        recentActivity: notionUsage.slice(-10).map(usage => ({
          action: usage.eventType,
          timestamp: usage.createdAt
        })),
        integrationHealth: databases.length > 0 ? 'connected' : 'setup_required'
      };
    } catch (error) {
      throw new Error(`Failed to get Notion insights: ${error.message}`);
    }
  }

  async processNotionWebhook(userId: string, payload: any) {
    try {
      // Track webhook usage
      await storage.trackUsage({
        userId,
        eventType: 'notion_webhook_received',
        metadata: {
          action: payload.action || 'webhook_received',
          timestamp: new Date().toISOString()
        }
      });

      // Process different webhook events
      switch (payload.action) {
        case 'database_updated':
          return await this.handleDatabaseUpdate(userId, payload.data);
        case 'page_created':
          return await this.handlePageCreated(userId, payload.data);
        default:
          return { success: true, message: 'Webhook processed' };
      }
    } catch (error) {
      throw new Error(`Failed to process Notion webhook: ${error.message}`);
    }
  }

  private async handleDatabaseUpdate(userId: string, data: any) {
    // Handle database updates - could trigger email notifications
    return { success: true, message: 'Database update processed' };
  }

  private async handlePageCreated(userId: string, data: any) {
    // Handle new page creation - could trigger automations
    return { success: true, message: 'Page creation processed' };
  }
}