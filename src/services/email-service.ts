import nodemailer from 'nodemailer';
import { getPasswordResetTemplate } from '../htmlTemplates/password-reset';
import { getVerificationTemplate } from '../htmlTemplates/verification';
import { getPasswordResetOtpTemplate } from '../htmlTemplates/password-reset-otp';
import { getVerificationOtpTemplate } from '../htmlTemplates/verification-otp';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = 'Reset Your Password - Mom Stories';
  const { html, text } = getPasswordResetTemplate({ resetUrl });
  return sendEmail({ to: email, subject, html, text });
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const subject = 'Verify Your Email - Mom Stories';
  const { html, text } = getVerificationTemplate({ verificationUrl });
  return sendEmail({ to: email, subject, html, text });
}

// OTP-based email functions
export async function sendPasswordResetOTP(email: string, otp: string, expiryMinutes: number = 10) {
  const subject = 'Reset Your Password - OTP Code';
  const { html, text } = getPasswordResetOtpTemplate({ otp, expiryMinutes });
  return sendEmail({ to: email, subject, html, text });
}

export async function sendVerificationOTP(email: string, otp: string, expiryMinutes: number = 10) {
  const subject = 'Verify Your Email - OTP Code';
  const { html, text } = getVerificationOtpTemplate({ otp, expiryMinutes });
  return sendEmail({ to: email, subject, html, text });
}
