import axios from 'axios';
import { storage } from '../storage';

export class ProjectManagementService {
  // Trello Integration
  async createTrelloCard(userId: string, cardData: {
    listId: string;
    name: string;
    desc?: string;
    due?: Date;
    labels?: string[];
  }) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const trelloIntegration = integrations.find(i => i.type === 'trello');
      
      if (!trelloIntegration?.accessToken) {
        throw new Error('Trello integration not configured');
      }

      const params = new URLSearchParams({
        key: process.env.TRELLO_API_KEY || '',
        token: trelloIntegration.accessToken,
        name: cardData.name,
        idList: cardData.listId
      });

      if (cardData.desc) params.append('desc', cardData.desc);
      if (cardData.due) params.append('due', cardData.due.toISOString());

      const response = await axios.post(
        `https://api.trello.com/1/cards?${params.toString()}`
      );

      return {
        success: true,
        cardId: response.data.id,
        url: response.data.url
      };
    } catch (error: any) {
      throw new Error(`Failed to create Trello card: ${error.message}`);
    }
  }

  // Asana Integration
  async createAsanaTask(userId: string, taskData: {
    projectId: string;
    name: string;
    notes?: string;
    due_on?: Date;
    assignee?: string;
  }) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const asanaIntegration = integrations.find(i => i.type === 'asana');
      
      if (!asanaIntegration?.accessToken) {
        throw new Error('Asana integration not configured');
      }

      const data: any = {
        data: {
          name: taskData.name,
          projects: [taskData.projectId]
        }
      };

      if (taskData.notes) data.data.notes = taskData.notes;
      if (taskData.due_on) data.data.due_on = taskData.due_on.toISOString().split('T')[0];
      if (taskData.assignee) data.data.assignee = taskData.assignee;

      const response = await axios.post(
        'https://app.asana.com/api/1.0/tasks',
        data,
        {
          headers: {
            'Authorization': `Bearer ${asanaIntegration.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        taskId: response.data.data.gid,
        permalink: response.data.data.permalink_url
      };
    } catch (error: any) {
      throw new Error(`Failed to create Asana task: ${error.message}`);
    }
  }

  // Monday.com Integration
  async createMondayItem(userId: string, itemData: {
    boardId: string;
    itemName: string;
    columnValues?: Record<string, any>;
  }) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const mondayIntegration = integrations.find(i => i.type === 'monday');
      
      if (!mondayIntegration?.accessToken) {
        throw new Error('Monday.com integration not configured');
      }

      const mutation = `
        mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON) {
          create_item (
            board_id: $boardId,
            item_name: $itemName,
            column_values: $columnValues
          ) {
            id
            name
            url
          }
        }
      `;

      const response = await axios.post(
        'https://api.monday.com/v2',
        {
          query: mutation,
          variables: {
            boardId: itemData.boardId,
            itemName: itemData.itemName,
            columnValues: JSON.stringify(itemData.columnValues || {})
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${mondayIntegration.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        itemId: response.data.data.create_item.id,
        url: response.data.data.create_item.url
      };
    } catch (error: any) {
      throw new Error(`Failed to create Monday.com item: ${error.message}`);
    }
  }

  // ClickUp Integration
  async createClickUpTask(userId: string, taskData: {
    listId: string;
    name: string;
    description?: string;
    priority?: number;
    dueDate?: Date;
    assignees?: string[];
  }) {
    try {
      const integrations = await storage.getIntegrations(userId);
      const clickupIntegration = integrations.find(i => i.type === 'clickup');
      
      if (!clickupIntegration?.accessToken) {
        throw new Error('ClickUp integration not configured');
      }

      const data: any = {
        name: taskData.name
      };

      if (taskData.description) data.description = taskData.description;
      if (taskData.priority) data.priority = taskData.priority;
      if (taskData.dueDate) data.due_date = taskData.dueDate.getTime();
      if (taskData.assignees) data.assignees = taskData.assignees;

      const response = await axios.post(
        `https://api.clickup.com/api/v2/list/${taskData.listId}/task`,
        data,
        {
          headers: {
            'Authorization': clickupIntegration.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        taskId: response.data.id,
        url: response.data.url
      };
    } catch (error: any) {
      throw new Error(`Failed to create ClickUp task: ${error.message}`);
    }
  }

  // Generic task creation from email
  async createTaskFromEmail(userId: string, emailData: {
    sender: string;
    subject: string;
    body: string;
    priority?: string;
  }, platform: string, config: any) {
    try {
      const taskName = `Follow up: ${emailData.subject}`;
      const taskDescription = `
Email from: ${emailData.sender}
Subject: ${emailData.subject}

Original message:
${emailData.body.substring(0, 500)}...
      `;

      switch (platform) {
        case 'trello':
          return await this.createTrelloCard(userId, {
            listId: config.listId,
            name: taskName,
            desc: taskDescription
          });

        case 'asana':
          return await this.createAsanaTask(userId, {
            projectId: config.projectId,
            name: taskName,
            notes: taskDescription
          });

        case 'monday':
          return await this.createMondayItem(userId, {
            boardId: config.boardId,
            itemName: taskName,
            columnValues: {
              text: taskDescription,
              priority: emailData.priority || 'Medium'
            }
          });

        case 'clickup':
          return await this.createClickUpTask(userId, {
            listId: config.listId,
            name: taskName,
            description: taskDescription,
            priority: this.mapPriorityToClickUp(emailData.priority)
          });

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to create task from email: ${error.message}`);
    }
  }

  private mapPriorityToClickUp(priority?: string): number {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 1;
      case 'high': return 2;
      case 'normal': return 3;
      case 'low': return 4;
      default: return 3;
    }
  }

  async getAvailablePlatforms() {
    return [
      {
        id: 'trello',
        name: 'Trello',
        description: 'Visual project management with boards, lists, and cards',
        features: ['Card Creation', 'Due Dates', 'Labels', 'Checklists'],
        authType: 'oauth'
      },
      {
        id: 'asana',
        name: 'Asana',
        description: 'Team collaboration and project tracking platform',
        features: ['Task Creation', 'Project Management', 'Team Assignments', 'Due Dates'],
        authType: 'oauth'
      },
      {
        id: 'monday',
        name: 'Monday.com',
        description: 'Work operating system for teams and projects',
        features: ['Item Creation', 'Custom Columns', 'Automation', 'Timeline View'],
        authType: 'oauth'
      },
      {
        id: 'clickup',
        name: 'ClickUp',
        description: 'All-in-one productivity and project management suite',
        features: ['Task Management', 'Time Tracking', 'Goals', 'Documents'],
        authType: 'api_key'
      },
      {
        id: 'jira',
        name: 'Jira',
        description: 'Issue tracking and project management for software teams',
        features: ['Issue Creation', 'Sprint Planning', 'Reporting', 'Workflows'],
        authType: 'oauth'
      }
    ];
  }

  async getProjectManagementInsights(userId: string) {
    try {
      const analytics = await storage.getUsageAnalytics(userId);
      const pmUsage = analytics.filter(a => 
        a.eventType.includes('trello') || 
        a.eventType.includes('asana') || 
        a.eventType.includes('monday') ||
        a.eventType.includes('clickup')
      );

      const integrations = await storage.getIntegrations(userId);
      const pmIntegrations = integrations.filter(i => 
        ['trello', 'asana', 'monday', 'clickup', 'jira'].includes(i.type)
      );

      return {
        connectedPlatforms: pmIntegrations.length,
        totalTasksCreated: pmUsage.length,
        recentActivity: pmUsage.slice(-10).map(usage => ({
          platform: this.extractPlatformFromEvent(usage.eventType),
          action: usage.eventType,
          timestamp: usage.createdAt
        })),
        platformBreakdown: this.calculatePlatformUsage(pmUsage)
      };
    } catch (error: any) {
      throw new Error(`Failed to get project management insights: ${error.message}`);
    }
  }

  private extractPlatformFromEvent(eventType: string): string {
    if (eventType.includes('trello')) return 'trello';
    if (eventType.includes('asana')) return 'asana';
    if (eventType.includes('monday')) return 'monday';
    if (eventType.includes('clickup')) return 'clickup';
    return 'unknown';
  }

  private calculatePlatformUsage(usage: any[]) {
    const counts: Record<string, number> = {};
    usage.forEach(u => {
      const platform = this.extractPlatformFromEvent(u.eventType);
      counts[platform] = (counts[platform] || 0) + 1;
    });

    return Object.entries(counts).map(([platform, count]) => ({
      platform,
      count,
      percentage: Math.round((count / usage.length) * 100)
    }));
  }
}