export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

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
  bloodGroup: BloodGroup;
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

/**
 * Publicly visible emergency data returned via QR scan (/id/:tagId).
 * Strictly omits email, password, internal account IDs, and private details.
 */
export interface PublicMedicalProfile {
  tagId: string;
  name: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  medicalConditions: string[];
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  notes?: string;
  lastUpdated: string;
  isEmergencyVerified: boolean;
}
