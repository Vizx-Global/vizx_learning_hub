import { getBaseEmailTemplate } from './base.html';

export const getAccountUpdateEmailTemplate = (name: string, updateType: string, details: string) => {
    const getTitle = () => {
        switch (updateType) {
            case 'password_changed': return 'Password Updated Successfully';
            case 'profile_updated': return 'Profile Updated';
            case 'role_changed': return 'Account Role Updated';
            case 'status_changed': return 'Account Status Updated';
            default: return 'Account Update Notification';
        }
    };

    const getIcon = () => {
        switch (updateType) {
            case 'password_changed': return '🔐';
            case 'profile_updated': return '👤';
            case 'role_changed': return '🔄';
            case 'status_changed': return '📊';
            default: return '📧';
        }
    };

    const content = `
        <div class="text-center">
            <h1>${getTitle()} ${getIcon()}</h1>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We're writing to inform you about an important update to your Vizx Academy account.</p>
            
            <div class="card">
                <h2>Update Details</h2>
                <div class="highlight">
                    ${details}
                </div>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
                    <h3>What This Means For You</h3>
                    ${updateType === 'password_changed' ? 
                        '<p>Your password has been successfully updated. If you did not make this change, please contact our support team immediately.</p>' : 
                      updateType === 'profile_updated' ?
                        '<p>Your profile information has been updated. You can review your profile at any time in your account settings.</p>' :
                      updateType === 'role_changed' ?
                        '<p>Your account role has been updated. This may affect the features and permissions available to you.</p>' :
                        '<p>Your account status has been updated. This may affect your access to the platform.</p>'
                    }
                </div>
            </div>
            
            <div class="warning">
                <strong>Security Reminder:</strong><br>
                If you did not authorize this change or notice any suspicious activity, please contact our support team immediately at <a href="mailto:security@vizxacademy.com">security@vizxacademy.com</a>
            </div>
            
            <p>Thank you for being part of Vizx Academy. We're committed to keeping your account secure and up-to-date.</p>
            
            <p>Best regards,<br>
            <strong>The Vizx Academy Team</strong></p>
        </div>
    `;
    
    return getBaseEmailTemplate(content, getTitle());
};