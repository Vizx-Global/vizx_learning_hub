import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getPasswordResetEmailTemplate = (
    name: string,
    resetToken: string
) => {
    const resetUrl = `${config.app.clientUrl}/reset-password?token=${resetToken}`;

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
      <h1 style="text-align:center;color:#111827;">Reset Your Password 🔑</h1>

      <p>Dear <strong>${name}</strong>,</p>

      <p>
        We received a request to reset the password for your
        <strong>Vizx Academy</strong> account.
        Click the button below to securely create a new password.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:35px 0;">
        <a
          href="${resetUrl}"
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
          Reset Password
        </a>
      </div>

      <!-- Expiry Notice -->
      <p style="text-align:center;font-size:14px;color:#6b7280;">
        This password reset link will expire in <strong>1 hour</strong>.
      </p>

      <!-- Security Tips -->
      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:20px;
        margin:30px 0;
      ">
        <h3 style="margin-top:0;color:#111827;">Security Tips</h3>
        <ul style="padding-left:18px;">
          <li>Create a strong password with at least 8 characters</li>
          <li>Use a combination of uppercase letters, numbers, and symbols</li>
          <li>Avoid using personal or easily guessable information</li>
          <li>Never share your password with anyone</li>
        </ul>
      </div>

      <!-- Warning -->
      <div style="
        background:#fff7ed;
        border-left:4px solid #f59e0b;
        padding:14px;
        font-size:14px;
        margin-bottom:25px;
      ">
        <strong>Didn’t request this?</strong><br/>
        If you did not initiate this password reset, please ignore this email.
        Your account remains secure.
      </div>

      <!-- Fallback Link -->
      <p style="font-size:13px;color:#6b7280;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <span style="word-break:break-all;">${resetUrl}</span>
      </p>

      <!-- Closing -->
      <p style="margin-top:35px;margin-bottom:10px;">
        Regards,<br/>
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

    return getBaseEmailTemplate(content, 'Reset Your Password – Vizx Academy');
};
