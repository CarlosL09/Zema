import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AutomationSuggestion {
  name: string;
  description: string;
  category: string;
  icon: string;
  triggers: Array<{
    type: string;
    value: string;
    operator?: string;
  }>;
  actions: Array<{
    type: string;
    value: string;
    parameters?: Record<string, any>;
  }>;
  confidence: number;
  reasoning: string;
}

export interface RuleSuggestion {
  name: string;
  description: string;
  conditions: string;
  actions: string;
  priority: number;
  category: string;
  triggerType: 'all' | 'any';
  confidence: number;
  reasoning: string;
}

export class AutomationAI {
  // Generate automation template suggestions based on user request
  async suggestAutomationTemplate(userRequest: string): Promise<AutomationSuggestion[]> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return this.getFallbackSuggestions(userRequest);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert email automation assistant. Based on user requests, create practical automation templates.

Available trigger types: email_received, email_sent, keyword_match, sender_match, time_schedule
Available action types: auto_reply, forward_email, add_label, create_task, send_notification, archive
Available operators: contains, equals, starts_with, ends_with
Available categories: email_management, lead_qualification, customer_support, meeting_scheduling, follow_up, content_analysis

Respond with JSON containing an array of 1-3 automation suggestions. Each should have:
- name: Clear, descriptive name
- description: What the automation does
- category: One of the available categories
- icon: Single emoji representing the automation
- triggers: Array of trigger objects with type, value, operator
- actions: Array of action objects with type, value, parameters
- confidence: 0-1 score of how well this matches the request
- reasoning: Brief explanation of why this automation is suggested

Make suggestions practical and specific to the user's request.`
          },
          {
            role: "user",
            content: userRequest
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error("Error generating automation suggestions:", error);
      return this.getFallbackSuggestions(userRequest);
    }
  }

  // Generate rule suggestions based on user request
  async suggestAutomationRule(userRequest: string): Promise<RuleSuggestion[]> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return this.getFallbackRuleSuggestions(userRequest);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert at creating email automation rules with conditional logic. Based on user requests, create practical automation rules.

Available rule categories: email_filtering, auto_response, organization, security, priority_management, follow_up, lead_scoring
Priority levels: 1-5 (1=low, 5=urgent)
Trigger types: all (all conditions must match) or any (any condition can match)

Rule conditions should use logical expressions like:
- sender.email.contains("@company.com")
- subject.includes("urgent") AND priority > 3
- body.word_count > 100
- received_time.hour >= 9 AND received_time.hour <= 17

Rule actions should be comma-separated function calls like:
- add_label("High Priority"), set_priority(5), notify_user("VIP email received")
- forward_to("manager@company.com"), create_task("Follow up with client")

Respond with JSON containing an array of 1-3 rule suggestions. Each should have:
- name: Clear, descriptive name
- description: What the rule does
- conditions: Logical expression string for when rule triggers
- actions: Comma-separated action string
- priority: 1-5 priority level
- category: One of the available categories  
- triggerType: "all" or "any"
- confidence: 0-1 score of how well this matches the request
- reasoning: Brief explanation of why this rule is suggested

Make rules practical and specific to the user's request.`
          },
          {
            role: "user", 
            content: userRequest
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error("Error generating rule suggestions:", error);
      return this.getFallbackRuleSuggestions(userRequest);
    }
  }

  // Analyze user's email patterns and suggest optimizations
  async analyzeAndSuggestOptimizations(emailData: any[]): Promise<{
    insights: string[];
    suggestions: AutomationSuggestion[];
  }> {
    try {
      const emailSummary = {
        totalEmails: emailData.length,
        senderFrequency: this.analyzeSenderFrequency(emailData),
        commonSubjects: this.analyzeCommonSubjects(emailData),
        timePatterns: this.analyzeTimePatterns(emailData),
        avgResponseTime: this.calculateAvgResponseTime(emailData)
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an email productivity expert. Analyze email patterns and suggest automation opportunities.

Based on the email data, provide insights about email habits and suggest specific automations that would save time.

Respond with JSON containing:
- insights: Array of strings describing email patterns and productivity opportunities
- suggestions: Array of automation template objects (same format as previous automation suggestions)

Focus on practical, time-saving automations based on the actual email patterns.`
          },
          {
            role: "user",
            content: `Analyze this email data and suggest automations: ${JSON.stringify(emailSummary)}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"insights": [], "suggestions": []}');
      return result;
    } catch (error) {
      console.error("Error analyzing email patterns:", error);
      throw new Error("Failed to analyze email patterns");
    }
  }

  // Guide user through automation creation with step-by-step assistance
  async getAutomationGuidance(userQuery: string, currentStep?: string, context?: any): Promise<{
    guidance: string;
    nextStep?: string;
    suggestions?: any[];
    isComplete: boolean;
  }> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return this.getFallbackGuidance(userQuery, currentStep);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a helpful automation assistant that guides users through creating email automations step by step.

