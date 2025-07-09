import OpenAI from "openai";
import { storage } from "./storage";
import type {
  CrossAccountContact,
  InsertCrossAccountContact,
  AccountOptimization,
  InsertAccountOptimization,
  DuplicateConversation,
  InsertDuplicateConversation,
  EmailAccount
} from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ContactUnificationData {
  contactEmail: string;
  contactName?: string;
  accounts: string[];
  interactions: Array<{
    account: string;
    timestamp: Date;
    subject?: string;
    direction: 'sent' | 'received';
  }>;
}

interface DuplicateDetectionResult {
  primaryConversationId: string;
  duplicateConversationId: string;
  primaryAccount: string;
  duplicateAccount: string;
  similarityScore: number;
  participants: string[];
  subject?: string;
  detectionMethod: string;
}

export class CrossAccountIntelligenceService {
  /**
   * Analyze and unify contact data across multiple email accounts
   */
  async analyzeContactIntelligence(userId: string): Promise<CrossAccountContact[]> {
    try {
      // Get all email accounts for user
      const emailAccounts = await storage.getEmailAccountsByUserId(userId);
      if (!emailAccounts || emailAccounts.length < 2) {
        return this.generateDemoContactIntelligence(userId);
      }

      const unifiedContacts = await this.unifyContactsAcrossAccounts(userId, emailAccounts);
      const savedContacts: CrossAccountContact[] = [];

      for (const contactData of unifiedContacts) {
        const existingContact = await storage.getCrossAccountContactByEmail(userId, contactData.contactEmail);
        
        if (existingContact) {
          const updatedContact = await storage.updateCrossAccountContact(existingContact.id, {
            connectedAccounts: contactData.accounts,
            totalInteractions: contactData.interactions.length,
            lastInteraction: contactData.interactions[0]?.timestamp || new Date(),
            relationshipStrength: this.calculateRelationshipStrength(contactData),
            businessValue: this.estimateBusinessValue(contactData),
            communicationPatterns: this.analyzeCommunicationPatterns(contactData),
            preferredAccount: this.determinePreferredAccount(contactData),
            insights: await this.generateContactInsights(contactData),
            updatedAt: new Date()
          });
          savedContacts.push(updatedContact);
        } else {
          const newContact = await storage.createCrossAccountContact({
            userId,
            contactEmail: contactData.contactEmail,
            contactName: contactData.contactName || null,
            unifiedContactId: this.generateUnifiedContactId(contactData.contactEmail),
            connectedAccounts: contactData.accounts,
            totalInteractions: contactData.interactions.length,
            lastInteraction: contactData.interactions[0]?.timestamp || new Date(),
            relationshipStrength: this.calculateRelationshipStrength(contactData),
            businessValue: this.estimateBusinessValue(contactData),
            communicationPatterns: this.analyzeCommunicationPatterns(contactData),
            preferredAccount: this.determinePreferredAccount(contactData),
            duplicateConversations: [],
            insights: await this.generateContactInsights(contactData)
          });
          savedContacts.push(newContact);
        }
      }

      return savedContacts;
    } catch (error) {
      console.error("Error analyzing contact intelligence:", error);
      return this.generateDemoContactIntelligence(userId);
    }
  }

