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
        connectionTimeout: 10000,
        socketTimeout: 10000,
        greetingTimeout: 10000,
    });

    static async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
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
                headers: {
                    'X-Priority': '1',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'high',
                    'X-Mailer': 'Vizx Academy Mail Service'
                },
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error: any) {
            throw new Error(`Failed to send email to ${options.to}: ${error.message}`);
        }
    }

    static async sendWelcomeEmail(email: string, name: string, password: string, role?: string): Promise<void> {
        const subject = role === 'MANAGER' ? '👨‍💼 Welcome Manager - Your Vizx Academy Account' : '🎓 Welcome to Vizx Academy - Your Account Details';
        await this.sendEmail({
            to: email,
            subject,
            html: getWelcomeEmailTemplate(name, email, password),
            text: this.generateTextVersion(name, email, password),
        });
    }

    static async sendManagerWelcomeEmail(email: string, name: string, password: string, verificationCode: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: '👨‍💼 Manager Account Created - Verify Your Email',
            html: getManagerWelcomeEmailTemplate(name, email, password, verificationCode),
            text: this.generateManagerTextVersion(name, email, password, verificationCode),
        });
    }

    static async sendVerificationCode(email: string, name: string, code: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: '🔐 Verify Your Email - Vizx Academy',
            html: getVerificationEmailTemplate(name, code),
            text: this.generateVerificationTextVersion(name, code),
        });
    }

    static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: '🔑 Reset Your Password - Vizx Academy',
            html: getPasswordResetEmailTemplate(name, resetToken),
            text: this.generatePasswordResetTextVersion(name, resetToken),
        });
    }

    static async sendAccountUpdateEmail(email: string, name: string, updateType: 'password_changed' | 'profile_updated' | 'role_changed' | 'status_changed' | 'employee_created', details: string): Promise<void> {
        const subjectMap = {
            'password_changed': '🔐 Password Updated Successfully',
            'profile_updated': '👤 Profile Information Updated',
            'role_changed': '🔄 Account Role Updated',
            'status_changed': '📊 Account Status Updated',
            'employee_created': '👨‍💼 Employee Account Created'
        };
        await this.sendEmail({
            to: email,
            subject: subjectMap[updateType],
            html: getAccountUpdateEmailTemplate(name, updateType, details),
            text: this.generateAccountUpdateTextVersion(name, updateType, details),
        });
    }

    static async sendAdminNotification(subject: string, message: string, data?: any): Promise<void> {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (!adminEmail) return;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333;">${subject}</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">${message}</p>
                ${data ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;"><pre style="font-size: 12px;">${JSON.stringify(data, null, 2)}</pre></div>` : ''}
            </div>`;
        await this.sendEmail({ to: adminEmail, subject: `[System Notification] ${subject}`, html, text: `${subject}\n\n${message}` });
    }

    static async sendBulkEmail(recipients: string[], subject: string, htmlContent: string, textContent?: string): Promise<void> {
        const batchSize = 50;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            await Promise.all(batch.map(recipient => this.sendEmail({ to: recipient, subject, html: htmlContent, text: textContent })));
            if (i + batchSize < recipients.length) await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    private static generateTextVersion(name: string, email: string, password: string): string {
        return `Welcome to Vizx Academy!\n\nDear ${name},\n\nYour account details:\nEmail: ${email}\nPassword: ${password}\n\nLogin: ${config.app.clientUrl}/login`;
    }

    private static generateManagerTextVersion(name: string, email: string, password: string, code: string): string {
        return `Welcome Manager!\n\nDear ${name},\n\nCredentials:\nEmail: ${email}\nPassword: ${password}\nVerification Code: ${code}\n\nVerify at: ${config.app.clientUrl}/login`;
    }

    private static generateVerificationTextVersion(name: string, code: string): string {
        return `Verify Your Account\n\nDear ${name},\n\nCode: ${code}\n\nExpires in 15 mins.`;
    }

    private static generatePasswordResetTextVersion(name: string, resetToken: string): string {
        return `Reset Your Password\n\nDear ${name},\n\nReset link: ${config.app.clientUrl}/reset-password?token=${resetToken}`;
    }

    private static generateAccountUpdateTextVersion(name: string, updateType: string, details: string): string {
        return `Account Update - Vizx Academy\n\nDear ${name},\n\n${details}`;
    }
}