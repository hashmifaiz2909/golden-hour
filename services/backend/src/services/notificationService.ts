import { config } from '../config/index.js';
import { db, Alert, EmergencyContact } from '../models/store.js';

export interface SendEmergencyNotificationParams {
  alert: Alert;
  contacts: EmergencyContact[];
}

export class NotificationService {
  /**
   * Dispatches emergency SMS & Email alerts to all registered emergency contacts and trauma desks
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

    // 1. Dispatch SMS Alerts
    for (const contact of contacts) {
      if (config.twilio.enabled) {
        await this.sendTwilioSms(contact, messageBody, alert.id);
      } else {
        this.sendMockSms(contact, messageBody, alert.id);
      }
    }

    // 2. Dispatch Emergency Email Alerts (Resend / SendGrid / Simulated)
    await this.dispatchEmergencyEmailAlerts(alert, contacts, mapLink);
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

  private async sendTwilioSms(contact: EmergencyContact, message: string, alertId: string): Promise<void> {
    try {
      const auth = Buffer.from(`${config.twilio.accountSid}:${config.twilio.authToken}`).toString('base64');
      const url = `https://api.twilio.com/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', contact.phone);
      params.append('From', config.twilio.fromPhone);
      params.append('Body', message);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const json: any = await res.json();

      if (res.ok) {
        db.addNotification({
          alertId,
          recipientName: contact.name,
          recipientPhone: contact.phone,
          type: 'sms',
          status: 'sent',
          message,
          provider: 'twilio',
          providerMessageId: json.sid
        });
      } else {
        db.addNotification({
          alertId,
          recipientName: contact.name,
          recipientPhone: contact.phone,
          type: 'sms',
          status: 'failed',
          message,
          provider: 'twilio',
          error: json.message || 'Twilio API Error'
        });
      }
    } catch (err: any) {
      console.error('[NotificationService] Twilio SMS dispatch exception:', err);
      db.addNotification({
        alertId,
        recipientName: contact.name,
        recipientPhone: contact.phone,
        type: 'sms',
        status: 'failed',
        message,
        provider: 'twilio',
        error: err.message || 'Network error'
      });
    }
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
