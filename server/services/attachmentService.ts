import OpenAI from "openai";
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AttachmentAnalysis {
  filename: string;
  mimeType: string;
  size: number;
  content: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  dataExtracted?: any;
  insights: string[];
  category: 'document' | 'spreadsheet' | 'image' | 'presentation' | 'other';
}

interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
}

export class AttachmentService {

  /**
   * Analyze email attachments and extract meaningful information
   */
  async analyzeAttachments(attachments: EmailAttachment[]): Promise<AttachmentAnalysis[]> {
    const analyses: AttachmentAnalysis[] = [];

    for (const attachment of attachments) {
      try {
        const analysis = await this.analyzeAttachment(attachment);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Error analyzing attachment ${attachment.filename}:`, error);
        // Create basic analysis even if detailed analysis fails
        analyses.push({
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          size: attachment.size,
          content: 'Analysis failed',
          summary: `Unable to analyze ${attachment.filename}`,
          keyPoints: [],
          actionItems: [],
          insights: [],
          category: this.categorizeByMimeType(attachment.mimeType)
        });
      }
    }

    return analyses;
  }

  /**
   * Analyze a single attachment
   */
  private async analyzeAttachment(attachment: EmailAttachment): Promise<AttachmentAnalysis> {
    const category = this.categorizeByMimeType(attachment.mimeType);
    
    let content = '';
    let dataExtracted: any = undefined;

    // Extract content based on file type
    if (this.isTextDocument(attachment.mimeType)) {
      content = await this.extractTextContent(attachment);
    } else if (this.isSpreadsheet(attachment.mimeType)) {
      const result = await this.extractSpreadsheetContent(attachment);
      content = result.content;
      dataExtracted = result.data;
    } else if (this.isImage(attachment.mimeType)) {
      content = await this.analyzeImageContent(attachment);
    } else if (this.isPDF(attachment.mimeType)) {
      content = await this.extractPDFContent(attachment);
    } else {
      content = `Binary file: ${attachment.filename} (${attachment.mimeType})`;
    }

    // Use AI to analyze the content
    const aiAnalysis = await this.performAIAnalysis(content, attachment.filename, category);

    return {
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
      content,
      summary: aiAnalysis.summary,
      keyPoints: aiAnalysis.keyPoints,
      actionItems: aiAnalysis.actionItems,
      dataExtracted,
      insights: aiAnalysis.insights,
      category
    };
  }

  /**
   * Use AI to analyze attachment content
   */
  private async performAIAnalysis(content: string, filename: string, category: string): Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    insights: string[];
  }> {
    try {
      const prompt = `Analyze this ${category} attachment and provide insights:

Filename: ${filename}
Content: ${content}

Please analyze and return JSON with:
{
  "summary": "Brief summary of the document",
  "keyPoints": ["main points or findings"],
  "actionItems": ["any tasks or actions mentioned"],
  "insights": ["business insights or important observations"]
}

Focus on:
- What is this document about?
- What are the key takeaways?
- Are there any deadlines, tasks, or actions required?
- Any financial data, metrics, or important business information?
- Any decisions that need to be made?`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert document analyst. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        summary: result.summary || "No summary available",
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
        insights: result.insights || []
      };

    } catch (error) {
      console.error("Error in AI analysis:", error);
      return {
        summary: "AI analysis failed",
        keyPoints: [],
        actionItems: [],
        insights: []
      };
    }
  }

  /**
   * Extract text content from text-based documents
   */
  private async extractTextContent(attachment: EmailAttachment): Promise<string> {
    try {
      // For text files, convert buffer to string
      if (attachment.mimeType.includes('text/')) {
        return attachment.data.toString('utf-8');
      }
      
      // For other text formats, you would need specific parsers
      // This is a simplified implementation
      return attachment.data.toString('utf-8').substring(0, 5000); // Limit to 5000 chars
      
    } catch (error) {
      return `Error extracting text from ${attachment.filename}`;
    }
  }

  /**
   * Extract content from spreadsheets
   */
  private async extractSpreadsheetContent(attachment: EmailAttachment): Promise<{
    content: string;
    data: any;
  }> {
    try {
      // In a real implementation, you would use libraries like:
      // - xlsx for Excel files
      // - csv-parser for CSV files
      // For now, we'll simulate the analysis
      
      const data = {
        sheets: ['Sheet1'],
        rowCount: 100,
        columnCount: 5,
        summary: 'Spreadsheet contains numerical data with headers'
      };

      const content = `Spreadsheet Analysis:
- File: ${attachment.filename}
- Contains ${data.rowCount} rows and ${data.columnCount} columns
- Appears to be ${this.inferSpreadsheetType(attachment.filename)}
- Key data points and trends would be analyzed here`;

      return { content, data };

    } catch (error) {
      return {
        content: `Error analyzing spreadsheet ${attachment.filename}`,
        data: null
      };
    }
  }

  /**
   * Analyze image content using AI vision
   */
  private async analyzeImageContent(attachment: EmailAttachment): Promise<string> {
    try {
      const base64Image = attachment.data.toString('base64');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and describe what you see. Focus on any text, charts, diagrams, or business-relevant content."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${attachment.mimeType};base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content || "Could not analyze image";

    } catch (error) {
      console.error("Error analyzing image:", error);
      return `Image analysis failed for ${attachment.filename}`;
    }
  }

  /**
   * Extract content from PDF files
   */
  private async extractPDFContent(attachment: EmailAttachment): Promise<string> {
    try {
      // In a real implementation, you would use a PDF parser like pdf-parse
      // For now, return a placeholder
      return `PDF Document: ${attachment.filename}
Size: ${(attachment.size / 1024).toFixed(1)} KB
Content extraction would require PDF parsing library`;
      
    } catch (error) {
      return `Error extracting PDF content from ${attachment.filename}`;
    }
  }

  /**
   * Generate contextual email response based on attachment analysis
   */
  async generateResponseWithAttachmentContext(
    emailContent: string,
    attachmentAnalyses: AttachmentAnalysis[],
    context: { 
      purpose: 'reply' | 'acknowledge' | 'request_info';
      tone: 'formal' | 'casual' | 'professional';
    }
  ): Promise<string> {
    try {
      const attachmentSummary = attachmentAnalyses.map(analysis => 
        `${analysis.filename}: ${analysis.summary}`
      ).join('\n');

      const keyFindings = attachmentAnalyses
        .flatMap(analysis => analysis.keyPoints)
        .slice(0, 5) // Top 5 findings
        .join('\n- ');

      const prompt = `Generate a professional email response that acknowledges and references the attachments:

Original Email: ${emailContent}

Attachments Analysis:
${attachmentSummary}

Key Findings:
- ${keyFindings}

Context:
- Purpose: ${context.purpose}
- Tone: ${context.tone}

Generate a response that:
1. Acknowledges receipt of the attachments
2. References specific content from the analysis
3. Addresses any action items or questions
4. Maintains the requested tone
5. Is concise but thorough`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional email assistant. Generate contextual responses that reference attachment content appropriately."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800
      });

      return response.choices[0].message.content || "Unable to generate response";

    } catch (error) {
      console.error("Error generating response with attachment context:", error);
      throw new Error("Failed to generate contextual response");
    }
  }

  /**
   * Helper methods
   */
  private categorizeByMimeType(mimeType: string): 'document' | 'spreadsheet' | 'image' | 'presentation' | 'other' {
    if (mimeType.includes('sheet') || mimeType.includes('csv')) return 'spreadsheet';
    if (mimeType.includes('image/')) return 'image';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('text/') || mimeType.includes('document') || mimeType.includes('pdf')) return 'document';
    return 'other';
  }

  private isTextDocument(mimeType: string): boolean {
    return mimeType.includes('text/') || 
           mimeType.includes('document') ||
           mimeType.includes('rtf');
  }

  private isSpreadsheet(mimeType: string): boolean {
    return mimeType.includes('sheet') || 
           mimeType.includes('csv') ||
           mimeType.includes('excel');
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private isPDF(mimeType: string): boolean {
    return mimeType.includes('pdf');
  }

  private inferSpreadsheetType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('budget') || lower.includes('financial')) return 'financial data';
    if (lower.includes('report') || lower.includes('analytics')) return 'business report';
    if (lower.includes('contact') || lower.includes('lead')) return 'contact/lead data';
    if (lower.includes('schedule') || lower.includes('timeline')) return 'project timeline';
    return 'data analysis';
  }
}

export const attachmentService = new AttachmentService();