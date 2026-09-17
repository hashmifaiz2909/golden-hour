import { db } from '../models/store.js';
import { config } from '../config/index.js';
import bcrypt from 'bcryptjs';

const BACKEND_URL = 'http://localhost:5050';
const FRONTEND_URL = 'http://localhost:3000';

async function test(name: string, fn: () => Promise<void>) {
  process.stdout.write(`• ${name}... `);
  try {
    await fn();
    console.log('✅ PASSED');
  } catch (err: any) {
    console.log('❌ FAILED');
    console.error('  Error:', err.message || err);
    throw err;
  }
}

async function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function run() {
  console.log('===============================================================');
  console.log('       GOLDEN HOUR — FULL END-TO-END VERIFICATION SUITE       ');
  console.log('===============================================================\n');

  // 1. Test Incorrect Password
  await test('Login with incorrect password returns 401 and generic error', async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@goldenhour.org', password: 'WrongPassword999!' })
    });
    const data = await res.json();
    await assert(res.status === 401, `Expected 401, got ${res.status}`);
    await assert(data.error === 'Invalid email or password.', `Unexpected error msg: ${data.error}`);
  });

  // 2. Test Correct Password for Default Rider
  await test('Login with correct password returns 200 and JWT session', async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@goldenhour.org', password: 'demo123' })
    });
    const data = await res.json();
    await assert(res.status === 200, `Expected 200, got ${res.status}`);
    await assert(typeof data.token === 'string' && data.token.length > 20, 'Missing JWT token');
    await assert(data.user.email === 'rider@goldenhour.org', 'User email mismatch');
  });

  // 3. Test Duplicate Signup Rejection
  await test('Signup with duplicate email returns 409 conflict', async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Rider',
        email: 'rider@goldenhour.org',
        password: 'Password123!',
        role: 'rider'
      })
    });
    const data = await res.json();
    await assert(res.status === 409, `Expected 409, got ${res.status}`);
    await assert(data.error === 'User with this email already exists.', `Unexpected message: ${data.error}`);
  });

  // 4. Test Seeded Rider Accounts & Recreated Account
  const testAccounts = [
    { email: 'alex.rider@goldenhour.org', pass: 'GoldenHour2026!', name: 'Alex Rivera' },
    { email: 'sarah.rider@goldenhour.org', pass: 'GoldenHour2026!', name: 'Sarah Chen' },
    { email: 'rahul.rider@goldenhour.org', pass: 'GoldenHour2026!', name: 'Rahul Verma' },
    { email: 'hashmifaiz2909@gmail.com', pass: 'GoldenHour2026!', name: 'Faiz Hashmi' }
  ];

  for (const acc of testAccounts) {
    await test(`Account login: ${acc.email} (${acc.name})`, async () => {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.pass })
      });
      const data = await res.json();
      await assert(res.status === 200, `Expected 200, got ${res.status}`);
      await assert(typeof data.token === 'string', 'Missing token');
      await assert(data.user.email === acc.email, `Email mismatch: ${data.user.email}`);
    });
  }

  // 5. Test Forgot Password Token Flow & Response Hygiene (No devToken leak)
  await test('Forgot-password endpoint: clean response & database token lifecycle', async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@goldenhour.org' })
    });
    const data = await res.json();
    await assert(res.status === 200, `Expected 200, got ${res.status}`);
    await assert(
      data.message === 'If an account exists with this email, a password reset link has been sent.',
      'Message mismatch'
    );
    await assert(!data._devToken, 'CRITICAL SECURITY: _devToken must NOT leak in API response!');

    // Fetch token directly from secure backend DB to verify lifecycle
    const user = db.getUserByEmail('rider@goldenhour.org');
    await assert(!!user, 'Rider not found in DB');
    const latestToken = db.getLatestPasswordResetTokenByUserId(user!.id);
    await assert(!!latestToken, 'Token was not inserted into database');

    // Verify token endpoint
    const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify-reset-token?token=${latestToken!.token}`);
    const verifyData = await verifyRes.json();
    await assert(verifyRes.status === 200 && verifyData.valid === true, 'Token failed verification');

    // Reset password to temporary new pass
    const newPass = 'SuiteVerifiedPass#2026';
    const resetRes = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: latestToken!.token, password: newPass })
    });
    const resetData = await resetRes.json();
    await assert(resetRes.status === 200, `Reset failed: ${resetData.error}`);

    // Verify login with new pass
    const newLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@goldenhour.org', password: newPass })
    });
    await assert(newLoginRes.status === 200, 'Login with new reset password failed');

    // Restore original password
    const salt = await bcrypt.genSalt(10);
    const originalHash = await bcrypt.hash('demo123', salt);
    db.updateUserPassword(user!.id, originalHash);
  });

  // 6. Test PWA Web Manifest & Service Worker
  await test('PWA Web Manifest is served with standalone display & icons', async () => {
    const res = await fetch(`${FRONTEND_URL}/manifest.webmanifest`);
    await assert(res.status === 200, `Expected 200, got ${res.status}`);
    const manifest = await res.json();
    await assert(manifest.name.includes('Golden Hour'), `Unexpected name: ${manifest.name}`);
    await assert(manifest.display === 'standalone', `Display mode is not standalone: ${manifest.display}`);
    await assert(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'Manifest missing icons');
  });

  await test('PWA Service Worker script (sw.js) is served', async () => {
    const res = await fetch(`${FRONTEND_URL}/sw.js`);
    await assert(res.status === 200, `Expected 200, got ${res.status}`);
    const text = await res.text();
    await assert(text.includes('workbox') || text.includes('precache'), 'Invalid SW content');
  });

  await test('PWA App Icons are valid image assets', async () => {
    const icon192 = await fetch(`${FRONTEND_URL}/pwa-192x192.png`);
    const icon512 = await fetch(`${FRONTEND_URL}/pwa-512x512.png`);
    await assert(icon192.status === 200, 'Missing 192x192 icon');
    await assert(icon512.status === 200, 'Missing 512x512 icon');
  });

  console.log('\n===============================================================');
  console.log('       ALL END-TO-END AUTOMATED CHECKS PASSED (10/10)        ');
  console.log('===============================================================\n');
}

run().catch(() => {
  process.exit(1);
});
