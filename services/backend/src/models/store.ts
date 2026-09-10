import { v4 as uuidv4 } from 'uuid';
import { sqlite, initDatabase } from './database.js';

// Auto-initialize DB on first import
initDatabase();

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'rider' | 'responder' | 'admin';
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority?: number;
  isPrimary?: boolean;
}

export interface MedicalProfile {
  id: string;
  ownerUserId: string;
  tagId: string;
  name: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  allergies: string[];
  medicalConditions: string[];
  medications?: string[];
  emergencyContacts: EmergencyContact[];
  doctorName?: string;
  doctorPhone?: string;
  insuranceProvider?: string;
  insurancePolicy?: string;
  organDonor?: boolean;
  emergencyInstructions?: string;
  notes?: string;
  preparednessScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  tagId: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy?: number;
  locationName?: string;
  isSimulated?: boolean;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'responding' | 'on_scene' | 'resolved' | 'cancelled';
  detectionType: 'threshold_impact' | 'ml_classifier' | 'manual_sos' | 'demo_simulated';
  confidence?: number;
  sensorSummary?: {
    peakG: number;
    maxJerk: number;
    tiltAngleDelta: number;
    speedEstimateKmh?: number;
    durationMs?: number;
  };
  medicalSummary?: {
    bloodGroup: string;
    allergies: string[];
    medicalConditions: string[];
    emergencyContacts: EmergencyContact[];
  };
  responderId?: string;
  responderName?: string;
  responderOrg?: string;
  acknowledgedAt?: string;
  respondingAt?: string;
  onSceneAt?: string;
  resolvedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  alertId?: string;
  recipientName: string;
  recipientPhone: string;
  type: 'sms' | 'email' | 'push' | 'webhook' | 'mock_dispatch';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'simulated_delivered';
  message: string;
  sentAt: string;
  provider: 'twilio' | 'resend' | 'sendgrid' | 'mock' | 'system';
  providerMessageId?: string;
  error?: string;
}

export interface ScanEventRecord {
  id: string;
  tagId: string;
  scannedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  ipAddress?: string;
  userAgent?: string;
}

class DatabaseStore {

