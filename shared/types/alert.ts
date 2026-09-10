import { EmergencyContact } from './profile.js';

export type AlertStatus = 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';

export type DetectionType = 
  | 'threshold_impact' 
  | 'ml_classifier' 
  | 'manual_sos' 
  | 'demo_simulated';

export interface SensorSummary {
  peakG: number;
  maxJerk: number;
  tiltAngleDelta: number;
  speedEstimateKmh?: number;
  durationMs?: number;
}

export interface MedicalSummary {
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContacts: EmergencyContact[];
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
  status: AlertStatus;
  detectionType: DetectionType;
  confidence?: number;
  sensorSummary?: SensorSummary;
  medicalSummary?: MedicalSummary;
  responderId?: string;
  responderName?: string;
  responderOrg?: string;
  acknowledgedAt?: string;
  respondingAt?: string;
  resolvedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertDto {
  riderId: string;
  riderName: string;
  tagId?: string;
  latitude: number | null;
  longitude: number | null;
  locationName?: string;
  detectionType: DetectionType;
  confidence?: number;
  sensorSummary?: SensorSummary;
}
