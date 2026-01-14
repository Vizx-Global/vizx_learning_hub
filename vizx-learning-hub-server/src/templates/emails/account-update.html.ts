import { getBaseEmailTemplate } from './base.html';

export const getAccountUpdateEmailTemplate = (
    name: string,
    updateType: string,
    details: string
) => {
    const getTitle = () => {
        switch (updateType) {
            case 'password_changed':
                return 'Password Updated Successfully';
            case 'profile_updated':
                return 'Profile Updated';
            case 'role_changed':
                return 'Account Role Updated';
            case 'status_changed':
                return 'Account Status Updated';
            default:
                return 'Account Update Notification';
        }
    };

    const getIcon = () => {
        switch (updateType) {
            case 'password_changed':
                return '🔐';
            case 'profile_updated':
                return '👤';
            case 'role_changed':
                return '🔄';
            case 'status_changed':
                return '📊';
            default:
                return '📧';
        }
    };

    const getImpactMessage = () => {
        switch (updateType) {
            case 'password_changed':
                return `
          <p>
            Your password has been successfully updated.
            If you did not authorize this change, please take immediate action to secure your account.
          </p>
        `;
            case 'profile_updated':
                return `
          <p>
            Your profile information has been updated.
            You can review your details anytime from your account settings.
          </p>
        `;
            case 'role_changed':
                return `
          <p>
            Your account role has been updated.
            This may affect the permissions and features available to you.
          </p>
        `;
            case 'status_changed':
                return `
          <p>
            Your account status has been updated.
            This may affect your access to the platform.
          </p>
        `;
            default:
                return `
          <p>
            An update has been made to your account.
            Please review the details above.
          </p>
        `;
        }
    };

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
        ${getTitle()} ${getIcon()}
      </h1>

      <p>Dear <strong>${name}</strong>,</p>

      <p>
        We’re writing to inform you of an important update to your
        <strong>Vizx Academy</strong> account.
      </p>

      <!-- Update Details -->
      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:20px;
        margin:25px 0;
      ">
        <h3 style="margin-top:0;color:#111827;">Update Details</h3>

        <div style="
          background:#ffffff;
          border-left:4px solid #2563eb;
          padding:14px;
          font-size:14px;
          margin-bottom:20px;
        ">
          ${details}
        </div>

        <h4 style="margin-bottom:8px;">What This Means for You</h4>
        ${getImpactMessage()}
      </div>

      <!-- Security Reminder -->
      <div style="
        background:#fff7ed;
        border-left:4px solid #f59e0b;
        padding:14px;
        font-size:14px;
        margin-bottom:30px;
      ">
        <strong>Security Reminder:</strong><br/>
        If you do not recognize this change, please take immediate steps
        to protect your account.
      </div>

      <p>
        Thank you for being part of Vizx Academy. We remain committed to
        keeping your account secure and transparent.
      </p>

      <!-- Closing -->
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

    return getBaseEmailTemplate(content, getTitle());
};
