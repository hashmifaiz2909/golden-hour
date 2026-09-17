const API_BASE = '/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'rider' | 'responder' | 'admin';
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
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
  doctorName?: string;
  doctorPhone?: string;
  insuranceProvider?: string;
  insurancePolicy?: string;
  organDonor?: boolean;
  emergencyInstructions?: string;
  emergencyContacts: EmergencyContact[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicMedicalProfile {
  tagId: string;
  name: string;
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
    isPrimary?: boolean;
  }>;
  notes?: string;
  emergencyInstructions?: string;
  organDonor?: boolean;
  medications?: string[];
  doctorName?: string;
  doctorPhone?: string;
  insuranceProvider?: string;
  insurancePolicy?: string;
  lastUpdated: string;
  isEmergencyVerified: boolean;
}

export interface Alert {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  tagId: string;
  latitude: number | null;
  longitude: number | null;
  locationName?: string;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
  detectionType: 'threshold_impact' | 'ml_classifier' | 'manual_sos' | 'demo_simulated';
  confidence?: number;
  sensorSummary?: {
    peakG: number;
    maxJerk: number;
    tiltAngleDelta: number;
    speedEstimateKmh?: number;
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
  resolvedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string):Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid email or password.' }));
      const msg = err.error || err.message || 'Invalid email or password.';
      throw new Error(msg);
    }
    return res.json();
  },

  async register(name: string, email: string, phone: string, password: string, role: 'rider' | 'responder'): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe(token: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ message: string; _devToken?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || err.message || 'Failed to process password reset request.');
    }
    return res.json();
  },

  async verifyResetToken(token: string): Promise<{ valid: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
    const data = await res.json().catch(() => ({ valid: false, error: 'Network error verifying reset link' }));
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Reset failed' }));
      throw new Error(err.error || err.message || 'Failed to reset password.');
    }
    return res.json();
  },

  // --- PROFILE ---
  async getProfile(token: string): Promise<{ profile: MedicalProfile }> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(token: string, profile: Partial<MedicalProfile>): Promise<{ profile: MedicalProfile }> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // --- PUBLIC QR PROFILE ---
  async getPublicProfile(tagId: string): Promise<{ profile: PublicMedicalProfile }> {
    const res = await fetch(`${API_BASE}/profile/tag/${encodeURIComponent(tagId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Emergency profile not found' }));
      throw new Error(err.error || 'Emergency profile not found.');
    }
    return res.json();
  },

  // --- ALERTS ---
  async createAlert(data: {
    riderId: string;
    riderName: string;
    riderPhone?: string;
    tagId?: string;
    latitude: number | null;
    longitude: number | null;
    locationName?: string;
    detectionType: Alert['detectionType'];
    confidence?: number;
    sensorSummary?: Alert['sensorSummary'];
  }): Promise<{ alert: Alert }> {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to dispatch alert');
    return res.json();
  },

  async getAlerts(filter?: { status?: string; riderId?: string }): Promise<{ alerts: Alert[] }> {
    const q = new URLSearchParams();
    if (filter?.status) q.append('status', filter.status);
    if (filter?.riderId) q.append('riderId', filter.riderId);
    const res = await fetch(`${API_BASE}/alerts?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async getAlertById(id: string): Promise<{ alert: Alert; notifications: any[] }> {
    const res = await fetch(`${API_BASE}/alerts/${id}`);
    if (!res.ok) throw new Error('Alert not found');
    return res.json();
  },

  async updateAlertStatus(id: string, update: {
    status: Alert['status'];
    responderName?: string;
    responderOrg?: string;
    cancellationReason?: string;
  }): Promise<{ alert: Alert }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update alert status');
    return res.json();
  },

  // --- RESPONDER ---
  async getResponderAlerts(): Promise<{ alerts: Alert[] }> {
    const res = await fetch(`${API_BASE}/responder/alerts`);
    if (!res.ok) throw new Error('Failed to load responder incidents');
    return res.json();
  },

  async getResponderStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/responder/stats`);
    if (!res.ok) throw new Error('Failed to load responder stats');
    return res.json();
  },

  async updateResponderTriage(
    id: string, 
    status: 'acknowledged' | 'responding' | 'on_scene' | 'resolved' | 'cancelled', 
    responderName?: string,
    notes?: string
  ): Promise<{ alert: Alert }> {
    const res = await fetch(`${API_BASE}/responder/alerts/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, responderName, notes })
    });
    if (!res.ok) throw new Error('Failed to update triage status');
    return res.json();
  },

  async getAlertLogs(id: string): Promise<{ incidentId: string; logs: Array<{ id: string; old_status: string; new_status: string; changed_by: string; notes: string; timestamp: string }> }> {
    const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(id)}/logs`);
    if (!res.ok) throw new Error('Failed to fetch incident audit logs');
    return res.json();
  },

  // --- SCAN AUDIT LOGS ---
  async getScanEvents(token: string): Promise<{ scanEvents: any[] }> {
    const res = await fetch(`${API_BASE}/profile/scans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch scan audit logs');
    return res.json();
  },

  async simulateScanEvent(
    token: string, 
    data?: { location_name?: string; latitude?: number; longitude?: number }
  ): Promise<{ success: boolean; event: any }> {
    const res = await fetch(`${API_BASE}/profile/scans/simulate`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data || {})
    });
    if (!res.ok) throw new Error('Failed to simulate scan event');
    return res.json();
  }
};