  // --- USER METHODS ---
  getUserById(id: string): User | undefined {
    const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at
    };
  }

  getUserByEmail(email: string): User | undefined {
    const row = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim()) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at
    };
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const id = `user-${uuidv4().slice(0, 8)}`;
    const createdAt = new Date().toISOString();

    sqlite.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, user.name, user.email, user.phone || '', user.passwordHash, user.role, createdAt);

    return {
      id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt
    };
  }

  // --- PROFILE METHODS ---
  private formatProfileRow(row: any): MedicalProfile {
    const contactsRows = sqlite.prepare('SELECT * FROM emergency_contacts WHERE profile_id = ? ORDER BY priority ASC, created_at ASC').all(row.id) as any[];

    const emergencyContacts: EmergencyContact[] = contactsRows.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      relationship: c.relationship || 'Family',
      priority: c.priority,
      isPrimary: Boolean(c.is_primary)
    }));

    return {
      id: row.id,
      ownerUserId: row.user_id,
      tagId: row.tag_id,
      name: row.name,
      bloodGroup: row.blood_group,
      allergies: row.allergies_json ? JSON.parse(row.allergies_json) : [],
      medicalConditions: row.conditions_json ? JSON.parse(row.conditions_json) : [],
      medications: row.medications_json ? JSON.parse(row.medications_json) : [],
      doctorName: row.doctor_name || '',
      doctorPhone: row.doctor_phone || '',
      insuranceProvider: row.insurance_provider || '',
      insurancePolicy: row.insurance_policy || '',
      organDonor: Boolean(row.organ_donor),
      emergencyInstructions: row.emergency_instructions || '',
      emergencyContacts,
      notes: row.notes || row.emergency_instructions || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  getProfileByUserId(userId: string): MedicalProfile | undefined {
    const row = sqlite.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
    if (!row) return undefined;
    return this.formatProfileRow(row);
  }

  getProfileByTagId(tagId: string): MedicalProfile | undefined {
    const row = sqlite.prepare('SELECT * FROM profiles WHERE UPPER(tag_id) = UPPER(?)').get(tagId.trim()) as any;
    if (!row) return undefined;
    return this.formatProfileRow(row);
  }

  getAllProfiles(): MedicalProfile[] {
    const rows = sqlite.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all() as any[];
    return rows.map(r => this.formatProfileRow(r));
  }

  createOrUpdateProfile(userId: string, data: Partial<MedicalProfile> & { name: string; bloodGroup: MedicalProfile['bloodGroup'] }): MedicalProfile {
    const existing = this.getProfileByUserId(userId);
    const now = new Date().toISOString();

    let tagId = (data.tagId ? data.tagId.trim().toUpperCase() : existing?.tagId) || `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    const tagOwner = sqlite.prepare('SELECT id, user_id FROM profiles WHERE UPPER(tag_id) = UPPER(?)').get(tagId) as any;
    if (tagOwner && tagOwner.user_id !== userId) {
      tagId = existing?.tagId || `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const profileId = existing ? existing.id : `profile-${uuidv4().slice(0, 8)}`;
    const createdAt = existing ? existing.createdAt : now;

    const allergiesJson = JSON.stringify(Array.isArray(data.allergies) ? data.allergies : (existing?.allergies || []));
    const conditionsJson = JSON.stringify(Array.isArray(data.medicalConditions) ? data.medicalConditions : (existing?.medicalConditions || []));
    const medicationsJson = JSON.stringify(Array.isArray(data.medications) ? data.medications : (existing?.medications || []));

    sqlite.prepare(`
      INSERT INTO profiles (
        id, user_id, tag_id, name, blood_group, allergies_json, conditions_json, medications_json,
        doctor_name, doctor_phone, insurance_provider, insurance_policy, organ_donor, emergency_instructions, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        tag_id = excluded.tag_id,
        name = excluded.name,
        blood_group = excluded.blood_group,
        allergies_json = excluded.allergies_json,
        conditions_json = excluded.conditions_json,
        medications_json = excluded.medications_json,
        doctor_name = excluded.doctor_name,
        doctor_phone = excluded.doctor_phone,
        insurance_provider = excluded.insurance_provider,
        insurance_policy = excluded.insurance_policy,
        organ_donor = excluded.organ_donor,
        emergency_instructions = excluded.emergency_instructions,
        updated_at = excluded.updated_at
    `).run(
      profileId,
      userId,
      tagId,
      data.name,
      data.bloodGroup || 'Unknown',
      allergiesJson,
      conditionsJson,
      medicationsJson,
      data.doctorName || '',
      data.doctorPhone || '',
      data.insuranceProvider || '',
      data.insurancePolicy || '',
      data.organDonor ? 1 : 0,
      data.emergencyInstructions || data.notes || '',
      createdAt,
      now
    );

    // Sync emergency contacts if supplied
    if (data.emergencyContacts && Array.isArray(data.emergencyContacts)) {
      sqlite.prepare('DELETE FROM emergency_contacts WHERE profile_id = ?').run(profileId);
      const insertContact = sqlite.prepare(`
        INSERT OR REPLACE INTO emergency_contacts (id, profile_id, name, phone, relationship, priority, is_primary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      data.emergencyContacts.forEach((c, idx) => {
        if (c.name || c.phone) {
          const contactId = c.id && !c.id.startsWith('c1') && !c.id.startsWith('c2')
            ? c.id
            : `contact-${uuidv4().slice(0, 8)}-${idx}`;
          insertContact.run(
            contactId,
            profileId,
            (c.name || '').trim(),
            (c.phone || '').trim(),
            c.relationship || 'Family',
            c.priority || (idx + 1),
            c.isPrimary ? 1 : (idx === 0 ? 1 : 0),
            now
          );
        }
      });
    }

    return this.getProfileByUserId(userId)!;
  }

  // --- ALERT / INCIDENT METHODS ---
  private formatAlertRow(row: any): Alert {
    return {
      id: row.id,
      riderId: row.rider_id,
      riderName: row.rider_name,
      riderPhone: row.rider_phone,
      tagId: row.tag_id,
      latitude: row.latitude,
      longitude: row.longitude,
      locationAccuracy: row.location_accuracy,
      locationName: row.location_name,
      isSimulated: Boolean(row.is_simulated),
      timestamp: row.created_at,
      status: row.status,
      detectionType: row.detection_type,
      confidence: row.confidence,
      sensorSummary: row.sensor_summary_json ? JSON.parse(row.sensor_summary_json) : undefined,
      medicalSummary: row.medical_summary_json ? JSON.parse(row.medical_summary_json) : undefined,
      responderId: row.responder_id,
      responderName: row.responder_name,
      responderOrg: row.responder_org,
      acknowledgedAt: row.acknowledged_at,
      respondingAt: row.responding_at,
      onSceneAt: row.on_scene_at,
      resolvedAt: row.resolved_at,
      cancelledAt: row.cancelled_at,
      cancellationReason: row.cancellation_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  getAllAlerts(filter?: { status?: string; riderId?: string }): Alert[] {
    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params: any[] = [];

    if (filter?.status) {
      query += ' AND status = ?';
      params.push(filter.status);
    }
    if (filter?.riderId) {
      query += ' AND rider_id = ?';
      params.push(filter.riderId);
    }

    query += ' ORDER BY created_at DESC';
    const rows = sqlite.prepare(query).all(...params) as any[];
    return rows.map(r => this.formatAlertRow(r));
  }

  getAlertById(id: string): Alert | undefined {
    const row = sqlite.prepare('SELECT * FROM incidents WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.formatAlertRow(row);
  }

  createAlert(data: {
    riderId: string;
    riderName: string;
    riderPhone?: string;
    tagId: string;
    latitude: number | null;
    longitude: number | null;
    locationAccuracy?: number;
    locationName?: string;
    isSimulated?: boolean;
    detectionType: Alert['detectionType'];
    confidence?: number;
    sensorSummary?: Alert['sensorSummary'];
  }): Alert {
    const id = `alert-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Pull medical profile snapshot for immutable incident record
    const profile = this.getProfileByTagId(data.tagId);
    const medicalSummary = profile ? {
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      medicalConditions: profile.medicalConditions,
      emergencyContacts: profile.emergencyContacts
    } : undefined;

    sqlite.prepare(`
      INSERT INTO incidents (
        id, rider_id, rider_name, rider_phone, tag_id, latitude, longitude, location_accuracy, location_name,
        is_simulated, status, detection_type, confidence, sensor_summary_json, medical_summary_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.riderId,
      data.riderName,
      data.riderPhone || '',
      data.tagId,
      data.latitude,
      data.longitude,
      data.locationAccuracy || null,
      data.locationName || 'GPS Location Captured',
      data.isSimulated ? 1 : 0,
      'pending',
      data.detectionType,
      data.confidence || 0.9,
      data.sensorSummary ? JSON.stringify(data.sensorSummary) : null,
      medicalSummary ? JSON.stringify(medicalSummary) : null,
      now,
      now
    );

    // Initial status log
    sqlite.prepare(`
      INSERT INTO incident_status_logs (id, incident_id, previous_status, new_status, changed_by, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`log-${Date.now()}`, id, null, 'pending', 'Automated Crash Detection Engine', 'Initial incident created via telemetry impulse trigger', now);

    return this.getAlertById(id)!;
  }

  updateAlertStatus(id: string, update: {
    status: Alert['status'];
    responderId?: string;
    responderName?: string;
    responderOrg?: string;
    cancellationReason?: string;
    notes?: string;
  }): Alert | undefined {
    const existing = this.getAlertById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    let acknowledgedAt = existing.acknowledgedAt;
    let respondingAt = existing.respondingAt;
    let onSceneAt = existing.onSceneAt;
    let resolvedAt = existing.resolvedAt;
    let cancelledAt = existing.cancelledAt;

    if (update.status === 'acknowledged' && !acknowledgedAt) acknowledgedAt = now;
    if (update.status === 'responding' && !respondingAt) respondingAt = now;
    if (update.status === 'on_scene' && !onSceneAt) onSceneAt = now;
    if (update.status === 'resolved') resolvedAt = now;
    if (update.status === 'cancelled') cancelledAt = now;

    sqlite.prepare(`
      UPDATE incidents SET
        status = ?,
        responder_id = COALESCE(?, responder_id),
        responder_name = COALESCE(?, responder_name),
        responder_org = COALESCE(?, responder_org),
        acknowledged_at = ?,
        responding_at = ?,
        on_scene_at = ?,
        resolved_at = ?,
        cancelled_at = ?,
        cancellation_reason = COALESCE(?, cancellation_reason),
        updated_at = ?
      WHERE id = ?
    `).run(
      update.status,
      update.responderId || null,
      update.responderName || null,
      update.responderOrg || null,
      acknowledgedAt || null,
      respondingAt || null,
      onSceneAt || null,
      resolvedAt || null,
      cancelledAt || null,
      update.cancellationReason || null,
      now,
      id
    );

    // Audit log
    sqlite.prepare(`
      INSERT INTO incident_status_logs (id, incident_id, previous_status, new_status, changed_by, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}`,
      id,
      existing.status,
      update.status,
      update.responderName || 'System',
      update.notes || update.cancellationReason || `Status transitioned from ${existing.status} to ${update.status}`,
      now
    );

    return this.getAlertById(id);
  }

  getIncidentStatusLogs(incidentId: string) {
    return sqlite.prepare('SELECT * FROM incident_status_logs WHERE incident_id = ? ORDER BY timestamp ASC').all(incidentId);
  }

  // --- NOTIFICATION METHODS ---
  addNotification(notif: Omit<NotificationLog, 'id' | 'sentAt'>): NotificationLog {
    const id = `notif-${uuidv4().slice(0, 8)}`;
    const sentAt = new Date().toISOString();

    sqlite.prepare(`
      INSERT INTO notifications (id, incident_id, recipient_name, recipient_phone, type, status, message, provider, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      notif.alertId || null,
      notif.recipientName,
      notif.recipientPhone,
      notif.type,
      notif.status,
      notif.message,
      notif.provider,
      sentAt
    );

    return {
      id,
      alertId: notif.alertId,
      recipientName: notif.recipientName,
      recipientPhone: notif.recipientPhone,
      type: notif.type,
      status: notif.status,
      message: notif.message,
      provider: notif.provider,
      sentAt
    };
  }

  getNotificationsByAlertId(alertId: string): NotificationLog[] {
    const rows = sqlite.prepare('SELECT * FROM notifications WHERE incident_id = ? ORDER BY sent_at DESC').all(alertId) as any[];
    return rows.map(r => ({
      id: r.id,
      alertId: r.incident_id,
      recipientName: r.recipient_name,
      recipientPhone: r.recipient_phone,
      type: r.type,
      status: r.status,
      message: r.message,
      provider: r.provider,
      sentAt: r.sent_at
    }));
  }

  getAllNotifications(): NotificationLog[] {
    const rows = sqlite.prepare('SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 100').all() as any[];
    return rows.map(r => ({
      id: r.id,
      alertId: r.incident_id,
      recipientName: r.recipient_name,
      recipientPhone: r.recipient_phone,
      type: r.type,
      status: r.status,
      message: r.message,
      provider: r.provider,
      sentAt: r.sent_at
    }));
  }

  // --- SCAN EVENTS ANALYTICS ---
  logScanEvent(data: {
    tagId: string;
    latitude?: number | null;
    longitude?: number | null;
    locationName?: string;
    ipAddress?: string;
    userAgent?: string;
  }): ScanEventRecord {
    const id = `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const scannedAt = new Date().toISOString();

    sqlite.prepare(`
      INSERT INTO scan_events (id, tag_id, scanned_at, latitude, longitude, location_name, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.tagId.toUpperCase(),
      scannedAt,
      data.latitude || null,
      data.longitude || null,
      data.locationName || 'Emergency Bystander Scan',
      data.ipAddress || '127.0.0.1',
      data.userAgent || 'Unknown Camera/Browser'
    );

    return {
      id,
      tagId: data.tagId.toUpperCase(),
      scannedAt,
      latitude: data.latitude,
      longitude: data.longitude,
      locationName: data.locationName,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    };
  }

  getScanEventsByTag(tagId: string): ScanEventRecord[] {
    const rows = sqlite.prepare('SELECT * FROM scan_events WHERE UPPER(tag_id) = UPPER(?) ORDER BY scanned_at DESC LIMIT 50').all(tagId.trim()) as any[];
    return rows.map(r => ({
      id: r.id,
      tagId: r.tag_id,
      scannedAt: r.scanned_at,
      latitude: r.latitude,
      longitude: r.longitude,
      locationName: r.location_name,
      ipAddress: r.ip_address,
      userAgent: r.user_agent
    }));
  }
}

export const db = new DatabaseStore();
