import { storage } from '../storage';
import { EncryptionService } from './encryption';

export interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  timestamp: Date;
  sessionId?: string;
}

export interface SecurityAlert {
  type: 'data_access' | 'authentication' | 'authorization' | 'system' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  metadata?: any;
}

export class AuditService {
  /**
   * Log user action for compliance and security monitoring
   */
  static async logAction(event: AuditEvent): Promise<void> {
    try {
      // Encrypt sensitive details
      const encryptedDetails = event.details ? 
        EncryptionService.encryptField(JSON.stringify(event.details)) : null;

      await storage.createAuditLog({
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        details: encryptedDetails,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent ? EncryptionService.encryptField(event.userAgent) : null,
        success: event.success,
        timestamp: event.timestamp,
        sessionId: event.sessionId
      });

      // Check for suspicious patterns
      await this.detectSuspiciousActivity(event);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log data access for GDPR/CCPA compliance
   */
  static async logDataAccess(
    userId: string, 
    dataType: string, 
    operation: 'read' | 'create' | 'update' | 'delete',
    recordId?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: `data_${operation}`,
      resource: dataType,
      details: { recordId, operation },
      ipAddress,
      success: true,
      timestamp: new Date()
    });
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    userId: string | null,
    event: 'login' | 'logout' | 'login_failed' | 'password_change' | 'mfa_setup' | 'mfa_verify',
    success: boolean,
    ipAddress?: string,
    details?: any
  ): Promise<void> {
    await this.logAction({
      userId: userId || undefined,
      action: `auth_${event}`,
      resource: 'authentication',
      details,
      ipAddress,
      success,
      timestamp: new Date()
    });

    // Create security alert for failed logins
    if (!success && event === 'login_failed') {
      await this.createSecurityAlert({
        type: 'authentication',
        severity: 'medium',
        message: 'Failed login attempt detected',
        userId: userId || undefined,
        metadata: { ipAddress, timestamp: new Date(), event }
      });
    }
  }

  /**
   * Log email processing events
   */
  static async logEmailAccess(
    userId: string,
    emailId: string,
    operation: 'read' | 'process' | 'draft' | 'send',
    ipAddress?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: `email_${operation}`,
      resource: 'email',
      details: { emailId },
      ipAddress,
      success: true,
      timestamp: new Date()
    });
  }

  /**
   * Log integration access
   */
  static async logIntegrationAccess(
    userId: string,
    provider: string,
    operation: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: `integration_${operation}`,
      resource: provider,
      details: { error },
      success,
      timestamp: new Date()
    });
  }

  /**
   * Create security alert
   */
  static async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      await storage.createSecurityAlert({
        userId: alert.userId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        metadata: alert.metadata ? EncryptionService.encryptField(JSON.stringify(alert.metadata)) : null,
        resolved: false
      });

      // For critical alerts, could send immediate notifications
      if (alert.severity === 'critical') {
        await this.handleCriticalAlert(alert);
      }
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }

  /**
   * Handle critical security alerts
   */
  private static async handleCriticalAlert(alert: SecurityAlert): Promise<void> {
    // In production, this would:
    // 1. Send immediate email/SMS notifications
    // 2. Trigger incident response workflows
    // 3. Potentially lock affected accounts
    console.log(`CRITICAL SECURITY ALERT: ${alert.message}`, alert);
  }

  /**
   * Detect suspicious activity patterns
   */
  private static async detectSuspiciousActivity(event: AuditEvent): Promise<void> {
    if (!event.userId || !event.ipAddress) return;

    try {
      // Get recent activities for this user
      const recentLogs = await storage.getRecentAuditLogs(event.userId, 24); // Last 24 hours

      // Check for multiple failed login attempts
      const failedLogins = recentLogs.filter(log => 
        log.action === 'auth_login_failed' && 
        log.ipAddress === event.ipAddress
      );

      if (failedLogins.length >= 5) {
        await this.createSecurityAlert({
          type: 'authentication',
          severity: 'high',
          message: 'Multiple failed login attempts detected',
          userId: event.userId,
          metadata: { 
            ipAddress: event.ipAddress, 
            failedAttempts: failedLogins.length,
            timeWindow: '24h'
          }
        });
      }

      // Check for unusual access patterns
      const uniqueIPs = new Set(recentLogs.map(log => log.ipAddress).filter(Boolean));
      if (uniqueIPs.size > 5) {
        await this.createSecurityAlert({
          type: 'authentication',
          severity: 'medium',
          message: 'Unusual access pattern: Multiple IP addresses',
          userId: event.userId,
          metadata: { 
            uniqueIPs: uniqueIPs.size,
            timeWindow: '24h'
          }
        });
      }

      // Check for rapid successive operations
      const recentActions = recentLogs.filter(log => 
        new Date().getTime() - new Date(log.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
      );

      if (recentActions.length > 50) {
        await this.createSecurityAlert({
          type: 'system',
          severity: 'medium',
          message: 'Rapid successive operations detected - possible automation',
          userId: event.userId,
          metadata: { 
            actionsCount: recentActions.length,
            timeWindow: '5min'
          }
        });
      }
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
    }
  }

  /**
   * Get audit trail for compliance reporting
   */
  static async getAuditTrail(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    action?: string
  ): Promise<any[]> {
    return await storage.getAuditLogs({
      userId,
      startDate,
      endDate,
      action
    });
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    dataAccess: any[];
    authentication: any[];
    modifications: any[];
    integrations: any[];
    summary: any;
  }> {
    const logs = await this.getAuditTrail(userId, startDate, endDate);

    const dataAccess = logs.filter(log => log.action.startsWith('data_'));
    const authentication = logs.filter(log => log.action.startsWith('auth_'));
    const modifications = logs.filter(log => 
      ['data_update', 'data_delete', 'data_create'].includes(log.action)
    );
    const integrations = logs.filter(log => log.action.startsWith('integration_'));

    return {
      dataAccess,
      authentication,
      modifications,
      integrations,
      summary: {
        totalEvents: logs.length,
        dataAccessEvents: dataAccess.length,
        authEvents: authentication.length,
        modificationEvents: modifications.length,
        integrationEvents: integrations.length,
        reportPeriod: { startDate, endDate }
      }
    };
  }

  /**
   * Log data retention compliance
   */
  static async logDataRetention(
    operation: 'archive' | 'delete' | 'anonymize',
    dataType: string,
    recordCount: number,
    reason: string
  ): Promise<void> {
    await this.logAction({
      action: `data_retention_${operation}`,
      resource: dataType,
      details: { recordCount, reason },
      success: true,
      timestamp: new Date()
    });
  }
}