Available steps: planning, triggers, actions, testing, completion
Available trigger types: email_received, email_sent, keyword_match, sender_match, time_schedule
Available action types: auto_reply, forward_email, add_label, create_task, send_notification, archive

Provide clear, actionable guidance for the user's current step. Ask clarifying questions if needed.

Respond with JSON containing:
- guidance: Clear instruction or question for the user
- nextStep: What step comes next (if any)
- suggestions: Array of specific options/examples relevant to current step
- isComplete: Boolean indicating if automation is ready to create

Keep guidance conversational and helpful.`
          },
          {
            role: "user",
            content: `User query: "${userQuery}"
Current step: ${currentStep || 'planning'}
Context: ${JSON.stringify(context || {})}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        guidance: result.guidance || "I'm here to help you create an automation. What would you like to automate?",
        nextStep: result.nextStep,
        suggestions: result.suggestions || [],
        isComplete: result.isComplete || false
      };
    } catch (error) {
      console.error("Error providing automation guidance:", error);
      return this.getFallbackGuidance(userQuery, currentStep);
    }
  }

  // Helper methods for email analysis
  private analyzeSenderFrequency(emails: any[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    emails.forEach(email => {
      const sender = email.sender || 'unknown';
      frequency[sender] = (frequency[sender] || 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    );
  }

  private analyzeCommonSubjects(emails: any[]): string[] {
    const subjects = emails.map(email => email.subject || '').filter(Boolean);
    const keywords: Record<string, number> = {};
    
    subjects.forEach(subject => {
      const words = subject.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]: [string, number]) => word);
  }

  private analyzeTimePatterns(emails: any[]): Record<string, number> {
    const patterns: Record<string, number> = {};
    emails.forEach(email => {
      if (email.timestamp) {
        const hour = new Date(email.timestamp).getHours();
        const timeSlot = hour < 6 ? 'night' : 
                        hour < 12 ? 'morning' : 
                        hour < 18 ? 'afternoon' : 'evening';
        patterns[timeSlot] = (patterns[timeSlot] || 0) + 1;
      }
    });
    return patterns;
  }

  private calculateAvgResponseTime(emails: any[]): number {
    // Simplified calculation - in real implementation would track reply chains
    return Math.floor(Math.random() * 24) + 1; // Mock: 1-24 hours
  }

  // Fallback automation suggestions when OpenAI API is not available
  private getFallbackSuggestions(userRequest: string): AutomationSuggestion[] {
    const request = userRequest.toLowerCase();
    
    if (request.includes('meeting') || request.includes('schedule') || request.includes('calendar')) {
      return [{
        name: "Smart Meeting Scheduler",
        description: "Automatically detect meeting requests and suggest available times",
        category: "meeting_scheduling",
        icon: "📅",
        triggers: [{ type: "keyword_match", value: "meeting|schedule|calendar", operator: "contains" }],
        actions: [{ type: "create_task", value: "Review meeting request", parameters: { priority: "high" } }],
        confidence: 0.8,
        reasoning: "Detected meeting-related request, suggesting calendar automation"
      }];
    }
    
    if (request.includes('newsletter') || request.includes('subscription') || request.includes('unsubscribe')) {
      return [{
        name: "Newsletter Organizer",
        description: "Automatically organize newsletters and promotional emails",
        category: "email_management",
        icon: "📧",
        triggers: [{ type: "keyword_match", value: "newsletter|unsubscribe|promotional", operator: "contains" }],
        actions: [{ type: "add_label", value: "Newsletter", parameters: { folder: "Marketing" } }],
        confidence: 0.9,
        reasoning: "Detected newsletter management request"
      }];
    }
    
    if (request.includes('urgent') || request.includes('priority') || request.includes('important')) {
      return [{
        name: "Priority Email Detector",
        description: "Automatically identify and prioritize urgent emails",
        category: "priority_management",
        icon: "🚨",
        triggers: [{ type: "keyword_match", value: "urgent|asap|immediate|priority", operator: "contains" }],
        actions: [{ type: "add_label", value: "High Priority", parameters: { notification: true } }],
        confidence: 0.85,
        reasoning: "Detected priority management request"
      }];
    }
    
    // Default fallback suggestions
    return [{
      name: "Smart Email Filter",
      description: "Create custom filters based on your email patterns",
      category: "email_management",
      icon: "🔍",
      triggers: [{ type: "email_received", value: "*" }],
      actions: [{ type: "add_label", value: "Filtered" }],
      confidence: 0.7,
      reasoning: "General email automation suggestion"
    }];
  }

  // Fallback rule suggestions when OpenAI API is not available
  private getFallbackRuleSuggestions(userRequest: string): RuleSuggestion[] {
    const request = userRequest.toLowerCase();
    
    if (request.includes('auto') && request.includes('reply')) {
      return [{
        name: "Professional Auto-Reply",
        description: "Send automatic responses to incoming emails",
        conditions: "sender.email.not_contains('@mycompany.com')",
        actions: "send_auto_reply('Thank you for your email. I will respond within 24 hours.')",
        priority: 3,
        category: "auto_response",
        triggerType: "all",
        confidence: 0.8,
        reasoning: "Auto-reply functionality requested"
      }];
    }
    
    return [{
      name: "Basic Email Organization",
      description: "Organize emails by sender domain",
      conditions: "sender.email.contains('@company.com')",
      actions: "add_label('Work'), set_priority(4)",
      priority: 3,
      category: "email_filtering",
      triggerType: "all",
      confidence: 0.7,
      reasoning: "General email organization rule"
    }];
  }

  // Fallback guidance when OpenAI API is not available
  private getFallbackGuidance(userQuery: string, currentStep?: string): {
    guidance: string;
    nextStep?: string;
    suggestions: string[];
    isComplete: boolean;
  } {
    const query = userQuery.toLowerCase();
    
    if (!currentStep || currentStep === 'planning') {
      return {
        guidance: "I'll help you create an email automation. What specific email task would you like to automate?",
        nextStep: "define_trigger",
        suggestions: [
          "Organize newsletters and promotional emails",
          "Auto-respond to customer inquiries",
          "Prioritize urgent emails from specific contacts",
          "Forward emails from important clients",
          "Archive old emails automatically"
        ],
        isComplete: false
      };
    }
    
    if (currentStep === 'define_trigger') {
      return {
        guidance: "Great! Now let's define when this automation should trigger. What should activate your automation?",
        nextStep: "define_action",
        suggestions: [
          "When emails arrive from specific senders",
          "When subject line contains certain keywords",
          "When emails are received during specific hours",
          "When emails have attachments",
          "When emails are marked as important"
        ],
        isComplete: false
      };
    }
    
    if (currentStep === 'define_action') {
      return {
        guidance: "Perfect! Now what action should I take when the trigger conditions are met?",
        nextStep: "review",
        suggestions: [
          "Move to a specific folder",
          "Add a label or category",
          "Send an automatic reply",
          "Forward to another email address",
          "Create a task or reminder",
          "Mark as high priority"
        ],
        isComplete: false
      };
    }
    
    return {
      guidance: "Your automation is ready to create! I'll set up the rule based on your specifications.",
      suggestions: ["Create automation rule", "Test the automation", "Modify settings"],
      isComplete: true
    };
  }
}

export const automationAI = new AutomationAI();