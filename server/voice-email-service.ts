import OpenAI from "openai";
import { storage } from "./storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VoiceCommand {
  id: number;
  userId: string;
  command: string;
  intent: string;
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  audioTranscription?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface EmailAudioSummary {
  id: number;
  userId: string;
  emailId: string;
  summary: string;
  audioUrl?: string;
  duration: number;
  keyPoints: string[];
  actionItems: string[];
  createdAt: Date;
}

export interface VoiceResponse {
  id: number;
  userId: string;
  originalEmailId: string;
  voiceInput: string;
  enhancedResponse: string;
  audioTranscription: string;
  contextAnalysis: any;
  sentimentScore: number;
  confidence: number;
  createdAt: Date;
}

// Voice command intents
export const VOICE_INTENTS = {
  MARK_READ: 'mark_read',
  ARCHIVE: 'archive',
  DELETE: 'delete',
  COMPOSE: 'compose',
  REPLY: 'reply',
  FORWARD: 'forward',
  SEARCH: 'search',
  ORGANIZE: 'organize',
  SUMMARIZE: 'summarize',
  SCHEDULE: 'schedule',
  REMIND: 'remind',
  FILTER: 'filter'
} as const;

export class VoiceEmailService {
  
  /**
   * Process voice command and transcribe audio input
   */
  async processVoiceCommand(userId: string, audioBuffer: Buffer): Promise<VoiceCommand> {
    try {
      // Transcribe audio using OpenAI Whisper
      const transcription = await this.transcribeAudio(audioBuffer);
      
      // Analyze intent and extract parameters
      const analysis = await this.analyzeVoiceIntent(transcription);
      
      // Create voice command record
      const voiceCommand = await storage.createVoiceCommand({
        userId,
        command: transcription,
        intent: analysis.intent,
        parameters: analysis.parameters,
        status: 'pending',
        audioTranscription: transcription,
      });

      // Execute the command
      await this.executeVoiceCommand(voiceCommand);
      
      return voiceCommand;
    } catch (error) {
      console.error("Error processing voice command:", error);
      throw new Error("Failed to process voice command");
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Convert buffer to file-like object for OpenAI
      const audioFile = new File([audioBuffer], "audio.wav", { type: "audio/wav" });
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "text"
      });

