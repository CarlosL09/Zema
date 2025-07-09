import OpenAI from "openai";
import { storage } from "../storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  async generateEmailDraft(
    userId: string,
    emailContext: {
      originalMessage: string;
      subject: string;
      sender: string;
      recipient: string;
      threadHistory?: string[];
    }
  ): Promise<{ content: string; confidence: number }> {
    // Track usage
    await storage.trackUsage({
      userId,
      eventType: 'draft_generated',
      metadata: { subject: emailContext.subject }
    });

    const user = await storage.getUser(userId);
    
    const prompt = `You are an AI email assistant helping to draft professional email responses. 

User Profile:
- Name: ${user?.firstName} ${user?.lastName}
- Email: ${user?.email}

Original Email:
From: ${emailContext.sender}
To: ${emailContext.recipient}
Subject: ${emailContext.subject}
Body: ${emailContext.originalMessage}

${emailContext.threadHistory ? `Previous Thread:\n${emailContext.threadHistory.join('\n---\n')}` : ''}

Generate a professional, contextually appropriate email response. The response should:
1. Be concise but complete
2. Maintain a professional tone
3. Address all key points from the original message
4. Include appropriate greetings and closings
5. Be personalized to the sender's writing style

Return the response in JSON format with:
{
  "content": "the email draft content",
  "confidence": confidence_score_between_0_and_1,
  "reasoning": "brief explanation of the approach"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional email drafting assistant. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: result.content || 'Unable to generate draft',
        confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1)
      };
    } catch (error) {
      console.error('AI draft generation failed:', error);
      return {
        content: 'Thank you for your email. I will review and respond shortly.',
        confidence: 0.3
      };
    }
  }

  async categorizeEmail(
    userId: string,
    emailContent: {
      subject: string;
      body: string;
      sender: string;
    }
  ): Promise<{ labels: string[]; priority: string }> {
    const prompt = `Analyze this email and categorize it with relevant labels and priority level.

Email:
From: ${emailContent.sender}
Subject: ${emailContent.subject}
Body: ${emailContent.body}

Categorize this email with:
1. Type labels (e.g., "meeting", "invoice", "support", "partnership", "internal", "client", "vendor")
2. Priority level ("low", "normal", "high", "urgent")
3. Action labels if applicable (e.g., "action_required", "response_needed", "fyi", "deadline")

Return JSON format:
{
  "labels": ["label1", "label2"],
  "priority": "priority_level",
  "reasoning": "brief explanation"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an email classification assistant. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        labels: result.labels || ['general'],
        priority: result.priority || 'normal'
      };
    } catch (error) {
      console.error('AI categorization failed:', error);
      return {
        labels: ['general'],
        priority: 'normal'
      };
    }
  }

  async suggestSmartRules(
    userId: string,
    emailPatterns: Array<{
      sender: string;
      subject: string;
      frequency: number;
    }>
  ): Promise<Array<{
    name: string;
    conditions: any;
    actions: any;
    description: string;
  }>> {
    const prompt = `Based on these email patterns, suggest smart automation rules:

Email Patterns:
${emailPatterns.map(p => `- From: ${p.sender}, Subject pattern: "${p.subject}", Frequency: ${p.frequency}`).join('\n')}

Suggest automation rules that could help manage these emails. Each rule should have:
1. Clear conditions (sender, subject keywords, etc.)
2. Helpful actions (labels, auto-reply, forward, etc.)
3. Descriptive name and explanation

Return JSON format:
{
  "rules": [
    {
      "name": "rule_name",
      "description": "what this rule does",
      "conditions": {
        "sender_contains": "domain.com",
        "subject_contains": "invoice"
      },
      "actions": {
        "add_label": "billing",
        "forward_to": "accounting@company.com"
      }
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a smart email automation assistant. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return result.rules || [];
    } catch (error) {
      console.error('AI rule suggestion failed:', error);
      return [];
    }
  }

  async processWithBusinessContext(
    userId: string,
    emailContent: string,
    businessContext: {
      integrations: Array<{ type: string; settings: any }>;
      userPreferences: any;
    }
  ): Promise<{
    suggestedActions: Array<{
      type: string;
      description: string;
      data: any;
    }>;
  }> {
    const hasSlack = businessContext.integrations.some(i => i.type === 'slack');
    const hasCalendar = businessContext.integrations.some(i => i.type === 'calendar');

    const prompt = `Analyze this email and suggest business actions based on available integrations:

Email Content: ${emailContent}

Available Integrations:
${hasSlack ? '- Slack (can send notifications to channels)' : ''}
${hasCalendar ? '- Calendar (can create events)' : ''}

Suggest relevant business actions that could be automated based on this email content.

Return JSON format:
{
  "actions": [
    {
      "type": "slack_notification",
      "description": "Send alert to #sales channel",
      "data": {
        "channel": "#sales",
        "message": "New client inquiry received"
      }
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a business process automation assistant. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        suggestedActions: result.actions || []
      };
    } catch (error) {
      console.error('AI business context processing failed:', error);
      return {
        suggestedActions: []
      };
    }
  }

  async summarizeEmailThread(
    userId: string,
    messages: Array<{
      subject: string;
      sender: string;
      body: string;
      timestamp: string;
    }>
  ): Promise<{ summary: string; keyPoints: string[]; actionItems: string[] }> {
    const prompt = `Analyze this email thread and provide a concise summary:

Email Thread:
${messages.map((msg, idx) => `
Message ${idx + 1} (${msg.timestamp}):
From: ${msg.sender}
Subject: ${msg.subject}
Body: ${msg.body}
---`).join('\n')}

Provide a summary in JSON format:
{
  "summary": "Brief 2-3 sentence overview of the entire conversation",
  "keyPoints": ["Important point 1", "Important point 2", "Important point 3"],
  "actionItems": ["Action item 1", "Action item 2"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at summarizing email conversations. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Track usage
      await storage.trackUsage({
        userId,
        eventType: 'thread_summarized',
        metadata: { messageCount: messages.length }
      });

      return {
        summary: result.summary || 'Unable to generate summary',
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || []
      };
    } catch (error) {
      console.error('AI summarization failed:', error);
      return {
        summary: 'Email thread summary not available',
        keyPoints: [],
        actionItems: []
      };
    }
  }

  async detectSchedulingRequest(
    userId: string,
    emailContent: {
      subject: string;
      body: string;
      sender: string;
    }
  ): Promise<{
    isSchedulingRequest: boolean;
    meetingType?: string;
    suggestedDuration?: number;
    urgency?: string;
    proposedTimes?: string[];
  }> {
    const prompt = `Analyze this email to detect if it's requesting a meeting or scheduling:

Email:
Subject: ${emailContent.subject}
From: ${emailContent.sender}
Body: ${emailContent.body}

Determine if this is a scheduling request and extract details in JSON format:
{
  "isSchedulingRequest": true/false,
  "meetingType": "call|meeting|interview|demo|consultation|other",
  "suggestedDuration": 30, // duration in minutes
  "urgency": "urgent|high|normal|low",
  "proposedTimes": ["specific times or dates mentioned"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at detecting scheduling requests in emails. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      if (result.isSchedulingRequest) {
        await storage.trackUsage({
          userId,
          eventType: 'scheduling_detected',
          metadata: { meetingType: result.meetingType, urgency: result.urgency }
        });
      }

      return result;
    } catch (error) {
      console.error('Scheduling detection failed:', error);
      return { isSchedulingRequest: false };
    }
  }

  async generateQuickReplies(
    userId: string,
    emailContent: {
      subject: string;
      body: string;
      sender: string;
    }
  ): Promise<string[]> {
    const user = await storage.getUser(userId);
    
    const prompt = `Generate 3-4 quick reply options for this email:

User Profile:
- Name: ${user?.firstName} ${user?.lastName}
- Email: ${user?.email}

Email to reply to:
Subject: ${emailContent.subject}
From: ${emailContent.sender}
Body: ${emailContent.body}

Generate appropriate quick replies in JSON format:
{
  "replies": [
    "Thanks for reaching out! I'll review this and get back to you by [day].",
    "Received - looking into this now.",
    "Let me check on this and follow up shortly."
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate professional, contextual quick reply options. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'quick_replies_generated',
        metadata: { repliesCount: result.replies?.length || 0 }
      });

      return result.replies || [];
    } catch (error) {
      console.error('Quick replies generation failed:', error);
      return [
        "Thank you for your email. I'll review and respond shortly.",
        "Received - I'll look into this and get back to you.",
        "Thanks for reaching out. Let me check on this."
      ];
    }
  }

  async calculatePriorityScore(
    userId: string,
    emailData: {
      subject: string;
      sender: string;
      body: string;
      hasAttachments: boolean;
      isReply: boolean;
    }
  ): Promise<{
    score: number; // 0-100
    priority: 'urgent' | 'high' | 'normal' | 'low';
    reasoning: string;
  }> {
    const prompt = `Analyze this email and calculate a priority score (0-100):

Email Details:
Subject: ${emailData.subject}
From: ${emailData.sender}
Body: ${emailData.body}
Has Attachments: ${emailData.hasAttachments}
Is Reply: ${emailData.isReply}

Consider factors like:
- Urgency keywords (urgent, ASAP, deadline, etc.)
- Sender importance (CEO, client, partner keywords)
- Content type (complaint, request, information, etc.)
- Time sensitivity
- Business impact

Return JSON format:
{
  "score": 85,
  "priority": "high",
  "reasoning": "Contains urgent keywords and appears to be from a client with a deadline"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at email prioritization. Score emails 0-100 and classify priority. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'priority_calculated',
        metadata: { 
          score: result.score,
          priority: result.priority,
          sender: emailData.sender
        }
      });

      return {
        score: Math.min(Math.max(result.score || 50, 0), 100),
        priority: result.priority || 'normal',
        reasoning: result.reasoning || 'Standard priority assigned'
      };
    } catch (error) {
      console.error('Priority calculation failed:', error);
      return {
        score: 50,
        priority: 'normal',
        reasoning: 'Default priority assigned due to analysis error'
      };
    }
  }

  async detectFollowUpNeeded(
    userId: string,
    emailContent: {
      subject: string;
      body: string;
      sender: string;
      timestamp: string;
    }
  ): Promise<{
    needsFollowUp: boolean;
    suggestedDelay: number; // hours
    followUpType: string;
    reason: string;
  }> {
    const prompt = `Analyze if this email needs a follow-up and when:

Email:
Subject: ${emailContent.subject}
From: ${emailContent.sender}
Body: ${emailContent.body}
Received: ${emailContent.timestamp}

Determine follow-up needs in JSON format:
{
  "needsFollowUp": true/false,
  "suggestedDelay": 24, // hours to wait before follow-up
  "followUpType": "response_reminder|status_update|deadline_reminder|meeting_confirmation|other",
  "reason": "explanation of why follow-up is needed"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze emails to determine if follow-ups are needed. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      if (result.needsFollowUp) {
        await storage.trackUsage({
          userId,
          eventType: 'followup_scheduled',
          metadata: { 
            delay: result.suggestedDelay,
            type: result.followUpType
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Follow-up detection failed:', error);
      return {
        needsFollowUp: false,
        suggestedDelay: 24,
        followUpType: 'response_reminder',
        reason: 'Analysis not available'
      };
    }
  }

  async performVIPDetection(
    userId: string,
    emailData: {
      sender: string;
      senderName?: string;
      domain: string;
    }
  ): Promise<{
    isVIP: boolean;
    vipLevel: 'executive' | 'client' | 'partner' | 'internal' | 'none';
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `Analyze this email sender to determine VIP status:

Sender: ${emailData.sender}
Sender Name: ${emailData.senderName || 'Not provided'}
Domain: ${emailData.domain}

Determine VIP status based on:
- Executive keywords (CEO, CTO, VP, Director, President, Founder)
- Client indicators (important company domains, account manager)
- Partner indicators (vendor, supplier, contractor keywords)
- Internal importance (same domain, manager keywords)

Return JSON format:
{
  "isVIP": true/false,
  "vipLevel": "executive|client|partner|internal|none",
  "confidence": 0.85,
  "reasoning": "detected CEO title and enterprise domain"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at identifying VIP contacts in business communications. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      if (result.isVIP) {
        await storage.trackUsage({
          userId,
          eventType: 'vip_detected',
          metadata: { 
            vipLevel: result.vipLevel,
            sender: emailData.sender,
            confidence: result.confidence
          }
        });
      }

      return {
        isVIP: result.isVIP || false,
        vipLevel: result.vipLevel || 'none',
        confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
        reasoning: result.reasoning || 'Analysis not available'
      };
    } catch (error) {
      console.error('VIP detection failed:', error);
      return {
        isVIP: false,
        vipLevel: 'none',
        confidence: 0,
        reasoning: 'VIP analysis not available'
      };
    }
  }

  async analyzeSentiment(
    userId: string,
    emailContent: {
      subject: string;
      body: string;
      sender: string;
    }
  ): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent';
    confidence: number;
    emotionalIndicators: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    requiresImmediateAttention: boolean;
  }> {
    const prompt = `Analyze the sentiment and urgency of this email:

Subject: ${emailContent.subject}
From: ${emailContent.sender}
Body: ${emailContent.body}

Analyze for:
- Overall sentiment (positive, neutral, negative, frustrated, urgent)
- Emotional indicators (specific words or phrases showing emotion)
- Urgency level based on language and content
- Whether immediate attention is required

Return JSON format:
{
  "sentiment": "frustrated",
  "confidence": 0.9,
  "emotionalIndicators": ["frustrated", "urgent", "ASAP"],
  "urgencyLevel": "high",
  "requiresImmediateAttention": true
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing email sentiment and urgency. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'sentiment_analyzed',
        metadata: { 
          sentiment: result.sentiment,
          urgencyLevel: result.urgencyLevel,
          requiresAttention: result.requiresImmediateAttention
        }
      });

      return {
        sentiment: result.sentiment || 'neutral',
        confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
        emotionalIndicators: result.emotionalIndicators || [],
        urgencyLevel: result.urgencyLevel || 'medium',
        requiresImmediateAttention: result.requiresImmediateAttention || false
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotionalIndicators: [],
        urgencyLevel: 'medium',
        requiresImmediateAttention: false
      };
    }
  }

  async analyzeRecipientTone(
    userId: string,
    pastEmails: Array<{
      subject: string;
      body: string;
      sender: string;
    }>
  ): Promise<{
    communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly' | 'direct';
    preferredLength: 'brief' | 'detailed' | 'moderate';
    commonPhrases: string[];
    toneAttributes: string[];
  }> {
    const prompt = `Analyze the communication style from these past emails:

${pastEmails.map((email, idx) => `
Email ${idx + 1}:
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}
---`).join('\n')}

Analyze the sender's communication patterns:
- Writing style (formal, casual, technical, friendly, direct)
- Preferred email length
- Common phrases or expressions they use
- Tone attributes

Return JSON format:
{
  "communicationStyle": "formal",
  "preferredLength": "brief",
  "commonPhrases": ["Thanks in advance", "Best regards"],
  "toneAttributes": ["professional", "concise", "polite"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing communication styles and patterns. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'tone_analyzed',
        metadata: { 
          communicationStyle: result.communicationStyle,
          emailCount: pastEmails.length
        }
      });

      return {
        communicationStyle: result.communicationStyle || 'formal',
        preferredLength: result.preferredLength || 'moderate',
        commonPhrases: result.commonPhrases || [],
        toneAttributes: result.toneAttributes || []
      };
    } catch (error) {
      console.error('Tone analysis failed:', error);
      return {
        communicationStyle: 'formal',
        preferredLength: 'moderate',
        commonPhrases: [],
        toneAttributes: []
      };
    }
  }

  async generateToneMatchedResponse(
    userId: string,
    emailContext: {
      originalMessage: string;
      subject: string;
      sender: string;
      recipient: string;
      recipientTone?: {
        communicationStyle: string;
        preferredLength: string;
        commonPhrases: string[];
        toneAttributes: string[];
      };
    },
    responseType: 'reply' | 'forward' | 'new' = 'reply'
  ): Promise<{ content: string; confidence: number; toneMatch: number }> {
    const user = await storage.getUser(userId);
    const toneContext = emailContext.recipientTone ? `
Recipient's Communication Style:
- Style: ${emailContext.recipientTone.communicationStyle}
- Preferred Length: ${emailContext.recipientTone.preferredLength}
- Common Phrases: ${emailContext.recipientTone.commonPhrases.join(', ')}
- Tone Attributes: ${emailContext.recipientTone.toneAttributes.join(', ')}
` : '';

    const prompt = `Generate a ${responseType} email that matches the recipient's communication style:

User Profile:
- Name: ${user?.firstName} ${user?.lastName}
- Email: ${user?.email}

Original Email:
From: ${emailContext.sender}
To: ${emailContext.recipient}
Subject: ${emailContext.subject}
Body: ${emailContext.originalMessage}

${toneContext}

Generate a response that:
1. Matches the recipient's communication style and tone
2. Uses appropriate length based on their preferences
3. Incorporates similar phrases or expressions if identified
4. Maintains professional appropriateness
5. Addresses all key points from the original message

Return JSON format:
{
  "content": "the email response content",
  "confidence": 0.9,
  "toneMatch": 0.85,
  "reasoning": "matched formal style and brief length preference"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at crafting tone-matched email responses. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'tone_matched_response',
        metadata: { 
          responseType,
          toneMatch: result.toneMatch,
          hasRecipientTone: !!emailContext.recipientTone
        }
      });

      return {
        content: result.content || 'Unable to generate tone-matched response',
        confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
        toneMatch: Math.min(Math.max(result.toneMatch || 0.5, 0), 1)
      };
    } catch (error) {
      console.error('Tone-matched response generation failed:', error);
      return {
        content: 'Thank you for your email. I will review and respond accordingly.',
        confidence: 0.3,
        toneMatch: 0.3
      };
    }
  }

  async detectLanguageAndGenerateResponse(
    userId: string,
    emailContent: {
      subject: string;
      body: string;
      sender: string;
    },
    targetLanguages: string[] = ['en']
  ): Promise<{
    detectedLanguage: string;
    responses: Array<{
      language: string;
      content: string;
      confidence: number;
    }>;
  }> {
    const prompt = `Detect the language and generate appropriate responses:

Email:
Subject: ${emailContent.subject}
Body: ${emailContent.body}

1. Detect the primary language of this email
2. Generate professional responses in these languages: ${targetLanguages.join(', ')}

Return JSON format:
{
  "detectedLanguage": "en",
  "responses": [
    {
      "language": "en",
      "content": "Thank you for your email...",
      "confidence": 0.9
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a multilingual email assistant. Detect languages accurately and generate appropriate responses. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'multilingual_response',
        metadata: { 
          detectedLanguage: result.detectedLanguage,
          languageCount: result.responses?.length || 0
        }
      });

      return {
        detectedLanguage: result.detectedLanguage || 'en',
        responses: result.responses || [{
          language: 'en',
          content: 'Thank you for your email. I will respond accordingly.',
          confidence: 0.5
        }]
      };
    } catch (error) {
      console.error('Multilingual response generation failed:', error);
      return {
        detectedLanguage: 'en',
        responses: [{
          language: 'en',
          content: 'Thank you for your email. I will respond accordingly.',
          confidence: 0.5
        }]
      };
    }
  }

  async generateDynamicTemplate(
    userId: string,
    templateContext: {
      purpose: 'meeting_request' | 'follow_up' | 'introduction' | 'proposal' | 'support' | 'custom';
      recipient: string;
      context: string;
      customFields?: Record<string, any>;
    }
  ): Promise<{
    template: string;
    placeholders: string[];
    suggestions: Record<string, string>;
    adaptations: string[];
  }> {
    const user = await storage.getUser(userId);
    
    const prompt = `Generate a dynamic email template for this context:

User: ${user?.firstName} ${user?.lastName}
Purpose: ${templateContext.purpose}
Recipient: ${templateContext.recipient}
Context: ${templateContext.context}
Custom Fields: ${JSON.stringify(templateContext.customFields || {})}

Create a professional email template that:
1. Adapts to the specific purpose and context
2. Includes placeholder variables for customization
3. Provides suggested content for placeholders
4. Lists contextual adaptations made

Return JSON format:
{
  "template": "Hi {{recipientName}},\n\nI hope this email finds you well...",
  "placeholders": ["recipientName", "meetingDate", "agenda"],
  "suggestions": {
    "recipientName": "John",
    "meetingDate": "next week",
    "agenda": "project discussion"
  },
  "adaptations": ["formal tone for business context", "included meeting specifics"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating adaptive email templates. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.trackUsage({
        userId,
        eventType: 'dynamic_template_generated',
        metadata: { 
          purpose: templateContext.purpose,
          placeholderCount: result.placeholders?.length || 0
        }
      });

      return {
        template: result.template || 'Unable to generate template',
        placeholders: result.placeholders || [],
        suggestions: result.suggestions || {},
        adaptations: result.adaptations || []
      };
    } catch (error) {
      console.error('Dynamic template generation failed:', error);
      return {
        template: 'Unable to generate template at this time.',
        placeholders: [],
        suggestions: {},
        adaptations: []
      };
    }
  }

  async analyzeAutomationRequest(
    description: string,
    emailExamples?: string[]
  ): Promise<{
    suggestedName: string;
    description: string;
    triggerType: string;
    conditions: Record<string, any>;
    actions: string[];
    confidence: number;
    explanation: string;
    priority?: string;
    settings?: Record<string, any>;
  }> {
    try {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert email automation analyst. Analyze user descriptions and suggest automation rules. Return a JSON object with all the required fields.`
          },
          {
            role: "user",
            content: `Analyze this automation request: "${description}". ${emailExamples ? `Email examples: ${JSON.stringify(emailExamples)}` : ''}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(analysis.choices[0].message.content || '{}');
      
      return {
        suggestedName: result.suggestedName || 'Custom Automation',
        description: result.description || description,
        triggerType: result.triggerType || 'email_received',
        conditions: result.conditions || {},
        actions: result.actions || ['categorize'],
        confidence: Math.min(Math.max(result.confidence || 70, 0), 100),
        explanation: result.explanation || 'AI-generated automation rule',
        priority: result.priority || 'medium',
        settings: result.settings || {}
      };
    } catch (error) {
      console.error('Error analyzing automation request:', error);
      return {
        suggestedName: 'Custom Automation',
        description: description,
        triggerType: 'email_received',
        conditions: {},
        actions: ['categorize'],
        confidence: 50,
        explanation: 'Basic automation rule created from description',
        priority: 'medium',
        settings: {}
      };
    }
  }
}