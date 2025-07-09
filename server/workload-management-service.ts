import OpenAI from "openai";
import { 
  emailWorkloadClassifications, 
  userEnergyPatterns, 
  emailProcessingSchedules, 
  workloadAnalytics,
  type EmailWorkloadClassification,
  type InsertEmailWorkloadClassification,
  type UserEnergyPattern,
  type InsertUserEnergyPattern,
  type EmailProcessingSchedule,
  type InsertEmailProcessingSchedule,
  type WorkloadAnalytics,
  type InsertWorkloadAnalytics
} from "@shared/schema";
import { storage } from "./storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EmailContent {
  id: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  content: string;
  timestamp: Date;
  threadContext?: string[];
}

interface WorkloadClassificationResult {
  timeToComplete: "2min" | "15min" | "1hr" | "2hr+";
  complexityScore: number;
  taskType: "quick_reply" | "research_required" | "decision_making" | "administrative" | "creative";
  priorityLevel: "low" | "medium" | "high" | "urgent";
  batchCategory: "quick_responses" | "deep_work" | "administrative" | "meetings";
  suggestedProcessingTime: "morning" | "afternoon" | "evening";
  focusBlockDuration: number;
  cognitiveLoad: "low" | "medium" | "high";
  energyLevel: "low" | "medium" | "high";
  reasoningFactors: string[];
  confidenceScore: number;
}

interface EnergyPattern {
  hourOfDay: number;
  dayOfWeek: number;
  energyLevel: number;
  emailsProcessed: number;
  avgResponseTime: number;
  qualityScore: number;
}

interface ProcessingSchedule {
  scheduleName: string;
  timeBlocks: Array<{
    start: string;
    end: string;
    type: "email_processing" | "focus_block" | "break" | "meetings";
    category?: string;
  }>;
  focusBlocks: Array<{
    duration: number;
    category: string;
    estimatedEmailCount: number;
    energyRequired: "low" | "medium" | "high";
  }>;
  batchingRules: Array<{
    category: string;
    maxBatchSize: number;
    timeLimit: number;
    energyThreshold: "low" | "medium" | "high";
  }>;
}

export class WorkloadManagementService {
  
  /**
   * Analyzes email content and classifies workload requirements using AI
   */
  async classifyEmailWorkload(email: EmailContent, userId: string): Promise<EmailWorkloadClassification> {
    try {
      const prompt = this.buildWorkloadAnalysisPrompt(email);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert email workload analyst. Analyze emails and classify their time requirements, complexity, and optimal processing conditions. Respond with JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis: WorkloadClassificationResult = JSON.parse(response.choices[0].message.content || "{}");
      
      // Store the classification in the database
      const classificationData: InsertEmailWorkloadClassification = {
        userId,
        emailId: email.id,
        fromEmail: email.fromEmail,
        subject: email.subject,
        contentPreview: email.content.substring(0, 500),
        timeToComplete: analysis.timeToComplete,
        complexityScore: analysis.complexityScore,
        taskType: analysis.taskType,
        priorityLevel: analysis.priorityLevel,
        batchCategory: analysis.batchCategory,
        suggestedProcessingTime: analysis.suggestedProcessingTime,
        focusBlockDuration: analysis.focusBlockDuration,
        cognitiveLoad: analysis.cognitiveLoad,
        energyLevel: analysis.energyLevel,
        reasoningFactors: analysis.reasoningFactors,
        confidenceScore: analysis.confidenceScore
      };

      return await storage.createEmailWorkloadClassification(classificationData);
    } catch (error) {
      console.error("Error classifying email workload:", error);
      throw new Error("Failed to classify email workload: " + (error as Error).message);
    }
  }

