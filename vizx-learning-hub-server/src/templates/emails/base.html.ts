export const getBaseEmailTemplate = (content: string, title?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Vizx Academy'}</title>
    <style>
        /* Import Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        /* Base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Poppins', sans-serif;
            line-height: 1.6;
            color: #000000;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        .header {
            background: linear-gradient(135deg, #f97316, #fb923c);
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
        }

        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }

        .logo {
            max-width: 120px;
            height: auto;
        }

        .logo-text {
            font-family: 'Poppins', sans-serif;
            font-size: 28px;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }

        .card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
        }

        .card:hover {
            border-color: #f97316;
            box-shadow: 0 10px 25px rgba(249, 115, 22, 0.1);
        }

        .btn-primary {
            display: inline-block;
            background-color: #f97316;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            text-align: center;
        }

        .btn-primary:hover {
            background-color: #ea580c;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2);
        }

        .footer {
            background-color: #111827;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 0 0 12px 12px;
            margin-top: 30px;
        }

        .footer a {
            color: #fb923c;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }

        .social-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(251, 146, 60, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fb923c;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-icon:hover {
            background-color: #fb923c;
            color: white;
            transform: scale(1.1);
        }

        h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
        }

        h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 15px;
        }

        h3 {
            font-family: 'Inter', sans-serif;
            font-size: 20px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
        }

        p {
            margin-bottom: 16px;
            color: #4b5563;
        }

        .highlight {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 8px;
        }

        .verification-code {
            display: inline-block;
            background: linear-gradient(135deg, #f97316, #fb923c);
            color: white;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            padding: 25px 40px;
            border-radius: 12px;
            margin: 30px 0;
            text-align: center;
            font-family: 'Inter', monospace;
            box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2);
        }

        .credentials-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }

        .credential-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .credential-item:last-child {
            border-bottom: none;
        }

        .credential-label {
            font-weight: 600;
            color: #374151;
        }

        .credential-value {
            font-family: 'Inter', monospace;
            font-weight: 500;
            color: #111827;
            background-color: #ffffff;
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
        }

        .warning {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .warning::before {
            content: "⚠️";
            font-size: 20px;
        }

        .info {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1d4ed8;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .info::before {
            content: "ℹ️";
            font-size: 20px;
        }

        .text-center {
            text-align: center;
        }

        .text-muted {
            color: #6b7280;
            font-size: 14px;
        }

        .expiry-note {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-top: 10px;
        }

        /* Responsive styles */
        @media (max-width: 640px) {
            .content {
                padding: 20px 15px;
            }
            
            .card {
                padding: 20px;
            }
            
            h1 {
                font-size: 24px;
            }
            
            h2 {
                font-size: 20px;
            }
            
            .verification-code {
                font-size: 24px;
                letter-spacing: 4px;
                padding: 20px;
            }
            
            .btn-primary {
                padding: 12px 24px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" 
                     alt="Vizx Academy Logo" class="logo">
                <div class="logo-text">Vizx Academy</div>
            </div>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <h3>Need Help?</h3>
            <p>Our support team is here to help you</p>
            <p><a href="mailto:support@vizxacademy.com">support@vizxacademy.com</a></p>
            
            <div class="social-links">
                <a href="#" class="social-icon">F</a>
                <a href="#" class="social-icon">T</a>
                <a href="#" class="social-icon">L</a>
                <a href="#" class="social-icon">I</a>
            </div>
            
            <p class="text-muted">
                © ${new Date().getFullYear()} Vizx Academy. All rights reserved.<br>
                <small>This is an automated email. Please do not reply to this message.</small>
            </p>
        </div>
    </div>
</body>
</html>
`;