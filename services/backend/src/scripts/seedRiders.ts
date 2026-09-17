import bcrypt from 'bcryptjs';
import { db, User } from '../models/store.js';

interface SeedRiderInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  tagId: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  doctorName: string;
  doctorPhone: string;
  insuranceProvider: string;
  insurancePolicy: string;
  organDonor: boolean;
  emergencyInstructions: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
    priority: number;
    isPrimary: boolean;
  }>;
}

const DEMO_RIDERS: SeedRiderInput[] = [
  {
    name: 'Alex Rivera',
    email: 'alex.rider@goldenhour.org',
    phone: '+919876540001',
    password: 'GoldenHour2026!',
    tagId: 'GH-7749',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    medicalConditions: ['Mild Asthma (carries inhaler)'],
    medications: ['Salbutamol Inhaler (PRN)'],
    doctorName: 'Dr. K. Sharma (Pulmonologist)',
    doctorPhone: '+919811100222',
    insuranceProvider: 'Star Health & Allied Insurance',
    insurancePolicy: 'SH-MED-77490-DEL',
    organDonor: true,
    emergencyInstructions: 'Carries asthma inhaler in jacket pocket. Wears contact lenses.',
    emergencyContacts: [
      { name: 'Elena Rivera', phone: '+919876540002', relationship: 'Spouse', priority: 1, isPrimary: true },
      { name: 'Marcus Rivera', phone: '+919876540003', relationship: 'Brother', priority: 2, isPrimary: false }
    ]
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.rider@goldenhour.org',
    phone: '+919822230001',
    password: 'GoldenHour2026!',
    tagId: 'GH-8821',
    bloodGroup: 'A-',
    allergies: ['NSAIDs / Ibuprofen', 'Peanuts'],
    medicalConditions: ['Type-1 Diabetes (Insulin dependent)'],
    medications: ['Insulin Glargine 12U QPM', 'Glucagon Emergency Kit'],
    doctorName: 'Dr. Anita Sen (Endocrinologist)',
    doctorPhone: '+919822299881',
    insuranceProvider: 'HDFC ERGO Health',
    insurancePolicy: 'POL-DIA-88210-BLR',
    organDonor: true,
    emergencyInstructions: 'Hypoglycemia risk. If unconscious, administer glucagon from backpack.',
    emergencyContacts: [
      { name: 'David Chen', phone: '+919822230002', relationship: 'Brother', priority: 1, isPrimary: true },
      { name: 'Grace Chen', phone: '+919822230003', relationship: 'Mother', priority: 2, isPrimary: false }
    ]
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.rider@goldenhour.org',
    phone: '+919833340001',
    password: 'GoldenHour2026!',
    tagId: 'GH-9932',
    bloodGroup: 'B+',
    allergies: ['Aspirin', 'Iodinated Contrast Dye'],
    medicalConditions: ['Hypertension (Stage 1 controlled)'],
    medications: ['Amlodipine 5mg OD'],
    doctorName: 'Dr. Vikram Seth (Cardiologist)',
    doctorPhone: '+919833399111',
    insuranceProvider: 'Care Health Insurance',
    insurancePolicy: 'CHI-CARD-99320-MUM',
    organDonor: false,
    emergencyInstructions: 'Severe aspirin allergy. Do NOT administer blood thinners without contrast check.',
    emergencyContacts: [
      { name: 'Ananya Verma', phone: '+919833340002', relationship: 'Sister', priority: 1, isPrimary: true },
      { name: 'Rohit Verma', phone: '+919833340003', relationship: 'Father', priority: 2, isPrimary: false }
    ]
  }
];

export async function seedDemoRiders() {
  console.log('🚀 Starting demo rider accounts seeding via REAL signup logic...');
  const createdUsers: Array<{ email: string; password: string; name: string; tagId: string; role: string }> = [];

  for (const rider of DEMO_RIDERS) {
    const normalizedEmail = rider.email.trim().toLowerCase();
    
    // Real Signup Logic:
    // 1. Check existing user
    let user = db.getUserByEmail(normalizedEmail);

    // 2. Hash password using real bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rider.password, salt);

    if (user) {
      console.log(`ℹ️ User ${normalizedEmail} already exists. Updating password hash and profile...`);
      db.updateUserPassword(user.id, passwordHash);
    } else {
      console.log(`✨ Registering new rider account: ${normalizedEmail}`);
      user = db.createUser({
        name: rider.name.trim(),
        email: normalizedEmail,
        phone: rider.phone.trim(),
        passwordHash,
        role: 'rider'
      });
    }

    // 3. Create or update the complete emergency profile
    db.createOrUpdateProfile(user.id, {
      name: rider.name,
      tagId: rider.tagId,
      bloodGroup: rider.bloodGroup,
      allergies: rider.allergies,
      medicalConditions: rider.medicalConditions,
      medications: rider.medications,
      doctorName: rider.doctorName,
      doctorPhone: rider.doctorPhone,
      insuranceProvider: rider.insuranceProvider,
      insurancePolicy: rider.insurancePolicy,
      organDonor: rider.organDonor,
      emergencyInstructions: rider.emergencyInstructions,
      emergencyContacts: rider.emergencyContacts.map((c, i) => ({
        id: `contact-${rider.tagId.toLowerCase()}-${i + 1}`,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship,
        priority: c.priority,
        isPrimary: c.isPrimary
      }))
    });

    // 4. Verify login logic works with the newly created password hash
    const isPasswordValid = await bcrypt.compare(rider.password, passwordHash);
    if (!isPasswordValid) {
      throw new Error(`Critical: Password hash verification failed for ${normalizedEmail}`);
    }

    createdUsers.push({
      email: normalizedEmail,
      password: rider.password,
      name: rider.name,
      tagId: rider.tagId,
      role: 'rider'
    });
  }

  console.log('\n======================================================');
  console.log('✅ DEMO RIDER ACCOUNTS SUCCESSFULLY SEEDED & VERIFIED');
  console.log('======================================================');
  for (const u of createdUsers) {
    console.log(`👤 Name:     ${u.name}`);
    console.log(`📧 Email:    ${u.email}`);
    console.log(`🔑 Password: ${u.password}`);
    console.log(`🏷️ Tag ID:   ${u.tagId}`);
    console.log('------------------------------------------------------');
  }

  return createdUsers;
}

// Allow direct execution via CLI
if (process.argv[1]?.endsWith('seedRiders.ts') || process.argv[1]?.endsWith('seedRiders.js')) {
  seedDemoRiders()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
