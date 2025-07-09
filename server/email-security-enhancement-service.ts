/**
 * Enhanced Email Security Service
 * Provides comprehensive free security features for email protection
 */

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'domain' | 'keyword' | 'pattern' | 'header' | 'attachment';
  rule: string;
  action: 'block' | 'quarantine' | 'flag' | 'warn';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface DomainReputation {
  domain: string;
  reputation: 'trusted' | 'neutral' | 'suspicious' | 'malicious';
  score: number; // 0-100
  reasons: string[];
  lastChecked: Date;
}

interface EmailAnalysisResult {
  emailId: string;
  overallThreatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detections: SecurityDetection[];
  recommendations: string[];
  quarantineRecommended: boolean;
}

interface SecurityDetection {
  type: 'phishing' | 'spam' | 'malware' | 'scam' | 'suspicious_domain' | 'spoofing' | 'social_engineering';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  confidence: number;
}

export class EmailSecurityEnhancementService {
  private securityRules: SecurityRule[] = [];
  private domainReputations: Map<string, DomainReputation> = new Map();
  private trustedDomains: Set<string> = new Set([
    'gmail.com', 'outlook.com', 'yahoo.com', 'apple.com', 'microsoft.com',
    'google.com', 'amazon.com', 'paypal.com', 'stripe.com', 'github.com'
  ]);
  private suspiciousDomains: Set<string> = new Set([
    '.tk', '.ml', '.ga', '.cf', 'bit.ly', 'tinyurl.com'
  ]);

  constructor() {
    this.initializeSecurityRules();
  }

  /**
   * Comprehensive email security analysis
   */
  async analyzeEmailSecurity(emailData: {
    subject: string;
    sender: string;
    senderEmail: string;
    body: string;
    headers?: Record<string, string>;
    attachments?: Array<{ name: string; type: string; size: number }>;
  }): Promise<EmailAnalysisResult> {
    const detections: SecurityDetection[] = [];

    // 1. Domain reputation analysis
    const domainDetections = await this.analyzeDomainReputation(emailData.senderEmail);
    detections.push(...domainDetections);

    // 2. Content analysis for phishing patterns
    const contentDetections = this.analyzeContent(emailData.subject, emailData.body);
    detections.push(...contentDetections);

    // 3. Header analysis for spoofing
    const headerDetections = this.analyzeHeaders(emailData.headers || {});
    detections.push(...headerDetections);

    // 4. Attachment analysis
    const attachmentDetections = this.analyzeAttachments(emailData.attachments || []);
    detections.push(...attachmentDetections);

    // 5. Social engineering detection
    const socialDetections = this.detectSocialEngineering(emailData.subject, emailData.body);
    detections.push(...socialDetections);

    // 6. URL analysis
    const urlDetections = this.analyzeUrls(emailData.body);
    detections.push(...urlDetections);

    // Calculate overall threat level
    const overallThreatLevel = this.calculateOverallThreatLevel(detections);
    const confidence = this.calculateConfidence(detections);
    const recommendations = this.generateRecommendations(detections);
    const quarantineRecommended = detections.some(d => d.severity === 'critical' || d.severity === 'high');

    return {
      emailId: `email_${Date.now()}`,
      overallThreatLevel,
      confidence,
      detections,
      recommendations,
      quarantineRecommended
    };
  }

  /**
   * Domain reputation analysis
   */
  private async analyzeDomainReputation(email: string): Promise<SecurityDetection[]> {
    const detections: SecurityDetection[] = [];
    const domain = email.split('@')[1];

    if (!domain) return detections;

    // Check against known suspicious domains
    if (this.suspiciousDomains.has(domain) || this.suspiciousDomains.has(`.${domain.split('.').pop()}`)) {
      detections.push({
        type: 'suspicious_domain',
        severity: 'high',
        description: 'Email from suspicious domain',
        evidence: [`Domain: ${domain}`, 'Known suspicious TLD or domain'],
        confidence: 0.85
      });
    }

    // Check for domain spoofing (similar to trusted domains)
    const spoofingDetection = this.detectDomainSpoofing(domain);
    if (spoofingDetection) {
      detections.push(spoofingDetection);
    }

    // Check for recently registered domains (heuristic)
    if (this.isLikelynewDomain(domain)) {
      detections.push({
        type: 'suspicious_domain',
        severity: 'medium',
        description: 'Email from potentially new domain',
        evidence: [`Domain: ${domain}`, 'Domain appears to be recently registered'],
        confidence: 0.65
      });
    }

    return detections;
  }

