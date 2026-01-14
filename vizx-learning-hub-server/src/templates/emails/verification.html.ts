import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getVerificationEmailTemplate = (
    name: string,
    code: string
) => {
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
        Verify Your Account 🔒
      </h1>

      <p>Dear <strong>${name}</strong>,</p>

      <p>
        To complete your account setup and gain secure access to
        <strong>Vizx Academy</strong>, please verify your email address using
        the code below.
      </p>

      <!-- Verification Code -->
      <div style="
        margin:30px auto;
        text-align:center;
        font-size:28px;
        font-weight:bold;
        letter-spacing:6px;
        color:#2563eb;
        background:#f9fafb;
        border:1px dashed #c7d2fe;
        padding:18px;
        border-radius:8px;
        width:fit-content;
      ">
        ${formattedCode}
      </div>

      <p style="text-align:center;font-size:14px;color:#6b7280;">
        This verification code will expire in <strong>15 minutes</strong>.
      </p>

      <!-- Instructions -->
      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:20px;
        margin:30px 0;
      ">
        <h3 style="margin-top:0;color:#111827;">How to Use This Code</h3>

        <ol style="padding-left:18px;">
          <li style="margin-bottom:8px;">
            Navigate to the verification page in your Vizx Academy account
          </li>
          <li style="margin-bottom:8px;">
            Enter the 6-digit verification code shown above
          </li>
          <li style="margin-bottom:8px;">
            Select <strong>“Verify Account”</strong> to complete the process
          </li>
        </ol>

        <!-- Security Warning -->
        <div style="
          margin-top:15px;
          padding:12px;
          background:#fff7ed;
          border-left:4px solid #f59e0b;
          font-size:14px;
        ">
          <strong>Security Notice:</strong>
          This verification code is confidential and must not be shared.
        </div>
      </div>

      <!-- Unrecognized Activity -->
      <div style="
        background:#fef2f2;
        border-left:4px solid #ef4444;
        padding:14px;
        font-size:14px;
        margin-bottom:30px;
      ">
        <strong>Did not initiate this request?</strong><br/>
        If you did not attempt to create an account with Vizx Academy,
        no action is required.
      </div>

      <!-- Closing -->
      <p style="margin-top:35px;margin-bottom:10px;">
        Kind regards,<br/>
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

    return getBaseEmailTemplate(content, 'Verify Your Account – Vizx Academy');
};
