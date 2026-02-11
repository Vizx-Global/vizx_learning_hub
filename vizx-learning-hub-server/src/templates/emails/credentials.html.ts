import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getCredentialsEmailTemplate = (
    name: string,
    email: string,
    password: string
) => {
    const loginUrl = `${config.app.clientUrl}/login`;

    const content = `
        <h1>Your Vizx Academy Account Details</h1>
        <p>Dear ${name},</p>
        <p>Your account on Vizx Academy has been created. You can now access the platform using the credentials provided below.</p>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 32px 0;">
            <p style="margin: 0; font-weight: 600; color: #111827;">Login Credentials:</p>
            <p style="margin: 8px 0; color: #4b5563;">Email: <strong>${email}</strong></p>
            <p style="margin: 8px 0; color: #4b5563;">Temporary Password: <strong>${password}</strong></p>
        </div>
        
        <p style="margin-bottom: 32px;">For security reasons, we strongly recommend that you change your password immediately after your first login.</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}" class="btn">Login to Your Account</a>
        </div>
        
        <p>If you have any questions regarding your account or the platform, please contact your administrator or our support team.</p>
    `;

    return getBaseEmailTemplate(content, 'Your Vizx Academy Account Details');
};
