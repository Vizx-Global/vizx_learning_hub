import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getWelcomeEmailTemplate = (
    name: string,
    email: string,
    password: string
) => {
    const loginUrl = `${config.app.clientUrl}/login`;

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
        Welcome to Vizx Academy 👋
      </h1>

      <p>Dear <strong>${name}</strong>,</p>

      <p>
        We’re pleased to welcome you to <strong>Vizx Academy</strong>.
        Your account has been created successfully. Please find your
        login details below.
      </p>

      <!-- Credentials -->
      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:20px;
        margin:25px 0;
      ">
        <h3 style="margin-top:0;color:#111827;">Account Credentials</h3>

        <p style="margin:8px 0;">
          <strong>Email Address:</strong> ${email}
        </p>

        <p style="margin:8px 0;">
          <strong>Temporary Password:</strong> ${password}
        </p>

        <!-- Security Notice -->
        <div style="
          margin-top:15px;
          padding:12px;
          background:#fff7ed;
          border-left:4px solid #f59e0b;
          font-size:14px;
        ">
          <strong>Security Notice:</strong>
          Please change your password immediately after your first login
          to keep your account secure.
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:30px 0;">
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
          Access Your Account
        </a>
      </div>

      <!-- Fallback -->
      <p style="font-size:13px;color:#6b7280;">
        If the button above does not work, copy and paste the following link
        into your browser:<br/>
        <span style="word-break:break-all;">${loginUrl}</span>
      </p>

      <!-- Closing -->
      <p>
        We look forward to supporting your learning journey at Vizx Academy.
      </p>

      <p style="margin-top:35px;margin-bottom:10px;">
        Best regards,<br/>
        <strong>The Vizx Academy Team</strong>
      </p>

      <!-- Signature (LAST SECTION) -->
      <div style="margin-top:15px;">
        <img
          src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768328073/vizx_signature_card_bxyj1a.png"
          alt="Vizx Academy Signature"
          style="max-width:260px;height:auto;"
        />
      </div>

    </div>
  `;

    return getBaseEmailTemplate(content, 'Welcome to Vizx Academy');
};
