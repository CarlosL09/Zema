import { randomBytes } from 'crypto';

export interface EmailService {
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendEmailVerificationEmail(email: string, verificationToken: string): Promise<void>;
  sendWelcomeEmail(email: string, firstName?: string): Promise<void>;
}

// Mock email service for development - replace with real service (SendGrid, AWS SES, etc.)
export class MockEmailService implements EmailService {
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    console.log(`
🔐 PASSWORD RESET EMAIL
To: ${email}
Subject: Reset Your ZEMA Password

Hi there,

You requested a password reset for your ZEMA account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The ZEMA Team
    `);
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    console.log(`
✉️ EMAIL VERIFICATION
To: ${email}
Subject: Verify Your ZEMA Email Address

Welcome to ZEMA!

Please verify your email address by clicking the link below:
${verifyUrl}

This link will expire in 24 hours.

Best regards,
The ZEMA Team
    `);
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const name = firstName ? ` ${firstName}` : '';
    
    console.log(`
🎉 WELCOME EMAIL
To: ${email}
Subject: Welcome to ZEMA - Zero Effort Mail Automation

Hi${name},

Welcome to ZEMA! Your account has been successfully created.

Get started with these features:
• Email Templates - Create and manage custom email templates
• Automation Rules - Set up smart email processing rules  
• Multi-Account Support - Connect multiple email accounts
• Advanced Analytics - Track your email productivity

Visit your dashboard: ${process.env.BASE_URL || 'http://localhost:5000'}/dashboard

Need help? Contact us anytime.

Best regards,
The ZEMA Team
    `);
  }
}

export const emailService = new MockEmailService();

// Utility functions
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateVerificationToken(): string {
  return randomBytes(24).toString('hex');
}