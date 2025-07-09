import { AIService } from './aiService';
import { storage } from '../storage';

export class SecurityService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async scanEmailForThreats(
    userId: string,
    emailData: {
      emailId: string;
      threadId?: string;
      subject: string;
      body: string;
      sender: string;
      attachments?: Array<{ filename: string; contentType: string }>;
    }
  ): Promise<{
    threats: Array<{
      type: 'phishing' | 'malware' | 'suspicious_link' | 'spoofing';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      confidence: number;
    }>;
    isBlocked: boolean;
  }> {
    const threats = [];

    // Check for phishing indicators
    const phishingResult = await this.detectPhishing(emailData);
    if (phishingResult.isPhishing) {
      threats.push({
        type: 'phishing' as const,
        severity: phishingResult.severity,
        description: phishingResult.description,
        confidence: phishingResult.confidence
      });
    }

    // Check for suspicious links
    const linkResult = await this.scanLinks(emailData.body);
    threats.push(...linkResult.threats);

    // Check for spoofing
    const spoofingResult = await this.detectSpoofing(emailData);
    if (spoofingResult.isSpoofed) {
      threats.push({
        type: 'spoofing' as const,
        severity: spoofingResult.severity,
        description: spoofingResult.description,
        confidence: spoofingResult.confidence
      });
    }

    // Create security alerts for threats
    for (const threat of threats) {
      if (threat.severity === 'high' || threat.severity === 'critical') {
        await storage.createSecurityAlert({
          userId,
          emailId: emailData.emailId,
          threadId: emailData.threadId || null,
          alertType: threat.type,
          severity: threat.severity,
          description: threat.description,
          detectedContent: emailData.body.substring(0, 500)
        });
      }
    }

    const isBlocked = threats.some(t => t.severity === 'critical');

    return { threats, isBlocked };
  }

  async detectSensitiveData(
    userId: string,
    emailData: {
      emailId: string;
      subject: string;
      body: string;
      attachments?: Array<{ filename: string; contentType: string }>;
    }
  ): Promise<{
    piiDetected: Array<{
      type: 'ssn' | 'credit_card' | 'phone' | 'email' | 'address' | 'custom';
      content: string;
      confidence: number;
    }>;
    financialData: Array<{
      type: 'account_number' | 'routing_number' | 'credit_card' | 'tax_id';
      content: string;
      confidence: number;
    }>;
    confidentialMarkers: Array<{
      type: 'confidential' | 'internal' | 'proprietary' | 'restricted';
      location: string;
      confidence: number;
    }>;
  }> {
    const text = `${emailData.subject} ${emailData.body}`;
    
    // PII Detection patterns
    const piiPatterns = {
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    };

    // Financial data patterns
    const financialPatterns = {
      account_number: /\b\d{10,17}\b/g,
      routing_number: /\b\d{9}\b/g,
      tax_id: /\b\d{2}-\d{7}\b/g
    };

    // Confidential markers
    const confidentialPatterns = {
      confidential: /\b(confidential|private|secret)\b/gi,
      internal: /\b(internal\s+use|internal\s+only)\b/gi,
      proprietary: /\b(proprietary|trade\s+secret)\b/gi,
      restricted: /\b(restricted|classified)\b/gi
    };

    const piiDetected = [];
    const financialData = [];
    const confidentialMarkers = [];

    // Scan for PII
    for (const [type, pattern] of Object.entries(piiPatterns)) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          piiDetected.push({
            type: type as any,
            content: match,
            confidence: 0.9
          });
        }
      }
    }

    // Scan for financial data
    for (const [type, pattern] of Object.entries(financialPatterns)) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          financialData.push({
            type: type as any,
            content: match,
            confidence: 0.8
          });
        }
      }
    }

    // Scan for confidential markers
    for (const [type, pattern] of Object.entries(confidentialPatterns)) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          confidentialMarkers.push({
            type: type as any,
            location: `Found in ${emailData.subject ? 'subject' : 'body'}`,
            confidence: 0.95
          });
        }
      }
    }

    // Create security alerts for sensitive data
    if (piiDetected.length > 0 || financialData.length > 0 || confidentialMarkers.length > 0) {
      await storage.createSecurityAlert({
        userId,
        emailId: emailData.emailId,
        alertType: 'pii',
        severity: 'medium',
        description: `Sensitive data detected: ${piiDetected.length} PII items, ${financialData.length} financial items, ${confidentialMarkers.length} confidential markers`,
        detectedContent: JSON.stringify({ piiDetected, financialData, confidentialMarkers })
      });
    }

    return { piiDetected, financialData, confidentialMarkers };
  }

  private async detectPhishing(emailData: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<{
    isPhishing: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
  }> {
    // Common phishing indicators
    const phishingIndicators = [
      { pattern: /urgent.{0,20}action.{0,20}required/gi, weight: 0.3 },
      { pattern: /verify.{0,20}account/gi, weight: 0.4 },
      { pattern: /click.{0,20}here.{0,20}immediately/gi, weight: 0.5 },
      { pattern: /suspended.{0,20}account/gi, weight: 0.6 },
      { pattern: /confirm.{0,20}identity/gi, weight: 0.3 },
      { pattern: /security.{0,20}alert/gi, weight: 0.4 },
      { pattern: /limited.{0,20}time/gi, weight: 0.2 }
    ];

    const text = `${emailData.subject} ${emailData.body}`;
    let phishingScore = 0;
    const indicators = [];

    for (const indicator of phishingIndicators) {
      if (indicator.pattern.test(text)) {
        phishingScore += indicator.weight;
        indicators.push(indicator.pattern.source);
      }
    }

    // Check sender reputation (simplified)
    const suspiciousDomains = ['tempmail', 'guerrillamail', '10minutemail'];
    const senderDomain = emailData.sender.split('@')[1]?.toLowerCase();
    if (suspiciousDomains.some(domain => senderDomain?.includes(domain))) {
      phishingScore += 0.7;
      indicators.push('suspicious sender domain');
    }

    const isPhishing = phishingScore > 0.5;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (phishingScore > 1.5) severity = 'critical';
    else if (phishingScore > 1.0) severity = 'high';
    else if (phishingScore > 0.7) severity = 'medium';

    return {
      isPhishing,
      severity,
      description: `Phishing indicators detected: ${indicators.join(', ')}`,
      confidence: Math.min(phishingScore, 1.0)
    };
  }

  private async scanLinks(body: string): Promise<{
    threats: Array<{
      type: 'suspicious_link';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      confidence: number;
    }>;
  }> {
    const urlPattern = /https?:\/\/[^\s<>"\[\]{}|\\^`]+/gi;
    const urls = body.match(urlPattern) || [];
    const threats = [];

    for (const url of urls) {
      const suspiciousPatterns = [
        { pattern: /bit\.ly|tinyurl|t\.co/i, severity: 'medium' as const, description: 'URL shortener detected' },
        { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/i, severity: 'high' as const, description: 'IP address URL detected' },
        { pattern: /[a-z0-9]{32,}/i, severity: 'medium' as const, description: 'Suspicious long random string in URL' }
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.pattern.test(url)) {
          threats.push({
            type: 'suspicious_link' as const,
            severity: pattern.severity,
            description: `${pattern.description}: ${url}`,
            confidence: 0.8
          });
          break;
        }
      }
    }

    return { threats };
  }

  private async detectSpoofing(emailData: {
    subject: string;
    sender: string;
  }): Promise<{
    isSpoofed: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
  }> {
    // Check for display name spoofing
    const displayNamePattern = /^(.+?)\s*<(.+@.+)>$/;
    const match = emailData.sender.match(displayNamePattern);
    
    if (match) {
      const displayName = match[1].toLowerCase();
      const emailAddress = match[2].toLowerCase();
      const emailDomain = emailAddress.split('@')[1];

      // Check if display name contains common company names but email is from different domain
      const commonCompanies = ['microsoft', 'google', 'apple', 'amazon', 'facebook', 'paypal', 'bank'];
      
      for (const company of commonCompanies) {
        if (displayName.includes(company) && !emailDomain.includes(company)) {
          return {
            isSpoofed: true,
            severity: 'high',
            description: `Display name spoofing detected: "${displayName}" from ${emailDomain}`,
            confidence: 0.9
          };
        }
      }
    }

    return {
      isSpoofed: false,
      severity: 'low',
      description: 'No spoofing detected',
      confidence: 0.1
    };
  }

  async checkComplianceViolations(
    userId: string,
    emailData: {
      emailId: string;
      subject: string;
      body: string;
      recipients: string[];
    },
    regulations: string[] = ['GDPR', 'HIPAA', 'SOX']
  ): Promise<{
    violations: Array<{
      regulation: string;
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  }> {
    const violations = [];
    const text = `${emailData.subject} ${emailData.body}`;

    // GDPR compliance checks
    if (regulations.includes('GDPR')) {
      const gdprKeywords = /personal\s+data|process.*data|consent|data\s+subject|right\s+to\s+be\s+forgotten/gi;
      if (gdprKeywords.test(text)) {
        violations.push({
          regulation: 'GDPR',
          type: 'data_processing',
          description: 'Email contains references to personal data processing',
          severity: 'medium' as const
        });
      }
    }

    // HIPAA compliance checks
    if (regulations.includes('HIPAA')) {
      const hipaaKeywords = /patient|medical|health.*record|diagnosis|treatment|PHI|protected.*health/gi;
      if (hipaaKeywords.test(text)) {
        violations.push({
          regulation: 'HIPAA',
          type: 'health_information',
          description: 'Email may contain protected health information',
          severity: 'high' as const
        });
      }
    }

    // SOX compliance checks
    if (regulations.includes('SOX')) {
      const soxKeywords = /financial.*statement|audit|internal.*control|material.*weakness|financial.*disclosure/gi;
      if (soxKeywords.test(text)) {
        violations.push({
          regulation: 'SOX',
          type: 'financial_disclosure',
          description: 'Email contains financial disclosure information',
          severity: 'medium' as const
        });
      }
    }

    // Create compliance alerts
    for (const violation of violations) {
      if (violation.severity === 'high' || violation.severity === 'critical') {
        await storage.createSecurityAlert({
          userId,
          emailId: emailData.emailId,
          alertType: 'compliance',
          severity: violation.severity,
          description: `${violation.regulation} compliance violation: ${violation.description}`,
          detectedContent: text.substring(0, 500)
        });
      }
    }

    return { violations };
  }

  async getSecurityDashboard(userId: string): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    alertsByType: Record<string, number>;
    recentAlerts: Array<{
      id: number;
      alertType: string;
      severity: string;
      description: string;
      createdAt: Date;
    }>;
    threatTrends: Array<{
      date: string;
      phishing: number;
      pii: number;
      compliance: number;
    }>;
  }> {
    const alerts = await storage.getSecurityAlerts(userId);
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

    const alertsByType = alerts.reduce((acc, alert) => {
      acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentAlerts = alerts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(alert => ({
        id: alert.id,
        alertType: alert.alertType,
        severity: alert.severity,
        description: alert.description,
        createdAt: alert.createdAt
      }));

    // Generate threat trends for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAlerts30Days = alerts.filter(a => new Date(a.createdAt) >= thirtyDaysAgo);
    const threatTrends = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayAlerts = recentAlerts30Days.filter(a => 
        a.createdAt.toISOString().split('T')[0] === dateStr
      );

      threatTrends.push({
        date: dateStr,
        phishing: dayAlerts.filter(a => a.alertType === 'phishing').length,
        pii: dayAlerts.filter(a => a.alertType === 'pii').length,
        compliance: dayAlerts.filter(a => a.alertType === 'compliance').length
      });
    }

    return {
      totalAlerts,
      criticalAlerts,
      alertsByType,
      recentAlerts,
      threatTrends
    };
  }
}