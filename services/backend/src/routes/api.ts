import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import * as profileCtrl from '../controllers/profileController.js';
import * as alertCtrl from '../controllers/alertController.js';
import * as responderCtrl from '../controllers/responderController.js';
import * as sensorCtrl from '../controllers/sensorController.js';
import * as notifCtrl from '../controllers/notificationController.js';
import { eventBroadcaster } from '../services/eventBroadcaster.js';

const router = Router();

// 1. Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Golden Hour Emergency Dispatch API',
    version: '1.0.0',
    systemYear: 2026,
    timestamp: new Date().toISOString()
  });
});

// 2. Real-time Server-Sent Events (SSE) stream for Responder & Demo sync
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  eventBroadcaster.addClient(res);
});

// 3. Auth Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authCtrl.getMe);

// 4. Rider Profile Routes
router.get('/profile', profileCtrl.getProfile);
router.post('/profile', profileCtrl.updateProfile);
router.put('/profile', profileCtrl.updateProfile);
router.get('/profile/scans', profileCtrl.getScanEvents);
router.post('/profile/scans/simulate', profileCtrl.simulateScanEvent);

// 5. PUBLIC QR MEDICAL PROFILE ROUTE (No login required)
router.get('/profile/tag/:tagId', profileCtrl.getPublicProfileByTag);

// 5b. Admin profiles registry
router.get('/admin/profiles', (req, res) => {
  const { db } = require('../models/store.js');
  res.status(200).json({ profiles: db.getAllProfiles() });
});

// 6. Emergency Alert Routes
router.post('/alerts', alertCtrl.createAlert);
router.get('/alerts', alertCtrl.getAlerts);
router.get('/alerts/:id', alertCtrl.getAlertById);
router.patch('/alerts/:id/status', alertCtrl.updateAlertStatus);
router.get('/alerts/:id/logs', alertCtrl.getAlertLogs);

// 7. Responder Command Routes
router.get('/responder/alerts', responderCtrl.getResponderAlerts);
router.get('/responder/stats', responderCtrl.getResponderStats);
router.patch('/responder/alerts/:id/status', responderCtrl.updateResponderTriage);

// 8. Sensor & ML Classification Routes
router.post('/sensors/evaluate', sensorCtrl.evaluateSensors);

// 9. Notification Routes
router.get('/notifications', notifCtrl.getNotifications);
router.post('/notifications/test', notifCtrl.testNotification);

export default router;
