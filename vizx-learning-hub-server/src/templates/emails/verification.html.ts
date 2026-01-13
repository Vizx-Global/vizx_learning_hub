import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getVerificationEmailTemplate = (name: string, code: string) => {
    const content = `
        <div class="text-center">
            <h1>Verify Your Account 🔒</h1>
            <p>Dear <strong>${name}</strong>,</p>
            <p>To complete your account setup and access all features of Vizx Academy, please verify your email address using the code below:</p>
            
            <div class="verification-code">
                ${code.match(/.{1}/g)?.join(' ') || code}
            </div>
            
            <p class="expiry-note">This verification code will expire in <strong>15 minutes</strong>.</p>
            
            <div class="card">
                <h3>How to Use This Code</h3>
                <ol style="text-align: left; margin: 20px 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Go to the verification page in your Vizx Academy account</li>
                    <li style="margin-bottom: 10px;">Enter the 6-digit code shown above</li>
                    <li style="margin-bottom: 10px;">Click "Verify Account" to complete the process</li>
                </ol>
                
                <div class="warning">
                    <strong>Important:</strong> This code is for your use only. Do not share it with anyone.
                </div>
            </div>
            
            <div class="info">
                <strong>Didn't request this verification?</strong><br>
                If you didn't create an account with Vizx Academy, please ignore this email or contact our support team immediately.
            </div>
            
            <p>Need help? Contact our support team at <a href="mailto:support@vizxacademy.com">support@vizxacademy.com</a></p>
            
            <p>Best regards,<br>
            <strong>The Vizx Academy Team</strong></p>
        </div>
    `;
    
    return getBaseEmailTemplate(content, 'Verify Your Account - Vizx Academy');
};