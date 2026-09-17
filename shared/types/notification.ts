export type NotificationType = 'sms' | 'call' | 'whatsapp' | 'email' | 'push' | 'webhook' | 'mock_dispatch';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'simulated_delivered';

export interface NotificationLog {
  id: string;
  alertId?: string;
  recipientName: string;
  recipientPhone: string;
  type: NotificationType;
  status: NotificationStatus;
  message: string;
  sentAt: string;
  provider: 'twilio' | 'resend' | 'sendgrid' | 'mock' | 'system';
  providerMessageId?: string;
  error?: string;
}
