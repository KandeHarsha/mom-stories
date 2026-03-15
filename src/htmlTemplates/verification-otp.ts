interface OtpTemplateData {
  otp: string;
  expiryMinutes?: number;
}

export function getVerificationOtpTemplate({ otp, expiryMinutes = 10 }: OtpTemplateData) {
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
          <h2>Welcome to Mom Stories!</h2>
          <p>Thank you for signing up. Please verify your email address to get started.</p>
          <p>Use the following One-Time Password (OTP) to verify your email:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin-top: 10px; color: #666;">Enter this code to verify your email</p>
          </div>

          <p class="warning">⚠️ This OTP will expire in ${expiryMinutes} minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mom Stories. All rights reserved.</p>
            <p style="margin-top: 10px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to Mom Stories!
    
    Thank you for signing up. Please verify your email address to get started.
    
    Your One-Time Password (OTP) is: ${otp}
    
    This OTP will expire in ${expiryMinutes} minutes.
    
    If you didn't create this account, please ignore this email.
    
    © ${new Date().getFullYear()} Mom Stories. All rights reserved.
    This is an automated message, please do not reply to this email.
  `;

  return { html, text };
}
