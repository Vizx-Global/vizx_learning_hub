import { config } from '../../config';
import { getBaseEmailTemplate } from './base.html';

export const getWelcomeEmailTemplate = (
    name: string,
    email: string
) => {
    const content = `
        <h1>Welcome to Vizx Academy</h1>
        <p>Dear ${name},</p>
        <p>We are excited to have you on board. Your account has been successfully verified and activated. You now have full access to our comprehensive learning resources and paths.</p>
        
        <p>You can sign in to your dashboard using the link below:</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="${config.app.clientUrl}/login" class="btn">Access Dashboard</a>
        </div>
        
        <p>At Vizx Academy, we are committed to providing you with the best learning experience. Explore our diverse modules, track your progress, and achieve your professional goals.</p>
    `;

    return getBaseEmailTemplate(content, 'Welcome to Vizx Academy');
};