  /**
   * Content analysis for phishing and scam patterns
   */
  private analyzeContent(subject: string, body: string): Promise<SecurityDetection[]> {
    const detections: SecurityDetection[] = [];
    const fullText = `${subject} ${body}`.toLowerCase();

    // Phishing keywords
    const phishingPatterns = [
      { pattern: /urgent.*action.*required/i, type: 'phishing', severity: 'high' },
      { pattern: /verify.*account.*immediately/i, type: 'phishing', severity: 'high' },
      { pattern: /suspended.*account/i, type: 'phishing', severity: 'high' },
      { pattern: /click.*here.*now/i, type: 'phishing', severity: 'medium' },
      { pattern: /limited.*time.*offer/i, type: 'spam', severity: 'low' },
      { pattern: /congratulations.*won/i, type: 'scam', severity: 'high' },
      { pattern: /inheritance.*million/i, type: 'scam', severity: 'critical' },
      { pattern: /tax.*refund/i, type: 'phishing', severity: 'medium' },
      { pattern: /update.*payment.*method/i, type: 'phishing', severity: 'high' }
    ];

    for (const { pattern, type, severity } of phishingPatterns) {
      if (pattern.test(fullText)) {
        detections.push({
          type: type as SecurityDetection['type'],
          severity: severity as SecurityDetection['severity'],
          description: `Suspicious ${type} pattern detected`,
          evidence: [`Pattern: ${pattern.source}`, `Found in: ${subject.includes(pattern.source) ? 'subject' : 'body'}`],
          confidence: 0.75
        });
      }
    }

    // Financial scam detection
    if (/\$[\d,]+|€[\d,]+|£[\d,]+/.test(fullText) && /transfer|claim|wire|bitcoin|crypto/.test(fullText)) {
      detections.push({
        type: 'scam',
        severity: 'high',
        description: 'Potential financial scam detected',
        evidence: ['Large monetary amounts mentioned', 'Financial transfer keywords'],
        confidence: 0.80
      });
    }

    // Urgency indicators
    const urgencyCount = (fullText.match(/urgent|immediate|asap|emergency|expire|deadline/g) || []).length;
    if (urgencyCount >= 3) {
      detections.push({
        type: 'social_engineering',
        severity: 'medium',
        description: 'High urgency language detected',
        evidence: [`${urgencyCount} urgency indicators found`],
        confidence: 0.70
      });
    }

    return Promise.resolve(detections);
  }

  /**
   * Header analysis for spoofing detection
   */
  private analyzeHeaders(headers: Record<string, string>): SecurityDetection[] {
    const detections: SecurityDetection[] = [];

    // Check for missing security headers
    const securityHeaders = ['dkim-signature', 'spf', 'dmarc'];
    const missingHeaders = securityHeaders.filter(header => !headers[header]);

    if (missingHeaders.length > 0) {
      detections.push({
        type: 'spoofing',
        severity: 'medium',
        description: 'Missing email authentication headers',
        evidence: [`Missing headers: ${missingHeaders.join(', ')}`],
        confidence: 0.60
      });
    }

    // Check for suspicious routing
    const received = headers['received'] || '';
    if (received.includes('suspicious') || received.split('by').length > 5) {
      detections.push({
        type: 'spoofing',
        severity: 'medium',
        description: 'Suspicious email routing detected',
        evidence: ['Unusual routing path'],
        confidence: 0.65
      });
    }

    return detections;
  }

  /**
   * Attachment analysis
   */
  private analyzeAttachments(attachments: Array<{ name: string; type: string; size: number }>): SecurityDetection[] {
    const detections: SecurityDetection[] = [];

    const dangerousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js', '.jar'];
    const suspiciousExtensions = ['.zip', '.rar', '.7z'];

    for (const attachment of attachments) {
      const extension = attachment.name.toLowerCase().substring(attachment.name.lastIndexOf('.'));

      if (dangerousExtensions.includes(extension)) {
        detections.push({
          type: 'malware',
          severity: 'critical',
          description: 'Potentially dangerous attachment',
          evidence: [`File: ${attachment.name}`, `Extension: ${extension}`],
          confidence: 0.90
        });
      } else if (suspiciousExtensions.includes(extension)) {
        detections.push({
          type: 'malware',
          severity: 'medium',
          description: 'Compressed attachment requires caution',
          evidence: [`File: ${attachment.name}`, 'Archive files can contain malware'],
          confidence: 0.50
        });
      }

      // Check for large files (potential data exfiltration)
      if (attachment.size > 50 * 1024 * 1024) { // 50MB
        detections.push({
          type: 'suspicious_domain',
          severity: 'low',
          description: 'Unusually large attachment',
          evidence: [`File: ${attachment.name}`, `Size: ${Math.round(attachment.size / 1024 / 1024)}MB`],
          confidence: 0.40
        });
      }
    }

    return detections;
  }

