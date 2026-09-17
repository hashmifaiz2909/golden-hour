import twilio from 'twilio';
import { config } from '../config/index.js';
import { notificationService } from '../services/notificationService.js';
import { db, Alert } from '../models/store.js';

async function main() {
  console.log('========================================================');
  console.log('🚨 GOLDEN HOUR — TWILIO VOICE & WHATSAPP VERIFIER 🚨');
  console.log('========================================================\n');

  console.log('Configuration State:');
  console.log(`- TWILIO_ACCOUNT_SID:   ${config.twilio.accountSid ? `${config.twilio.accountSid.slice(0, 8)}...` : '(NOT SET)'}`);
  console.log(`- TWILIO_AUTH_TOKEN:     ${config.twilio.authToken ? '********' : '(NOT SET)'}`);
  console.log(`- TWILIO_FROM_PHONE:     ${config.twilio.fromPhone || '(NOT SET)'}`);
  console.log(`- TWILIO_WHATSAPP_FROM:  ${config.twilio.whatsappFrom || '(NOT SET)'}`);
  console.log(`- MOCK_NOTIFICATIONS:    ${config.mockNotifications}\n`);

  const hasPlaceholders = 
    !config.twilio.accountSid ||
    config.twilio.accountSid.includes('paste') ||
    config.twilio.accountSid.includes('xxx') ||
    !config.twilio.authToken ||
    config.twilio.authToken.includes('paste');

  if (hasPlaceholders) {
    console.log('⚠️  Twilio credentials are not yet populated or contain placeholder text in .env.');
    console.log('   Please provide real credentials in .env or pass them as parameters:');
    console.log('   TWILIO_ACCOUNT_SID=AC...');
    console.log('   TWILIO_AUTH_TOKEN=...');
    console.log('   TWILIO_FROM_PHONE=+1...');
    console.log('   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886\n');
    console.log('Running simulated verification instead to ensure pipeline integrity...');
  }

  // Get recipient phone from CLI argument or demo database
  const cliPhone = process.argv[2];
  const demoProfile = db.getAllProfiles()[0];
  const targetPhone = cliPhone || demoProfile?.emergencyContacts?.[0]?.phone || '+919876543210';
  const targetName = demoProfile?.emergencyContacts?.[0]?.name || 'Primary Emergency Contact';

  console.log(`🎯 Test Target: ${targetName} (${targetPhone})`);

  const testAlert: Alert = {
    id: `alert-test-${Date.now().toString().slice(-6)}`,
    riderId: 'user-test-01',
    riderName: 'Faiz Hashmi',
    tagId: 'GH-TEST-2026',
    latitude: 28.6139,
    longitude: 77.2090,
    locationName: 'Connaught Place, New Delhi',
    timestamp: new Date().toISOString(),
    status: 'pending',
    detectionType: 'threshold_impact',
    confidence: 0.96,
    isSimulated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`\nDispatching full emergency protocol through notificationService...`);
  await notificationService.dispatchEmergencyAlerts({
    alert: testAlert,
    contacts: [{
      id: 'contact-test-1',
      name: targetName,
      phone: targetPhone,
      relationship: 'Primary ICE',
      isPrimary: true
    }]
  });

  console.log('\n========================================================');
  console.log('📋 LATEST NOTIFICATION LOG ENTRIES IN LOCAL DB');
  console.log('========================================================');
  const recentLogs = db.getNotificationsByAlertId(testAlert.id);
  console.table(recentLogs.map(l => ({
    Type: l.type,
    Recipient: l.recipientPhone,
    Status: l.status,
    Provider: l.provider,
    MessageId: l.providerMessageId || 'N/A',
    Error: l.error || 'None'
  })));

  if (config.twilio.enabled && !hasPlaceholders) {
    const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    const callLog = recentLogs.find(l => l.type === 'call' && l.providerMessageId);
    const waLog = recentLogs.find(l => l.type === 'whatsapp' && l.providerMessageId);

    if (callLog?.providerMessageId) {
      try {
        console.log(`\n🔍 Fetching Live Call Status from Twilio API for SID: ${callLog.providerMessageId}...`);
        const liveCall = await client.calls(callLog.providerMessageId).fetch();
        console.log(`   Twilio Live Call Status: ${liveCall.status}`);
        console.log(`   Twilio Call Duration:    ${liveCall.duration || 'ringing/in-progress'}`);
        console.log(`   Twilio Call Price:       ${liveCall.price || 'free/trial'}`);
      } catch (e: any) {
        console.warn(`   Could not fetch live call SID: ${e.message}`);
      }
    }

    if (waLog?.providerMessageId) {
      try {
        console.log(`\n🔍 Fetching Live WhatsApp Status from Twilio API for SID: ${waLog.providerMessageId}...`);
        const liveMsg = await client.messages(waLog.providerMessageId).fetch();
        console.log(`   Twilio Live Message Status: ${liveMsg.status}`);
        console.log(`   Twilio Error Code:          ${liveMsg.errorCode || 'None'}`);
      } catch (e: any) {
        console.warn(`   Could not fetch live message SID: ${e.message}`);
      }
    }
  }

  console.log('\n✅ Test execution completed.');
}

main().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
