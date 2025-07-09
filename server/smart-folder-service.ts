import OpenAI from "openai";
import { storage } from "./storage";
import { 
  SmartFolder, 
  InsertSmartFolder, 
  FolderRule, 
  InsertFolderRule,
  EmailFolderAssignment,
  InsertEmailFolderAssignment,
  SimilarEmailGroup,
  InsertSimilarEmailGroup,
  EmailGroupMember,
  InsertEmailGroupMember,
  FolderSuggestion,
  InsertFolderSuggestion
} from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EmailData {
  id: string;
  subject: string;
  from: string;
  content: string;
  timestamp: Date;
  threadId?: string;
  labels?: string[];
  hasAttachments?: boolean;
}

export interface FolderStructureSuggestion {
  name: string;
  description: string;
  type: 'project' | 'client' | 'topic' | 'archive';
  color: string;
  icon: string;
  reasoning: string;
  confidence: number;
  triggerEmails: string[];
  autoCreateRules?: {
    senderDomains?: string[];
    subjectPatterns?: string[];
    keywords?: string[];
    threshold: number;
    days: number;
  };
}

export interface SimilarEmailGroupSuggestion {
  name: string;
  description: string;
  groupType: 'sender' | 'subject_pattern' | 'content_similarity' | 'thread';
  emails: string[];
  similarityScore: number;
  suggestedActions: string[];
}

