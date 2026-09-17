import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data dir exists either in local backend or cwd
const candidateDirs = [
  process.env.DATA_DIR,
  path.resolve(__dirname, '../../data'),
  path.resolve(__dirname, '../../../../data'),
  path.resolve(process.cwd(), 'services/backend/data'),
  path.resolve(process.cwd(), 'data')
].filter(Boolean) as string[];

let DATA_DIR = candidateDirs[1] || path.resolve(process.cwd(), 'data');
for (const dir of candidateDirs) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    DATA_DIR = dir;
    break;
  } catch (e) {}
}

const DB_PATH = path.join(DATA_DIR, 'golden_hour.db');
export const sqlite: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for high concurrent performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export function initDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('rider', 'responder', 'admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tag_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      allergies_json TEXT,
      conditions_json TEXT,
      medications_json TEXT,
      doctor_name TEXT,
      doctor_phone TEXT,
      insurance_provider TEXT,
      insurance_policy TEXT,
      organ_donor INTEGER DEFAULT 0,
      emergency_instructions TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT,
      priority INTEGER DEFAULT 1,
      is_primary INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      rider_id TEXT NOT NULL,
      rider_name TEXT NOT NULL,
      rider_phone TEXT,
      tag_id TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      location_accuracy REAL,
      location_name TEXT,
      is_simulated INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('pending', 'acknowledged', 'responding', 'on_scene', 'resolved', 'cancelled')),
      detection_type TEXT NOT NULL,
      confidence REAL,
      sensor_summary_json TEXT,
      medical_summary_json TEXT,
      responder_id TEXT,
      responder_name TEXT,
      responder_org TEXT,
      acknowledged_at TEXT,
      responding_at TEXT,
      on_scene_at TEXT,
      resolved_at TEXT,
      cancelled_at TEXT,
      cancellation_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incident_status_logs (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      changed_by TEXT,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(incident_id) REFERENCES incidents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      incident_id TEXT,
      recipient_name TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      provider TEXT NOT NULL,
      sent_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scan_events (
      id TEXT PRIMARY KEY,
      tag_id TEXT NOT NULL,
      scanned_at TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      location_name TEXT,
      ip_address TEXT,
      user_agent TEXT
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Safe runtime migrations for notification metadata
  try { sqlite.exec(`ALTER TABLE notifications ADD COLUMN provider_message_id TEXT;`); } catch (_) {}
  try { sqlite.exec(`ALTER TABLE notifications ADD COLUMN error TEXT;`); } catch (_) {}

  seedIfEmpty();
}

function seedIfEmpty() {
  const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Already initialized
  }

  console.log('🌱 Seeding initial Golden Hours database with realistic SIH demo dataset...');

  const demoHash = bcrypt.hashSync('demo123', 10);
  const now = new Date().toISOString();
  const pastDate = new Date(Date.now() - 30 * 86400000).toISOString();

  // 1. Seed Demo Rider Profile
  const riderId = 'user-rider-demo-01';
  sqlite.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(riderId, 'Emergency Rider', 'rider@goldenhour.org', '+919876543210', demoHash, 'rider', pastDate);

  const profileId = 'profile-demo-01';
  sqlite.prepare(`
    INSERT INTO profiles (
      id, user_id, tag_id, name, blood_group, allergies_json, conditions_json, medications_json,
      doctor_name, doctor_phone, insurance_provider, insurance_policy, organ_donor, emergency_instructions, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId,
    riderId,
    'GH-7749',
    'Emergency Rider',
    'O+',
    JSON.stringify(['Penicillin', 'Sulfa drugs']),
    JSON.stringify(['Mild Asthma (carries inhaler)', 'No heart conditions']),
    JSON.stringify(['Salbutamol Inhaler (PRN)', 'Multivitamin']),
    'Dr. K. Sharma (Cardiologist)',
    '+919811100222',
    'Star Health & Allied Insurance',
    'SH-MED-8899201-DEL',
    1,
    'Carries asthma inhaler in jacket pocket. Wears contact lenses. Helmet fitted with Golden Hours Emergency QR.',
    pastDate,
    now
  );

  sqlite.prepare(`
    INSERT INTO emergency_contacts (id, profile_id, name, phone, relationship, priority, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('contact-01', profileId, 'Primary ICE Contact', '+919876543211', 'Spouse', 1, 1, pastDate);

  sqlite.prepare(`
    INSERT INTO emergency_contacts (id, profile_id, name, phone, relationship, priority, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('contact-02', profileId, 'Dr. K. Sharma', '+919876543212', 'Physician', 2, 0, pastDate);

  // 2. Seed Demo Responder Captain Suresh Rao
  const responderId = 'user-responder-demo-01';
  sqlite.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(responderId, 'Captain Suresh Rao', 'responder@goldenhour.org', '+919811122233', demoHash, 'responder', pastDate);

  // 3. Seed Secondary Rider Priya Patel
  const rider2Id = 'user-rider-demo-02';
  sqlite.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(rider2Id, 'Priya Patel', 'priya@goldenhour.org', '+919822233344', demoHash, 'rider', pastDate);

  const profile2Id = 'profile-demo-02';
  sqlite.prepare(`
    INSERT INTO profiles (
      id, user_id, tag_id, name, blood_group, allergies_json, conditions_json, medications_json,
      doctor_name, doctor_phone, insurance_provider, insurance_policy, organ_donor, emergency_instructions, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profile2Id,
    rider2Id,
    'GH-9102',
    'Priya Patel',
    'B+',
    JSON.stringify(['NSAIDs / Ibuprofen', 'Peanuts']),
    JSON.stringify(['Type-1 Diabetes (Insulin dependent)']),
    JSON.stringify(['Insulin Glargine 12U QPM']),
    'Dr. Anita Sen (Endocrinologist)',
    '+919822299881',
    'HDFC ERGO Health',
    'POL-DIA-77441-BLR',
    1,
    'Patient has hypoglycemia risk. Glucagon kit in backpack.',
    pastDate,
    now
  );

  sqlite.prepare(`
    INSERT INTO emergency_contacts (id, profile_id, name, phone, relationship, priority, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('contact-03', profile2Id, 'Nikhil Patel', '+919822233355', 'Brother', 1, 1, pastDate);

  // 4. Seed an Active Incident (Priya Patel, near India Gate, New Delhi)
  const incidentId = 'alert-sample-01';
  sqlite.prepare(`
    INSERT INTO incidents (
      id, rider_id, rider_name, rider_phone, tag_id, latitude, longitude, location_accuracy, location_name,
      is_simulated, status, detection_type, confidence, sensor_summary_json, medical_summary_json,
      responder_id, responder_name, responder_org, acknowledged_at, responding_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    incidentId,
    rider2Id,
    'Priya Patel',
    '+919822233344',
    'GH-9102',
    28.6139,
    77.2090,
    15.4,
    'Near India Gate Hexagon, Central New Delhi',
    1,
    'acknowledged',
    'threshold_impact',
    0.93,
    JSON.stringify({ peakG: 4.6, maxJerk: 24.2, tiltAngleDelta: 68.0, speedEstimateKmh: 42 }),
    JSON.stringify({
      bloodGroup: 'B+',
      allergies: ['NSAIDs / Ibuprofen', 'Peanuts'],
      medicalConditions: ['Type-1 Diabetes (Insulin dependent)'],
      emergencyContacts: [{ name: 'Nikhil Patel', phone: '+919822233355', relationship: 'Brother' }]
    }),
    responderId,
    'Captain Suresh Rao',
    'Delhi Central Quick Trauma Dispatch',
    new Date(Date.now() - 10 * 60000).toISOString(),
    null,
    new Date(Date.now() - 15 * 60000).toISOString(),
    now
  );

  sqlite.prepare(`
    INSERT INTO incident_status_logs (id, incident_id, previous_status, new_status, changed_by, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('log-01', incidentId, 'pending', 'acknowledged', 'Captain Suresh Rao', 'Incident confirmed via kinetic telemetry; dispatch notified.', new Date(Date.now() - 10 * 60000).toISOString());

  // 5. Seed realistic scan events for GH-7749
  sqlite.prepare(`
    INSERT INTO scan_events (id, tag_id, scanned_at, latitude, longitude, location_name, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('scan-01', 'GH-7749', new Date(Date.now() - 3 * 3600000).toISOString(), 28.6139, 77.2090, 'Connaught Place Outer Circle, New Delhi', '103.21.124.5', 'Mobile Safari / iOS 17.5');

  sqlite.prepare(`
    INSERT INTO scan_events (id, tag_id, scanned_at, latitude, longitude, location_name, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('scan-02', 'GH-7749', new Date(Date.now() - 18 * 3600000).toISOString(), 12.9279, 77.6771, 'Outer Ring Road, Bellandur, Bengaluru', '49.36.112.89', 'Chrome Mobile / Android 14');

  console.log('✅ SQLite Database initialized and seeded successfully.');
}
