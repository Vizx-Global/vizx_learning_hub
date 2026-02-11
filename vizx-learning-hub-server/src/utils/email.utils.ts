import nodemailer from 'nodemailer';
import { config } from '../config';
import {
    getWelcomeEmailTemplate,
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getManagerWelcomeEmailTemplate,
    getAccountUpdateEmailTemplate,
    getCredentialsEmailTemplate,
    getEmployeeWelcomeEmailTemplate
} from '../templates/emails';

import dns from 'dns';

// Force DNS to prefer IPv4. This often fixes "fetch failed" / ETIMEDOUT issues in Node.js
dns.setDefaultResultOrder('ipv4first');

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

console.log('[EmailService] SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD ? '********' : 'undefined'
});

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        requireTLS: true,
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        debug: true, // Force debug on to see more details
        logger: true,
    });

    static async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('[EmailService] SMTP connection verified successfully');
            return true;
        } catch (error: any) {
            console.error('[EmailService] SMTP Connection Error:', error.message);
            return false;
        }
    }

    static async sendEmail(options: SendEmailOptions): Promise<void> {
        try {
            const mailOptions: nodemailer.SendMailOptions = {
                from: process.env.SMTP_FROM || '"Vizx Academy" <support@vizxglobal.com>',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                cc: options.cc,
                bcc: options.bcc,
                attachments: options.attachments,
            };

            console.log(`[EmailService] Sending email to: ${options.to}`);
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Sent successfully. Message ID: ${info.messageId}`);
        } catch (error: any) {
            console.error(`[EmailService] Failed to send to ${options.to}:`, error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    static async sendWelcomeEmail(email: string, name: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Welcome to Vizx Academy',
            html: getWelcomeEmailTemplate(name, email),
            text: `Welcome to Vizx Academy! Dear ${name}, your account is now active.`,
        });
    }

    static async sendCredentialsEmail(email: string, name: string, password: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Your Vizx Academy Account Details',
            html: getCredentialsEmailTemplate(name, email, password),
            text: `Your Vizx Academy account has been created. Email: ${email}, Temporary Password: ${password}`,
        });
    }

    static async sendEmployeeWelcomeEmail(email: string, name: string, password: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Welcome to Vizx Academy - Your Account is Ready',
            html: getEmployeeWelcomeEmailTemplate(name, email, password),
            text: `Welcome to Vizx Academy! Your account has been created. Email: ${email}, Temporary Password: ${password}. Please change your password on first login.`,
        });
    }

    static async sendManagerWelcomeEmail(email: string, name: string, password: string, verificationCode: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Manager Account Created - Verify Your Email',
            html: getManagerWelcomeEmailTemplate(name, email, password, verificationCode),
            text: `Welcome Manager! Your credentials: Email: ${email}, Password: ${password}, Verification Code: ${verificationCode}`,
        });
    }

    static async sendVerificationCode(email: string, name: string, code: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email - Vizx Academy',
            html: getVerificationEmailTemplate(name, code),
            text: `Verify Your Account. Dear ${name}, your verification code is: ${code}. It expires in 10 minutes.`,
        });
    }

    static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password - Vizx Academy',
            html: getPasswordResetEmailTemplate(name, resetToken),
            text: `Reset Your Password. Dear ${name}, your reset link: ${config.app.clientUrl}/reset-password?token=${resetToken}`,
        });
    }

    static async sendAccountUpdateEmail(email: string, name: string, updateType: 'password_changed' | 'profile_updated' | 'role_changed' | 'status_changed' | 'employee_created', details: string): Promise<void> {
        const subjectMap = {
            'password_changed': 'Password Updated Successfully',
            'profile_updated': 'Profile Information Updated',
            'role_changed': 'Account Role Updated',
            'status_changed': 'Account Status Updated',
            'employee_created': 'Employee Account Created'
        };
        await this.sendEmail({
            to: email,
            subject: subjectMap[updateType],
            html: getAccountUpdateEmailTemplate(name, updateType, details),
            text: `Account Update - Vizx Academy. Dear ${name}, ${details}`,
        });
    }

    static async sendAdminNotification(subject: string, message: string, data?: any): Promise<void> {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (!adminEmail) {
            console.warn('No admin email configured for notifications');
            return;
        }
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333;">${subject}</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">${message}</p>
                ${data ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;"><pre style="font-size: 12px;">${JSON.stringify(data, null, 2)}</pre></div>` : ''}
            </div>`;
        await this.sendEmail({ 
            to: adminEmail, 
            subject: `[System Notification] ${subject}`, 
            html, 
            text: `${subject}\n\n${message}` 
        });
    }

    static async sendBulkEmail(recipients: string[], subject: string, htmlContent: string, textContent?: string): Promise<void> {
        const batchSize = 50;
        console.log(`Sending bulk email to ${recipients.length} recipients in batches of ${batchSize}`);
        
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} emails`);
            
            const emailPromises = batch.map(recipient => 
                this.sendEmail({ 
                    to: recipient, 
                    subject, 
                    html: htmlContent, 
                    text: textContent 
                }).catch(error => {
                    console.error(`Failed to send to ${recipient}:`, error.message);
                    // Continue with other emails even if one fails
                    return null;
                })
            );
            
            await Promise.all(emailPromises);
            
            // Delay between batches to avoid rate limiting
            if (i + batchSize < recipients.length) {
                console.log(`Waiting 2 seconds before next batch...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        console.log('Bulk email sending completed');
    }
}
