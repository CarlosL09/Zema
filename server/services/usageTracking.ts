import { storage } from "../storage";

export class UsageTrackingService {
  // Track OpenAI usage for email processing
  static async trackOpenAiUsage(userId: string, operation: string, tokensUsed: number) {
    const costPerToken = 0.002 / 1000; // $0.002 per 1K tokens (GPT-4 pricing)
    const costInCents = Math.round(tokensUsed * costPerToken * 100);
    
    const currentDate = new Date();
    const billingPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      // Track usage log
      await storage.trackAiUsage({
        userId,
        service: 'openai',
        operation,
        tokensUsed,
        costInCents,
        requestData: JSON.stringify({ model: 'gpt-4o', operation }),
        responseData: JSON.stringify({ tokensUsed, success: true }),
        billingPeriod
      });
      
      // Update user totals
      await storage.updateUserAiCosts(userId, tokensUsed, costInCents);
      
      return { success: true, costInCents, tokensUsed };
    } catch (error) {
      console.error('Error tracking OpenAI usage:', error);
      throw error;
    }
  }
  
  // Track Azure usage for email integration
  static async trackAzureUsage(userId: string, operation: string, apiCalls: number = 1) {
    const creditsPerCall = 10; // 10 credits per API call
    const creditsUsed = apiCalls * creditsPerCall;
    
    const currentDate = new Date();
    const billingPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      // Track usage log
      await storage.trackAzureUsage({
        userId,
        service: 'azure-graph',
        operation,
        creditsUsed,
        apiCalls,
        dataTransferred: Math.round(Math.random() * 1000), // Simulated data transfer
        billingPeriod,
        metadata: JSON.stringify({ 
          operation, 
          timestamp: new Date().toISOString(),
          success: true
        })
      });
      
      // Update user totals
      await storage.updateUserAzureCosts(userId, creditsUsed);
      
      return { success: true, creditsUsed, apiCalls };
    } catch (error) {
      console.error('Error tracking Azure usage:', error);
      throw error;
    }
  }
  
  // Generate sample usage data for demo purposes
  static async generateSampleUsageData(userId: string) {
    const operations = [
      { type: 'ai', operation: 'email_summary', tokens: 150 },
      { type: 'ai', operation: 'smart_reply', tokens: 75 },
      { type: 'ai', operation: 'priority_score', tokens: 50 },
      { type: 'azure', operation: 'email_fetch', calls: 5 },
      { type: 'azure', operation: 'contact_sync', calls: 3 },
      { type: 'azure', operation: 'calendar_integration', calls: 2 }
    ];
    
    for (const op of operations) {
      if (op.type === 'ai') {
        await this.trackOpenAiUsage(userId, op.operation, op.tokens || 100);
      } else {
        await this.trackAzureUsage(userId, op.operation, op.calls || 1);
      }
      
      // Small delay to spread out timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { message: 'Sample usage data generated successfully' };
  }
  
  // Get usage summary for a user
  static async getUserUsageSummary(userId: string, billingPeriod?: string) {
    try {
      const [aiUsage, azureUsage] = await Promise.all([
        storage.getAiUsageByUser(userId, billingPeriod),
        storage.getAzureUsageByUser(userId, billingPeriod)
      ]);
      
      const aiSummary = {
        totalTokens: aiUsage.reduce((sum, log) => sum + (log.tokensUsed || 0), 0),
        totalCost: aiUsage.reduce((sum, log) => sum + (log.costInCents || 0), 0),
        operationCount: aiUsage.length,
        topOperations: this.getTopOperations(aiUsage, 'operation')
      };
      
      const azureSummary = {
        totalCredits: azureUsage.reduce((sum, log) => sum + (log.creditsUsed || 0), 0),
        totalApiCalls: azureUsage.reduce((sum, log) => sum + (log.apiCalls || 0), 0),
        operationCount: azureUsage.length,
        topOperations: this.getTopOperations(azureUsage, 'operation')
      };
      
      return {
        ai: aiSummary,
        azure: azureSummary,
        billingPeriod: billingPeriod || 'current'
      };
    } catch (error) {
      console.error('Error getting usage summary:', error);
      throw error;
    }
  }
  
  private static getTopOperations(usage: any[], field: string) {
    const operationCounts = usage.reduce((acc, log) => {
      const operation = log[field];
      acc[operation] = (acc[operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(operationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([operation, count]) => ({ operation, count }));
  }
}