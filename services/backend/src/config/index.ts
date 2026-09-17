import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config(); // Also check current working directory

export const config = {
  port: parseInt(process.env.PORT || '5050', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'golden-hour-production-jwt-super-secure-key-2026',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromPhone: process.env.TWILIO_FROM_PHONE || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    contentSid: process.env.TWILIO_CONTENT_SID || '',
    enabled: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.EMERGENCY_FROM_EMAIL || 'emergency@goldenhours.org',
    emergencyDeskEmail: process.env.EMERGENCY_DESK_EMAIL || 'dispatch@goldenhours.org',
    testRecipientOverride: process.env.RESEND_TEST_RECIPIENT_OVERRIDE || process.env.RESEND_ACCOUNT_EMAIL || '',
    enabled: Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY)
  },
  mockNotifications: process.env.MOCK_NOTIFICATIONS !== 'false'
};