  /**
   * Analyzes user's energy patterns based on historical email processing data
   */
  async analyzeEnergyPatterns(userId: string): Promise<UserEnergyPattern[]> {
    try {
      // Get existing energy patterns for the user
      const existingPatterns = await storage.getUserEnergyPatterns(userId);
      
      // Get recent email processing data to update patterns
      const recentClassifications = await storage.getEmailWorkloadClassifications(userId, { limit: 100 });
      
      // Analyze patterns for each hour of day and day of week
      const patterns: Map<string, EnergyPattern> = new Map();
      
      for (const classification of recentClassifications) {
        if (classification.completedAt && classification.actualTimeSpent) {
          const date = new Date(classification.completedAt);
          const hourOfDay = date.getHours();
          const dayOfWeek = date.getDay() || 7; // Convert Sunday from 0 to 7
          
          const key = `${hourOfDay}-${dayOfWeek}`;
          const existing = patterns.get(key) || {
            hourOfDay,
            dayOfWeek,
            energyLevel: 0,
            emailsProcessed: 0,
            avgResponseTime: 0,
            qualityScore: 0
          };
          
          // Calculate efficiency score based on predicted vs actual time
          const predictedMinutes = this.getTimeEstimateInMinutes(classification.timeToComplete);
          const efficiencyScore = Math.min(1, predictedMinutes / classification.actualTimeSpent);
          
          existing.emailsProcessed += 1;
          existing.avgResponseTime = (existing.avgResponseTime * (existing.emailsProcessed - 1) + classification.actualTimeSpent) / existing.emailsProcessed;
          existing.qualityScore = (existing.qualityScore * (existing.emailsProcessed - 1) + efficiencyScore) / existing.emailsProcessed;
          existing.energyLevel = existing.qualityScore; // Use quality score as proxy for energy level
          
          patterns.set(key, existing);
        }
      }
      
      // Update database with new patterns
      const updatedPatterns: UserEnergyPattern[] = [];
      for (const [key, pattern] of patterns) {
        const patternData: InsertUserEnergyPattern = {
          userId,
          hourOfDay: pattern.hourOfDay,
          dayOfWeek: pattern.dayOfWeek,
          energyLevel: pattern.energyLevel,
          emailsProcessed: pattern.emailsProcessed,
          avgResponseTime: pattern.avgResponseTime,
          qualityScore: pattern.qualityScore,
          dataPoints: 1,
          confidence: Math.min(1, pattern.emailsProcessed / 10) // Higher confidence with more data points
        };
        
        const updatedPattern = await storage.upsertUserEnergyPattern(patternData);
        updatedPatterns.push(updatedPattern);
      }
      
      return updatedPatterns;
    } catch (error) {
      console.error("Error analyzing energy patterns:", error);
      throw new Error("Failed to analyze energy patterns: " + (error as Error).message);
    }
  }

  /**
   * Generates optimal email processing schedule based on energy patterns and workload
   */
  async generateOptimalSchedule(userId: string, preferences?: {
    startTime?: string;
    endTime?: string;
    maxFocusBlockDuration?: number;
    breakDuration?: number;
  }): Promise<EmailProcessingSchedule> {
    try {
      const energyPatterns = await storage.getUserEnergyPatterns(userId);
      const pendingEmails = await storage.getEmailWorkloadClassifications(userId, { completed: false });
      
      // Analyze workload distribution
      const workloadAnalysis = this.analyzeWorkloadDistribution(pendingEmails);
      
      // Generate AI-optimized schedule
      const schedule = await this.generateAIOptimizedSchedule(
        energyPatterns,
        workloadAnalysis,
        preferences
      );
      
      const scheduleData: InsertEmailProcessingSchedule = {
        userId,
        scheduleName: `Optimized Schedule - ${new Date().toISOString().split('T')[0]}`,
        timeBlocks: schedule.timeBlocks,
        focusBlocks: schedule.focusBlocks,
        batchingRules: schedule.batchingRules,
        preferredStartTime: preferences?.startTime || "09:00",
        preferredEndTime: preferences?.endTime || "17:00",
        breakDuration: preferences?.breakDuration || 15,
        maxFocusBlockDuration: preferences?.maxFocusBlockDuration || 90,
        avgDailyEmailCount: pendingEmails.length,
        aiOptimizationEnabled: true
      };
      
      return await storage.createEmailProcessingSchedule(scheduleData);
    } catch (error) {
      console.error("Error generating optimal schedule:", error);
      throw new Error("Failed to generate optimal schedule: " + (error as Error).message);
    }
  }

  /**
   * Creates focus blocks by batching similar email types
   */
  async createFocusBlocks(userId: string, date: Date): Promise<Array<{
    timeSlot: string;
    duration: number;
    category: string;
    emails: EmailWorkloadClassification[];
    estimatedCompletionTime: number;
    energyRequired: "low" | "medium" | "high";
  }>> {
    try {
      const classifications = await storage.getEmailWorkloadClassifications(userId, { 
        completed: false,
        date: date.toISOString().split('T')[0]
      });
      
      // Group emails by batch category
      const batches = this.groupEmailsByCategory(classifications);
      
      // Create focus blocks
      const focusBlocks = [];
      for (const [category, emails] of batches) {
        const totalTime = emails.reduce((sum, email) => 
          sum + this.getTimeEstimateInMinutes(email.timeToComplete), 0
        );
        
        const avgEnergyLevel = this.calculateAverageEnergyRequirement(emails);
        
        focusBlocks.push({
          timeSlot: this.suggestOptimalTimeSlot(category, avgEnergyLevel),
          duration: Math.min(90, totalTime + 10), // Add 10 min buffer, max 90 min
          category,
          emails,
          estimatedCompletionTime: totalTime,
          energyRequired: avgEnergyLevel
        });
      }
      
      return focusBlocks.sort((a, b) => {
        const timeOrder = { "morning": 1, "afternoon": 2, "evening": 3 };
        return timeOrder[a.timeSlot] - timeOrder[b.timeSlot];
      });
    } catch (error) {
      console.error("Error creating focus blocks:", error);
      throw new Error("Failed to create focus blocks: " + (error as Error).message);
    }
  }

