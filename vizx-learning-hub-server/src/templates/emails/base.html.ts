export const getBaseEmailTemplate = (content: string, title?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Vizx Academy'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #111827;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }

        .wrapper {
            width: 100%;
            background-color: #f9fafb;
            padding: 40px 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .header {
            background-color: #ffffff;
            padding: 32px;
            text-align: center;
            border-bottom: 1px solid #f3f4f6;
        }

        .logo {
            max-width: 160px;
            height: auto;
        }

        .content {
            padding: 40px;
            background-color: #ffffff;
        }

        .footer {
            padding: 32px;
            background-color: #f9fafb;
            text-align: center;
            border-top: 1px solid #f3f4f6;
        }

        .brand-logo-small {
            max-width: 100px;
            margin-bottom: 16px;
        }

        .signature {
            margin-top: 32px;
            text-align: left;
            border-top: 1px solid #f3f4f6;
            padding-top: 24px;
        }

        .signature-img {
            max-width: 200px;
            height: auto;
        }

        h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 24px;
        }

        p {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #E57437;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background-color: #d15f2a;
        }

        .text-muted {
            font-size: 14px;
            color: #6b7280;
        }

        .social-links {
            margin: 16px 0;
        }

        .social-link {
            margin: 0 8px;
            color: #E57437;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" alt="Vizx Academy" class="logo">
            </div>
            
            <div class="content">
                ${content}
                
                <div class="signature">
                    <p style="margin-bottom: 8px; font-weight: 600;">Best Regards,</p>
                    <p style="margin-bottom: 16px;">The Vizx Academy Team</p>
                    <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768328073/vizx_signature_card_bxyj1a.png" alt="Vizx Academy Signature" class="signature-img">
                </div>
            </div>
            
            <div class="footer">
                <p class="text-muted" style="margin-bottom: 8px;">
                    &copy; ${new Date().getFullYear()} Vizx Global. All rights reserved.
                </p>
                <p class="text-muted">
                    Vizx Academy &bull; Knowledge for the Future
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;
;