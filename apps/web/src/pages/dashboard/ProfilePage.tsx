import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, User, Phone, Shield, Plus, Trash2, CheckCircle2, 
  ArrowLeft, Save, AlertTriangle, Sparkles, RefreshCw, QrCode,
  Star, Check, FileText, Activity
} from 'lucide-react';
import { useRider } from '../../context/RiderContext';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile, createProfile } = useRider();

  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [tagId, setTagId] = useState(() => profile?.tagId || `GH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [fullName, setFullName] = useState(() => {
    const candidate = profile?.name || user?.name || '';
    return (candidate.includes('Aarav') || candidate.includes('Mehta') || candidate.includes('Emergency Rider')) ? '' : candidate;
  });
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(profile?.allergies?.join(', ') || '');
  const [conditions, setConditions] = useState(profile?.medicalConditions?.join(', ') || '');
  const [medications, setMedications] = useState(profile?.medications?.join(', ') || '');
  const [doctorName, setDoctorName] = useState(profile?.doctorName || '');
  const [doctorPhone, setDoctorPhone] = useState(profile?.doctorPhone || '');
  const [organDonor, setOrganDonor] = useState(profile?.organDonor !== undefined ? profile.organDonor : true);
  const [insuranceProvider, setInsuranceProvider] = useState(profile?.insuranceProvider || '');
  const [insurancePolicy, setInsurancePolicy] = useState(profile?.insurancePolicy || '');

  const [contacts, setContacts] = useState(
    profile?.emergencyContacts && profile.emergencyContacts.length > 0 && !profile.name?.includes('Aarav') && !profile.name?.includes('Mehta')
      ? profile.emergencyContacts
      : [
          { id: 'c1', name: '', phone: '', relationship: 'Family / ICE', isPrimary: true }
        ]
  );

  const [instructions, setInstructions] = useState(profile?.emergencyInstructions || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync state when profile loads initially if valid custom profile
  useEffect(() => {
    if (profile) {
      const isDemo = profile.name && (profile.name.includes('Aarav') || profile.name.includes('Emergency Rider') || profile.name.includes('Mehta'));
      if (!isDemo && profile.name) {
        setIsCreatingNew(false);
        setTagId(profile.tagId || `GH-${Math.floor(1000 + Math.random() * 9000)}`);
        setFullName(profile.name);
        setPhone(user?.phone || '');
        setBloodGroup(profile.bloodGroup || 'O+');
        setAllergies(profile.allergies?.join(', ') || '');
        setConditions(profile.medicalConditions?.join(', ') || '');
        setMedications(profile.medications?.join(', ') || '');
        setDoctorName(profile.doctorName || '');
        setDoctorPhone(profile.doctorPhone || '');
        setInsuranceProvider(profile.insuranceProvider || '');
        setInsurancePolicy(profile.insurancePolicy || '');
        setOrganDonor(profile.organDonor !== undefined ? profile.organDonor : true);

        if (profile.emergencyInstructions) {
          setInstructions(profile.emergencyInstructions);
        } else if (profile.notes) {
          const parts = profile.notes.split('|');
          if (parts[0] && !parts[0].includes('Doctor:') && !parts[0].includes('Insurance:')) {
            setInstructions(parts[0].trim());
          }
        }

        if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
          setContacts(profile.emergencyContacts);
        }
      } else {
        setIsCreatingNew(true);
      }
    }
  }, [profile, user]);

  const handleStartNewProfile = () => {
    const randomTag = `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    setIsCreatingNew(true);
    const cleanUserName = user?.name && !user.name.includes('Aarav') && !user.name.includes('Mehta') ? user.name : '';
    setFullName(cleanUserName);
    setPhone(user?.phone || '');
    setBloodGroup('O+');
    setAllergies('');
    setConditions('');
    setMedications('');
    setInstructions('');
    setDoctorName('');
    setDoctorPhone('');
    setOrganDonor(false);
    setInsuranceProvider('');
    setInsurancePolicy('');
    setContacts([
      { id: `c-${Date.now()}`, name: '', phone: '', relationship: 'Family / ICE', isPrimary: true }
    ]);
  };

  const handleLoadDemoProfile = () => {
    setIsCreatingNew(false);
    const randomTag = `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    setTagId(randomTag);
    setFullName(user?.name || '');
    setPhone(user?.phone || '+919876543210');
    setBloodGroup('O+');
    setAllergies('Penicillin, Sulfa drugs');
    setConditions('Mild Asthma (carries inhaler)');
    setMedications('Salbutamol Inhaler (PRN), Multivitamin');
    setInstructions('Do NOT remove helmet if neck trauma suspected. Asthmatic (inhaler in right jacket pocket).');
    setDoctorName('Dr. K. Sharma (Cardiologist)');
    setDoctorPhone('+919811100222');
    setOrganDonor(true);
    setInsuranceProvider('Star Health & Allied Insurance');
    setInsurancePolicy('SH-MED-8899201-DEL');
    setContacts([
      { id: 'c1', name: 'Primary ICE Contact', phone: '+919876543211', relationship: 'Spouse', isPrimary: true },
      { id: 'c2', name: 'Secondary ICE Contact', phone: '+919876543212', relationship: 'Family', isPrimary: false }
    ]);
  };

  const handleAddContact = () => {
    setContacts(prev => [
      ...prev,
      { id: `c-${Date.now()}`, name: '', phone: '', relationship: 'Family', isPrimary: prev.length === 0 }
    ]);
  };

  const handleRemoveContact = (id: string) => {
    setContacts(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleContactChange = (id: string, field: string, val: any) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleSetPrimary = (id: string) => {
    setContacts(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === id
    })));
  };

  // Dynamic Preparedness Score Calculation
  const validContacts = contacts.filter(c => c.phone.trim() && c.name.trim());
  const hasPrimaryContact = contacts.some(c => c.isPrimary && c.phone.trim());
  const scoreBreakdown = [
    { label: 'Blood Group Defined', met: Boolean(bloodGroup && bloodGroup !== 'Unknown'), weight: 20 },
    { label: 'Primary Contact Set', met: hasPrimaryContact, weight: 15 },
    { label: 'Multiple Contacts (2+)', met: validContacts.length >= 2, weight: 15 },
    { label: 'Allergies / Conditions Documented', met: Boolean(allergies.trim() || conditions.trim()), weight: 15 },
    { label: 'Doctor or Resuscitation Notes', met: Boolean(doctorName.trim() || instructions.trim()), weight: 15 },
    { label: 'Organ Donor or Insurance Policy', met: Boolean(organDonor || insurancePolicy.trim()), weight: 20 },
  ];
  const preparednessScore = scoreBreakdown.filter(item => item.met).reduce((acc, item) => acc + item.weight, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const notesParts: string[] = [];
    if (instructions.trim()) notesParts.push(instructions.trim());
    if (doctorName.trim() || doctorPhone.trim()) notesParts.push(`Doctor: ${doctorName || 'N/A'} (${doctorPhone || 'N/A'})`);
    if (insuranceProvider.trim() || insurancePolicy.trim()) notesParts.push(`Insurance: ${insuranceProvider || 'N/A'} (#${insurancePolicy || 'N/A'})`);
    notesParts.push(`Organ Donor: ${organDonor ? 'YES' : 'NO'}`);

    const payload = {
      tagId: tagId.trim().toUpperCase(),
      name: fullName.trim() || 'Emergency Profile',
      bloodGroup: bloodGroup as any,
      allergies: allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      medicalConditions: conditions ? conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      medications: medications ? medications.split(',').map(s => s.trim()).filter(Boolean) : [],
      doctorName: doctorName.trim(),
      doctorPhone: doctorPhone.trim(),
      insuranceProvider: insuranceProvider.trim(),
      insurancePolicy: insurancePolicy.trim(),
      organDonor,
      emergencyInstructions: instructions.trim(),
      emergencyContacts: contacts.filter(c => c.name.trim() || c.phone.trim()),
      notes: notesParts.join(' | ')
    };

    try {
      if (isCreatingNew) {
        await createProfile(payload);
        setIsCreatingNew(false);
        setSaveSuccess(`New Emergency Profile "${payload.name}" created with Tag ID ${payload.tagId}! Preparedness: ${preparednessScore}%`);
      } else {
        await updateProfile(payload);
        setSaveSuccess(`Emergency Profile "${payload.name}" updated successfully! Preparedness: ${preparednessScore}%`);
      }

      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      setSaveSuccess(`Profile saved locally with Tag ID ${payload.tagId}.`);
      setTimeout(() => setSaveSuccess(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F4EE] text-[#1A2421] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb / Back & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C5C53] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNewProfile}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isCreatingNew 
                  ? 'bg-[#FF5A4E] text-white ring-2 ring-[#FF5A4E]/30' 
                  : 'bg-white text-[#11332D] border border-[#D9DFD6] hover:border-[#1C5C53]'
              }`}
            >
              <Plus className="w-4 h-4 text-[#FF5A4E]" />
              <span>Create Brand New Profile</span>
            </button>

            <button
              type="button"
              onClick={handleLoadDemoProfile}
              className="px-3.5 py-2 rounded-full bg-white text-[#5A6B66] border border-[#D9DFD6] hover:text-[#11332D] text-xs font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>
          </div>
        </div>

        {/* Mode Indicator Banner */}
        {isCreatingNew ? (
          <div className="p-4 rounded-2xl bg-[#1C5C53] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#FF5A4E]" />
              <span>Creating a brand new emergency medical profile. Fill in your information below.</span>
            </div>
            <span className="text-[11px] font-mono bg-white/20 px-2.5 py-1 rounded-full text-white font-bold">
              Tag: {tagId}
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white border border-[#D9DFD6] flex items-center justify-between shadow-sm text-xs">
            <span className="text-[#5A6B66] font-medium">
              Editing Profile: <strong className="text-[#11332D]">{fullName || 'Emergency Profile'}</strong>
            </span>
            <span className="font-mono font-bold text-[#1C5C53] bg-[#1C5C53]/10 px-2.5 py-0.5 rounded-full">
              Tag: {tagId}
            </span>
          </div>
        )}

        {/* Save Toast Notification */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-[#11332D] text-white flex items-center gap-3 text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Dynamic Preparedness Scorecard */}
        <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1C5C53]" />
                <h3 className="text-base font-bold text-[#11332D]">Emergency Preparedness Score</h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  preparednessScore >= 80 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : preparednessScore >= 50 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-rose-100 text-rose-800'
                }`}>
                  {preparednessScore >= 80 ? 'Optimal Readiness' : preparednessScore >= 50 ? 'Moderate Protection' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-[#5A6B66]">
                Real-time evaluation based on triage completeness, ICE redundancy, and clinical clarity.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-[#F1F4EE] px-4 py-2 rounded-2xl">
              <span className="text-2xl font-black text-[#11332D] font-mono">{preparednessScore}%</span>
              <span className="text-xs text-[#5A6B66] font-medium">ready</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-[#F1F4EE] rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                preparednessScore >= 80 
                  ? 'bg-gradient-to-r from-[#1C5C53] to-[#10B981]' 
                  : preparednessScore >= 50 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                    : 'bg-gradient-to-r from-[#FF5A4E] to-rose-400'
              }`}
              style={{ width: `${Math.max(5, preparednessScore)}%` }}
            />
          </div>

          {/* Readiness Checklist Criteria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {scoreBreakdown.map((item, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                  item.met 
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900 font-medium' 
                    : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}
              >
                {item.met ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-[10px] text-stone-400 font-bold shrink-0">
                    +
                  </span>
                )}
                <span className="truncate">{item.label}</span>
                <span className="ml-auto text-[10px] font-mono opacity-70">+{item.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Card 1: Core Personal & Blood Info */}
          <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-[#D9DFD6]/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#11332D] font-display flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FF5A4E]" />
                  <span>Patient Identity & Tag Assignment</span>
                </h2>
                <p className="text-xs text-[#5A6B66]">
                  Critical information displayed first to paramedics and hospital emergency teams.
                </p>
              </div>

              <a
                href={`/id/${tagId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#1C5C53] hover:text-[#11332D] bg-[#1C5C53]/10 hover:bg-[#1C5C53]/20 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
                title="Open live emergency dossier in new tab"
              >
                <QrCode className="w-3.5 h-3.5 text-[#FF5A4E]" />
                <span>Test QR Dossier: /id/{tagId}</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#11332D]">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter patient full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-[#F1F4EE]/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#11332D]">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-white font-bold text-[#FF5A4E]"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#11332D]">Primary Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-[#F1F4EE]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#11332D]">Assigned Tag ID</label>
                <input
                  type="text"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value.toUpperCase())}
                  placeholder="e.g. GH-8821"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm font-mono font-bold text-[#1C5C53] bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Clinical Data, Allergies & Medications */}
          <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-[#D9DFD6]/60 pb-3">
              <h2 className="text-xl font-bold text-[#11332D] font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#FF5A4E]" />
                <span>Allergies, Medications & Clinical History</span>
              </h2>
              <p className="text-xs text-[#5A6B66]">
                Prevents fatal drug reactions and alerts doctors about existing medical conditions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#FF5A4E] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Severe Drug & Food Allergies (Comma separated)</span>
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Latex"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-rose-50/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#11332D]">Chronic Medical Conditions</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Type 1 Diabetes, Severe Asthma, Epilepsy, Hypertension"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#11332D]">Current Prescription Medications</label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Insulin Glargine, Salbutamol Inhaler, Metformin"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. K. Sharma (Cardiologist)"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Doctor Contact Phone</label>
                  <input
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                  />
                </div>
              </div>

              {/* Insurance Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Health Insurance Provider</label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. Star Health, HDFC ERGO, ICICI Lombard"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Insurance Policy / TPA Card Number</label>
                  <input
                    type="text"
                    value={insurancePolicy}
                    onChange={(e) => setInsurancePolicy(e.target.value)}
                    placeholder="e.g. POL-99201-DEL"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm font-mono"
                  />
                </div>
              </div>

              {/* Organ Donor Toggle */}
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="organDonor"
                  checked={organDonor}
                  onChange={(e) => setOrganDonor(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5A4E] rounded cursor-pointer"
                />
                <label htmlFor="organDonor" className="text-xs font-bold text-[#11332D] cursor-pointer">
                  Registered Organ Donor (NOTTO / State Donor Registry)
                </label>
              </div>

              {/* First Responder Critical Instructions */}
              <div className="space-y-1.5 pt-3 border-t border-[#D9DFD6]/60">
                <label className="text-xs font-bold text-[#11332D] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FF5A4E]" />
                  <span>First Responder Emergency Instructions & Resuscitation Directives</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Do NOT remove helmet if unconscious. Asthmatic (inhaler in right pocket). Allergic to NSAIDs."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-xs bg-amber-50/20"
                />
                <p className="text-[11px] text-[#5A6B66]">
                  These exact instructions appear in a prominent high-contrast banner on the emergency QR screen.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Emergency Contacts */}
          <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9DFD6]/60 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#11332D] font-display flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#1C5C53]" />
                  <span>Immediate Emergency Contacts (ICE)</span>
                </h2>
                <p className="text-xs text-[#5A6B66]">
                  Designate a primary contact. Bystanders and paramedics can tap directly to dial these numbers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddContact}
                className="px-3.5 py-1.5 rounded-full border border-[#1C5C53] text-[#1C5C53] hover:bg-[#1C5C53] hover:text-white text-xs font-bold transition-all flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((c, index) => (
                <div
                  key={c.id || index}
                  className={`p-4 rounded-2xl border transition-all ${
                    c.isPrimary 
                      ? 'bg-[#1C5C53]/5 border-[#1C5C53]/40 shadow-sm' 
                      : 'bg-[#F1F4EE]/40 border-[#D9DFD6]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(c.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        c.isPrimary
                          ? 'bg-[#1C5C53] text-white'
                          : 'bg-white text-[#5A6B66] border border-[#D9DFD6] hover:text-[#11332D]'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${c.isPrimary ? 'fill-white text-white' : 'text-stone-400'}`} />
                      <span>{c.isPrimary ? 'Primary Contact (Notified First)' : 'Set as Primary'}</span>
                    </button>

                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="text-[11px] font-bold text-[#1C5C53] hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#D9DFD6]"
                        title="Direct phone dial preview"
                      >
                        <Phone className="w-3 h-3 text-[#1C5C53]" />
                        <span>Test Call ({c.phone})</span>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-[#5A6B66] uppercase tracking-wider block mb-1">Name</label>
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => handleContactChange(c.id, 'name', e.target.value)}
                        placeholder="e.g. Priya Sharma / Family Contact"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9DFD6] bg-white focus:outline-none focus:border-[#1C5C53]"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-[#5A6B66] uppercase tracking-wider block mb-1">Relationship</label>
                      <input
                        type="text"
                        value={c.relationship}
                        onChange={(e) => handleContactChange(c.id, 'relationship', e.target.value)}
                        placeholder="e.g. Spouse / Father"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9DFD6] bg-white focus:outline-none focus:border-[#1C5C53]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-[#5A6B66] uppercase tracking-wider block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={c.phone}
                        onChange={(e) => handleContactChange(c.id, 'phone', e.target.value)}
                        placeholder="+919876543211"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9DFD6] bg-white focus:outline-none focus:border-[#1C5C53]"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(c.id)}
                          className="p-2 text-[#5A6B66] hover:text-[#FF5A4E] transition-colors cursor-pointer"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-full border border-[#D9DFD6] text-[#11332D] font-bold text-xs hover:bg-white transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#FF5A4E]" />
              <span>
                {isSaving 
                  ? 'Saving Profile...' 
                  : isCreatingNew 
                    ? 'Create & Activate Profile' 
                    : 'Save Profile Updates'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
