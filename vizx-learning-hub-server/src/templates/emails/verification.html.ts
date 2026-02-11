import { getBaseEmailTemplate } from './base.html';

export const getVerificationEmailTemplate = (
    name: string,
    code: string
) => {
    const formattedCode = code.split('').join(' ');

    const content = `
        <h1>Verify Your Email Address</h1>
        <p>Dear ${name},</p>
        <p>Thank you for registering with Vizx Academy. To complete your account setup, please use the 6-digit verification code provided below. This code is required to verify your email address and activate your account.</p>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;">
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #E57437; font-family: 'Courier New', monospace;">
                ${formattedCode}
            </div>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
            This verification code will expire in 10 minutes.
        </p>
        
        <p>If you did not initiate this request, please disregard this email or contact our support team if you have any concerns.</p>
    `;

    return getBaseEmailTemplate(content, 'Verify Your Email - Vizx Academy');
};
