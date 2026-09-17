import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, Activity, QrCode, User, AlertOctagon, HeartPulse, 
  MapPin, Phone, CheckCircle2, AlertTriangle, Play, Square, 
  Settings, History, ChevronRight, Send, Check, RefreshCw, Radio
} from 'lucide-react';
import { useRider } from '../../context/RiderContext';
import { useAuth } from '../../context/AuthContext';
import { TelemetryGraph } from '../../components/sensor/TelemetryGraph';
import { CrashCountdownModal } from '../../components/sensor/CrashCountdownModal';
import { AlertStatusBadge } from '../../components/common/AlertStatusBadge';

export const MobileAppPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    profile, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    liveReading, 
    latestEval, 
    showCrashModal, 
    countdown, 
    lastAlert, 
    thresholdConfig, 
    updateThresholdConfig,
    iosPermissionState,
    requestIosPermission,
    cancelCrashEvent, 
    confirmCrashNow, 
    simulateImpact, 
    simulateBraking, 
    simulatePothole,
    triggerEmergencyAlert,
    updateProfile,
    resetAlertState
  } = useRider();

  const [activeTab, setActiveTab] = useState<'home' | 'monitor' | 'profile' | 'qr' | 'history'>('home');
  const [editProfileForm, setEditProfileForm] = useState({
    name: profile?.name || user?.name || 'Emergency User',
    bloodGroup: profile?.bloodGroup || 'O+',
    allergies: profile?.allergies?.join(', ') || 'Penicillin, Sulfa drugs',
    medicalConditions: profile?.medicalConditions?.join(', ') || 'Mild Asthma (carries inhaler)',
    contactName: profile?.emergencyContacts?.[0]?.name || 'Primary ICE Contact',
    contactPhone: profile?.emergencyContacts?.[0]?.phone || '+919876543211',
    contactRel: profile?.emergencyContacts?.[0]?.relationship || 'Spouse'
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Sync initial profile values
  React.useEffect(() => {
    if (profile) {
      setEditProfileForm({
        name: profile.name,
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies.join(', '),
        medicalConditions: profile.medicalConditions.join(', '),
        contactName: profile.emergencyContacts[0]?.name || '',
        contactPhone: profile.emergencyContacts[0]?.phone || '',
        contactRel: profile.emergencyContacts[0]?.relationship || ''
      });
    }
  }, [profile]);

  // Auto-start safety monitoring when permission is permitted (Android / Desktop / granted iOS)
  React.useEffect(() => {
    if ((iosPermissionState === 'not_required' || iosPermissionState === 'granted') && !isMonitoring) {
      console.log('[MobileAppPage] Auto-starting safety monitoring on ride screen mount.');
      startMonitoring();
    }
  }, [iosPermissionState, isMonitoring, startMonitoring]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: editProfileForm.name,
      bloodGroup: editProfileForm.bloodGroup as any,
      allergies: editProfileForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      medicalConditions: editProfileForm.medicalConditions.split(',').map(s => s.trim()).filter(Boolean),
      emergencyContacts: [
        {
          id: 'contact-primary',
          name: editProfileForm.contactName,
          phone: editProfileForm.contactPhone,
          relationship: editProfileForm.contactRel,
          isPrimary: true
        }
      ]
    });
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const currentTagId = profile?.tagId || 'GH-7749';
  const publicQrUrl = `${window.location.origin}/id/${currentTagId}`;

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex justify-center items-center">
      
      {/* 20-Second Emergency Crash Screen Modal */}
      <CrashCountdownModal
        isOpen={showCrashModal}
        countdown={countdown}
        onCancel={cancelCrashEvent}
        onConfirmNow={confirmCrashNow}
        peakG={latestEval?.peakMagnitudeG || 4.6}
      />

      {/* Realistic Smartphone Frame Simulator */}
      <div className="mobile-device-frame">
        
        {/* Phone Notch */}
        <div className="mobile-notch" />

        {/* Mobile Header / Status Bar */}
        <div className="pt-7 px-5 pb-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black tracking-tight flex items-center gap-1">
                GOLDEN HOUR
                <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded">APP</span>
              </div>
              <div className="text-[10px] text-slate-400">Rider Safety Monitor</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="text-slate-300 font-medium">{isMonitoring ? 'Protected' : 'Standby'}</span>
          </div>
        </div>

        {/* Mobile Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          
          {/* ALERT SENT STATE VIEW */}
          {lastAlert ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl bg-rose-600 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider">
                    <AlertOctagon className="w-5 h-5 animate-bounce" />
                    <span>Emergency Alert Sent</span>
                  </div>
                  <span className="text-[10px] bg-rose-700 px-2 py-0.5 rounded font-mono font-bold">
                    DISPATCHED
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black">Help is On The Way</h3>
                  <p className="text-xs text-rose-100">
                    Your GPS coordinates and emergency medical profile have been broadcast to the trauma command network and your family.
                  </p>
                </div>

                <div className="bg-rose-700/60 p-3 rounded-xl text-xs space-y-1.5 border border-rose-500/40">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lastAlert.locationName || 'GPS: 28.6139°, 77.2090°'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-200">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Emergency SMS Dispatched to {profile?.emergencyContacts?.[0]?.name || 'Family'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold">Status:</span>
                  <AlertStatusBadge status={lastAlert.status} size="sm" />
                </div>
              </div>

              {/* Reset / Return to Safe State */}
              <button
                onClick={resetAlertState}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Return to Active Monitoring</span>
              </button>
            </div>
          ) : null}

          {/* TAB 1: HOME DASHBOARD */}
          {!lastAlert && activeTab === 'home' && (
            <div className="space-y-4">
              
              {/* Protection Status Banner */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isMonitoring 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      {isMonitoring ? 'You Are Protected' : 'Monitoring Standby'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Golden Hours SafeRide v1.0</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMonitoring 
                    ? 'Accelerometer & Gyroscope sensors are streaming. Sudden kinetic impacts trigger a 20s confirmation safeguard.'
                    : 'Turn on safety monitoring before you begin riding to enable automatic crash detection.'}
                </p>
                <div className="mt-3">
                  {iosPermissionState === 'prompt' ? (
                    <div className="space-y-2">
                      <button
                        onClick={requestIosPermission}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Enable Crash Detection (iOS Motion)</span>
                      </button>
                      <p className="text-[10px] text-slate-500 text-center">
                        Tap to allow Apple Safari motion sensor access for crash detection.
                      </p>
                    </div>
                  ) : iosPermissionState === 'denied' ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900">
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                        <span>Motion Sensors Blocked</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-700">
                        To enable automatic crash detection on iPhone: Open <strong>Settings &gt; Safari &gt; Motion &amp; Orientation Access</strong> (turn ON), then reload this page.
                      </p>
                    </div>
                  ) : isMonitoring ? (
                    <button
                      onClick={stopMonitoring}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Pause Monitoring</span>
                    </button>
                  ) : (
                    <button
                      onClick={startMonitoring}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Safety Monitoring</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Checklist Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Sensors</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Accel + Gyro Active</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">GPS Tracking</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>Ready (High Acc)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Medical ID</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>{profile?.bloodGroup || 'O+'} Verified</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Contacts</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{profile?.emergencyContacts?.length || 2} Connected</span>
                  </div>
                </div>
              </div>

              {/* QR Medical Tag Preview Shortcut */}
              <div 
                onClick={() => setActiveTab('qr')}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Helmet QR Tag: {currentTagId}</div>
                    <div className="text-[11px] text-slate-500">Tap to display bystander emergency QR code</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* EMERGENCY MANUAL SOS BUTTON */}
              <div className="pt-2">
                <button
                  onClick={() => triggerEmergencyAlert('manual_sos')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <AlertOctagon className="w-5 h-5" />
                  <span>EMERGENCY SOS DISPATCH</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-1">
                  Transmits immediate GPS distress alert & notifies emergency contacts.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: SAFETY MONITORING & TELEMETRY */}
          {!lastAlert && activeTab === 'monitor' && (
            <div className="space-y-4">
              
              {/* Telemetry Live Waveform & Gauges */}
              <TelemetryGraph liveReading={liveReading} latestEval={latestEval} />

              {/* Configurable Sensitivity / Threshold */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Impact Threshold</span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {thresholdConfig.impactGThreshold}G ({((thresholdConfig.impactGThreshold || 3.8) * 9.8).toFixed(0)} m/s²)
                  </span>
                </div>
                <input
                  type="range"
                  min="2.5"
                  max="6.0"
                  step="0.1"
                  value={thresholdConfig.impactGThreshold}
                  onChange={(e) => updateThresholdConfig({ impactGThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sensitive (2.5G)</span>
                  <span>Default (3.8G)</span>
                  <span>Severe (6.0G)</span>
                </div>
              </div>

              {/* Interactive Simulation Triggers */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Emergency Demo Simulator</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    TEST MODE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Test kinetic detection filters and the 20-second "Are You OK?" safeguard:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={simulateBraking}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Hard Braking (~1.7G)
                  </button>
                  <button
                    onClick={simulatePothole}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Pothole Bump (~2.2G)
                  </button>
                </div>

                <button
                  onClick={simulateImpact}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>SIMULATE SUDDEN IMPACT (4.8G)</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: MEDICAL PROFILE EDITOR */}
          {!lastAlert && activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Medical & Emergency Profile
                  </h3>
                  <span className="text-[10px] font-mono bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold">
                    {currentTagId}
                  </span>
                </div>

                {profileSaveSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Profile saved and synced to QR tag successfully.</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Blood Group</label>
                  <select
                    value={editProfileForm.bloodGroup}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Allergies */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Known Allergies (Comma separated)</label>
                  <input
                    type="text"
                    value={editProfileForm.allergies}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, allergies: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Penicillin, Sulfa, Peanuts"
                  />
                </div>

                {/* Conditions */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Medical Conditions</label>
                  <input
                    type="text"
                    value={editProfileForm.medicalConditions}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, medicalConditions: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Asthma, Diabetes, Hypertension"
                  />
                </div>

                {/* Primary Emergency Contact */}
                <div className="pt-2 border-t space-y-2">
                  <div className="text-[11px] font-bold text-slate-800">Primary Emergency Contact</div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editProfileForm.contactName}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, contactName: e.target.value })}
                      placeholder="Contact Name"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      required
                    />
                    <input
                      type="text"
                      value={editProfileForm.contactRel}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, contactRel: e.target.value })}
                      placeholder="Relationship"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <input
                    type="tel"
                    value={editProfileForm.contactPhone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, contactPhone: e.target.value })}
                    placeholder="Phone Number (+91...)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: MY QR CODE */}
          {!lastAlert && activeTab === 'qr' && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                  Emergency Bystander QR Tag
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-mono">
                  {currentTagId}
                </h3>
                <p className="text-xs text-slate-500">
                  Stick this QR on your helmet or fuel tank. In an accident, any bystander can scan to access your blood group and emergency contacts.
                </p>
              </div>

              {/* Dynamic SVG QR Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <QRCodeSVG
                  value={publicQrUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`/id/${currentTagId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Preview Public QR Web View (/id/{currentTagId})
                </a>
                <p className="text-[10px] text-slate-400">
                  🔒 Zero login required for bystanders. Private data strictly redacted.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Mobile Navigation Tabs */}
        <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-slate-500">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              activeTab === 'home' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              activeTab === 'monitor' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Sensors</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              activeTab === 'qr' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>My QR</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              activeTab === 'profile' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
};
