import { Resend } from 'resend';
import { config } from '../config/index.js';

// TODO: Switch to noreply@[custom_domain] once custom domain is verified (currently using Resend sandbox sender)
const SANDBOX_SENDER = 'Golden Hour <onboarding@resend.dev>';

export interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({ to, name, resetLink }: PasswordResetEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = config.email.resendApiKey;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F4EE; margin: 0; padding: 24px; color: #1A2421; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #D9DFD6; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
          .logo-text { font-size: 20px; font-weight: 800; color: #11332D; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: rgba(28,92,83,0.1); color: #1C5C53; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 800; color: #11332D; margin-top: 0; margin-bottom: 12px; }
          p { font-size: 14px; line-height: 1.6; color: #5A6B66; margin-bottom: 20px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #FF5A4E; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(255,90,78,0.3); }
          .alt-link { font-size: 12px; color: #8A9B96; word-break: break-all; margin-top: 16px; }
          .footer { font-size: 12px; color: #8A9B96; margin-top: 32px; padding-top: 16px; border-top: 1px solid #D9DFD6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">Security & Authentication</div>
          <h1>Reset your Golden Hour password</h1>
          <p>Hello ${name || 'Rider'},</p>
          <p>We received a request to reset the password for your Golden Hour emergency response account. Click the button below to choose a new secure password:</p>
          <div class="btn-container">
            <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p>This password reset link is valid for <strong>60 minutes</strong>. If you did not request this change, you can safely ignore this email — your account remains completely secure.</p>
          <div class="alt-link">
            Or copy and paste this link in your browser:<br>
            <a href="${resetLink}" style="color: #1C5C53;">${resetLink}</a>
          </div>
          <div class="footer">
            Golden Hour — AI-Assisted Road Accident Emergency Response Platform<br>
            Emergency Trauma Network • Fast Incident Verification
          </div>
        </div>
      </body>
    </html>
  `;

  // If sandbox sender is active and test recipient override is configured, deliver to account email
  const overrideTo = config.email.testRecipientOverride;
  const isSandbox = SANDBOX_SENDER.includes('@resend.dev');
  const effectiveTo = (isSandbox && overrideTo) ? overrideTo : to;

  if (isSandbox && overrideTo && overrideTo !== to) {
    console.log(`[EmailService] Resend sandbox restriction active: routing email for ${to} to verified account email ${overrideTo}`);
  }

  if (!apiKey || apiKey.includes('PASTE YOUR')) {
    console.warn('[EmailService] RESEND_API_KEY is not configured or placeholder detected in environment. Simulated email details:');
    console.log(`To: ${effectiveTo} (intended: ${to})`);
    console.log(`Subject: Reset your Golden Hour password`);
    console.log(`Reset Link: ${resetLink}`);
    return { success: true, messageId: `mock-resend-${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: SANDBOX_SENDER,
      to: effectiveTo,
      subject: 'Reset your Golden Hour password',
      html: htmlContent
    });

    if (result.error) {
      console.error('[EmailService] Resend API error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[EmailService] Password reset email sent via Resend to ${effectiveTo}, ID: ${result.data?.id}`);
    return { success: true, messageId: result.data?.id };
  } catch (err: any) {
    console.error('[EmailService] Failed to send email via Resend:', err);
    return { success: false, error: err.message };
  }
}

export async function checkEmailStatus(messageId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = config.email.resendApiKey;
  if (!apiKey || apiKey.includes('PASTE YOUR')) {
    return { success: false, error: 'No valid Resend API key configured.' };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.get(messageId);
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

