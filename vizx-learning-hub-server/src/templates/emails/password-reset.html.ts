import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getPasswordResetEmailTemplate = (name: string, resetToken: string) => {
    const resetUrl = `${config.app.clientUrl}/reset-password?token=${resetToken}`;
    
    const content = `
        <div class="text-center">
            <h1>Reset Your Password 🔑</h1>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We received a request to reset your password for your Vizx Academy account. Click the button below to create a new password:</p>
            
            <div style="margin: 40px 0;">
                <a href="${resetUrl}" class="btn-primary">Reset Password</a>
            </div>
            
            <p class="expiry-note">This password reset link will expire in <strong>1 hour</strong>.</p>
            
            <div class="card">
                <h3>Security Tips</h3>
                <ul style="text-align: left; margin: 20px 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Create a strong password with at least 8 characters</li>
                    <li style="margin-bottom: 10px;">Use a combination of letters, numbers, and symbols</li>
                    <li style="margin-bottom: 10px;">Avoid using personal information in your password</li>
                    <li style="margin-bottom: 10px;">Never share your password with anyone</li>
                </ul>
            </div>
            
            <div class="warning">
                <strong>Didn't request this?</strong><br>
                If you didn't request a password reset, please ignore this email. Your account remains secure.
            </div>
            
            <p class="text-muted">
                Can't click the button? Copy and paste this link in your browser:<br>
                <small>${resetUrl}</small>
            </p>
            
            <p>Need help? Contact our support team at <a href="mailto:support@vizxacademy.com">support@vizxacademy.com</a></p>
            
            <p>Best regards,<br>
            <strong>The Vizx Academy Team</strong></p>
        </div>
    `;
    
    return getBaseEmailTemplate(content, 'Reset Your Password - Vizx Academy');
};