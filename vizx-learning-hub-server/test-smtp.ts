import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testConnection() {
    console.log('Testing SMTP connection with EXPLICIT host settings:');
    console.log(`Host: smtp.office365.com`);
    console.log(`Port: 587`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Auth Type: ${process.env.SMTP_AUTH_TYPE}`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: process.env.SMTP_AUTH_TYPE === 'OAuth2' ? {
            type: 'OAuth2',
            user: process.env.SMTP_USER,
            clientId: process.env.SMTP_CLIENT_ID,
            clientSecret: process.env.SMTP_CLIENT_SECRET,
            refreshToken: process.env.SMTP_REFRESH_TOKEN,
        } : {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        requireTLS: true,
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        },
        debug: true,
        logger: true,
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        console.log('Sending test email...');
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, 
            subject: 'SMTP OAuth2 Test Connection',
            text: 'This is a test email to verify SMTP OAuth2 settings.',
            html: '<b>This is a test email to verify SMTP OAuth2 settings.</b>'
        });
        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ SMTP Test Failed:');
        console.error(error);
    }
}

testConnection();
