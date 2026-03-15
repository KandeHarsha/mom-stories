interface PasswordResetTemplateData {
  resetUrl: string;
}

export function getPasswordResetTemplate({ resetUrl }: PasswordResetTemplateData) {
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
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password for your Mom Stories account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mom Stories. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password
    
    You requested to reset your password for your Mom Stories account.
    
    Click the link below to reset your password:
    ${resetUrl}
    
    If you didn't request this password reset, you can safely ignore this email.
    This link will expire in 1 hour for security reasons.
    
    © ${new Date().getFullYear()} Mom Stories. All rights reserved.
  `;

  return { html, text };
}