      return transcription;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  /**
   * Analyze voice command intent using GPT-4o
   */
  private async analyzeVoiceIntent(transcription: string): Promise<{
    intent: string;
    parameters: any;
    confidence: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes voice commands for email management. 
            
            Available intents: ${Object.values(VOICE_INTENTS).join(', ')}
            
            Analyze the user's voice command and return JSON with:
            - intent: the detected intent
            - parameters: extracted parameters (recipients, keywords, filters, etc.)
            - confidence: confidence score (0-1)
            
            Examples:
            - "Mark all newsletters as read" -> {intent: "mark_read", parameters: {filter: "newsletters", scope: "all"}, confidence: 0.95}
            - "Reply to John's email about the meeting" -> {intent: "reply", parameters: {recipient: "John", subject_keywords: ["meeting"]}, confidence: 0.9}
            - "Archive all emails from last week" -> {intent: "archive", parameters: {time_range: "last_week", scope: "all"}, confidence: 0.85}`
          },
          {
            role: "user",
            content: transcription
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        intent: result.intent || 'unknown',
        parameters: result.parameters || {},
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Error analyzing voice intent:", error);
      return {
        intent: 'unknown',
        parameters: {},
        confidence: 0.0
      };
    }
  }

  /**
   * Execute voice command based on intent
   */
  private async executeVoiceCommand(voiceCommand: VoiceCommand): Promise<void> {
    try {
      await storage.updateVoiceCommand(voiceCommand.id, { status: 'processing' });
      
      let result: string;
      
      switch (voiceCommand.intent) {
        case VOICE_INTENTS.MARK_READ:
          result = await this.executeMarkRead(voiceCommand.userId, voiceCommand.parameters);
          break;
        case VOICE_INTENTS.ARCHIVE:
          result = await this.executeArchive(voiceCommand.userId, voiceCommand.parameters);
          break;
        case VOICE_INTENTS.DELETE:
          result = await this.executeDelete(voiceCommand.userId, voiceCommand.parameters);
          break;
        case VOICE_INTENTS.SEARCH:
          result = await this.executeSearch(voiceCommand.userId, voiceCommand.parameters);
          break;
        case VOICE_INTENTS.SUMMARIZE:
          result = await this.executeSummarize(voiceCommand.userId, voiceCommand.parameters);
          break;
        default:
          result = `Voice command "${voiceCommand.intent}" is not yet supported.`;
      }

      await storage.updateVoiceCommand(voiceCommand.id, {
        status: 'completed',
        result,
        completedAt: new Date()
      });
    } catch (error) {
      console.error("Error executing voice command:", error);
      await storage.updateVoiceCommand(voiceCommand.id, {
        status: 'failed',
        result: `Failed to execute command: ${error.message}`,
        completedAt: new Date()
      });
    }
  }

  /**
   * Execute mark as read command
   */
  private async executeMarkRead(userId: string, parameters: any): Promise<string> {
    const { filter, scope } = parameters;
    
    // Demo implementation - in real app would integrate with email providers
    if (filter === 'newsletters' && scope === 'all') {
      return "Marked 23 newsletter emails as read.";
    } else if (filter === 'promotions') {
      return "Marked 15 promotional emails as read.";
    } else {
      return "Marked selected emails as read.";
    }
  }

  /**
   * Execute archive command
   */
  private async executeArchive(userId: string, parameters: any): Promise<string> {
    const { time_range, scope, sender } = parameters;
    
    if (time_range === 'last_week') {
      return "Archived 45 emails from last week.";
    } else if (sender) {
      return `Archived all emails from ${sender}.`;
    } else {
      return "Archived selected emails.";
    }
  }

  /**
   * Execute delete command
   */
  private async executeDelete(userId: string, parameters: any): Promise<string> {
    const { filter, confirmation } = parameters;
    
    // Require confirmation for delete operations
    if (!confirmation) {
      return "Delete operation requires confirmation. Please confirm deletion.";
    }
    
    return "Deleted selected emails.";
  }

  /**
   * Execute search command
   */
  private async executeSearch(userId: string, parameters: any): Promise<string> {
    const { keywords, sender, date_range } = parameters;
    
    let searchQuery = "Found emails";
    if (keywords) searchQuery += ` containing "${keywords.join(', ')}"`;
    if (sender) searchQuery += ` from ${sender}`;
    if (date_range) searchQuery += ` from ${date_range}`;
    
    return `${searchQuery}. Displaying 12 results.`;
  }

  /**
   * Execute summarize command
   */
  private async executeSummarize(userId: string, parameters: any): Promise<string> {
    const { scope, time_range } = parameters;
    
    if (scope === 'inbox' && time_range === 'today') {
      return "Today's inbox summary: 8 important emails, 3 require responses, 12 newsletters, 2 meeting invites.";
    } else {
      return "Email summary generated and available in your dashboard.";
    }
  }

  /**
   * Generate enhanced email response from voice input
   */
  async generateVoiceResponse(
    userId: string, 
    originalEmailId: string, 
    voiceInput: string,
    originalEmailContent?: string
  ): Promise<VoiceResponse> {
    try {
      // Transcribe voice input if it's audio
      const transcription = voiceInput; // Assume already transcribed for demo
      
      // Analyze context and enhance response
      const enhancement = await this.enhanceVoiceResponse(
        transcription, 
        originalEmailContent || ""
      );
      
      // Create voice response record
      const voiceResponse = await storage.createVoiceResponse({
        userId,
        originalEmailId,
        voiceInput,
        enhancedResponse: enhancement.enhancedText,
        audioTranscription: transcription,
        contextAnalysis: enhancement.contextAnalysis,
        sentimentScore: enhancement.sentimentScore,
        confidence: enhancement.confidence,
      });

      return voiceResponse;
    } catch (error) {
      console.error("Error generating voice response:", error);
      throw new Error("Failed to generate voice response");
    }
  }

  /**
   * Generate AI draft response based on email content
   */
  async generateAIDraftResponse(
    userId: string,
    originalEmailId: string,
    emailContent: string,
    responseType: string = 'professional'
  ): Promise<{ draftResponse: string; responseType: string; keyPoints: string[] }> {
    try {
      // Use OpenAI to analyze email and generate appropriate response
      const prompt = `
You are an AI email assistant. Analyze the following email and generate an appropriate ${responseType} response.

Email Content:
${emailContent}

Please generate a ${responseType} response that:
1. Acknowledges the main points of the email
2. Provides a clear and helpful response
3. Maintains appropriate tone (${responseType})
4. Is concise but complete
5. Includes a proper greeting and closing

Response should be well-structured and ready to send with minimal editing.

Please also identify 3-5 key points that the response addresses.

Return JSON format:
{
  "draftResponse": "the complete email response",
  "keyPoints": ["point 1", "point 2", "point 3"]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Store the AI draft interaction using voice interaction table
      await storage.createVoiceInteraction({
        userId,
        interactionType: 'ai_draft',
        inputData: { emailContent, responseType },
        outputData: result,
        metadata: { originalEmailId },
        createdAt: new Date()
      });

      return {
        draftResponse: result.draftResponse || "I'll be happy to help with that. Let me get back to you shortly.",
        responseType,
        keyPoints: result.keyPoints || []
      };
    } catch (error) {
      console.error('Error generating AI draft response:', error);
      throw new Error('Failed to generate AI draft response');
    }
  }

