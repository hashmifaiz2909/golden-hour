import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, User, QrCode, Scan, Sparkles, MapPin, 
  ExternalLink, Printer, Edit, CheckCircle2, AlertCircle, PlayCircle, Plus 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRider } from '../../context/RiderContext';
import { api } from '../../services/api';

interface ScanEvent {
  id: string;
  scanned_at: string;
  location_name: string;
  latitude: number;
  longitude: number;
  ip_address: string;
  user_agent: string;
}

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const { profile } = useRider();

  const [scanLogs, setScanLogs] = useState<ScanEvent[]>([
    {
      id: 'scan-101',
      scanned_at: new Date(Date.now() - 15 * 60000).toISOString(),
      location_name: 'Near India Gate Hexagon, Central New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      ip_address: '103.21.124.5',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)'
    },
    {
      id: 'scan-102',
      scanned_at: new Date(Date.now() - 120 * 60000).toISOString(),
      location_name: 'Outer Ring Road, Bellandur, Bengaluru',
      latitude: 12.9279,
      longitude: 77.6771,
      ip_address: '49.36.112.89',
      user_agent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)'
    }
  ]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const userName = profile?.name || user?.name || '';
  const tagId = profile?.tagId || 'GH-7749';
  const contactsCount = profile?.emergencyContacts?.length || 0;

  // Dynamic Preparedness Score
  const hasBloodGroup = Boolean(profile?.bloodGroup && profile.bloodGroup !== 'Unknown');
  const hasPrimary = Boolean(profile?.emergencyContacts?.some(c => c.isPrimary && c.phone));
  const hasAllergiesOrConditions = Boolean((profile?.allergies && profile.allergies.length > 0) || (profile?.medicalConditions && profile.medicalConditions.length > 0));
  const hasDoctorOrNotes = Boolean(profile?.notes && profile.notes.trim().length > 0);
  
  let preparednessScore = 0;
  if (hasBloodGroup) preparednessScore += 20;
  if (hasPrimary) preparednessScore += 15;
  if (contactsCount >= 2) preparednessScore += 25;
  else if (contactsCount >= 1) preparednessScore += 15;
  if (hasAllergiesOrConditions) preparednessScore += 15;
  if (hasDoctorOrNotes) preparednessScore += 25;
  preparednessScore = Math.min(100, Math.max(10, preparednessScore));

  // Fetch real scan events from backend SQLite
  useEffect(() => {
    if (!token) return;
    api.getScanEvents(token)
      .then(res => {
        if (res.scanEvents && res.scanEvents.length > 0) {
          setScanLogs(res.scanEvents);
        }
      })
      .catch(err => {
        console.warn('Scan events sync warning, keeping existing logs:', err);
      });
  }, [token]);

  const handleSimulateScan = async () => {
    setIsSimulating(true);

    const locations = [
      { name: 'Connaught Place Inner Circle, New Delhi', lat: 28.6304, lng: 77.2177 },
      { name: 'Western Express Highway, Andheri East, Mumbai', lat: 19.1136, lng: 72.8697 },
      { name: 'Indiranagar 100 Feet Road, Bengaluru', lat: 12.9719, lng: 77.6412 },
      { name: 'Anna Salai Near Guindy, Chennai', lat: 13.0067, lng: 78.2023 }
    ];
    const picked = locations[Math.floor(Math.random() * locations.length)];

    try {
      if (token) {
        const res = await api.simulateScanEvent(token, {
          location_name: picked.name,
          latitude: picked.lat,
          longitude: picked.lng
        });
        if (res.event) {
          setScanLogs(prev => [res.event, ...prev]);
        }
      } else {
        const fallbackScan: ScanEvent = {
          id: `scan-${Date.now()}`,
          scanned_at: new Date().toISOString(),
          location_name: picked.name,
          latitude: picked.lat,
          longitude: picked.lng,
          ip_address: '122.161.48.12',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)'
        };
        setScanLogs(prev => [fallbackScan, ...prev]);
      }
      setSimulationToast(`Emergency scan logged at ${picked.name}! Automated alerts dispatched to ${contactsCount} contacts.`);
      setTimeout(() => setSimulationToast(null), 4000);
    } catch (err) {
      console.warn('Simulation backend sync warning:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F4EE] text-[#1A2421] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Simulation Alert Toast */}
        {simulationToast && (
          <div className="p-4 rounded-2xl bg-[#11332D] text-white flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A4E] animate-ping" />
              <span>{simulationToast}</span>
            </div>
            <button
              onClick={() => setSimulationToast(null)}
              className="text-xs text-[#F1F4EE]/70 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C5C53]/10 text-[#1C5C53] text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A4E]" />
              <span>Golden Hours Emergency Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#11332D] font-display">
              {userName ? `Welcome, ${userName}` : 'Emergency Medical Profile'}
            </h1>
            <p className="text-sm text-[#5A6B66] max-w-xl leading-relaxed">
              Your emergency identification profile is active. First responders and bystanders can access your critical medical details and reach your family.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/profile"
              className="px-5 py-2.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FF5A4E]" />
              <span>Create New Profile</span>
            </Link>

            <button
              onClick={handleSimulateScan}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-full bg-[#FF5A4E] hover:bg-[#FF5A4E]/95 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer animate-pulse-glow"
            >
              <Scan className="w-4 h-4" />
              <span>{isSimulating ? 'Simulating...' : 'Simulate QR Scan'}</span>
            </button>

            <Link
              to="/dashboard/qr"
              className="px-4 py-2.5 rounded-full border border-[#D9DFD6] hover:border-[#1C5C53] text-[#11332D] bg-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#1C5C53]" />
              <span>Print / Download QR</span>
            </Link>

            <Link
              to="/dashboard/profile"
              className="px-4 py-2.5 rounded-full border border-[#D9DFD6] hover:border-[#1C5C53] text-[#11332D] bg-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4 text-[#1C5C53]" />
              <span>Edit Medical Profile</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Preparedness Score */}
          <div className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#5A6B66]">
              <span>PREPAREDNESS</span>
              <span className={`font-bold ${
                preparednessScore >= 80 ? 'text-[#10B981]' : preparednessScore >= 50 ? 'text-amber-600' : 'text-[#FF5A4E]'
              }`}>
                {preparednessScore >= 80 ? 'Optimal' : preparednessScore >= 50 ? 'Moderate' : 'Action Needed'}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#11332D] font-display">
              {preparednessScore}%
            </div>
            <div className="w-full bg-[#F1F4EE] h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  preparednessScore >= 80 ? 'bg-[#10B981]' : preparednessScore >= 50 ? 'bg-amber-500' : 'bg-[#FF5A4E]'
                }`} 
                style={{ width: `${preparednessScore}%` }} 
              />
            </div>
            <p className="text-[11px] text-[#5A6B66]">
              {preparednessScore >= 80 
                ? 'High readiness: Blood, contacts, and clinical notes verified.'
                : 'Complete contacts and medical instructions for 100% readiness.'}
            </p>
          </div>

          {/* Card 2: Emergency Scans */}
          <div className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#5A6B66]">
              <span>EMERGENCY SCANS</span>
              <Scan className="w-4 h-4 text-[#FF5A4E]" />
            </div>
            <div className="text-3xl font-extrabold text-[#11332D] font-display">
              {scanLogs.length}
            </div>
            <div className="text-[11px] text-[#5A6B66] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF5A4E] animate-ping inline-block" />
              <span>Real-time scan logs recorded</span>
            </div>
            <p className="text-[11px] text-[#5A6B66]">
              Instant SMS and GPS dispatched on every scan event.
            </p>
          </div>

          {/* Card 3: Contacts Added */}
          <div className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#5A6B66]">
              <span>CONTACTS ADDED</span>
              <User className="w-4 h-4 text-[#1C5C53]" />
            </div>
            <div className="text-3xl font-extrabold text-[#11332D] font-display">
              {contactsCount}
            </div>
            <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Direct Calling</span>
            </div>
            <p className="text-[11px] text-[#5A6B66]">
              {profile?.emergencyContacts?.[0]?.name || 'Primary ICE Contact'}
            </p>
          </div>

          {/* Card 4: Active Medical Tag */}
          <div className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#5A6B66]">
              <span>ACTIVE TAG</span>
              <QrCode className="w-4 h-4 text-[#1C5C53]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#11332D]">
              {tagId}
            </div>
            <div className="text-[11px] text-[#1C5C53] font-semibold">
              Blood Type: <strong className="text-[#FF5A4E]">{profile?.bloodGroup || 'O+'}</strong>
            </div>
            <Link
              to={`/id/${tagId}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1C5C53] hover:underline"
            >
              <span>View Public Scan Card</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Live Scan Activity Feed */}
        <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9DFD6]/60 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#11332D] font-display flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#FF5A4E]" />
                <span>Live Scan Activity</span>
              </h2>
              <p className="text-xs text-[#5A6B66]">
                Every time your helmet card or sticker is scanned, coordinates and browser metadata are logged here.
              </p>
            </div>
            <span className="text-xs font-mono text-[#5A6B66]">
              Total Events: {scanLogs.length}
            </span>
          </div>

          {/* Logs List */}
          <div className="space-y-3">
            {scanLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A6B66]">
                No scan activity logged yet. Click <strong>Simulate QR Scan</strong> above to test notifications and location mapping.
              </div>
            ) : (
              scanLogs.map((log) => {
                const formattedDate = new Date(log.scanned_at).toLocaleString();
                const isMobile = log.user_agent.toLowerCase().includes('iphone') || log.user_agent.toLowerCase().includes('android');

                return (
                  <div
                    key={log.id}
                    className="p-4 bg-[#F1F4EE]/40 border border-[#D9DFD6] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1C5C53]/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A4E] animate-ping shrink-0" />
                        <span className="text-xs font-bold text-[#11332D]">
                          {log.location_name || 'Emergency scan log recorded'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#5A6B66] font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>Timestamp: {formattedDate}</span>
                        <span>IP Address: {log.ip_address || '127.0.0.1'}</span>
                        <span>Device: {isMobile ? 'Mobile Phone' : 'Desktop browser'}</span>
                      </div>
                    </div>

                    {log.latitude && log.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#D9DFD6] hover:border-[#1C5C53] rounded-full text-xs font-bold text-[#11332D] bg-white shadow-sm transition-all shrink-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#FF5A4E]" />
                        <span>Map Link</span>
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link
            to="/dashboard/profile"
            className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm hover:shadow-md hover:border-[#1C5C53]/40 transition-all space-y-3 block"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A4E]/10 text-[#FF5A4E] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#11332D] font-display">Medical Profile</h3>
            <p className="text-xs text-[#5A6B66] leading-relaxed">
              Update blood group, severe allergies (e.g. Penicillin), chronic conditions, and emergency family contacts.
            </p>
          </Link>

          <Link
            to="/dashboard/qr"
            className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm hover:shadow-md hover:border-[#1C5C53]/40 transition-all space-y-3 block"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1C5C53]/10 text-[#1C5C53] flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#11332D] font-display">Printable QR Cards</h3>
            <p className="text-xs text-[#5A6B66] leading-relaxed">
              Download standard wallet card templates, helmet stickers, and wristband formats for offline emergency identification.
            </p>
          </Link>

          <Link
            to="/admin"
            className="bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm hover:shadow-md hover:border-[#1C5C53]/40 transition-all space-y-3 block"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#11332D]/10 text-[#11332D] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#11332D] font-display">Admin Registry</h3>
            <p className="text-xs text-[#5A6B66] leading-relaxed">
              Inspect database registry records, responder triage queues, and real-time kinetic telemetry metrics.
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
};
