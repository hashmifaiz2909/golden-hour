export type NotificationType = 'sms' | 'push' | 'webhook' | 'mock_dispatch';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export interface NotificationLog {
  id: string;
  alertId: string;
  recipientName: string;
  recipientPhone: string;
  type: NotificationType;
  status: NotificationStatus;
  message: string;
  sentAt: string;
  provider: 'twilio' | 'mock' | 'system';
  providerMessageId?: string;
  error?: string;
}