export class SmartFolderService {
  /**
   * Analyze email patterns and suggest folder structures
   */
  async analyzeFolderStructure(userId: string, emails: EmailData[]): Promise<FolderStructureSuggestion[]> {
    try {
      // Prepare email data for AI analysis
      const emailSummary = emails.slice(0, 50).map(email => ({
        subject: email.subject,
        from: email.from,
        hasAttachments: email.hasAttachments,
        timestamp: email.timestamp.toISOString(),
        contentPreview: email.content.substring(0, 200)
      }));

      const prompt = `
        Analyze the following email data and suggest optimal folder structures for email organization.
        Focus on identifying patterns in senders, projects, clients, and topics.
        
        Email Data:
        ${JSON.stringify(emailSummary, null, 2)}
        
        Please suggest 3-5 folder structures that would help organize these emails effectively.
        For each folder, provide:
        - A clear, professional name
        - Description of what emails should go in this folder
        - Type: project, client, topic, or archive
        - Color suggestion (hex code)
        - Icon suggestion (from lucide-react icon set)
        - Reasoning for why this folder is needed
        - Confidence score (0-1)
        - Auto-creation rules if applicable

        Respond with JSON in this format:
        {
          "suggestions": [
            {
              "name": "Project Alpha",
              "description": "All emails related to Project Alpha development",
              "type": "project",
              "color": "#3b82f6",
              "icon": "folder-open",
              "reasoning": "Found 8 emails with 'Project Alpha' in subject line",
              "confidence": 0.9,
              "triggerEmails": ["email1", "email2"],
              "autoCreateRules": {
                "subjectPatterns": ["Project Alpha", "Alpha Project"],
                "threshold": 3,
                "days": 7
              }
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Error analyzing folder structure:', error);
      return [];
    }
  }

  /**
   * Create folder suggestions and store them for user review
   */
  async createFolderSuggestions(userId: string, suggestions: FolderStructureSuggestion[]): Promise<FolderSuggestion[]> {
    const created: FolderSuggestion[] = [];

    for (const suggestion of suggestions) {
      const folderSuggestion: InsertFolderSuggestion = {
        userId,
        suggestedName: suggestion.name,
        suggestedDescription: suggestion.description,
        suggestedColor: suggestion.color,
        suggestedIcon: suggestion.icon,
        folderType: suggestion.type,
        reasoning: suggestion.reasoning,
        triggerEmails: suggestion.triggerEmails,
        confidence: suggestion.confidence,
        status: 'pending'
      };

      const result = await storage.createFolderSuggestion(folderSuggestion);
      created.push(result);
    }

    return created;
  }

  /**
   * Accept a folder suggestion and create the actual folder
   */
  async acceptFolderSuggestion(suggestionId: number, userId: string): Promise<SmartFolder> {
    const suggestion = await storage.getFolderSuggestion(suggestionId);
    if (!suggestion || suggestion.userId !== userId) {
      throw new Error('Folder suggestion not found');
    }

    // Create the smart folder
    const folderData: InsertSmartFolder = {
      userId,
      name: suggestion.suggestedName,
      description: suggestion.suggestedDescription || '',
      color: suggestion.suggestedColor || '#3b82f6',
      icon: suggestion.suggestedIcon || 'folder',
      isAiSuggested: true,
      folderType: suggestion.folderType,
      isActive: true
    };

    const folder = await storage.createSmartFolder(folderData);

    // Update suggestion status
    await storage.updateFolderSuggestion(suggestionId, {
      status: 'accepted',
      implementedFolderId: folder.id
    });

    return folder;
  }

  /**
   * Auto-create project folders based on email thread criteria
   */
  async checkAutoCreateFolders(userId: string, newEmail: EmailData): Promise<SmartFolder[]> {
    const createdFolders: SmartFolder[] = [];

    try {
      // Get active folder rules for auto-creation
      const folderRules = await storage.getFolderRulesByUser(userId);
      const autoCreateRules = folderRules.filter(rule => 
        rule.isActive && 
        rule.autoCreateThreshold && 
        rule.autoCreateDays
      );

      for (const rule of autoCreateRules) {
        // Check if conditions match the new email
        if (await this.emailMatchesRule(newEmail, rule)) {
          // Count recent matching emails
          const matchingEmails = await this.getMatchingEmailsForRule(userId, rule);
          
          if (matchingEmails.length >= (rule.autoCreateThreshold || 3)) {
            // Auto-create folder
            const folderName = this.generateFolderNameFromRule(rule, newEmail);
            
            const folderData: InsertSmartFolder = {
              userId,
              name: folderName,
              description: `Auto-created folder based on email patterns: ${rule.name}`,
              folderType: 'project',
              isAutoCreate: true,
              isActive: true,
              color: '#10b981',
              icon: 'folder-plus'
            };

            const folder = await storage.createSmartFolder(folderData);
            
            // Update rule to link with folder
            await storage.updateFolderRule(rule.id, {
              folderId: folder.id,
              lastTriggered: new Date(),
              matchCount: (rule.matchCount || 0) + 1
            });

            // Move matching emails to the new folder
            for (const emailId of matchingEmails) {
              await this.assignEmailToFolder(userId, emailId, folder.id, 'auto');
            }

            createdFolders.push(folder);
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-create folders:', error);
    }

    return createdFolders;
  }

  /**
   * Group similar emails for batch processing
   */
  async findSimilarEmailGroups(userId: string, emails: EmailData[]): Promise<SimilarEmailGroupSuggestion[]> {
    try {
      // Group by sender domain
      const senderGroups = this.groupBySender(emails);
      
      // Group by subject pattern
      const subjectGroups = await this.groupBySubjectPattern(emails);
      
      // Group by content similarity (using AI)
      const contentGroups = await this.groupByContentSimilarity(emails);

      const suggestions: SimilarEmailGroupSuggestion[] = [];

      // Process sender groups
      for (const [sender, groupEmails] of senderGroups.entries()) {
        if (groupEmails.length >= 3) {
          suggestions.push({
            name: `Emails from ${sender}`,
            description: `${groupEmails.length} emails from the same sender`,
            groupType: 'sender',
            emails: groupEmails.map(e => e.id),
            similarityScore: 1.0,
            suggestedActions: ['Archive all', 'Mark as read', 'Create sender rule']
          });
        }
      }

      // Process subject groups
      for (const group of subjectGroups) {
        suggestions.push(group);
      }

      // Process content groups
      for (const group of contentGroups) {
        suggestions.push(group);
      }

      return suggestions.slice(0, 10); // Limit to top 10 suggestions
    } catch (error) {
      console.error('Error finding similar email groups:', error);
      return [];
    }
  }

  /**
   * Create similar email groups for batch processing
   */
  async createSimilarEmailGroups(userId: string, suggestions: SimilarEmailGroupSuggestion[]): Promise<SimilarEmailGroup[]> {
    const created: SimilarEmailGroup[] = [];

    for (const suggestion of suggestions) {
      const groupData: InsertSimilarEmailGroup = {
        userId,
        name: suggestion.name,
        description: suggestion.description,
        groupType: suggestion.groupType,
        similarityThreshold: suggestion.similarityScore,
        emailCount: suggestion.emails.length,
        suggestedActions: suggestion.suggestedActions,
        isActive: true
      };

      const group = await storage.createSimilarEmailGroup(groupData);

      // Add emails to the group
      for (const emailId of suggestion.emails) {
        const memberData: InsertEmailGroupMember = {
          userId,
          groupId: group.id,
          emailId,
          similarityScore: suggestion.similarityScore,
          addedBy: 'system'
        };
        await storage.createEmailGroupMember(memberData);
      }

      created.push(group);
    }

    return created;
  }

  /**
   * Assign email to a folder
   */
  async assignEmailToFolder(
    userId: string, 
    emailId: string, 
    folderId: number, 
    assignmentType: 'manual' | 'auto' | 'ai_suggested',
    confidence?: number
  ): Promise<EmailFolderAssignment> {
    const assignmentData: InsertEmailFolderAssignment = {
      userId,
      emailId,
      folderId,
      assignmentType,
      assignedBy: assignmentType === 'manual' ? userId : 'system',
      confidence
    };

    const assignment = await storage.createEmailFolderAssignment(assignmentData);

    // Update folder email count
    await storage.incrementFolderEmailCount(folderId);

    return assignment;
  }

  // Helper methods

  private async emailMatchesRule(email: EmailData, rule: FolderRule): Promise<boolean> {
    const conditions = rule.conditions as any;
    if (!conditions) return false;

    // Check sender conditions
    if (conditions.senders && conditions.senders.length > 0) {
      if (!conditions.senders.some((sender: string) => 
        email.from.toLowerCase().includes(sender.toLowerCase())
      )) {
        return false;
      }
    }

    // Check subject conditions
    if (conditions.subjectPatterns && conditions.subjectPatterns.length > 0) {
      if (!conditions.subjectPatterns.some((pattern: string) => 
        email.subject.toLowerCase().includes(pattern.toLowerCase())
      )) {
        return false;
      }
    }

    // Check keyword conditions
    if (conditions.keywords && conditions.keywords.length > 0) {
      if (!conditions.keywords.some((keyword: string) => 
        email.content.toLowerCase().includes(keyword.toLowerCase()) ||
        email.subject.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return false;
      }
    }

    return true;
  }

  private async getMatchingEmailsForRule(userId: string, rule: FolderRule): Promise<string[]> {
    // This would typically query the email provider API
    // For now, return a mock implementation
    return [];
  }

  private generateFolderNameFromRule(rule: FolderRule, email: EmailData): string {
    const conditions = rule.conditions as any;
    
    if (conditions?.subjectPatterns?.length > 0) {
      const pattern = conditions.subjectPatterns[0];
      return `Project: ${pattern}`;
    }
    
    if (conditions?.keywords?.length > 0) {
      const keyword = conditions.keywords[0];
      return `Topic: ${keyword}`;
    }
    
    const domain = email.from.split('@')[1];
    return `Emails from ${domain}`;
  }

  private groupBySender(emails: EmailData[]): Map<string, EmailData[]> {
    const groups = new Map<string, EmailData[]>();
    
    for (const email of emails) {
      const sender = email.from.toLowerCase();
      if (!groups.has(sender)) {
        groups.set(sender, []);
      }
      groups.get(sender)!.push(email);
    }
    
    return groups;
  }

  private async groupBySubjectPattern(emails: EmailData[]): Promise<SimilarEmailGroupSuggestion[]> {
    const patterns = new Map<string, EmailData[]>();
    
    for (const email of emails) {
      // Extract common patterns from subject lines
      const cleaned = email.subject
        .replace(/^(re:|fwd?:|fw:)\s*/i, '')
        .replace(/\[.*?\]/g, '')
        .trim()
        .toLowerCase();
      
      if (cleaned.length > 10) {
        if (!patterns.has(cleaned)) {
          patterns.set(cleaned, []);
        }
        patterns.get(cleaned)!.push(email);
      }
    }
    
    const suggestions: SimilarEmailGroupSuggestion[] = [];
    
    for (const [pattern, groupEmails] of patterns.entries()) {
      if (groupEmails.length >= 2) {
        suggestions.push({
          name: `Subject: ${pattern}`,
          description: `${groupEmails.length} emails with similar subject line`,
          groupType: 'subject_pattern',
          emails: groupEmails.map(e => e.id),
          similarityScore: 0.9,
          suggestedActions: ['Group in folder', 'Create thread', 'Archive all']
        });
      }
    }
    
    return suggestions;
  }

  private async groupByContentSimilarity(emails: EmailData[]): Promise<SimilarEmailGroupSuggestion[]> {
    if (emails.length < 10) return []; // Need enough emails for meaningful analysis
    
    try {
      const emailContents = emails.slice(0, 20).map(email => ({
        id: email.id,
        content: email.content.substring(0, 500) // Limit content for analysis
      }));

      const prompt = `
        Analyze the following email contents and identify groups of similar emails.
        Look for emails that discuss similar topics, projects, or themes.
        
        Email Contents:
        ${JSON.stringify(emailContents, null, 2)}
        
        Identify 2-3 groups of similar emails where each group has at least 3 emails.
        
        Respond with JSON in this format:
        {
          "groups": [
            {
              "name": "Group name",
              "description": "What makes these emails similar",
              "emailIds": ["id1", "id2", "id3"],
              "similarityScore": 0.85,
              "suggestedActions": ["action1", "action2"]
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"groups": []}');
      
      return (result.groups || []).map((group: any) => ({
        name: group.name,
        description: group.description,
        groupType: 'content_similarity' as const,
        emails: group.emailIds,
        similarityScore: group.similarityScore,
        suggestedActions: group.suggestedActions || ['Group in folder', 'Archive all']
      }));
    } catch (error) {
      console.error('Error in content similarity analysis:', error);
      return [];
    }
  }
}

export const smartFolderService = new SmartFolderService();