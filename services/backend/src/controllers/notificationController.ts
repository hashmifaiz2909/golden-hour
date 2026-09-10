import { Request, Response } from 'express';
import { db } from '../models/store.js';
import { notificationService } from '../services/notificationService.js';

export const getNotifications = (req: Request, res: Response) => {
  const { alertId } = req.query;
  if (typeof alertId === 'string') {
    return res.status(200).json({ notifications: db.getNotificationsByAlertId(alertId) });
  }
  return res.status(200).json({ notifications: db.getAllNotifications() });
};

export const testNotification = async (req: Request, res: Response) => {
  const { phone, name, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required.' });
  }

  const dummyAlert = db.getAllAlerts()[0] || {
    id: 'test-alert',
    riderName: name || 'Test Rider',
    timestamp: new Date().toISOString(),
    tagId: 'GH-TEST',
    latitude: 28.6139,
    longitude: 77.2090,
    locationName: 'Test Location'
  };

  await notificationService.dispatchEmergencyAlerts({
    alert: dummyAlert as any,
    contacts: [{
      id: 'test-c1',
      name: name || 'Emergency Contact',
      phone,
      relationship: 'Primary Contact'
    }]
  });

  return res.status(200).json({
    message: 'Test notification queued / logged successfully',
    latest: db.getAllNotifications()[0]
  });
};
