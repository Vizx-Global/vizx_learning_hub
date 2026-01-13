import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getManagerWelcomeEmailTemplate = (name: string, email: string, password: string, code: string) => {
    const loginUrl = `${config.app.clientUrl}/login`;
    
    const content = `
        <div class="text-center">
            <h1>Welcome Manager! 🎯</h1>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Congratulations! You've been appointed as a Manager in Vizx Academy. Your account has been created with special privileges to manage your team and oversee learning activities.</p>
            
            <div class="card">
                <h2>Your Account Credentials</h2>
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
                    <strong>Important:</strong> You must verify your email before accessing manager features.
                </div>
                
                <h3 style="margin-top: 30px;">Verification Code</h3>
                <div class="verification-code">
                    ${code.match(/.{1}/g)?.join(' ') || code}
                </div>
                <p class="expiry-note">This code expires in 15 minutes</p>
                
                <div style="margin: 30px 0;">
                    <a href="${loginUrl}" class="btn-primary">Verify & Access Account</a>
                </div>
            </div>
            
            <div class="card">
                <h2>Manager Privileges</h2>
                <div style="text-align: left;">
                    <p><strong>✓</strong> Create and manage employee accounts in your department</p>
                    <p><strong>✓</strong> Assign learning paths to team members</p>
                    <p><strong>✓</strong> Track team progress and performance</p>
                    <p><strong>✓</strong> Generate reports and analytics</p>
                    <p><strong>✓</strong> Approve or review submissions</p>
                </div>
            </div>
            
            <div class="info">
                <strong>Next Steps:</strong><br>
                1. Verify your email with the code provided<br>
                2. Change your password on first login<br>
                3. Complete your profile setup<br>
                4. Start managing your team's learning journey
            </div>
            
            <p>Our team is here to support you. For any questions about your manager role, contact <a href="mailto:managers@vizxacademy.com">managers@vizxacademy.com</a></p>
            
            <p>Best regards,<br>
            <strong>The Vizx Academy Leadership Team</strong></p>
        </div>
    `;
    
    return getBaseEmailTemplate(content, 'Welcome Manager - Vizx Academy');
};