interface OtpTemplateData {
  otp: string;
  expiryMinutes?: number;
}

export function getPasswordResetOtpTemplate({ otp, expiryMinutes = 10 }: OtpTemplateData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-box { 
            background-color: #f3f4f6;
            border: 2px dashed #4F46E5;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
          .warning { color: #dc2626; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password for your Mom Stories account.</p>
          <p>Use the following One-Time Password (OTP) to reset your password:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin-top: 10px; color: #666;">Enter this code to reset your password</p>
          </div>

          <p class="warning">⚠️ This OTP will expire in ${expiryMinutes} minutes.</p>
          <p>If you didn't request this password reset, please ignore this email and ensure your account is secure.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mom Stories. All rights reserved.</p>
            <p style="margin-top: 10px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password - Mom Stories
    
    You requested to reset your password for your Mom Stories account.
    
    Your One-Time Password (OTP) is: ${otp}
    
    This OTP will expire in ${expiryMinutes} minutes.
    
    If you didn't request this password reset, please ignore this email and ensure your account is secure.
    
    © ${new Date().getFullYear()} Mom Stories. All rights reserved.
    This is an automated message, please do not reply to this email.
  `;

  return { html, text };
}
