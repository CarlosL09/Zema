import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { EncryptionService } from './encryption';
import { storage } from '../storage';

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerification {
  isValid: boolean;
  remainingAttempts?: number;
  lockoutUntil?: Date;
}

export class MFAService {
  /**
   * Generate MFA setup for new user
   */
  static async generateMFASetup(userId: string, userEmail: string): Promise<MFASetup> {
    // Generate secret key
    const secret = speakeasy.generateSecret({
      name: `ZEMA (${userEmail})`,
      issuer: 'ZEMA - Zero Effort Mail Automation',
      length: 32
    });

    // Generate QR code for authenticator apps
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      EncryptionService.generateSecureToken(8).toUpperCase()
    );

    // Store encrypted secret and backup codes
    await storage.updateUserMFASettings(userId, {
      mfaSecret: EncryptionService.encryptField(secret.base32),
      mfaBackupCodes: backupCodes.map(code => EncryptionService.encryptField(code)),
      mfaEnabled: false, // User must verify first
      mfaFailedAttempts: 0,
      mfaLastFailedAt: null
    });

    return {
      secret: secret.base32,
      qrCode,
      backupCodes
    };
  }

  /**
   * Verify TOTP token and enable MFA
   */
  static async verifyAndEnableMFA(userId: string, token: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user?.mfaSecret) {
      throw new Error('MFA not set up for this user');
    }

    const decryptedSecret = EncryptionService.decryptField(user.mfaSecret);
    
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });

    if (verified) {
      await storage.updateUserMFASettings(userId, {
        mfaEnabled: true,
        mfaFailedAttempts: 0,
        mfaLastFailedAt: null
      });
      
      // Log successful MFA activation
      await this.logSecurityEvent(userId, 'mfa_enabled', 'success');
      return true;
    }

    return false;
  }

  /**
   * Verify MFA token during login
   */
  static async verifyMFALogin(userId: string, token: string, isBackupCode = false): Promise<MFAVerification> {
    const user = await storage.getUser(userId);
    if (!user?.mfaSecret || !user.mfaEnabled) {
      return { isValid: false };
    }

    // Check for account lockout
    const lockoutInfo = await this.checkMFALockout(userId);
    if (lockoutInfo.isLockedOut) {
      return { 
        isValid: false, 
        lockoutUntil: lockoutInfo.lockoutUntil 
      };
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      isValid = await this.verifyBackupCode(userId, token);
    } else {
      // Verify TOTP token
      const decryptedSecret = EncryptionService.decryptField(user.mfaSecret);
      isValid = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token,
        window: 2
      });
    }

    if (isValid) {
      // Reset failed attempts on successful verification
      await storage.updateUserMFASettings(userId, {
        mfaFailedAttempts: 0,
        mfaLastFailedAt: null
      });
      
      await this.logSecurityEvent(userId, 'mfa_login_success', 'success');
      return { isValid: true };
    } else {
      // Increment failed attempts
      const failedAttempts = (user.mfaFailedAttempts || 0) + 1;
      await storage.updateUserMFASettings(userId, {
        failedAttempts,
        lastFailedAt: new Date()
      });

      await this.logSecurityEvent(userId, 'mfa_login_failed', 'warning', {
        failedAttempts,
        remainingAttempts: Math.max(0, 5 - failedAttempts)
      });

      return { 
        isValid: false,
        remainingAttempts: Math.max(0, 5 - failedAttempts)
      };
    }
  }

  /**
   * Verify backup code
   */
  private static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user?.mfaBackupCodes) return false;

    const encryptedCode = EncryptionService.encryptField(code.toUpperCase());
    const codeIndex = user.mfaBackupCodes.findIndex(storedCode => storedCode === encryptedCode);

    if (codeIndex !== -1) {
      // Remove used backup code
      const updatedCodes = [...user.mfaBackupCodes];
      updatedCodes.splice(codeIndex, 1);

      await storage.updateUserMFASettings(userId, {
        backupCodes: updatedCodes
      });

      await this.logSecurityEvent(userId, 'backup_code_used', 'info', {
        remainingCodes: updatedCodes.length
      });

      return true;
    }

    return false;
  }

  /**
   * Check if user is locked out from too many failed MFA attempts
   */
  private static async checkMFALockout(userId: string): Promise<{ isLockedOut: boolean; lockoutUntil?: Date }> {
    const user = await storage.getUser(userId);
    const failedAttempts = user?.mfaFailedAttempts || 0;
    const lastFailedAt = user?.mfaLastFailedAt;

    if (failedAttempts >= 5 && lastFailedAt) {
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      const lockoutUntil = new Date(lastFailedAt.getTime() + lockoutDuration);
      
      if (new Date() < lockoutUntil) {
        return { isLockedOut: true, lockoutUntil };
      }
    }

    return { isLockedOut: false };
  }

  /**
   * Disable MFA for user (with proper verification)
   */
  static async disableMFA(userId: string, password: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    // Verify current password before disabling MFA
    const passwordValid = await EncryptionService.verifyPassword(password, user.passwordHash || '');
    if (!passwordValid) return false;

    await storage.updateUserMFASettings(userId, {
      secret: null,
      backupCodes: [],
      isEnabled: false,
      failedAttempts: 0,
      lastFailedAt: null
    });

    await this.logSecurityEvent(userId, 'mfa_disabled', 'warning');
    return true;
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newBackupCodes = Array.from({ length: 8 }, () => 
      EncryptionService.generateSecureToken(8).toUpperCase()
    );

    await storage.updateUserMFASettings(userId, {
      backupCodes: newBackupCodes.map(code => EncryptionService.encryptField(code))
    });

    await this.logSecurityEvent(userId, 'backup_codes_regenerated', 'info');
    
    return newBackupCodes;
  }

  /**
   * Log security events for audit trail
   */
  private static async logSecurityEvent(
    userId: string, 
    event: string, 
    level: 'info' | 'warning' | 'error' | 'success',
    metadata?: any
  ): Promise<void> {
    try {
      await storage.createSecurityAlert({
        userId,
        type: 'authentication',
        severity: level === 'error' ? 'high' : level === 'warning' ? 'medium' : 'low',
        message: `MFA Event: ${event}`,
        metadata: {
          event,
          timestamp: new Date().toISOString(),
          ...metadata
        },
        resolved: level === 'success' || level === 'info'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}