  /**
   * Social engineering detection
   */
  private detectSocialEngineering(subject: string, body: string): SecurityDetection[] {
    const detections: SecurityDetection[] = [];
    const fullText = `${subject} ${body}`.toLowerCase();

    // Authority impersonation
    const authorityPatterns = [
      'ceo', 'president', 'manager', 'director', 'administrator',
      'irs', 'fbi', 'police', 'government', 'bank', 'paypal', 'amazon'
    ];

    for (const authority of authorityPatterns) {
      if (fullText.includes(authority) && fullText.includes('urgent')) {
        detections.push({
          type: 'social_engineering',
          severity: 'high',
          description: 'Authority impersonation detected',
          evidence: [`Authority figure: ${authority}`, 'Combined with urgency'],
          confidence: 0.75
        });
        break;
      }
    }

    // Fear tactics
    if (/account.*close|legal.*action|arrest|penalty|fine/.test(fullText)) {
      detections.push({
        type: 'social_engineering',
        severity: 'high',
        description: 'Fear-based manipulation detected',
        evidence: ['Threats of negative consequences'],
        confidence: 0.80
      });
    }

    return detections;
  }

  /**
   * URL analysis
   */
  private analyzeUrls(body: string): SecurityDetection[] {
    const detections: SecurityDetection[] = [];
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = body.match(urlRegex) || [];

    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        
        // Check for URL shorteners
        const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'short.link'];
        if (shorteners.some(shortener => urlObj.hostname.includes(shortener))) {
          detections.push({
            type: 'phishing',
            severity: 'medium',
            description: 'URL shortener detected',
            evidence: [`URL: ${url}`, 'Shortened URLs can hide malicious destinations'],
            confidence: 0.60
          });
        }

        // Check for suspicious domains
        if (this.suspiciousDomains.has(urlObj.hostname)) {
          detections.push({
            type: 'phishing',
            severity: 'high',
            description: 'Link to suspicious domain',
            evidence: [`URL: ${url}`, `Domain: ${urlObj.hostname}`],
            confidence: 0.85
          });
        }