  /**
   * Tracks daily workload analytics
   */
  async trackDailyWorkload(userId: string, date: Date): Promise<WorkloadAnalytics> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const classifications = await storage.getEmailWorkloadClassifications(userId, { 
        date: dateStr 
      });
      
      const completedEmails = classifications.filter(c => c.completed);
      
      const analytics = {
        totalEmailsProcessed: completedEmails.length,
        totalTimeSpent: completedEmails.reduce((sum, email) => 
          sum + (email.actualTimeSpent || 0), 0) / 60, // Convert to hours
        avgTimePerEmail: completedEmails.length > 0 ? 
          completedEmails.reduce((sum, email) => sum + (email.actualTimeSpent || 0), 0) / completedEmails.length : 0,
        quickTasks: completedEmails.filter(e => e.timeToComplete === "2min").length,
        mediumTasks: completedEmails.filter(e => e.timeToComplete === "15min").length,
        longTasks: completedEmails.filter(e => ["1hr", "2hr+"].includes(e.timeToComplete)).length
      };
      
      // Generate AI insights
      const insights = await this.generateDailyInsights(classifications, analytics);
      
      const analyticsData: InsertWorkloadAnalytics = {
        userId,
        date: dateStr,
        ...analytics,
        insights: insights.insights,
        recommendations: insights.recommendations
      };
      
