import nodemailer from 'nodemailer';
import { config } from '../config';
import {
    getWelcomeEmailTemplate,
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getManagerWelcomeEmailTemplate,
    getAccountUpdateEmailTemplate
} from '../templates/emails';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    cc?: string[];
    bcc?: string[];
}

export interface EmailAttachment {
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
}

export interface SendEmailOptions extends EmailOptions {
    attachments?: EmailAttachment[];
}

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        // Add connection timeout
        connectionTimeout: 10000,
        // Add socket timeout
        socketTimeout: 10000,
        // Add greeting timeout
        greetingTimeout: 10000,
    });

    // Verify SMTP connection
    static async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('❌ SMTP connection failed:', error);
            return false;
        }
    }

    static async sendEmail(options: SendEmailOptions): Promise<void> {
        try {
            const mailOptions: nodemailer.SendMailOptions = {
                from: process.env.SMTP_FROM || 'Vizx Academy <noreply@vizxacademy.com>',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                cc: options.cc,
                bcc: options.bcc,
                attachments: options.attachments,
                // Add headers for better email deliverability
                headers: {
                    'X-Priority': '1',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'high',
                    'X-Mailer': 'Vizx Academy Mail Service'
                },
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ Email sent successfully to ${options.to}`);
            console.log(`📧 Message ID: ${info.messageId}`);
            
            // Log email details (without sensitive information)
            this.logEmailSent(options.to, options.subject);
            
        } catch (error: any) {
            console.error('❌ Failed to send email:', {
                to: options.to,
                subject: options.subject,
                error: error.message,
                code: error.code,
            });
            
            // Re-throw with more context
            throw new Error(`Failed to send email to ${options.to}: ${error.message}`);
        }
    }

    private static logEmailSent(to: string, subject: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] 📧 Email sent - To: ${to} | Subject: ${subject}`;
        
        // Log to console
        console.log(logMessage);
        
        // You could also log to a file or database here
        // For example:
        // this.logToFile(logMessage);
    }

    // Welcome Email (for all new users)
    static async sendWelcomeEmail(
        email: string, 
        name: string, 
        password: string,
        role?: string
    ): Promise<void> {
        const subject = role === 'MANAGER' 
            ? '👨‍💼 Welcome Manager - Your Vizx Academy Account'
            : '🎓 Welcome to Vizx Academy - Your Account Details';
        
        const html = getWelcomeEmailTemplate(name, email, password);
        
        await this.sendEmail({
            to: email,
            subject,
            html,
            text: this.generateTextVersion(name, email, password),
        });
    }

    // Manager Welcome Email with Verification Code
    static async sendManagerWelcomeEmail(
        email: string,
        name: string,
        password: string,
        verificationCode: string
    ): Promise<void> {
        const html = getManagerWelcomeEmailTemplate(name, email, password, verificationCode);
        
        await this.sendEmail({
            to: email,
            subject: '👨‍💼 Manager Account Created - Verify Your Email',
            html,
            text: this.generateManagerTextVersion(name, email, password, verificationCode),
        });
    }

    // Verification Code Email
    static async sendVerificationCode(
        email: string,
        name: string,
        code: string
    ): Promise<void> {
        const html = getVerificationEmailTemplate(name, code);
        
        await this.sendEmail({
            to: email,
            subject: '🔐 Verify Your Email - Vizx Academy',
            html,
            text: this.generateVerificationTextVersion(name, code),
        });
    }

    // Password Reset Email
    static async sendPasswordResetEmail(
        email: string,
        name: string,
        resetToken: string
    ): Promise<void> {
        const html = getPasswordResetEmailTemplate(name, resetToken);
        
        await this.sendEmail({
            to: email,
            subject: '🔑 Reset Your Password - Vizx Academy',
            html,
            text: this.generatePasswordResetTextVersion(name, resetToken),
        });
    }

    // Account Update Notification
    static async sendAccountUpdateEmail(
        email: string,
        name: string,
        updateType: 'password_changed' | 'profile_updated' | 'role_changed' | 'status_changed',
        details: string
    ): Promise<void> {
        const html = getAccountUpdateEmailTemplate(name, updateType, details);
        
        const subjectMap = {
            'password_changed': '🔐 Password Updated Successfully',
            'profile_updated': '👤 Profile Information Updated',
            'role_changed': '🔄 Account Role Updated',
            'status_changed': '📊 Account Status Updated'
        };
        
        await this.sendEmail({
            to: email,
            subject: subjectMap[updateType],
            html,
            text: this.generateAccountUpdateTextVersion(name, updateType, details),
        });
    }

    // Bulk Email (for announcements, notifications)
    static async sendBulkEmail(
        recipients: string[],
        subject: string,
        htmlContent: string,
        textContent?: string
    ): Promise<void> {
        // Send emails in batches to avoid rate limiting
        const batchSize = 50;
        
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(recipient =>
                    this.sendEmail({
                        to: recipient,
                        subject,
                        html: htmlContent,
                        text: textContent,
                    })
                )
            );
            
            console.log(`✅ Sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(recipients.length / batchSize)}`);
            
            // Add delay between batches to prevent rate limiting
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    // Generate text versions for email clients that don't support HTML

    private static generateTextVersion(name: string, email: string, password: string): string {
        return `
Welcome to Vizx Academy!

Dear ${name},

Your account has been created successfully.

Account Details:
Email: ${email}
Temporary Password: ${password}

Please login and change your password immediately for security:
${config.app.clientUrl}/login

Security Notice: Please change your password after your first login.

Getting Started:
After logging in, you'll be guided through setting up your profile and exploring available learning paths.

Need help? Contact our support team at support@vizxacademy.com

Best regards,
The Vizx Academy Team

---
Vizx Academy
${config.app.clientUrl}
© ${new Date().getFullYear()} Vizx Academy. All rights reserved.
This is an automated email. Please do not reply to this message.
`;
    }

    private static generateManagerTextVersion(name: string, email: string, password: string, code: string): string {
        return `
Welcome Manager - Vizx Academy!

Dear ${name},

Congratulations! You've been appointed as a Manager in Vizx Academy.

Account Credentials:
Email: ${email}
Temporary Password: ${password}
Verification Code: ${code}

Important: You must verify your email before accessing manager features.

Verification Code: ${code}
This code expires in 15 minutes.

Login URL: ${config.app.clientUrl}/login

Manager Privileges:
✓ Create and manage employee accounts in your department
✓ Assign learning paths to team members
✓ Track team progress and performance
✓ Generate reports and analytics
✓ Approve or review submissions

Next Steps:
1. Verify your email with the code provided
2. Change your password on first login
3. Complete your profile setup
4. Start managing your team's learning journey

For manager-specific questions: managers@vizxacademy.com
General support: support@vizxacademy.com

Best regards,
The Vizx Academy Leadership Team

---
Vizx Academy
${config.app.clientUrl}
© ${new Date().getFullYear()} Vizx Academy. All rights reserved.
This is an automated email. Please do not reply to this message.
`;
    }

    private static generateVerificationTextVersion(name: string, code: string): string {
        return `
Verify Your Account - Vizx Academy

Dear ${name},

To complete your account setup, please verify your email address.

Verification Code: ${code}

This code will expire in 15 minutes.

How to use this code:
1. Go to the verification page in your Vizx Academy account
2. Enter the 6-digit code shown above
3. Click "Verify Account" to complete the process

Important: This code is for your use only. Do not share it with anyone.

Didn't request this verification?
If you didn't create an account with Vizx Academy, please ignore this email or contact our support team immediately.

Need help? Contact: support@vizxacademy.com

Best regards,
The Vizx Academy Team

---
Vizx Academy
${config.app.clientUrl}
© ${new Date().getFullYear()} Vizx Academy. All rights reserved.
This is an automated email. Please do not reply to this message.
`;
    }

    private static generatePasswordResetTextVersion(name: string, resetToken: string): string {
        const resetUrl = `${config.app.clientUrl}/reset-password?token=${resetToken}`;
        
        return `
Reset Your Password - Vizx Academy

Dear ${name},

We received a request to reset your password for your Vizx Academy account.

Reset your password using this link:
${resetUrl}

This password reset link will expire in 1 hour.

Security Tips:
• Create a strong password with at least 8 characters
• Use a combination of letters, numbers, and symbols
• Avoid using personal information in your password
• Never share your password with anyone

Didn't request this?
If you didn't request a password reset, please ignore this email. Your account remains secure.

Need help? Contact: support@vizxacademy.com

Best regards,
The Vizx Academy Team

---
Vizx Academy
${config.app.clientUrl}
© ${new Date().getFullYear()} Vizx Academy. All rights reserved.
This is an automated email. Please do not reply to this message.
`;
    }

    private static generateAccountUpdateTextVersion(name: string, updateType: string, details: string): string {
        const titleMap = {
            'password_changed': 'Password Updated Successfully',
            'profile_updated': 'Profile Updated',
            'role_changed': 'Account Role Updated',
            'status_changed': 'Account Status Updated'
        };

        return `
${titleMap[updateType as keyof typeof titleMap] || 'Account Update'} - Vizx Academy

Dear ${name},

We're writing to inform you about an important update to your Vizx Academy account.

Update Details:
${details}

What this means for you:
${
    updateType === 'password_changed' ? 
    'Your password has been successfully updated. If you did not make this change, please contact our support team immediately.' :
    updateType === 'profile_updated' ?
    'Your profile information has been updated. You can review your profile at any time in your account settings.' :
    updateType === 'role_changed' ?
    'Your account role has been updated. This may affect the features and permissions available to you.' :
    'Your account status has been updated. This may affect your access to the platform.'
}

Security Reminder:
If you did not authorize this change or notice any suspicious activity, please contact our security team immediately at security@vizxacademy.com

Thank you for being part of Vizx Academy.

Best regards,
The Vizx Academy Team

---
Vizx Academy
${config.app.clientUrl}
© ${new Date().getFullYear()} Vizx Academy. All rights reserved.
This is an automated email. Please do not reply to this message.
`;
    }
}