        // Check for IP addresses instead of domains
        if (/^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
          detections.push({
            type: 'phishing',
            severity: 'high',
            description: 'Link uses IP address instead of domain',
            evidence: [`URL: ${url}`, 'IP addresses often used for malicious sites'],
            confidence: 0.80
          });
        }
      } catch (e) {
        // Invalid URL
        detections.push({
          type: 'phishing',
          severity: 'low',
          description: 'Malformed URL detected',
          evidence: [`URL: ${url}`],
          confidence: 0.50
        });
      }
    }

    return detections;
  }

  /**
   * Domain spoofing detection
   */
  private detectDomainSpoofing(domain: string): SecurityDetection | null {
    for (const trustedDomain of this.trustedDomains) {
      const similarity = this.calculateStringSimilarity(domain, trustedDomain);
      if (similarity > 0.8 && similarity < 1.0) {
        return {
          type: 'spoofing',
          severity: 'critical',
          description: 'Potential domain spoofing detected',
          evidence: [
            `Suspicious domain: ${domain}`,
            `Similar to trusted domain: ${trustedDomain}`,
            `Similarity: ${Math.round(similarity * 100)}%`
          ],
          confidence: 0.90
        };
      }
    }
    return null;
  }

  /**
   * Heuristic for detecting new domains
   */
  private isLikelynewDomain(domain: string): boolean {
    // Simple heuristics for new domains
    const suspiciousPatterns = [
      /\d{4,}/, // Many numbers
      /-{2,}/, // Multiple hyphens
      /[0-9]{2,}-[a-z]+/, // Numbers followed by letters with hyphen
    ];

    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate overall threat level
   */
  private calculateOverallThreatLevel(detections: SecurityDetection[]): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
    if (detections.length === 0) return 'safe';
    
    const criticalCount = detections.filter(d => d.severity === 'critical').length;
    const highCount = detections.filter(d => d.severity === 'high').length;
    const mediumCount = detections.filter(d => d.severity === 'medium').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount >= 2) return 'critical';
    if (highCount >= 1) return 'high';
    if (mediumCount >= 3) return 'high';
    if (mediumCount >= 1) return 'medium';
    
    return 'low';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(detections: SecurityDetection[]): number {
    if (detections.length === 0) return 0.95; // High confidence it's safe
    
    const avgConfidence = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
    return Math.round(avgConfidence * 100) / 100;
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(detections: SecurityDetection[]): string[] {
    const recommendations: string[] = [];
    
    if (detections.some(d => d.type === 'phishing')) {
      recommendations.push('Do not click any links in this email');
      recommendations.push('Verify sender identity through alternative communication');
    }
    
    if (detections.some(d => d.type === 'malware')) {
      recommendations.push('Do not download or open attachments');
      recommendations.push('Scan any attachments with antivirus before opening');
    }
    
    if (detections.some(d => d.type === 'scam')) {
      recommendations.push('This appears to be a financial scam - do not respond');
      recommendations.push('Report this email to authorities if it involves large sums');
    }
    
    if (detections.some(d => d.type === 'spoofing')) {
      recommendations.push('Verify the sender through official channels');
      recommendations.push('Check the actual sender email address carefully');
    }
    
    if (detections.some(d => d.severity === 'critical' || d.severity === 'high')) {
      recommendations.push('Consider blocking this sender');
      recommendations.push('Move this email to quarantine immediately');
    }
    
    return recommendations;
  }

  /**
   * Initialize default security rules
   */
  private initializeSecurityRules(): void {
    this.securityRules = [
      {
        id: 'rule_1',
        name: 'Block dangerous file extensions',
        description: 'Blocks emails with potentially dangerous executable attachments',
        type: 'attachment',
        rule: '\\.exe$|\\.scr$|\\.bat$|\\.cmd$',
        action: 'block',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'rule_2',
        name: 'Flag urgent financial requests',
        description: 'Flags emails with urgent financial language',
        type: 'keyword',
        rule: 'urgent.*transfer|immediate.*payment|emergency.*funds',
        action: 'flag',
        severity: 'high',
        enabled: true
      },
      {
        id: 'rule_3',
        name: 'Quarantine lottery scams',
        description: 'Quarantines obvious lottery and inheritance scams',
        type: 'keyword',
        rule: 'congratulations.*won|inheritance.*million|lottery.*winner',
        action: 'quarantine',
        severity: 'high',
        enabled: true
      },
      {
        id: 'rule_4',
        name: 'Warn about suspicious domains',
        description: 'Warns about emails from suspicious TLDs',
        type: 'domain',
        rule: '\\.tk$|\\.ml$|\\.ga$|\\.cf$',
        action: 'warn',
        severity: 'medium',
        enabled: true
      },
      {
        id: 'rule_5',
        name: 'Flag account verification requests',
        description: 'Flags emails requesting account verification',
        type: 'keyword',
        rule: 'verify.*account|confirm.*identity|update.*details',
        action: 'flag',
        severity: 'medium',
        enabled: true
      }
    ];
  }

  /**
   * Get all security rules
   */
  getSecurityRules(): SecurityRule[] {
    return this.securityRules;
  }

  /**
   * Add custom security rule
   */
  addSecurityRule(rule: Omit<SecurityRule, 'id'>): string {
    const id = `rule_${Date.now()}`;
    this.securityRules.push({ ...rule, id });
    return id;
  }

  /**
   * Update security rule
   */
  updateSecurityRule(id: string, updates: Partial<SecurityRule>): boolean {
    const ruleIndex = this.securityRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false;
    
    this.securityRules[ruleIndex] = { ...this.securityRules[ruleIndex], ...updates };
    return true;
  }

  /**
   * Delete security rule
   */
  deleteSecurityRule(id: string): boolean {
    const ruleIndex = this.securityRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false;
    
    this.securityRules.splice(ruleIndex, 1);
    return true;
  }
}

export const emailSecurityEnhancementService = new EmailSecurityEnhancementService();