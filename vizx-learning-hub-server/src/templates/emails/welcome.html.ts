import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getWelcomeEmailTemplate = (name: string, email: string, password: string) => {
    const loginUrl = `${config.app.clientUrl}/login`;
    
    const content = `
        <div class="text-center">
            <h1>Welcome to Vizx Academy! 👋</h1>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We're excited to welcome you to Vizx Academy! Your account has been created successfully.</p>
            
            <div class="card">
                <h2>Your Account Details</h2>
                <div class="credentials-box">
                    <div class="credential-item">
                        <span class="credential-label">Email Address:</span>
                        <span class="credential-value">${email}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Temporary Password:</span>
                        <span class="credential-value">${password}</span>
                    </div>
                </div>
                
                <div class="warning">
                    <strong>Security Notice:</strong> Please change your password immediately after your first login for security purposes.
                </div>
                
                <div style="margin: 30px 0;">
                    <a href="${loginUrl}" class="btn-primary">Access Your Account</a>
                </div>
                
                <p class="text-muted">
                    Can't click the button? Copy and paste this link in your browser:<br>
                    <small>${loginUrl}</small>
                </p>
            </div>
            
            <div class="info">
                <strong>Getting Started:</strong> 
                After logging in, you'll be guided through setting up your profile and exploring available learning paths.
            </div>
            
            <p>We're committed to providing you with the best learning experience. If you have any questions, don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>
            <strong>The Vizx Academy Team</strong></p>
        </div>
    `;
    
    return getBaseEmailTemplate(content, 'Welcome to Vizx Academy');
};