interface DeleteAccountTemplateData {
  confirmUrl: string;
}

export function getDeleteAccountTemplate({ confirmUrl }: DeleteAccountTemplateData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .warning {
            background-color: #FEF2F2;
            border: 1px solid #FCA5A5;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 20px 0;
            color: #991B1B;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #DC2626;
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
          <h2>Delete Your Account</h2>
          <p>You requested to permanently delete your Mom Stories account.</p>
          <div class="warning">
            <strong>This action is permanent.</strong> Deleting your account will erase your profile, children's profiles, journal entries, memories, and all other data associated with your account. This cannot be undone.
          </div>
          <p>Click the button below to confirm deletion. You'll be asked to sign in first to verify it's really you:</p>
          <a href="${confirmUrl}" class="button">Confirm Account Deletion</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #DC2626;">${confirmUrl}</p>
          <p>If you didn't request this, you can safely ignore this email — your account will not be deleted.</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mom Stories. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Delete Your Account

    You requested to permanently delete your Mom Stories account.

    This action is permanent. Deleting your account will erase your profile, children's profiles, journal entries, memories, and all other data associated with your account. This cannot be undone.

    Click the link below to confirm deletion. You'll be asked to sign in first to verify it's really you:
    ${confirmUrl}

    If you didn't request this, you can safely ignore this email — your account will not be deleted.
    This link will expire in 24 hours for security reasons.

    © ${new Date().getFullYear()} Mom Stories. All rights reserved.
  `;

  return { html, text };
}
