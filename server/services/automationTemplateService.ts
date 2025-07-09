import { storage } from '../storage.js';
import { AutomationRule, InsertAutomationRule } from '../../shared/schema.js';
import { AIService } from './aiService.js';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'email_management' | 'lead_qualification' | 'customer_support' | 'meeting_scheduling' | 'follow_up' | 'content_analysis';
  icon: string;
  triggers: string[];
  actions: string[];
  conditions: Record<string, any>;
  settings: Record<string, any>;
  popularity: number;
  estimatedTimeSaved: string;
}

export class AutomationTemplateService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  getTemplates(): AutomationTemplate[] {
    return [
      {
        id: 'smart_classifier',
        name: 'Smart Email Classifier',
        description: 'Automatically categorize incoming emails based on content and sender',
        category: 'email_management',
        icon: '🏷️',
        triggers: ['email_received'],
        actions: ['classify', 'move_to_folder', 'add_label'],
        conditions: {
          contentKeywords: ['invoice', 'receipt', 'order'],
          senderDomains: ['@vendor.com', '@supplier.com'],
          hasAttachments: true
        },
        settings: {
          confidenceThreshold: 0.8,
          autoMove: true,
          notifyUser: false
        },
        popularity: 92,
        estimatedTimeSaved: '2-3 hours/week'
      },
      {
        id: 'priority_scorer',
        name: 'Priority Email Scorer',
        description: 'Automatically score email priority based on sender, content, and urgency',
        category: 'email_management',
        icon: '⭐',
        triggers: ['email_received'],
        actions: ['calculate_priority', 'set_flag', 'notify_if_urgent'],
        conditions: {
          vipSenders: ['@important-client.com'],
          urgencyKeywords: ['urgent', 'asap', 'deadline'],
          timeReferences: true
        },
        settings: {
          urgentThreshold: 8,
          vipWeight: 0.3,
          keywordWeight: 0.4
        },
        popularity: 88,
        estimatedTimeSaved: '1-2 hours/week'
      },
      {
        id: 'auto_responder',
        name: 'Smart Auto-Responder',
        description: 'Generate contextual auto-replies for common inquiries',
        category: 'customer_support',
        icon: '💬',
        triggers: ['email_received', 'keyword_match'],
        actions: ['generate_reply', 'send_response', 'log_interaction'],
        conditions: {
          inquiryTypes: ['pricing', 'support', 'general'],
          businessHours: '9am-5pm',
          responseTemplates: true
        },
        settings: {
          delay: '5_minutes',
          personalizeResponse: true,
          requireApproval: false
        },
        popularity: 85,
        estimatedTimeSaved: '3-4 hours/week'
      },
      {
        id: 'lead_qualifier',
        name: 'Lead Qualification System',
        description: 'Score and qualify sales leads based on email interactions',
        category: 'lead_qualification',
        icon: '🎯',
        triggers: ['email_received', 'contact_form'],
        actions: ['score_lead', 'assign_to_sales', 'update_crm'],
        conditions: {
          leadSources: ['website', 'referral', 'cold_outreach'],
          qualificationCriteria: ['budget', 'authority', 'need', 'timeline'],
          minimumScore: 7
        },
        settings: {
          scoringModel: 'bant',
          autoAssign: true,
          crmIntegration: 'salesforce'
        },
        popularity: 91,
        estimatedTimeSaved: '4-5 hours/week'
      },
      {
        id: 'meeting_scheduler',
        name: 'Smart Meeting Scheduler',
        description: 'Automatically detect meeting requests and propose available time slots',
        category: 'meeting_scheduling',
        icon: '📅',
        triggers: ['email_received', 'calendar_keywords'],
        actions: ['check_availability', 'send_calendar_link', 'create_meeting'],
        conditions: {
          keywordMatches: ['meeting', 'call', 'schedule', 'appointment', 'discuss'],
          hasTimeReference: true,
          senderType: 'external'
        },
        settings: {
          workingHours: '9am-5pm',
          bufferTime: '15_minutes',
          defaultDuration: '30_minutes',
          calendarProvider: 'google'
        },
        popularity: 87,
        estimatedTimeSaved: '2-3 hours/week'
      },
      {
        id: 'follow_up_tracker',
        name: 'Follow-up Tracker',
        description: 'Track emails that need follow-up and send reminders',
        category: 'follow_up',
        icon: '⏰',
        triggers: ['email_sent', 'no_reply_received'],
        actions: ['set_reminder', 'send_follow_up', 'notify_user'],
        conditions: {
          followUpDelay: '3_days',
          maxFollowUps: 3,
          excludeDomains: ['@internal.com']
        },
        settings: {
          reminderFrequency: 'daily',
          autoSendFollowUp: false,
          escalateAfter: '1_week'
        },
        popularity: 83,
        estimatedTimeSaved: '2-3 hours/week'
      },
      {
        id: 'content_analyzer',
        name: 'Email Content Analyzer',
        description: 'Analyze email content for sentiment, compliance, and insights',
        category: 'content_analysis',
        icon: '📊',
        triggers: ['email_received', 'email_sent'],
        actions: ['analyze_sentiment', 'check_compliance', 'extract_insights'],
        conditions: {
          analysisTypes: ['sentiment', 'tone', 'compliance'],
          confidentialityCheck: true,
          languageDetection: true
        },
        settings: {
          realTimeAnalysis: true,
          alertOnNegative: true,
          complianceRules: 'gdpr'
        },
        popularity: 79,
        estimatedTimeSaved: '1-2 hours/week'
      },
      {
        id: 'vip_detector',
        name: 'VIP Contact Detector',
        description: 'Identify and prioritize emails from VIP contacts',
        category: 'email_management',
        icon: '👑',
        triggers: ['email_received'],
        actions: ['flag_as_vip', 'notify_immediately', 'escalate_priority'],
        conditions: {
          vipList: ['@enterprise-client.com', '@key-partner.com'],
          titleKeywords: ['CEO', 'Director', 'VP'],
          domainAuthority: 'high'
        },
        settings: {
          immediateNotification: true,
          vipFolderMove: true,
          escalationLevel: 'high'
        },
        popularity: 86,
        estimatedTimeSaved: '1-2 hours/week'
      },
      {
        id: 'spam_filter',
        name: 'Advanced Spam Filter',
        description: 'AI-powered spam detection with learning capabilities',
        category: 'email_management',
        icon: '🛡️',
        triggers: ['email_received'],
        actions: ['analyze_spam_indicators', 'quarantine', 'learn_patterns'],
        conditions: {
          spamIndicators: ['suspicious_links', 'mass_sender', 'poor_reputation'],
          whitelistDomains: ['@trusted-partner.com'],
          learningMode: true
        },
        settings: {
          sensitivityLevel: 'medium',
          autoQuarantine: true,
          reportFalsePositives: true
        },
        popularity: 84,
        estimatedTimeSaved: '3-4 hours/week'
      }
    ];
  }

  getPopularTemplates(limit: number = 5): AutomationTemplate[] {
    return this.getTemplates()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  getTemplatesByCategory(category: string): AutomationTemplate[] {
    return this.getTemplates().filter(template => template.category === category);
  }

  async createAutomationFromTemplate(userId: string, templateId: string, customSettings?: any): Promise<AutomationRule> {
    const template = this.getTemplates().find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const automationRule: InsertAutomationRule = {
      userId,
      name: template.name,
      description: template.description,
      triggers: template.triggers,
      actions: template.actions,
      conditions: customSettings?.conditions || template.conditions,
      settings: customSettings?.settings || template.settings,
      isActive: true,
      priority: customSettings?.priority || 'medium',
      successRate: template.popularity / 100,
      timeSaved: template.estimatedTimeSaved
    };

    return await storage.createAutomationRule(automationRule);
  }

  async getAutomationAnalytics(userId: string) {
    const rules = await storage.getAutomationRules(userId);
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.isActive).length;
    const avgSuccessRate = rules.reduce((sum, rule) => sum + (rule.successRate || 0), 0) / totalRules || 0;

    return {
      totalRules,
      activeRules,
      avgSuccessRate,
      timeSaved: this.calculateTimeSaved(rules),
      topPerformingRules: this.getTopPerformingRules(rules),
      recommendations: await this.generateRecommendations(userId, rules)
    };
  }

  private calculateTimeSaved(rules: AutomationRule[]): string {
    const activeRules = rules.filter(rule => rule.isActive);
    if (activeRules.length === 0) return '0 hours/week';
    
    const totalHours = activeRules.length * 2; // Estimate 2 hours saved per active rule
    return `${totalHours}-${totalHours + 5} hours/week`;
  }

  private getTopPerformingRules(rules: AutomationRule[]): any[] {
    return rules
      .filter(rule => rule.successRate && rule.successRate > 0.7)
      .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
      .slice(0, 5)
      .map(rule => ({
        name: rule.name,
        successRate: rule.successRate,
        timeSaved: rule.timeSaved
      }));
  }

  private async generateRecommendations(userId: string, rules: AutomationRule[]): Promise<any[]> {
    const activeRuleCategories = rules.map(rule => rule.name?.toLowerCase() || '');
    const allTemplates = this.getTemplates();
    
    return allTemplates
      .filter(template => !activeRuleCategories.some(category => template.name.toLowerCase().includes(category)))
      .slice(0, 3)
      .map(template => ({
        templateId: template.id,
        name: template.name,
        description: template.description,
        estimatedImpact: template.popularity
      }));
  }
}