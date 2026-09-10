import { Request, Response } from 'express';
import { db } from '../models/store.js';
import { notificationService } from '../services/notificationService.js';
import { eventBroadcaster } from '../services/eventBroadcaster.js';

export const createAlert = async (req: Request, res: Response) => {
  const {
    riderId,
    riderName,
    riderPhone,
    tagId,
    latitude,
    longitude,
    locationAccuracy,
    locationName,
    isSimulated,
    detectionType,
    confidence,
    sensorSummary
  } = req.body;

  if (!riderId || !riderName) {
    return res.status(400).json({ error: 'riderId and riderName are required.' });
  }

  const alert = db.createAlert({
    riderId,
    riderName,
    riderPhone,
    tagId,
    latitude: typeof latitude === 'number' ? latitude : null,
    longitude: typeof longitude === 'number' ? longitude : null,
    locationAccuracy: typeof locationAccuracy === 'number' ? locationAccuracy : undefined,
    locationName,
    isSimulated: Boolean(isSimulated),
    detectionType: detectionType || 'threshold_impact',
    confidence: confidence || 0.9,
    sensorSummary
  });

  // If there are emergency contacts in the profile, trigger notification service
  if (alert.medicalSummary?.emergencyContacts?.length) {
    await notificationService.dispatchEmergencyAlerts({
      alert,
      contacts: alert.medicalSummary.emergencyContacts
    });
  }

  // Real-time broadcast to responder command dashboard
  eventBroadcaster.broadcast('ALERT_CREATED', alert);

  return res.status(201).json({
    message: 'Emergency alert created and dispatched successfully',
    alert
  });
};

export const getAlerts = (req: Request, res: Response) => {
  const { status, riderId } = req.query;

  const alerts = db.getAllAlerts({
    status: typeof status === 'string' ? status : undefined,
    riderId: typeof riderId === 'string' ? riderId : undefined
  });

  return res.status(200).json({ alerts });
};

export const getAlertById = (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = db.getAlertById(id);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found.' });
  }

  const notifications = db.getNotificationsByAlertId(id);

  return res.status(200).json({
    alert,
    notifications
  });
};

export const updateAlertStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, responderId, responderName, responderOrg, cancellationReason } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const updated = db.updateAlertStatus(id, {
    status,
    responderId,
    responderName,
    responderOrg,
    cancellationReason
  });

  if (!updated) {
    return res.status(404).json({ error: 'Alert not found.' });
  }

  // Broadcast real-time status update
  eventBroadcaster.broadcast('ALERT_STATUS_UPDATED', updated);

  return res.status(200).json({
    message: `Alert status updated to ${status}`,
    alert: updated
  });
};

export const getAlertLogs = (req: Request, res: Response) => {
  const { id } = req.params;
  const logs = db.getIncidentStatusLogs(id);
  return res.status(200).json({ logs });
};