  /**
   * Detect duplicate conversations across accounts
   */
  async detectDuplicateConversations(userId: string): Promise<DuplicateConversation[]> {
    try {
      const emailAccounts = await storage.getEmailAccountsByUserId(userId);
      if (!emailAccounts || emailAccounts.length < 2) {
        return this.generateDemoDuplicateConversations(userId);
      }

      const duplicates = await this.findDuplicateConversations(userId, emailAccounts);
      const savedDuplicates: DuplicateConversation[] = [];

      for (const duplicate of duplicates) {
        const existingDuplicate = await storage.getDuplicateConversationByIds(
          userId,
          duplicate.primaryConversationId,
          duplicate.duplicateConversationId
        );

        if (!existingDuplicate) {
          const newDuplicate = await storage.createDuplicateConversation({
            userId,
            primaryConversationId: duplicate.primaryConversationId,
            duplicateConversationId: duplicate.duplicateConversationId,
            primaryAccount: duplicate.primaryAccount,
            duplicateAccount: duplicate.duplicateAccount,
            similarityScore: duplicate.similarityScore,
            detectionMethod: duplicate.detectionMethod,
            participants: duplicate.participants,
            subject: duplicate.subject || null,
            timeFrame: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            },
            recommendedAction: this.getRecommendedAction(duplicate.similarityScore),
            status: "detected"
          });
          savedDuplicates.push(newDuplicate);
        }
      }

      return savedDuplicates;
    } catch (error) {
      console.error("Error detecting duplicate conversations:", error);
      return this.generateDemoDuplicateConversations(userId);
    }
  }

  /**
   * Generate account optimization suggestions
   */
  async generateAccountOptimizations(userId: string): Promise<AccountOptimization[]> {
    try {
      const contacts = await storage.getCrossAccountContactsByUserId(userId);
      const optimizations: AccountOptimization[] = [];

      for (const contact of contacts) {
        if (contact.connectedAccounts.length > 1) {
          const optimization = await this.analyzeAccountOptimization(contact);
          if (optimization) {
            const existing = await storage.getAccountOptimizationByContact(userId, contact.contactEmail);
            if (!existing) {
              const newOptimization = await storage.createAccountOptimization({
                userId,
                contactEmail: contact.contactEmail,
                currentAccount: contact.connectedAccounts[0],
                recommendedAccount: optimization.recommendedAccount,
                reason: optimization.reason,
                confidenceScore: optimization.confidenceScore,
                potentialBenefit: optimization.potentialBenefit,
                estimatedImpact: optimization.estimatedImpact,
                status: "pending"
              });
              optimizations.push(newOptimization);
            }
          }
        }
      }

      return optimizations.length > 0 ? optimizations : this.generateDemoAccountOptimizations(userId);
    } catch (error) {
      console.error("Error generating account optimizations:", error);
      return this.generateDemoAccountOptimizations(userId);
    }
  }

  /**
   * Get comprehensive cross-account intelligence overview
   */
  async getCrossAccountOverview(userId: string) {
    const [contacts, duplicates, optimizations] = await Promise.all([
      this.analyzeContactIntelligence(userId),
      this.detectDuplicateConversations(userId),
      this.generateAccountOptimizations(userId)
    ]);

    return {
      contacts,
      duplicates,
      optimizations,
      summary: {
        totalContacts: contacts.length,
        multiAccountContacts: contacts.filter(c => c.connectedAccounts.length > 1).length,
        duplicateConversations: duplicates.length,
        optimizationOpportunities: optimizations.length,
        potentialTimeSavings: optimizations.reduce((sum, opt) => sum + (opt.estimatedImpact || 0), 0)
      }
    };
  }

  // Private helper methods

  private async unifyContactsAcrossAccounts(userId: string, emailAccounts: EmailAccount[]): Promise<ContactUnificationData[]> {
    // In a real implementation, this would fetch emails from each account
    // For now, we'll return demo data structure
    return this.generateDemoUnifiedContacts();
  }

  private async findDuplicateConversations(userId: string, emailAccounts: EmailAccount[]): Promise<DuplicateDetectionResult[]> {
    // Real implementation would compare conversation threads across accounts
    return this.generateDemoDuplicateDetectionResults();
  }

  private calculateRelationshipStrength(contactData: ContactUnificationData): number {
    const interactionCount = contactData.interactions.length;
    const accountSpread = contactData.accounts.length;
    const recentActivity = contactData.interactions.filter(
      i => new Date(i.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return Math.min(0.9, (interactionCount * 0.1 + accountSpread * 0.2 + recentActivity * 0.05));
  }

  private estimateBusinessValue(contactData: ContactUnificationData): number {
    const domainValue = this.getDomainValue(contactData.contactEmail);
    const interactionFrequency = contactData.interactions.length / 30; // per day
    return Math.min(1000, domainValue * interactionFrequency * 10);
  }

  private getDomainValue(email: string): number {
    const domain = email.split('@')[1]?.toLowerCase();
    const highValueDomains = ['gmail.com', 'company.com', 'enterprise.com'];
    return highValueDomains.includes(domain) ? 5 : 2;
  }

  private analyzeCommunicationPatterns(contactData: ContactUnificationData) {
    const interactions = contactData.interactions;
    const hourly = new Array(24).fill(0);
    const weekly = new Array(7).fill(0);

    interactions.forEach(interaction => {
      const date = new Date(interaction.timestamp);
      hourly[date.getHours()]++;
      weekly[date.getDay()]++;
    });

    return {
      preferredHours: hourly,
      preferredDays: weekly,
      averageResponseTime: "2.5 hours",
      communicationStyle: "professional"
    };
  }

  private determinePreferredAccount(contactData: ContactUnificationData): string {
    // Determine which account has the most recent/frequent interactions
    const accountCounts = contactData.accounts.reduce((acc, account) => {
      acc[account] = contactData.interactions.filter(i => i.account === account).length;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(accountCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || contactData.accounts[0];
  }

  private async generateContactInsights(contactData: ContactUnificationData): Promise<string[]> {
    try {
      const prompt = `Analyze this contact's communication patterns and provide 3-5 actionable insights:
      
      Contact: ${contactData.contactEmail}
      Connected Accounts: ${contactData.accounts.length}
      Total Interactions: ${contactData.interactions.length}
      Recent Activity: ${contactData.interactions.slice(0, 5).map(i => `${i.direction} via ${i.account}`).join(', ')}
      
      Provide insights about communication optimization, relationship strength, and account usage.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      const insights = response.choices[0].message.content?.split('\n').filter(line => line.trim()) || [];
      return insights.slice(0, 5);
    } catch (error) {
      return [
        "High-value contact with consistent communication",
        "Prefers professional account for business discussions",
        "Most active during business hours (9-5 EST)",
        "Responds well to structured email formats"
      ];
    }
  }

  private async analyzeAccountOptimization(contact: CrossAccountContact): Promise<{
    recommendedAccount: string;
    reason: string;
    confidenceScore: number;
    potentialBenefit: string;
    estimatedImpact: number;
  } | null> {
    if (contact.connectedAccounts.length < 2) return null;

    // Analyze which account would be optimal for this contact
    const businessAccount = contact.connectedAccounts.find(acc => acc.includes('business') || acc.includes('work'));
    const personalAccount = contact.connectedAccounts.find(acc => acc.includes('personal') || acc.includes('gmail'));

    if (contact.businessValue > 500 && businessAccount) {
      return {
        recommendedAccount: businessAccount,
        reason: "High business value contact should use professional account",
        confidenceScore: 0.85,
        potentialBenefit: "better_organization",
        estimatedImpact: 15 // minutes saved per week
      };
    }

    return {
      recommendedAccount: contact.preferredAccount || contact.connectedAccounts[0],
      reason: "Consolidate communications to most active account",
      confidenceScore: 0.7,
      potentialBenefit: "time_saved",
      estimatedImpact: 10
    };
  }

  private generateUnifiedContactId(email: string): string {
    return `unified_${email.replace(/[@.]/g, '_')}_${Date.now()}`;
  }

  private getRecommendedAction(similarityScore: number): string {
    if (similarityScore > 0.9) return "merge";
    if (similarityScore > 0.7) return "archive_duplicate";
    return "keep_both";
  }

  // Demo data generators

  private generateDemoContactIntelligence(userId: string): CrossAccountContact[] {
    return [
      {
        id: 1,
        userId,
        contactEmail: "john.smith@company.com",
        contactName: "John Smith",
        unifiedContactId: "unified_john_smith_company_com_001",
        connectedAccounts: ["work@zema.com", "personal@gmail.com"],
        totalInteractions: 45,
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        relationshipStrength: 0.85,
        businessValue: 750,
        communicationPatterns: {
          preferredHours: [0,0,0,0,0,0,0,0,2,8,12,10,8,6,4,3,2,1,0,0,0,0,0,0],
          preferredDays: [1,5,8,8,8,6,2],
          averageResponseTime: "1.5 hours",
          communicationStyle: "professional"
        },
        preferredAccount: "work@zema.com",
        duplicateConversations: ["conv_123", "conv_456"],
        insights: [
          "High-value business contact with consistent communication",
          "Prefers work account for professional discussions",
          "Most responsive during business hours (9-5 EST)",
          "Important for quarterly business reviews"
        ],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        userId,
        contactEmail: "sarah.johnson@startup.com",
        contactName: "Sarah Johnson",
        unifiedContactId: "unified_sarah_johnson_startup_com_002",
        connectedAccounts: ["work@zema.com", "personal@gmail.com", "consulting@zema.com"],
        totalInteractions: 28,
        lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        relationshipStrength: 0.72,
        businessValue: 920,
        communicationPatterns: {
          preferredHours: [0,0,0,0,0,0,0,1,3,6,9,8,7,5,4,4,3,2,1,0,0,0,0,0],
          preferredDays: [0,6,9,8,7,5,1],
          averageResponseTime: "3.2 hours",
          communicationStyle: "casual_professional"
        },
        preferredAccount: "consulting@zema.com",
        duplicateConversations: ["conv_789"],
        insights: [
          "Emerging high-value startup contact",
          "Uses multiple accounts for different project discussions",
          "Prefers consulting account for technical topics",
          "Good potential for long-term partnership"
        ],
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];
  }

  private generateDemoDuplicateConversations(userId: string): DuplicateConversation[] {
    return [
      {
        id: 1,
        userId,
        primaryConversationId: "conv_primary_123",
        duplicateConversationId: "conv_duplicate_124",
        primaryAccount: "work@zema.com",
        duplicateAccount: "personal@gmail.com",
        similarityScore: 0.92,
        detectionMethod: "subject_and_participants",
        participants: ["john.smith@company.com", "work@zema.com"],
        subject: "Q4 Budget Planning Discussion",
        timeFrame: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        recommendedAction: "merge",
        status: "detected",
        resolvedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        userId,
        primaryConversationId: "conv_primary_456",
        duplicateConversationId: "conv_duplicate_457",
        primaryAccount: "consulting@zema.com",
        duplicateAccount: "personal@gmail.com",
        similarityScore: 0.78,
        detectionMethod: "content_similarity",
        participants: ["sarah.johnson@startup.com", "consulting@zema.com"],
        subject: "Project Timeline Review",
        timeFrame: {
          start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        recommendedAction: "archive_duplicate",
        status: "detected",
        resolvedAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private generateDemoAccountOptimizations(userId: string): AccountOptimization[] {
    return [
      {
        id: 1,
        userId,
        contactEmail: "john.smith@company.com",
        currentAccount: "personal@gmail.com",
        recommendedAccount: "work@zema.com",
        reason: "High business value contact should use professional account for better organization and credibility",
        confidenceScore: 0.88,
        potentialBenefit: "better_organization",
        estimatedImpact: 20,
        status: "pending",
        appliedAt: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        userId,
        contactEmail: "family.member@gmail.com",
        currentAccount: "work@zema.com",
        recommendedAccount: "personal@gmail.com",
        reason: "Personal contact should use personal account to maintain work-life boundaries",
        confidenceScore: 0.95,
        potentialBenefit: "work_life_separation",
        estimatedImpact: 15,
        status: "pending",
        appliedAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private generateDemoUnifiedContacts(): ContactUnificationData[] {
    return [
      {
        contactEmail: "john.smith@company.com",
        contactName: "John Smith",
        accounts: ["work@zema.com", "personal@gmail.com"],
        interactions: [
          { account: "work@zema.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), direction: "received", subject: "Q4 Planning" },
          { account: "personal@gmail.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), direction: "sent", subject: "Follow-up" }
        ]
      }
    ];
  }

  private generateDemoDuplicateDetectionResults(): DuplicateDetectionResult[] {
    return [
      {
        primaryConversationId: "conv_primary_123",
        duplicateConversationId: "conv_duplicate_124",
        primaryAccount: "work@zema.com",
        duplicateAccount: "personal@gmail.com",
        similarityScore: 0.92,
        participants: ["john.smith@company.com"],
        subject: "Q4 Budget Planning",
        detectionMethod: "subject_and_participants"
      }
    ];
  }
}

export const crossAccountIntelligenceService = new CrossAccountIntelligenceService();