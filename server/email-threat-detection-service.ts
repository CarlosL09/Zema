import OpenAI from 'openai';
import { InsertSecurityAlert, SecurityAlert } from '../shared/schema.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EmailThreatAnalysis {
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threatTypes: string[];
  confidence: number;
  reasoning: string;
  warningMessage?: string;
  actionRecommended: 'allow' | 'warn' | 'quarantine' | 'block';
  suspiciousElements: string[];
  legitimacyScore: number; // 0-100, higher = more legitimate
}

interface PhishingIndicators {
  suspiciousDomain: boolean;
  urgencyLanguage: boolean;
  moneyRequests: boolean;
  credentialRequests: boolean;
  suspiciousLinks: boolean;
  grammarIssues: boolean;
  impersonation: boolean;
  spoofedEmail: boolean;
}

interface EmailContent {
  subject: string;
  body: string;
  fromEmail: string;
  fromName?: string;
  links?: string[];
  attachments?: string[];
  headers?: any;
}

export class EmailThreatDetectionService {
  private storage: any;

  constructor(storage: any) {
    this.storage = storage;
  }

  /**
   * Analyze email for threats using OpenAI GPT-4o
   */
  async analyzeEmailThreat(userId: string, emailContent: EmailContent): Promise<EmailThreatAnalysis> {
    try {
      const prompt = this.buildThreatAnalysisPrompt(emailContent);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert email security analyst. Analyze emails for phishing, scams, malware, and other threats. 
            Respond with JSON in this exact format:
            {
              "threatLevel": "safe|low|medium|high|critical",
              "threatTypes": ["phishing", "scam", "malware", "spam", "impersonation"],
              "confidence": 0.95,
              "reasoning": "Detailed explanation of analysis",
              "warningMessage": "User-friendly warning message",
              "actionRecommended": "allow|warn|quarantine|block",
              "suspiciousElements": ["list of specific suspicious elements"],
              "legitimacyScore": 85
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Create security alert if threat detected
      if (analysis.threatLevel !== 'safe') {
        await this.createThreatAlert(userId, emailContent, analysis);
      }

      return analysis;

    } catch (error) {
      console.error('Error analyzing email threat:', error);
      
      // Fallback to rule-based analysis
      return await this.fallbackThreatAnalysis(emailContent);
    }
  }

  /**
   * Build comprehensive prompt for threat analysis
   */
  private buildThreatAnalysisPrompt(emailContent: EmailContent): string {
    return `
ANALYZE THIS EMAIL FOR SECURITY THREATS:

FROM: ${emailContent.fromEmail} ${emailContent.fromName ? `(${emailContent.fromName})` : ''}
SUBJECT: ${emailContent.subject}

EMAIL BODY:
${emailContent.body}

${emailContent.links?.length ? `LINKS FOUND: ${emailContent.links.join(', ')}` : ''}
${emailContent.attachments?.length ? `ATTACHMENTS: ${emailContent.attachments.join(', ')}` : ''}

ANALYZE FOR:
1. Phishing attempts (credential theft, fake login pages)
2. Scams (financial fraud, fake prizes, advance fee fraud)
3. Malware distribution (suspicious attachments/links)
4. Impersonation (pretending to be legitimate organizations)
5. Social engineering attacks
6. Spam and unwanted commercial email

CONSIDER:
- Domain reputation and authenticity
- Language patterns and urgency tactics
- Request for sensitive information
- Suspicious links or attachments
- Grammar and spelling quality
- Email header inconsistencies
- Known phishing patterns

THREAT LEVELS:
- safe: Legitimate email, no threats detected
- low: Minor suspicious elements, likely safe
- medium: Some concerning elements, caution advised
- high: Clear threat indicators, user warning needed
- critical: Definite malicious email, block immediately

Provide detailed reasoning and specific suspicious elements found.`;
  }

  /**
   * Analyze sender reputation and domain
   */
  async analyzeSenderReputation(emailAddress: string): Promise<{
    isKnownThreat: boolean;
    domainReputation: 'good' | 'neutral' | 'suspicious' | 'malicious';
    riskFactors: string[];
  }> {
    try {
      const domain = emailAddress.split('@')[1];
      
      const prompt = `
Analyze the email domain and sender for reputation and security risks:

EMAIL: ${emailAddress}
DOMAIN: ${domain}

Check for:
1. Known malicious domains
2. Suspicious domain patterns (typosquatting, lookalikes)
3. Recently registered domains
4. Common phishing domain characteristics
5. Legitimate business domain vs suspicious patterns

Respond with JSON:
{
  "isKnownThreat": boolean,
  "domainReputation": "good|neutral|suspicious|malicious",
  "riskFactors": ["list of specific risk factors found"]
}`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a domain reputation expert. Analyze email domains for security risks and reputation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('Error analyzing sender reputation:', error);
      return {
        isKnownThreat: false,
        domainReputation: 'neutral',
        riskFactors: []
      };
    }
  }

  /**
   * Detect phishing indicators using pattern analysis
   */
  private detectPhishingIndicators(emailContent: EmailContent): PhishingIndicators {
    const subject = emailContent.subject.toLowerCase();
    const body = emailContent.body.toLowerCase();
    const fromEmail = emailContent.fromEmail.toLowerCase();
    
    return {
      suspiciousDomain: this.checkSuspiciousDomain(fromEmail),
      urgencyLanguage: this.checkUrgencyLanguage(subject + ' ' + body),
      moneyRequests: this.checkMoneyRequests(body),
      credentialRequests: this.checkCredentialRequests(body),
      suspiciousLinks: this.checkSuspiciousLinks(emailContent.links || []),
      grammarIssues: this.checkGrammarIssues(body),
      impersonation: this.checkImpersonation(fromEmail, emailContent.fromName || ''),
      spoofedEmail: this.checkEmailSpoofing(fromEmail, emailContent.headers)
    };
  }

  /**
   * Check for suspicious domain patterns
   */
  private checkSuspiciousDomain(email: string): boolean {
    const domain = email.split('@')[1];
    const suspiciousPatterns = [
      /[0-9]{4,}/, // Long numbers in domain
      /[a-z]-[a-z]/, // Hyphens between single letters
      /.{20,}/, // Very long domains
      /secure|verify|update|confirm/, // Common phishing words
      /paypal|amazon|microsoft|google/, // Potential impersonation
      /\.tk$|\.ml$|\.ga$/, // Free domain extensions
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  /**
   * Detect urgency and pressure tactics
   */
  private checkUrgencyLanguage(text: string): boolean {
    const urgencyKeywords = [
      'urgent', 'immediate', 'expire', 'suspend', 'within 24 hours',
      'act now', 'limited time', 'verify now', 'update immediately',
      'confirm within', 'deadline', 'suspended', 'blocked', 'frozen'
    ];
    
    return urgencyKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Detect money-related scam patterns
   */
  private checkMoneyRequests(text: string): boolean {
    const moneyPatterns = [
      /\$[0-9,]+/, // Dollar amounts
      /wire transfer|money transfer|bank transfer/,
      /inheritance|lottery|prize|winner/,
      /refund|payment|invoice|billing/,
      /crypto|bitcoin|investment|trading/
    ];
    
    return moneyPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Detect credential harvesting attempts
   */
  private checkCredentialRequests(text: string): boolean {
    const credentialKeywords = [
      'password', 'username', 'login', 'sign in', 'verify account',
      'update password', 'security code', 'two-factor', 'authentication',
      'ssn', 'social security', 'credit card', 'bank account'
    ];
    
    return credentialKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Analyze links for suspicious patterns
   */
  private checkSuspiciousLinks(links: string[]): boolean {
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co/, // URL shorteners
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      /[a-z]{10,}\.com/, // Random long domains
      /secure.*login|verify.*account/, // Phishing patterns
    ];
    
    return links.some(link => 
      suspiciousPatterns.some(pattern => pattern.test(link))
    );
  }

  /**
   * Basic grammar and spelling check
   */
  private checkGrammarIssues(text: string): boolean {
    const grammarIssues = [
      /\s{2,}/, // Multiple spaces
      /[a-z][A-Z]/, // Incorrect capitalization
      /[.]{2,}/, // Multiple periods
      /\?\?+/, // Multiple question marks
    ];
    
    // Count grammar issues
    const issueCount = grammarIssues.reduce((count, pattern) => 
      count + (text.match(pattern) || []).length, 0
    );
    
    return issueCount > 3; // More than 3 issues suggests poor quality
  }

  /**
   * Check for impersonation attempts
   */
  private checkImpersonation(email: string, displayName: string): boolean {
    const legitimateOrgs = [
      'paypal', 'amazon', 'microsoft', 'google', 'apple', 'facebook',
      'instagram', 'twitter', 'linkedin', 'netflix', 'spotify',
      'bank', 'wells fargo', 'chase', 'irs', 'usps', 'fedex', 'ups'
    ];
    
    const domain = email.split('@')[1];
    const nameText = (displayName + ' ' + email).toLowerCase();
    
    return legitimateOrgs.some(org => 
      nameText.includes(org) && !domain.includes(org)
    );
  }

  /**
   * Check for email spoofing indicators
   */
  private checkEmailSpoofing(email: string, headers: any): boolean {
    if (!headers) return false;
    
    // Check if Return-Path matches From address
    const returnPath = headers['return-path'];
    const fromAddress = headers['from'];
    
    if (returnPath && fromAddress) {
      return !returnPath.includes(email.split('@')[1]);
    }
    
    return false;
  }

  /**
   * Fallback rule-based threat analysis
   */
  private async fallbackThreatAnalysis(emailContent: EmailContent): Promise<EmailThreatAnalysis> {
    const indicators = this.detectPhishingIndicators(emailContent);
    const riskScore = Object.values(indicators).filter(Boolean).length;
    
    let threatLevel: EmailThreatAnalysis['threatLevel'] = 'safe';
    let actionRecommended: EmailThreatAnalysis['actionRecommended'] = 'allow';
    
    if (riskScore >= 4) {
      threatLevel = 'critical';
      actionRecommended = 'block';
    } else if (riskScore >= 3) {
      threatLevel = 'high';
      actionRecommended = 'quarantine';
    } else if (riskScore >= 2) {
      threatLevel = 'medium';
      actionRecommended = 'warn';
    } else if (riskScore >= 1) {
      threatLevel = 'low';
      actionRecommended = 'allow';
    }
    
    return {
      threatLevel,
      threatTypes: this.identifyThreatTypes(indicators),
      confidence: Math.min(0.8, riskScore * 0.2),
      reasoning: `Rule-based analysis detected ${riskScore} risk indicators`,
      actionRecommended,
      suspiciousElements: this.getSuspiciousElements(indicators),
      legitimacyScore: Math.max(0, 100 - (riskScore * 20))
    };
  }

  /**
   * Identify threat types from indicators
   */
  private identifyThreatTypes(indicators: PhishingIndicators): string[] {
    const threats: string[] = [];
    
    if (indicators.credentialRequests || indicators.suspiciousLinks) {
      threats.push('phishing');
    }
    if (indicators.moneyRequests) {
      threats.push('scam');
    }
    if (indicators.impersonation) {
      threats.push('impersonation');
    }
    if (indicators.urgencyLanguage) {
      threats.push('social_engineering');
    }
    
    return threats.length > 0 ? threats : ['suspicious'];
  }

  /**
   * Get list of suspicious elements
   */
  private getSuspiciousElements(indicators: PhishingIndicators): string[] {
    const elements: string[] = [];
    
    if (indicators.suspiciousDomain) elements.push('Suspicious sender domain');
    if (indicators.urgencyLanguage) elements.push('Urgent language tactics');
    if (indicators.moneyRequests) elements.push('Money-related requests');
    if (indicators.credentialRequests) elements.push('Credential harvesting attempt');
    if (indicators.suspiciousLinks) elements.push('Suspicious links detected');
    if (indicators.grammarIssues) elements.push('Poor grammar/spelling');
    if (indicators.impersonation) elements.push('Organization impersonation');
    if (indicators.spoofedEmail) elements.push('Email spoofing detected');
    
    return elements;
  }

  /**
   * Create security alert for detected threats
   */
  private async createThreatAlert(
    userId: string, 
    emailContent: EmailContent, 
    analysis: EmailThreatAnalysis
  ): Promise<void> {
    try {
      const alertData: InsertSecurityAlert = {
        userId,
        emailId: `email-${Date.now()}`, // Generate unique email ID
        alertType: analysis.threatTypes[0] || 'suspicious_email',
        severity: analysis.threatLevel === 'critical' ? 'critical' :
                 analysis.threatLevel === 'high' ? 'high' :
                 analysis.threatLevel === 'medium' ? 'medium' : 'low',
        description: analysis.warningMessage || analysis.reasoning,
        detectedContent: JSON.stringify({
          from: emailContent.fromEmail,
          subject: emailContent.subject,
          threatTypes: analysis.threatTypes,
          suspiciousElements: analysis.suspiciousElements,
          confidence: analysis.confidence
        }),
        isResolved: false
      };

      await this.storage.createSecurityAlert(alertData);
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Batch analyze multiple emails
   */
  async batchAnalyzeEmails(userId: string, emails: EmailContent[]): Promise<EmailThreatAnalysis[]> {
    const analyses = await Promise.all(
      emails.map(email => this.analyzeEmailThreat(userId, email))
    );
    
    return analyses;
  }

  /**
   * Get threat statistics for user
   */
  async getThreatStatistics(userId: string): Promise<{
    totalEmailsScanned: number;
    threatsDetected: number;
    threatsByType: Record<string, number>;
    recentThreats: SecurityAlert[];
  }> {
    try {
      const alerts = await this.storage.getSecurityAlertsByUser(userId);
      const threatsByType: Record<string, number> = {};
      
      alerts.forEach((alert: SecurityAlert) => {
        threatsByType[alert.alertType] = (threatsByType[alert.alertType] || 0) + 1;
      });
      
      return {
        totalEmailsScanned: 0, // Would need to track this separately
        threatsDetected: alerts.length,
        threatsByType,
        recentThreats: alerts.slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting threat statistics:', error);
      return {
        totalEmailsScanned: 0,
        threatsDetected: 0,
        threatsByType: {},
        recentThreats: []
      };
    }
  }
}

export const emailThreatDetectionService = new EmailThreatDetectionService(null); // Will be initialized with storage