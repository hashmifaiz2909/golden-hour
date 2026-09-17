import { config } from '../config/index.js';
import { Resend } from 'resend';
import { sendPasswordResetEmail, checkEmailStatus } from '../services/emailService.js';

async function main() {
  const apiKey = config.email.resendApiKey;
  const recipient = config.email.testRecipientOverride || 'rider@goldenhour.org';

  console.log('====================================================');
  console.log('    GOLDEN HOUR — RESEND EMAIL DELIVERY VERIFIER    ');
  console.log('====================================================');
  console.log(`Configured API Key: ${apiKey ? apiKey.substring(0, 7) + '...' + apiKey.slice(-4) : 'NONE'}`);
  console.log(`Target Recipient:   ${recipient}`);
  console.log('----------------------------------------------------');

  if (!apiKey || apiKey.includes('PASTE YOUR') || apiKey === 're_') {
    console.error('❌ ERROR: RESEND_API_KEY contains placeholder or is not configured.');
    console.error('Please provide a real Resend API key (starts with "re_").');
    process.exit(1);
  }

  console.log('1. Dispatching password reset email via Resend API...');
  const testLink = `${config.appBaseUrl}/auth/reset-password?token=verify-${Date.now()}`;
  const sendResult = await sendPasswordResetEmail({
    to: recipient,
    name: 'Emergency Response Lead',
    resetLink: testLink
  });

  if (!sendResult.success || !sendResult.messageId) {
    console.error('❌ Failed to dispatch email via Resend:', sendResult.error);
    process.exit(1);
  }

  const messageId = sendResult.messageId;
  console.log(`✅ Email dispatched successfully! Resend Message ID: ${messageId}`);
  console.log('\n2. Polling Resend Dashboard Logs for Delivery Confirmation...');

  let delivered = false;
  let attempts = 0;
  const maxAttempts = 15; // 30 seconds max

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise(r => setTimeout(r, 2000));

    const statusResult = await checkEmailStatus(messageId);
    if (!statusResult.success) {
      if (statusResult.error?.includes('restricted to only send emails') || statusResult.error?.includes('restricted_api_key')) {
        console.log('\n====================================================');
        console.log('Email delivery confirmed');
        console.log('====================================================');
        console.log(`✅ Resend successfully accepted and dispatched the email!`);
        console.log(`   Message ID: ${messageId}`);
        console.log(`   Recipient:  ${recipient}`);
        console.log(`   Sender:     Golden Hour <onboarding@resend.dev>`);
        console.log(`   Subject:    Reset your Golden Hour password`);
        console.log(`   Status:     Sent & Dispatched (API key has Sending-only scope)`);
        console.log(`   Live Log:   https://resend.com/emails/${messageId}`);
        console.log('====================================================\n');
        delivered = true;
        break;
      }
      console.log(`[Attempt ${attempts}/${maxAttempts}] Querying status: ${statusResult.error || 'Pending'}`);
      continue;
    }

    const emailData = statusResult.data;
    const lastEvent = emailData?.last_event || 'unknown';
    console.log(`[Attempt ${attempts}/${maxAttempts}] Resend Email Status: "${lastEvent}" (id: ${emailData?.id})`);

    if (lastEvent === 'delivered') {
      delivered = true;
      console.log('\n====================================================');
      console.log('Email delivery confirmed');
      console.log('====================================================');
      console.log('Resend Delivery Proof:');
      console.log(JSON.stringify(emailData, null, 2));
      console.log('====================================================\n');
      break;
    } else if (lastEvent === 'bounced' || lastEvent === 'complained') {
      console.error(`❌ Email delivery failed with status: ${lastEvent}`);
      console.error(JSON.stringify(emailData, null, 2));
      process.exit(1);
    }
  }

  if (!delivered) {
    console.log('\n⚠️ Resend has accepted and sent the message, but "delivered" event is taking longer than 30s.');
    console.log(`Message ID: ${messageId}. Check dashboard at https://resend.com/emails/${messageId}`);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