      return await storage.createWorkloadAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking daily workload:", error);
      throw new Error("Failed to track daily workload: " + (error as Error).message);
    }
  }

  /**
   * Provides workload optimization recommendations
   */
  async getWorkloadRecommendations(userId: string): Promise<{
    optimizationScore: number;
    recommendations: string[];
    insights: string[];
    schedulingTips: string[];
  }> {
    try {
      const recentAnalytics = await storage.getWorkloadAnalytics(userId, { limit: 7 });
      const energyPatterns = await storage.getUserEnergyPatterns(userId);
      const currentSchedule = await storage.getActiveEmailProcessingSchedule(userId);
      
      const prompt = this.buildOptimizationPrompt(recentAnalytics, energyPatterns, currentSchedule);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert productivity coach specializing in email workload optimization. Analyze user data and provide actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error getting workload recommendations:", error);
      throw new Error("Failed to get workload recommendations: " + (error as Error).message);
    }
  }

  private buildWorkloadAnalysisPrompt(email: EmailContent): string {
    return `
Analyze this email and classify its workload requirements:

FROM: ${email.fromEmail}
SUBJECT: ${email.subject}
CONTENT: ${email.content}

Classify the email based on:

1. TIME_TO_COMPLETE: How long will this email take to process?
   - "2min": Quick acknowledgment, simple yes/no, forwarding
   - "15min": Detailed response, research required, multiple questions
   - "1hr": Complex analysis, document creation, coordination
   - "2hr+": Project planning, extensive research, multiple stakeholders

2. TASK_TYPE: What type of work is required?
   - "quick_reply": Simple response, acknowledgment
   - "research_required": Need to gather information
   - "decision_making": Requires analysis and judgment
   - "administrative": Scheduling, documentation, processes
   - "creative": Writing, brainstorming, problem-solving

3. PRIORITY_LEVEL: How urgent/important is this?
   - "low": FYI, non-urgent updates
   - "medium": Standard business communication
   - "high": Important decisions, time-sensitive
   - "urgent": Immediate response required

4. BATCH_CATEGORY: How should this be grouped?
   - "quick_responses": Can be batched with other quick tasks
   - "deep_work": Requires focused attention
   - "administrative": Routine/process tasks
   - "meetings": Scheduling or meeting-related

5. COGNITIVE_LOAD & ENERGY_LEVEL: Mental effort required (low/medium/high)

6. SUGGESTED_PROCESSING_TIME: When to handle this?
   - "morning": High energy, complex tasks
   - "afternoon": Medium energy, routine tasks
   - "evening": Low energy, simple tasks

Respond with JSON containing: timeToComplete, complexityScore (0-1), taskType, priorityLevel, batchCategory, suggestedProcessingTime, focusBlockDuration (minutes), cognitiveLoad, energyLevel, reasoningFactors (array of strings), confidenceScore (0-1).
`;
  }

  private buildOptimizationPrompt(analytics: WorkloadAnalytics[], energyPatterns: UserEnergyPattern[], schedule: EmailProcessingSchedule | null): string {
    return `
Analyze this user's email workload data and provide optimization recommendations:

RECENT ANALYTICS (7 days):
${JSON.stringify(analytics, null, 2)}

ENERGY PATTERNS:
${JSON.stringify(energyPatterns, null, 2)}

CURRENT SCHEDULE:
${schedule ? JSON.stringify(schedule, null, 2) : "No active schedule"}

Provide recommendations in JSON format with:
- optimizationScore (0-1): How well the current approach is working
- recommendations: Array of actionable improvements
- insights: Array of key observations about patterns
- schedulingTips: Array of specific timing suggestions

Focus on:
1. Email batching efficiency
2. Energy level alignment with task complexity
3. Time estimation accuracy
4. Focus block optimization
5. Interruption reduction strategies
`;
  }

  private getTimeEstimateInMinutes(timeToComplete: string): number {
    switch (timeToComplete) {
      case "2min": return 2;
      case "15min": return 15;
      case "1hr": return 60;
      case "2hr+": return 120;
      default: return 15;
    }
  }

  private analyzeWorkloadDistribution(emails: EmailWorkloadClassification[]) {
    return {
      quickTasks: emails.filter(e => e.timeToComplete === "2min").length,
      mediumTasks: emails.filter(e => e.timeToComplete === "15min").length,
      longTasks: emails.filter(e => ["1hr", "2hr+"].includes(e.timeToComplete)).length,
      totalEmails: emails.length,
      avgComplexity: emails.reduce((sum, e) => sum + e.complexityScore, 0) / emails.length || 0
    };
  }

  private async generateAIOptimizedSchedule(
    energyPatterns: UserEnergyPattern[],
    workloadAnalysis: any,
    preferences?: any
  ): Promise<ProcessingSchedule> {
    // Simple schedule generation - can be enhanced with more sophisticated AI
    return {
      scheduleName: "AI Optimized",
      timeBlocks: [
        { start: "09:00", end: "10:30", type: "focus_block", category: "deep_work" },
        { start: "10:30", end: "10:45", type: "break" },
        { start: "10:45", end: "11:30", type: "email_processing", category: "quick_responses" },
        { start: "14:00", end: "15:30", type: "focus_block", category: "administrative" },
        { start: "16:00", end: "16:30", type: "email_processing", category: "quick_responses" }
      ],
      focusBlocks: [
        { duration: 90, category: "deep_work", estimatedEmailCount: 5, energyRequired: "high" },
        { duration: 60, category: "administrative", estimatedEmailCount: 10, energyRequired: "medium" }
      ],
      batchingRules: [
        { category: "quick_responses", maxBatchSize: 10, timeLimit: 45, energyThreshold: "low" },
        { category: "deep_work", maxBatchSize: 3, timeLimit: 90, energyThreshold: "high" }
      ]
    };
  }

  private groupEmailsByCategory(emails: EmailWorkloadClassification[]): Map<string, EmailWorkloadClassification[]> {
    const batches = new Map<string, EmailWorkloadClassification[]>();
    
    for (const email of emails) {
      const category = email.batchCategory || "general";
      if (!batches.has(category)) {
        batches.set(category, []);
      }
      batches.get(category)!.push(email);
    }
    
    return batches;
  }

  private calculateAverageEnergyRequirement(emails: EmailWorkloadClassification[]): "low" | "medium" | "high" {
    const energyValues = { "low": 1, "medium": 2, "high": 3 };
    const avgEnergy = emails.reduce((sum, email) => 
      sum + energyValues[email.energyLevel], 0) / emails.length;
    
    if (avgEnergy <= 1.5) return "low";
    if (avgEnergy <= 2.5) return "medium";
    return "high";
  }

  private suggestOptimalTimeSlot(category: string, energyLevel: "low" | "medium" | "high"): string {
    if (energyLevel === "high") return "morning";
    if (energyLevel === "medium") return "afternoon";
    return "evening";
  }

  private async generateDailyInsights(classifications: EmailWorkloadClassification[], analytics: any): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    // Simple insights generation - can be enhanced with AI
    const insights = [
      `Processed ${analytics.totalEmailsProcessed} emails today`,
      `Average time per email: ${Math.round(analytics.avgTimePerEmail)} minutes`,
      `Most common task type: ${this.getMostCommonTaskType(classifications)}`
    ];
    
    const recommendations = [
      "Consider batching quick tasks for better efficiency",
      "Schedule complex emails during high-energy periods",
      "Use focus blocks to minimize context switching"
    ];
    
    return { insights, recommendations };
  }

  private getMostCommonTaskType(classifications: EmailWorkloadClassification[]): string {
    const taskTypes = classifications.reduce((acc, email) => {
      acc[email.taskType] = (acc[email.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(taskTypes).sort(([,a], [,b]) => b - a)[0]?.[0] || "unknown";
  }
}

export const workloadManagementService = new WorkloadManagementService();