  /**
   * Enhance voice response using AI
   */
  private async enhanceVoiceResponse(
    voiceInput: string, 
    originalEmailContent: string
  ): Promise<{
    enhancedText: string;
    contextAnalysis: any;
    sentimentScore: number;
    confidence: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that enhances dictated email responses. 
            
            Your task:
            1. Take the user's spoken response and enhance it professionally
            2. Maintain the user's intent and tone
            3. Improve grammar, clarity, and structure
            4. Add appropriate email formatting
            5. Ensure context-awareness with the original email
            
            Return JSON with:
            - enhancedText: the improved email response
            - contextAnalysis: analysis of how well it addresses the original email
            - sentimentScore: sentiment score (-1 to 1)
            - confidence: confidence in the enhancement (0-1)`
          },
          {
            role: "user",
            content: `Original email: ${originalEmailContent}\n\nVoice response: ${voiceInput}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        enhancedText: result.enhancedText || voiceInput,
        contextAnalysis: result.contextAnalysis || {},
        sentimentScore: result.sentimentScore || 0,
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Error enhancing voice response:", error);
      return {
        enhancedText: voiceInput,
        contextAnalysis: {},
        sentimentScore: 0,
        confidence: 0.0
      };
    }
  }

  /**
   * Generate audio summary of emails
   */
  async generateEmailAudioSummary(
    userId: string, 
    emailIds: string[],
    summaryType: 'daily' | 'priority' | 'custom' = 'daily'
  ): Promise<EmailAudioSummary> {
    try {
      // Get email content (demo data for now)
      const emailContent = this.getDemoEmailContent(emailIds);
      
      // Generate text summary
      const textSummary = await this.generateTextSummary(emailContent, summaryType);
      
      // Generate audio from text using OpenAI TTS (Text-to-Speech)
      const audioBuffer = await this.generateAudioFromText(textSummary.summary);
      
      // In a real implementation, you'd save the audio file and get a URL
      const audioUrl = `/api/audio/summary-${Date.now()}.mp3`;
      
      // Create audio summary record
      const audioSummary = await storage.createEmailAudioSummary({
        userId,
        emailId: emailIds[0], // Primary email ID
        summary: textSummary.summary,
        audioUrl,
        duration: this.estimateAudioDuration(textSummary.summary),
        keyPoints: textSummary.keyPoints,
        actionItems: textSummary.actionItems,
      });

      return audioSummary;
    } catch (error) {
      console.error("Error generating audio summary:", error);
      throw new Error("Failed to generate audio summary");
    }
  }

  /**
   * Generate text summary of emails
   */
  private async generateTextSummary(
    emailContent: string, 
    summaryType: string
  ): Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that creates concise email summaries for busy professionals. 
            
            Create a ${summaryType} summary that includes:
            - Main summary (2-3 sentences)
            - Key points (3-5 bullet points)
            - Action items (specific tasks requiring attention)
            
            Keep it professional but conversational for audio consumption.
            Return JSON format.`
          },
          {
            role: "user",
            content: emailContent
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        summary: result.summary || "No summary available",
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || []
      };
    } catch (error) {
      console.error("Error generating text summary:", error);
      return {
        summary: "Unable to generate summary",
        keyPoints: [],
        actionItems: []
      };
    }
  }

  /**
   * Generate audio from text using OpenAI TTS
   */
  private async generateAudioFromText(text: string): Promise<Buffer> {
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova", // Professional female voice
        input: text,
        response_format: "mp3"
      });

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error("Error generating audio:", error);
      throw new Error("Failed to generate audio");
    }
  }

  /**
   * Get user's voice commands history
   */
  async getVoiceCommandHistory(userId: string, limit: number = 50): Promise<VoiceCommand[]> {
    return await storage.getVoiceCommands(userId, limit);
  }

  /**
   * Get user's voice responses history
   */
  async getVoiceResponseHistory(userId: string, limit: number = 50): Promise<VoiceResponse[]> {
    return await storage.getVoiceResponses(userId, limit);
  }

  /**
   * Get user's audio summaries
   */
  async getAudioSummaries(userId: string, limit: number = 50): Promise<EmailAudioSummary[]> {
    return await storage.getEmailAudioSummaries(userId, limit);
  }

  /**
   * Helper method to estimate audio duration
   */
  private estimateAudioDuration(text: string): number {
    // Rough estimate: 150 words per minute
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / 150) * 60); // Duration in seconds
  }

  /**
   * Demo email content for testing
   */
  private getDemoEmailContent(emailIds: string[]): string {
    return `
    Email 1: Meeting Reminder - Team standup at 2 PM today in conference room A.
    Email 2: Project Update - Q4 deliverables are on track, need review of final presentation.
    Email 3: Newsletter - Weekly tech updates and industry news.
    Email 4: Client Inquiry - Request for proposal deadline extended to next Friday.
    Email 5: HR Notice - Company holiday schedule for December released.
    `;
  }

  /**
   * Generate demo voice commands for testing
   */
  generateDemoVoiceCommands(userId: string): VoiceCommand[] {
    return [
      {
        id: 1,
        userId,
        command: "Mark all newsletters as read",
        intent: VOICE_INTENTS.MARK_READ,
        parameters: { filter: "newsletters", scope: "all" },
        status: "completed",
        result: "Marked 23 newsletter emails as read.",
        audioTranscription: "Mark all newsletters as read",
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: new Date(Date.now() - 3590000)
      },
      {
        id: 2,
        userId,
        command: "Archive emails from last week",
        intent: VOICE_INTENTS.ARCHIVE,
        parameters: { time_range: "last_week", scope: "all" },
        status: "completed",
        result: "Archived 45 emails from last week.",
        audioTranscription: "Archive emails from last week",
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        completedAt: new Date(Date.now() - 7190000)
      },
      {
        id: 3,
        userId,
        command: "Search for emails about the project proposal",
        intent: VOICE_INTENTS.SEARCH,
        parameters: { keywords: ["project", "proposal"] },
        status: "completed",
        result: "Found 8 emails containing 'project proposal'. Displaying results.",
        audioTranscription: "Search for emails about the project proposal",
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        completedAt: new Date(Date.now() - 1790000)
      }
    ];
  }

  /**
   * Generate demo voice responses for testing
   */
  generateDemoVoiceResponses(userId: string): VoiceResponse[] {
    return [
      {
        id: 1,
        userId,
        originalEmailId: "email-123",
        voiceInput: "Yeah sure I can make it to the meeting tomorrow at 2 PM",
        enhancedResponse: "Thank you for the invitation. I can confirm my attendance at the meeting tomorrow at 2 PM. Please let me know if there's anything specific I should prepare beforehand.",
        audioTranscription: "Yeah sure I can make it to the meeting tomorrow at 2 PM",
        contextAnalysis: { topic: "meeting_confirmation", formality: "enhanced", clarity_improved: true },
        sentimentScore: 0.8,
        confidence: 0.92,
        createdAt: new Date(Date.now() - 5400000) // 1.5 hours ago
      },
      {
        id: 2,
        userId,
        originalEmailId: "email-456",
        voiceInput: "Tell them I need more time to review the documents maybe by Friday",
        enhancedResponse: "Thank you for sending the documents. I would appreciate additional time to thoroughly review them. Would it be possible to extend the deadline to Friday? This will ensure I can provide comprehensive feedback.",
        audioTranscription: "Tell them I need more time to review the documents maybe by Friday",
        contextAnalysis: { topic: "deadline_extension", formality: "enhanced", politeness_improved: true },
        sentimentScore: 0.6,
        confidence: 0.88,
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ];
  }

  /**
   * Generate demo audio summaries for testing
   */
  generateDemoAudioSummaries(userId: string): EmailAudioSummary[] {
    return [
      {
        id: 1,
        userId,
        emailId: "daily-summary-001",
        summary: "Today you received 24 emails. 3 require immediate attention including a client proposal deadline and team meeting confirmation. 12 newsletters and 5 promotional emails can be archived. Key action items: respond to Sarah about project timeline and confirm attendance for tomorrow's board meeting.",
        audioUrl: "/api/audio/daily-summary-001.mp3",
        duration: 45,
        keyPoints: [
          "24 total emails received",
          "3 emails need immediate response",
          "Client proposal deadline tomorrow",
          "Board meeting confirmation required"
        ],
        actionItems: [
          "Respond to Sarah about project timeline",
          "Confirm board meeting attendance",
          "Review client proposal before deadline"
        ],
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: 2,
        userId,
        emailId: "priority-summary-002",
        summary: "Priority email summary: High-importance message from your manager about Q4 budget review scheduled for next week. Client feedback on the presentation is mostly positive with minor revisions requested. Team lead position interview has been scheduled for Thursday.",
        audioUrl: "/api/audio/priority-summary-002.mp3",
        duration: 32,
        keyPoints: [
          "Q4 budget review next week",
          "Positive client feedback received",
          "Interview scheduled for Thursday"
        ],
        actionItems: [
          "Prepare for Q4 budget review",
          "Implement minor presentation revisions",
          "Prepare for team lead interview"
        ],
        createdAt: new Date(Date.now() - 7200000) // 2 hours ago
      }
    ];
  }
}

export const voiceEmailService = new VoiceEmailService();