import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getManagerWelcomeEmailTemplate = (
    name: string,
    email: string,
    password: string,
    code: string
) => {
    const loginUrl = `${config.app.clientUrl}/login`;
    const formattedCode = code.match(/.{1}/g)?.join(' ') || code;

    const content = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:25px;">
        <img 
          src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767653109/vizx_academy_upy2x1.jpg"
          alt="Vizx Academy"
          style="max-width:160px;height:auto;"
        />
      </div>

      <!-- Heading -->
      <h1 style="text-align:center;color:#111827;">
        Welcome to Vizx Academy Management 🎯
      </h1>

      <p>Dear <strong>${name}</strong>,</p>

      <p>
        Congratulations! You have been appointed as a <strong>Manager</strong> at
        Vizx Academy. Your account has been created with elevated privileges
        to manage teams and oversee learning activities.
      </p>

      <!-- Credentials -->
      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:20px;
        margin:25px 0;
      ">
        <h3 style="margin-top:0;color:#111827;">Your Account Credentials</h3>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>

        <!-- Verification Warning -->
        <div style="
          margin-top:15px;
          padding:12px;
          background:#fff7ed;
          border-left:4px solid #f59e0b;
          font-size:14px;
        ">
          <strong>Important:</strong>
          You must verify your email address before accessing manager features.
        </div>

        <!-- Verification Code -->
        <h4 style="margin-top:25px;">Verification Code</h4>

        <div style="
          text-align:center;
          font-size:26px;
          font-weight:bold;
          letter-spacing:6px;
          color:#2563eb;
          background:#ffffff;
          border:1px dashed #c7d2fe;
          padding:16px;
          border-radius:8px;
          margin:15px 0;
        ">
          ${formattedCode}
        </div>

        <p style="font-size:13px;color:#6b7280;text-align:center;">
          This code expires in <strong>15 minutes</strong>.
        </p>

        <!-- CTA -->
        <div style="text-align:center;margin-top:25px;">
          <a
            href="${loginUrl}"
            style="
              background:#2563eb;
              color:#ffffff;
              padding:12px 26px;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
              display:inline-block;
            "
          >
            Verify & Access Account
          </a>
        </div>
      </div>

      <!-- Manager Privileges -->
      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:20px;
        margin-bottom:25px;
      ">
        <h3 style="margin-top:0;color:#111827;">Manager Privileges</h3>

        <ul style="padding-left:18px;">
          <li>Create and manage employee accounts in your department</li>
          <li>Assign learning paths to team members</li>
          <li>Monitor team progress and performance</li>
          <li>Generate reports and analytics</li>
          <li>Review and approve submissions</li>
        </ul>
      </div>

      <!-- Next Steps -->
      <div style="
        background:#eef2ff;
        border-left:4px solid #6366f1;
        padding:14px;
        font-size:14px;
        margin-bottom:25px;
      ">
        <strong>Next Steps:</strong><br/>
        1. Verify your email using the code above<br/>
        2. Change your password after first login<br/>
        3. Complete your profile setup<br/>
        4. Start managing your team’s learning journey
      </div>

      <!-- Support -->
      <p style="font-size:14px;">
        For questions related to your manager role, contact
        <a href="mailto:managers@vizxacademy.com" style="color:#2563eb;">
          managers@vizxacademy.com
        </a>
      </p>

      <!-- Signature -->
      <div style="margin-top:40px;">
        <p style="margin-bottom:10px;">Sincerely,</p>
        <strong>The Vizx Academy Leadership Team</strong>

        <div style="margin-top:15px;">
          <img
            src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768328073/vizx_signature_card_bxyj1a.png"
            alt="Vizx Academy Signature"
            style="max-width:260px;height:auto;"
          />
        </div>
      </div>

    </div>
  `;

    return getBaseEmailTemplate(content, 'Welcome Manager – Vizx Academy');
};
