import twilio from 'twilio';
import { config } from '../config/index.js';
import { db, Alert, EmergencyContact } from '../models/store.js';

export interface SendEmergencyNotificationParams {
  alert: Alert;
  contacts: EmergencyContact[];
}

function formatE164(phone: string): string {
  const cleaned = (phone || '').replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.startsWith('0') && cleaned.length === 11) return `+91${cleaned.slice(1)}`;
  return `+${cleaned}`;
}

function formatWhatsAppNumber(phone: string): string {
  const e164 = formatE164(phone);
  return e164.startsWith('whatsapp:') ? e164 : `whatsapp:${e164}`;
}

export class NotificationService {
  private getTwilioClient(): twilio.Twilio | null {
    if (!config.twilio.accountSid || !config.twilio.authToken) return null;
    return twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  /**
   * Dispatches emergency Call, WhatsApp, SMS & Email alerts to registered emergency contacts
   */
  async dispatchEmergencyAlerts(params: SendEmergencyNotificationParams): Promise<void> {
    const { alert, contacts } = params;

    if (!contacts || contacts.length === 0) {
      console.warn(`[NotificationService] No emergency contacts found for alert ${alert.id}`);
      return;
    }

    const mapLink = (alert.latitude && alert.longitude) 
      ? `https://maps.google.com/?q=${alert.latitude},${alert.longitude}`
      : 'Location unavailable';

    const messageBody = `[GOLDEN HOUR EMERGENCY ALERT]\n` +
      `Possible road accident detected for ${alert.riderName}.\n` +
      `Time: ${new Date(alert.timestamp).toLocaleTimeString()}\n` +
      `Location: ${alert.locationName || mapLink}\n` +
      `Map: ${mapLink}\n` +
      `Medical Tag: ${alert.tagId}\n` +
      `Emergency medical response has been notified.`;

    // 1. Keep SMS explicitly mocked (per Indian DLT regulations)
    for (const contact of contacts) {
      this.sendMockSms(contact, messageBody, alert.id);
    }

    // 2. Identify primary emergency contact for outbound Voice Call & WhatsApp
    const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

    // 3. Dispatch Real Outbound Voice Call via Twilio
    if (config.twilio.enabled) {
      await this.placeTwilioVoiceCall(primaryContact, alert);
    } else {
      this.sendMockVoiceCall(
        primaryContact,
        `This is an automated emergency alert from Golden Hour. ${alert.riderName} may have been involved in an accident. Please check on them immediately.`,
        alert.id
      );
    }

    // 4. Dispatch Real WhatsApp Message via Twilio
    if (config.twilio.enabled) {
      await this.sendTwilioWhatsApp(primaryContact, alert, mapLink);
    } else {
      this.sendMockWhatsApp(
        primaryContact,
        `🚨 *[GOLDEN HOUR EMERGENCY ALERT]* 🚨\nPossible road accident detected for *${alert.riderName}*.\n📍 Location: ${mapLink}`,
        alert.id
      );
    }

    // 5. Dispatch Emergency Email Alerts (Resend / SendGrid / Simulated)
    await this.dispatchEmergencyEmailAlerts(alert, contacts, mapLink);
  }

  /**
   * Outbound automated voice call via Twilio Voice TwiML
   */
  private async placeTwilioVoiceCall(contact: EmergencyContact, alert: Alert): Promise<void> {
    if (!contact.phone) {
      console.warn(`[NotificationService] Cannot place voice call: Contact ${contact.name} has no phone number.`);
      return;
    }

    const toPhone = formatE164(contact.phone);
    const fromPhone = formatE164(config.twilio.fromPhone);
    const speechMessage = `This is an automated emergency alert from Golden Hour. ${alert.riderName} may have been involved in an accident. Please check on them immediately.`;

    console.log(`\n========================================================`);
    console.log(`📞 [TWILIO VOICE OUTBOUND CALL INITIATING]`);
    console.log(`   To:    ${contact.name} (${toPhone})`);
    console.log(`   From:  ${fromPhone}`);
    console.log(`   TwiML: "${speechMessage}"`);
    console.log(`========================================================\n`);

    const client = this.getTwilioClient();
    if (!client || !fromPhone) {
      console.warn('[NotificationService] Twilio client or TWILIO_FROM_PHONE not configured. Falling back to mock call.');
      this.sendMockVoiceCall(contact, speechMessage, alert.id);
      return;
    }

    try {
      const twimletUrl = `https://twimlets.com/message?Message%5B0%5D=${encodeURIComponent(speechMessage)}`;

      const call = await client.calls.create({
        url: twimletUrl,
        to: toPhone,
        from: fromPhone
      });

      console.log(`✅ [Twilio Voice Call Placed Successfully]`);
      console.log(`   Call SID:   ${call.sid}`);
      console.log(`   Status:     ${call.status}`);
      console.log(`   Direction:  ${call.direction}`);

      db.addNotification({
        alertId: alert.id,
        recipientName: contact.name,
        recipientPhone: toPhone,
        type: 'call',
        status: 'sent',
        message: speechMessage,
        provider: 'twilio',
        providerMessageId: call.sid
      });
    } catch (err: any) {
      const errorCode = err.code || err.status || 'UNKNOWN';
      const errorMessage = err.message || 'Unknown Twilio Voice error';
      const moreInfo = err.moreInfo ? ` (${err.moreInfo})` : '';

      console.error(`❌ [NotificationService] Twilio Voice Call Failed [Code ${errorCode}]: ${errorMessage}${moreInfo}`);

      db.addNotification({
        alertId: alert.id,
        recipientName: contact.name,
        recipientPhone: toPhone,
        type: 'call',
        status: 'failed',
        message: speechMessage,
        provider: 'twilio',
        error: `[Twilio Code ${errorCode}] ${errorMessage}`
      });
    }
  }

  /**
   * Outbound WhatsApp message via Twilio Messaging
   */
  private async sendTwilioWhatsApp(contact: EmergencyContact, alert: Alert, mapLink: string): Promise<void> {
    if (!contact.phone) {
      console.warn(`[NotificationService] Cannot send WhatsApp: Contact ${contact.name} has no phone number.`);
      return;
    }

    const toWhatsApp = formatWhatsAppNumber(contact.phone);
    const rawFrom = config.twilio.whatsappFrom || 'whatsapp:+14155238886';
    const fromWhatsApp = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;

    const whatsappBody = `🚨 *[GOLDEN HOUR EMERGENCY ALERT]* 🚨\n\n` +
      `Possible road accident detected for *${alert.riderName}*.\n` +
      `⏱ *Time:* ${new Date(alert.timestamp).toLocaleTimeString()}\n` +
      `📍 *Live Location:* ${mapLink}\n` +
      `🆔 *Emergency Tag ID:* ${alert.tagId}\n\n` +
      `⚠️ *Note:* This is an automated safety alert from Golden Hour emergency response platform. Please check on ${alert.riderName} immediately.`;

    console.log(`\n========================================================`);
    console.log(`📱 [TWILIO WHATSAPP MESSAGE DISPATCHING]`);
    console.log(`   To:    ${contact.name} (${toWhatsApp})`);
    console.log(`   From:  ${fromWhatsApp}`);
    console.log(`   Content Preview: ${whatsappBody.slice(0, 80)}...`);
    console.log(`========================================================\n`);

    const client = this.getTwilioClient();
    if (!client) {
      console.warn('[NotificationService] Twilio client not configured. Falling back to mock WhatsApp.');
      this.sendMockWhatsApp(contact, whatsappBody, alert.id);
      return;
    }

    try {
      const messageParams: any = {
        to: toWhatsApp,
        from: fromWhatsApp
      };

      if (config.twilio.contentSid) {
        messageParams.contentSid = config.twilio.contentSid;
        messageParams.contentVariables = JSON.stringify({
          1: alert.riderName,
          2: alert.locationName || mapLink,
          3: mapLink
        });
      } else {
        messageParams.body = whatsappBody;
      }

      const message = await client.messages.create(messageParams);

      console.log(`✅ [Twilio WhatsApp Sent Successfully]`);
      console.log(`   Message SID: ${message.sid}`);
      console.log(`   Status:      ${message.status}`);

      db.addNotification({
        alertId: alert.id,
        recipientName: contact.name,
        recipientPhone: toWhatsApp,
        type: 'whatsapp',
        status: 'sent',
        message: whatsappBody,
        provider: 'twilio',
        providerMessageId: message.sid
      });
    } catch (err: any) {
      const errorCode = err.code || err.status || 'UNKNOWN';
      const errorMessage = err.message || 'Unknown Twilio WhatsApp error';
      const moreInfo = err.moreInfo ? ` (${err.moreInfo})` : '';

      console.error(`❌ [NotificationService] Twilio WhatsApp Failed [Code ${errorCode}]: ${errorMessage}${moreInfo}`);

      db.addNotification({
        alertId: alert.id,
        recipientName: contact.name,
        recipientPhone: toWhatsApp,
        type: 'whatsapp',
        status: 'failed',
        message: whatsappBody,
        provider: 'twilio',
        error: `[Twilio Code ${errorCode}] ${errorMessage}`
      });
    }
  }

  private sendMockVoiceCall(contact: EmergencyContact, speechMessage: string, alertId: string): void {
    console.log(`\n========================================`);
    console.log(`📞 [SIMULATED VOICE CALL DISPATCH]`);
    console.log(`To: ${contact.name} (${contact.phone})`);
    console.log(`Message: "${speechMessage}"`);
    console.log(`========================================\n`);

    db.addNotification({
      alertId,
      recipientName: contact.name,
      recipientPhone: contact.phone,
      type: 'call',
      status: 'simulated_delivered',
      message: speechMessage,
      provider: 'mock'
    });
  }

  private sendMockWhatsApp(contact: EmergencyContact, message: string, alertId: string): void {
    console.log(`\n========================================`);
    console.log(`📱 [SIMULATED WHATSAPP DISPATCH]`);
    console.log(`To: ${contact.name} (${contact.phone})`);
    console.log(`Content:\n${message}`);
    console.log(`========================================\n`);

    db.addNotification({
      alertId,
      recipientName: contact.name,
      recipientPhone: contact.phone,
      type: 'whatsapp',
      status: 'simulated_delivered',
      message,
      provider: 'mock'
    });
  }

  private sendMockSms(contact: EmergencyContact, message: string, alertId: string): void {
    console.log(`\n========================================`);
    console.log(`📢 [SIMULATED SMS DISPATCH] To: ${contact.name} (${contact.phone})`);
    console.log(`Content:\n${message}`);
    console.log(`========================================\n`);

    db.addNotification({
      alertId,
      recipientName: contact.name,
      recipientPhone: contact.phone,
      type: 'sms',
      status: 'simulated_delivered',
      message,
      provider: 'mock'
    });
  }

  /**
   * Dispatches Emergency Email Alerts via Resend or SendGrid API
   */
  private async dispatchEmergencyEmailAlerts(alert: Alert, contacts: EmergencyContact[], mapLink: string): Promise<void> {
    const subject = `🚨 URGENT: Golden Hours Emergency Alert - ${alert.riderName} (${alert.tagId})`;
    
    const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];
    const bloodGroup = alert.medicalSummary?.bloodGroup || 'O+';
    const allergies = alert.medicalSummary?.allergies?.join(', ') || 'None reported';
    const conditions = alert.medicalSummary?.medicalConditions?.join(', ') || 'None reported';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f4ee; padding: 24px; color: #1a2421;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #d9dfd6; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <div style="background-color: #ff5a4e; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">CRITICAL EMERGENCY ALERT DETECTED</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.95;">Golden Hours Immediate Medical Notification System</p>
          </div>

          <div style="padding: 24px;">
            <p style="font-size: 15px; line-height: 1.5; margin-top: 0;">
              An urgent crash or distress event has been registered for <strong>${alert.riderName}</strong>. First responders and family contacts are being notified immediately.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
              <tr style="background: #f8faf7; border-bottom: 1px solid #e5eae2;">
                <td style="padding: 10px; font-weight: bold; width: 35%;">Patient Name:</td>
                <td style="padding: 10px;">${alert.riderName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5eae2;">
                <td style="padding: 10px; font-weight: bold;">Emergency Tag ID:</td>
                <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #1c5c53;">${alert.tagId}</td>
              </tr>
              <tr style="background: #f8faf7; border-bottom: 1px solid #e5eae2;">
                <td style="padding: 10px; font-weight: bold;">Blood Group:</td>
                <td style="padding: 10px; font-weight: bold; color: #ff5a4e;">${bloodGroup}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5eae2;">
                <td style="padding: 10px; font-weight: bold;">Known Allergies:</td>
                <td style="padding: 10px; color: #dc2626;">${allergies}</td>
              </tr>
              <tr style="background: #f8faf7; border-bottom: 1px solid #e5eae2;">
                <td style="padding: 10px; font-weight: bold;">Medical Conditions:</td>
                <td style="padding: 10px;">${conditions}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5eae2;">
                <td style="padding: 10px; font-weight: bold;">Location:</td>
                <td style="padding: 10px;">${alert.locationName || 'GPS Location Captured'}</td>
              </tr>
              <tr style="background: #f8faf7;">
                <td style="padding: 10px; font-weight: bold;">Primary ICE Contact:</td>
                <td style="padding: 10px;">${primaryContact.name} (${primaryContact.phone})</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 24px 0 16px;">
              <a href="${mapLink}" style="background-color: #11332d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 13px; display: inline-block;">
                📍 Open Incident GPS in Google Maps
              </a>
            </div>

            <div style="text-align: center; margin-bottom: 12px;">
              <a href="https://goldenhours.org/id/${alert.tagId}" style="color: #1c5c53; font-size: 12px; font-weight: bold; text-decoration: underline;">
                View Complete First Responder Medical Dossier
              </a>
            </div>
          </div>

          <div style="background-color: #f8faf7; padding: 14px; text-align: center; font-size: 11px; color: #5a6b66; border-top: 1px solid #d9dfd6;">
            Dispatched via Golden Hours Automated Life-Safety Protocol &bull; National Emergency Dial: 112
          </div>
        </div>
      </body>
      </html>
    `;

    const recipientEmails = [
      config.email.emergencyDeskEmail
    ];

    for (const recipient of recipientEmails) {
      if (config.email.resendApiKey) {
        await this.sendResendEmail(recipient, subject, htmlBody, alert.id);
      } else if (config.email.sendgridApiKey) {
        await this.sendSendGridEmail(recipient, subject, htmlBody, alert.id);
      } else {
        this.sendMockEmail(recipient, subject, alert.id);
      }
    }
  }

  private async sendResendEmail(toEmail: string, subject: string, html: string, alertId: string): Promise<void> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.email.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: config.email.fromEmail,
          to: toEmail,
          subject,
          html
        })
      });

      const json: any = await res.json();
      if (res.ok) {
        console.log(`[NotificationService] Resend Email sent successfully to ${toEmail} (ID: ${json.id})`);
        db.addNotification({
          alertId,
          recipientName: 'Emergency Desk',
          recipientPhone: toEmail,
          type: 'email',
          status: 'sent',
          message: subject,
          provider: 'resend',
          providerMessageId: json.id
        });
      } else {
        console.warn(`[NotificationService] Resend Email failed:`, json);
        db.addNotification({
          alertId,
          recipientName: 'Emergency Desk',
          recipientPhone: toEmail,
          type: 'email',
          status: 'failed',
          message: subject,
          provider: 'resend',
          error: json.message || 'Resend API Error'
        });
      }
    } catch (err: any) {
      console.error('[NotificationService] Resend exception:', err);
    }
  }

  private async sendSendGridEmail(toEmail: string, subject: string, html: string, alertId: string): Promise<void> {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.email.sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: config.email.fromEmail },
          subject,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (res.ok) {
        console.log(`[NotificationService] SendGrid Email sent successfully to ${toEmail}`);
        db.addNotification({
          alertId,
          recipientName: 'Emergency Desk',
          recipientPhone: toEmail,
          type: 'email',
          status: 'sent',
          message: subject,
          provider: 'sendgrid'
        });
      } else {
        const errorText = await res.text();
        console.warn(`[NotificationService] SendGrid Email failed:`, errorText);
        db.addNotification({
          alertId,
          recipientName: 'Emergency Desk',
          recipientPhone: toEmail,
          type: 'email',
          status: 'failed',
          message: subject,
          provider: 'sendgrid',
          error: errorText
        });
      }
    } catch (err: any) {
      console.error('[NotificationService] SendGrid exception:', err);
    }
  }

  private sendMockEmail(toEmail: string, subject: string, alertId: string): void {
    console.log(`\n========================================`);
    console.log(`📧 [SIMULATED EMERGENCY EMAIL DISPATCH]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Provider: Simulated (set RESEND_API_KEY or SENDGRID_API_KEY in .env to send live)`);
    console.log(`========================================\n`);

    db.addNotification({
      alertId,
      recipientName: 'Emergency Desk',
      recipientPhone: toEmail,
      type: 'email',
      status: 'simulated_delivered',
      message: subject,
      provider: 'mock'
    });
  }
}

export const notificationService = new NotificationService();
