import { Request, Response } from 'express';
import { db } from '../models/store.js';
import { eventBroadcaster } from '../services/eventBroadcaster.js';

export const getResponderAlerts = (req: Request, res: Response) => {
  const alerts = db.getAllAlerts();
  return res.status(200).json({ alerts });
};

export const getResponderStats = (req: Request, res: Response) => {
  const all = db.getAllAlerts();
  const pending = all.filter(a => a.status === 'pending').length;
  const acknowledged = all.filter(a => a.status === 'acknowledged').length;
  const responding = all.filter(a => a.status === 'responding').length;
  const onScene = all.filter(a => a.status === 'on_scene').length;
  const resolved = all.filter(a => a.status === 'resolved').length;
  const cancelled = all.filter(a => a.status === 'cancelled').length;

  return res.status(200).json({
    total: all.length,
    pending,
    acknowledged,
    responding,
    onScene,
    resolved,
    cancelled,
    activeIncidents: pending + acknowledged + responding + onScene
  });
};

export const updateResponderTriage = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, responderName, responderOrg } = req.body;

  if (!['acknowledged', 'responding', 'on_scene', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid responder action status. Must be acknowledged, responding, on_scene, or resolved.' });
  }

  const updated = db.updateAlertStatus(id, {
    status,
    responderName: responderName || 'On-Duty Trauma Unit',
    responderOrg: responderOrg || 'Emergency Response Command'
  });

  if (!updated) {
    return res.status(404).json({ error: 'Incident alert not found.' });
  }

  eventBroadcaster.broadcast('ALERT_STATUS_UPDATED', updated);

  return res.status(200).json({
    message: `Incident triage updated to ${status}`,
    alert: updated
  });
};
