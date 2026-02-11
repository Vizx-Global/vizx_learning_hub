import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getEmployeeWelcomeEmailTemplate = (
    name: string,
    email: string,
    password: string
) => {
    const loginUrl = `${config.app.clientUrl}/login`;

    const content = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <h1 style="color:#111827;">Welcome to Vizx Academy! 🎓</h1>
      <p>Dear <strong>${name}</strong>,</p>
      <p>We are delighted to welcome you to <strong>Vizx Academy</strong>. Your account has been created and verified by your administrator, and you now have full access to our learning platform.</p>

      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:24px; margin:24px 0;">
        <h3 style="margin-top:0; color:#111827; border-bottom:1px solid #e5e7eb; padding-bottom:12px;">Your Account Credentials</h3>
        <p style="margin: 16px 0 8px 0;"><strong>Email:</strong> <span style="color:#2563eb;">${email}</span></p>
        <p style="margin: 8px 0 16px 0;"><strong>Temporary Password:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #d1d5db; font-weight:bold;">${password}</code></p>
        
        <div style="margin-top:16px; padding:12px; background:#fff7ed; border-left:4px solid #f59e0b; font-size:14px; color:#9a3412;">
          <strong>Security Notice:</strong> For your protection, you will be required to change this temporary password upon your first login.
        </div>

        <div style="text-align:center; margin-top:32px;">
          <a href="${loginUrl}" style="background:#E57437; color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block; transition: background-color 0.3s ease;">
            Login & Get Started
          </a>
        </div>
      </div>

      <div style="background:#eef2ff; border-left:4px solid #6366f1; padding:20px; border-radius:0 8px 8px 0; margin-bottom:24px;">
        <h4 style="margin-top:0; color:#1e1b4b;">What's Next?</h4>
        <ol style="margin:0; padding-left:20px; color:#312e81; line-height:1.8;">
          <li>Log in using your official email and temporary password</li>
          <li>Set a new, secure password of your choice</li>
          <li>Explore your assigned learning paths and modules</li>
          <li>Start tracking your progress and earning certificates</li>
        </ol>
      </div>

      <p style="font-size:15px; color:#4b5563;">If you encounter any issues while logging in or have any questions about the platform, please reach out to your department manager or contact our support team.</p>
    </div>
    `;

    return getBaseEmailTemplate(content, 'Welcome to Vizx Academy - Your Account is Ready');
};
