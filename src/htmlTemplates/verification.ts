interface VerificationTemplateData {
  verificationUrl: string;
}

export function getVerificationTemplate({ verificationUrl }: VerificationTemplateData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to Mom Stories!</h2>
          <p>Thank you for signing up. Please verify your email address to get started.</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mom Stories. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to Mom Stories!
    
    Thank you for signing up. Please verify your email address to get started.
    
    Click the link below to verify your email:
    ${verificationUrl}
    
    If you didn't create this account, you can safely ignore this email.
    
    © ${new Date().getFullYear()} Mom Stories. All rights reserved.
  `;

  return { html, text };
}
