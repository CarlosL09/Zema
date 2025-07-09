import OpenAI from "openai";
import { storage } from "../storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface WritingStyleProfile {
  userId: string;
  styleAnalysis: {
    tone: string; // formal, casual, friendly, professional
    complexity: string; // simple, moderate, complex
    length: string; // brief, moderate, detailed
    vocabulary: string[]; // commonly used words/phrases
    signature: string; // email signature pattern
    greetings: string[]; // typical greeting patterns
    closings: string[]; // typical closing patterns
  };
  examples: string[]; // sample emails for training
  lastUpdated: Date;
}

export class WritingStyleService {
  
  /**
   * Analyze user's writing style from their sent emails
   */
  async analyzeWritingStyle(userId: string, emailSamples: string[]): Promise<WritingStyleProfile> {
    try {
      const prompt = `Analyze the writing style from these email samples and extract key characteristics:

${emailSamples.map((email, i) => `Email ${i + 1}:\n${email}\n`).join('\n')}

Please analyze and return JSON with:
{
  "tone": "formal/casual/friendly/professional",
  "complexity": "simple/moderate/complex", 
  "length": "brief/moderate/detailed",
  "vocabulary": ["commonly used words/phrases"],
  "signature": "typical signature pattern",
  "greetings": ["typical greeting patterns"],
  "closings": ["typical closing patterns"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing writing styles. Return only valid JSON."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const styleAnalysis = JSON.parse(response.choices[0].message.content || "{}");
      
      const profile: WritingStyleProfile = {
        userId,
        styleAnalysis,
        examples: emailSamples,
        lastUpdated: new Date()
      };

      // Store the writing style profile
      await storage.saveWritingStyleProfile(profile);
      
      return profile;

    } catch (error) {
      console.error("Error analyzing writing style:", error);
      throw new Error("Failed to analyze writing style");
    }
  }

  /**
   * Generate email draft using user's learned writing style
   */
  async generateStyledDraft(userId: string, context: {
    subject?: string;
    originalEmail?: string;
    purpose: string; // reply, new email, follow-up
    recipient?: string;
    keyPoints?: string[];
  }): Promise<string> {
    try {
      // Get user's writing style profile
      const styleProfile = await storage.getWritingStyleProfile(userId);
      
      if (!styleProfile) {
        throw new Error("No writing style profile found. Please analyze some email samples first.");
      }

      const { styleAnalysis } = styleProfile;
      
      const prompt = `Generate an email that matches this specific writing style:

WRITING STYLE PROFILE:
- Tone: ${styleAnalysis.tone}
- Complexity: ${styleAnalysis.complexity}
- Length preference: ${styleAnalysis.length}
- Common vocabulary: ${styleAnalysis.vocabulary.join(", ")}
- Typical greetings: ${styleAnalysis.greetings.join(", ")}
- Typical closings: ${styleAnalysis.closings.join(", ")}
- Signature pattern: ${styleAnalysis.signature}

CONTEXT:
- Purpose: ${context.purpose}
- Subject: ${context.subject || "N/A"}
- Recipient: ${context.recipient || "N/A"}
- Key points to include: ${context.keyPoints?.join(", ") || "N/A"}
${context.originalEmail ? `- Original email to respond to:\n${context.originalEmail}` : ""}

SAMPLE EMAILS FOR REFERENCE:
${styleProfile.examples.slice(0, 2).map((email, i) => `Example ${i + 1}:\n${email}\n`).join('\n')}

Generate an email that perfectly matches this person's writing style, tone, and patterns. Make it sound exactly like they would write it.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert email writer who can perfectly mimic someone's writing style based on their profile."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content || "";

    } catch (error) {
      console.error("Error generating styled draft:", error);
      throw new Error("Failed to generate styled email draft");
    }
  }

  /**
   * Learn from new email samples to improve style profile
   */
  async updateStyleFromNewEmails(userId: string, newEmailSamples: string[]): Promise<void> {
    try {
      const existingProfile = await storage.getWritingStyleProfile(userId);
      
      if (!existingProfile) {
        // Create new profile if none exists
        await this.analyzeWritingStyle(userId, newEmailSamples);
        return;
      }

      // Combine existing samples with new ones (keep most recent 20)
      const combinedSamples = [...existingProfile.examples, ...newEmailSamples].slice(-20);
      
      // Re-analyze with updated samples
      await this.analyzeWritingStyle(userId, combinedSamples);

    } catch (error) {
      console.error("Error updating writing style:", error);
      throw new Error("Failed to update writing style profile");
    }
  }

  /**
   * Get user's current writing style profile
   */
  async getWritingStyleProfile(userId: string): Promise<WritingStyleProfile | null> {
    try {
      return await storage.getWritingStyleProfile(userId);
    } catch (error) {
      console.error("Error getting writing style profile:", error);
      return null;
    }
  }
}

export const writingStyleService = new WritingStyleService();