import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, Sparkles, Scan, ChevronDown, ChevronRight, 
  CircleAlert, Smartphone, Clock, Printer, Users, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState<'aanya' | 'kabir'>('aanya');

  const faqs = [
    {
      q: 'Does a first responder need an app to scan the QR code?',
      a: 'No. Any standard smartphone camera or QR scanner can instantly read the physical tag. The emergency profile opens immediately in a mobile browser in under 0.4 seconds with zero app installation.'
    },
    {
      q: 'Is my medical and personal data safe?',
      a: 'Yes. Golden Hours strictly displays user-authorized emergency information (blood type, allergies, conditions, doctor, and ICE contacts). Passwords, emails, and financial data are never exposed.'
    },
    {
      q: 'How do the family alerts work?',
      a: 'When a bystander or responder scans your tag, the system captures the device GPS location and immediately triggers an automated SMS to your primary emergency contacts with a direct Google Maps link.'
    },
    {
      q: 'What types of physical tags are available?',
      a: 'Golden Hours provides printable standard wallet card formats (CR80), adhesive helmet and motorcycle stickers, and wearable wristband templates with high-contrast durable QR codes.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F4EE] text-[#1A2421]">
      
      {/* 1. HERO SECTION */}
      <header className="py-16 sm:py-20 bg-gradient-to-b from-[#F1F4EE] via-white to-[#F1F4EE] overflow-hidden border-b border-[#D9DFD6]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission & Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#1C5C53] bg-[#1C5C53]/10 rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A4E]" />
              <span>Emergency ID, Reimagined • goldenhours.com</span>
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#11332D] font-display leading-[1.1]">
              One scan tells responders everything they need to know.
            </h1>

            <p className="text-base sm:text-lg text-[#5A6B66] max-w-xl leading-relaxed">
              Golden Hours turns a simple card, sticker, or wristband into a lifeline. In an emergency, first responders instantly access critical medical details, doctor contacts, and AI-guided triage summaries.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to={user ? "/dashboard/profile" : "/auth/signup"}
                className="px-8 py-4 text-base font-bold text-white bg-[#FF5A4E] hover:bg-[#FF5A4E]/95 rounded-full transition-all shadow-md hover:shadow-lg animate-pulse-glow"
              >
                {user ? "Open Emergency Profile" : "Create emergency profile & tag"}
              </Link>

              <Link
                to={user ? "/dashboard" : "/auth/login"}
                className="px-8 py-4 text-base font-semibold text-[#11332D] hover:bg-[#D9DFD6]/20 rounded-full border border-[#D9DFD6] transition-all"
              >
                {user ? "Go to Dashboard" : "Sign In to Account"}
              </Link>
            </div>

            {/* Highlights row */}
            <div className="flex flex-wrap gap-6 text-xs text-[#5A6B66] font-mono pt-4 border-t border-[#D9DFD6]/50">
              <span className="flex items-center gap-1.5 font-semibold">
                <Shield className="w-4 h-4 text-[#1C5C53]" /> NO APP REQUIRED
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Heart className="w-4 h-4 text-[#FF5A4E] fill-[#FF5A4E]" /> INSTANT FAMILY ALERTS
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-4 h-4 text-[#1C5C53]" /> GEMINI AI SUMMARIES
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Tag Card Preview */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-80 bg-white rounded-3xl border border-[#D9DFD6] p-6 shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[#1C5C53]/10 duration-300">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono tracking-wider text-[#5A6B66]/80 font-semibold">
                  Golden Hours · Tag 021
                </span>
                <Heart className="w-5 h-5 text-[#FF5A4E] fill-[#FF5A4E] animate-pulse" />
              </div>

              {/* Tag Center QR Graphic */}
              <div className="bg-[#F1F4EE] p-4 rounded-2xl border border-[#D9DFD6] flex flex-col items-center justify-center aspect-square relative group overflow-hidden">
                <div className="w-full h-full bg-white flex items-center justify-center p-3 rounded-lg border border-[#D9DFD6]">
                  <div className="grid grid-cols-4 gap-2 w-full h-full opacity-85">
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                    <div className="rounded-sm bg-transparent"></div>
                    <div className="rounded-sm bg-[#11332D]"></div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-[#11332D]/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Scan className="w-10 h-10 text-[#FF5A4E] animate-bounce mb-2" />
                  <span className="font-mono text-xs font-semibold">SCAN ME IN AN EMERGENCY</span>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <h3 className="text-lg font-bold text-[#11332D] font-display">Aanya Verma</h3>
                <p className="text-xs font-mono text-[#5A6B66]">Blood Group: O+ · Diabetic</p>
              </div>
            </div>

            {/* Floating Scanned Toast */}
            <div className="absolute -bottom-6 -right-2 glass-card rounded-2xl p-4 shadow-xl border border-[#FF5A4E]/30 w-64 animate-bounce duration-[3000ms]">
              <div className="flex gap-2.5 items-start">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A4E] mt-1.5 animate-ping"></div>
                <div>
                  <h4 className="text-xs font-bold text-[#FF5A4E]">SCANNED ✓</h4>
                  <p className="text-[11px] text-[#5A6B66] leading-tight mt-0.5">
                    Profile accessed in 0.4s. Emergency contacts Priya Verma & Rahul Verma notified via SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. HEARTBEAT PULSE SVG LINE */}
      <div className="py-2 bg-[#F1F4EE] relative">
        <div className="max-w-7xl mx-auto px-4">
          <svg viewBox="0 0 1180 60" preserveAspectRatio="none" style={{ width: '100%', height: '48px', maxHeight: '48px' }} className="w-full h-12 stroke-[#D9DFD6]/80 fill-none">
            <path d="M0,30 L500,30 L520,8 L535,52 L550,30 L1180,30" strokeWidth="2" />
            <circle className="pulse-line-blip fill-[#FF5A4E]" r="4.5">
              <animateMotion dur="4s" repeatCount="indefinite" path="M0,30 L500,30 L520,8 L535,52 L550,30 L1180,30" />
            </circle>
          </svg>
        </div>
      </div>

      {/* 3. DUAL PORTAL GATEWAYS */}
      <section className="py-12 bg-[#F1F4EE]/50 border-y border-[#D9DFD6]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Customer Dashboard Portal */}
            <div className="bg-white p-8 rounded-3xl border border-[#D9DFD6]/80 shadow-sm space-y-4 hover:shadow-md hover:border-[#1C5C53]/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5A4E]/10 text-[#FF5A4E] flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-[#FF5A4E]" />
                </div>
                <h3 className="text-xl font-bold text-[#11332D] font-display">Customer Dashboard</h3>
                <p className="text-sm text-[#5A6B66] leading-relaxed">
                  Register, log in, set up your personal emergency details (contacts, medications, allergies), and generate your unique QR data code. Print it onto wallet cards or helmet stickers.
                </p>
              </div>
              <div className="pt-4 flex gap-4">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 bg-[#FF5A4E] hover:bg-[#FF5A4E]/90 text-white font-bold rounded-full text-xs transition-all shadow-sm"
                >
                  Patient Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="px-5 py-2.5 border border-[#D9DFD6] hover:border-[#1C5C53] text-[#11332D] font-semibold rounded-full text-xs transition-all"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Admin Registry Portal */}
            <div className="bg-white p-8 rounded-3xl border border-[#D9DFD6]/80 shadow-sm space-y-4 hover:shadow-md hover:border-[#1C5C53]/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1C5C53]/10 text-[#1C5C53] flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#11332D] font-display">Admin Registry</h3>
                <p className="text-sm text-[#5A6B66] leading-relaxed">
                  Access the backend patient database directory. Search registered profiles, inspect emergency contact information, review real-time scan events, and analyze Gemini AI engine statistics.
                </p>
              </div>
              <div className="pt-4 flex gap-4">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold rounded-full text-xs transition-all shadow-sm"
                >
                  <span>Access Admin Registry</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/demo"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#D9DFD6] hover:border-[#1C5C53] text-[#11332D] font-bold rounded-full text-xs transition-all"
                >
                  <span>Interactive Demo Suite</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 4 BEATS */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1C5C53] font-mono">
              Simple & Reliable
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#11332D] font-display">
              From crisis to coordinated care in four steps.
            </h2>
            <p className="text-[#5A6B66]">
              No complex mobile apps to download, no hardware to charge. Just immediate access when it matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="relative p-6 bg-[#F1F4EE]/40 rounded-2xl border border-[#D9DFD6]/60 hover:border-[#1C5C53]/40 transition-colors">
              <div className="text-sm font-bold text-[#FF5A4E] font-mono mb-4">BEAT 01</div>
              <h3 className="text-lg font-bold text-[#11332D] mb-2 font-display">Bystander scans tag</h3>
              <p className="text-sm text-[#5A6B66] leading-relaxed">
                Any phone camera works. A responder scans the physical card or sticker on your wristband or backpack.
              </p>
            </div>

            <div className="relative p-6 bg-[#F1F4EE]/40 rounded-2xl border border-[#D9DFD6]/60 hover:border-[#1C5C53]/40 transition-colors">
              <div className="text-sm font-bold text-[#FF5A4E] font-mono mb-4">BEAT 02</div>
              <h3 className="text-lg font-bold text-[#11332D] mb-2 font-display">GPS location captured</h3>
              <p className="text-sm text-[#5A6B66] leading-relaxed">
                The browser requests location permission to log exactly where the emergency occurred.
              </p>
            </div>

            <div className="relative p-6 bg-[#F1F4EE]/40 rounded-2xl border border-[#D9DFD6]/60 hover:border-[#1C5C53]/40 transition-colors">
              <div className="text-sm font-bold text-[#FF5A4E] font-mono mb-4">BEAT 03</div>
              <h3 className="text-lg font-bold text-[#11332D] mb-2 font-display">Profile opens in 0.4s</h3>
              <p className="text-sm text-[#5A6B66] leading-relaxed">
                Medical conditions, blood groups, insurance details, and primary doctors load instantly.
              </p>
            </div>

            <div className="relative p-6 bg-[#F1F4EE]/40 rounded-2xl border border-[#D9DFD6]/60 hover:border-[#1C5C53]/40 transition-colors">
              <div className="text-sm font-bold text-[#FF5A4E] font-mono mb-4">BEAT 04</div>
              <h3 className="text-lg font-bold text-[#11332D] mb-2 font-display">SMS alert dispatched</h3>
              <p className="text-sm text-[#5A6B66] leading-relaxed">
                Your emergency contacts receive an instant text message with your active GPS coordinates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SAFETY-CRITICAL DESIGN */}
      <section className="py-20 bg-[#11332D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A4E] font-mono">
              Safety-critical design
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              Built for emergencies, not just demos.
            </h2>
            <p className="text-[#F1F4EE]/75 text-sm">
              We design every feature around speed, legibility, and high-stress readability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-2xl bg-[#11332D] border border-white/10 hover:border-white/20 transition-all">
              <CircleAlert className="w-8 h-8 text-[#FF5A4E] mb-4" />
              <h3 className="text-lg font-bold mb-2 font-display">Flashing Vitals Banner</h3>
              <p className="text-sm text-[#F1F4EE]/75 leading-relaxed">
                Life-threatening allergies and blood group are displayed first in a high-contrast pulsing red header.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#11332D] border border-white/10 hover:border-white/20 transition-all">
              <Smartphone className="w-8 h-8 text-[#FF5A4E] mb-4" />
              <h3 className="text-lg font-bold mb-2 font-display">One-Click Calls</h3>
              <p className="text-sm text-[#F1F4EE]/75 leading-relaxed">
                Responders can call primary contacts directly from the landing page with a single touch, no dialing required.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#11332D] border border-white/10 hover:border-white/20 transition-all">
              <Clock className="w-8 h-8 text-[#FF5A4E] mb-4" />
              <h3 className="text-lg font-bold mb-2 font-display">Scan Log Audit</h3>
              <p className="text-sm text-[#F1F4EE]/75 leading-relaxed">
                Real-time history feed in your dashboard logs exactly when and where your card was scanned.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#11332D] border border-white/10 hover:border-white/20 transition-all">
              <Printer className="w-8 h-8 text-[#FF5A4E] mb-4" />
              <h3 className="text-lg font-bold mb-2 font-display">Printable Templates</h3>
              <p className="text-sm text-[#F1F4EE]/75 leading-relaxed">
                Format and print your QR onto cards, luggage stickers, or wristband templates in standard dimensions.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#11332D] border border-white/10 hover:border-white/20 transition-all">
              <Shield className="w-8 h-8 text-[#FF5A4E] mb-4" />
              <h3 className="text-lg font-bold mb-2 font-display">Medical Document Vault</h3>
              <p className="text-sm text-[#F1F4EE]/75 leading-relaxed">
                Store insurance policies and medical reports securely, unlocked only during responder scans.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#11332D] border border-white/10 hover:border-white/20 transition-all">
              <Users className="w-8 h-8 text-[#FF5A4E] mb-4" />
              <h3 className="text-lg font-bold mb-2 font-display">Family Monitoring</h3>
              <p className="text-sm text-[#F1F4EE]/75 leading-relaxed">
                Add multiple children, elderly parents, or pet accounts under a single unified dashboard.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. GEMINI AI INTEGRATION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5A4E] bg-[#FF5A4E]/10 rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Integration</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#11332D] font-display leading-[1.2]">
              Instant AI summaries when seconds count.
            </h2>

            <p className="text-[#5A6B66]">
              Raw medical charts and fields are hard to scan in a panic. Our Gemini AI system parses your profile details and generates instant, calm, and actionable guidelines for responder teams.
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-[#1C5C53]/10 flex items-center justify-center mt-0.5 text-[#1C5C53] font-bold text-xs font-mono">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#11332D]">AI Emergency Summary</h4>
                  <p className="text-xs text-[#5A6B66]">A 10-second first-responder overview highlighting life-saving notes.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-[#1C5C53]/10 flex items-center justify-center mt-0.5 text-[#1C5C53] font-bold text-xs font-mono">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#11332D]">AI Doctor Assistant</h4>
                  <p className="text-xs text-[#5A6B66]">A clinical history synopsis for hospital triage and doctor handoffs.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-[#1C5C53]/10 flex items-center justify-center mt-0.5 text-[#1C5C53] font-bold text-xs font-mono">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#11332D]">AI Family Guidance</h4>
                  <p className="text-xs text-[#5A6B66]">Clear step-by-step next actions and preparation checklists for family members.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive AI Preview Box */}
          <div className="bg-[#F1F4EE]/40 p-6 sm:p-8 rounded-3xl border border-[#D9DFD6]">
            <div className="flex gap-2 justify-center mb-6">
              <button
                onClick={() => setActivePersona('aanya')}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  activePersona === 'aanya' ? 'bg-[#11332D] text-white border-transparent' : 'bg-white text-[#1A2421] border-[#D9DFD6]'
                }`}
              >
                Aanya Verma
              </button>
              <button
                onClick={() => setActivePersona('kabir')}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  activePersona === 'kabir' ? 'bg-[#11332D] text-white border-transparent' : 'bg-white text-[#1A2421] border-[#D9DFD6]'
                }`}
              >
                Kabir Sharma
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#D9DFD6] space-y-4">
              <div>
                <h4 className="text-xs font-mono text-[#5A6B66] uppercase tracking-wider mb-1">Input Fields</h4>
                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-[#F1F4EE]/50 rounded-lg font-mono">
                  <div>Blood Group: {activePersona === 'aanya' ? 'O+' : 'B+'}</div>
                  <div>Allergies: {activePersona === 'aanya' ? 'Penicillin, Shellfish' : 'Aspirin'}</div>
                  <div className="col-span-2">
                    Conditions: {activePersona === 'aanya' ? 'Type 1 Diabetes, carry insulin in backpack' : 'Asthma, Inhaler PRN'}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#D9DFD6]/60 pt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-[#FF5A4E]" />
                  <h4 className="text-xs font-bold text-[#11332D] font-mono uppercase tracking-wider">
                    Gemini Response Brief
                  </h4>
                </div>
                <div className="bg-[#11332D] text-[#F1F4EE] p-4 rounded-xl text-xs font-mono whitespace-pre-line leading-relaxed shadow-inner">
                  {activePersona === 'aanya' ? (
                    `• CRITICAL: Type 1 Diabetic. Carries insulin in bag. Check blood glucose levels.
• SEVERE ALLERGY: Avoid Penicillin. Avoid Shellfish.
• BLOOD GROUP: O positive.
• CONTACT: Priya Verma (Mother), reachable at +91 98888 77777. Tap to call immediately.`
                  ) : (
                    `• CRITICAL: Severe Asthma history. Administer Salbutamol if in respiratory distress.
• SEVERE ALLERGY: Avoid Aspirin & NSAIDs.
• BLOOD GROUP: B positive.
• CONTACT: Dr. K. Sharma (Physician), reachable at +91 98765 43210.`
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. REAL-WORLD IMPACT STORIES */}
      <section className="py-20 bg-[#F1F4EE]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1C5C53] font-mono">
              Real-world impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#11332D] font-display">
              Stories that shape our mission.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-[#D9DFD6] flex flex-col justify-between shadow-sm">
              <p className="text-sm text-[#1A2421] italic leading-relaxed mb-6">
                "My father wanders occasionally due to early dementia. The keychain QR card has helped neighbors contact us and bring him back safely twice."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF5A4E]/10 text-[#FF5A4E] flex items-center justify-center font-bold text-sm font-display">
                  R
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#11332D]">Rohan Nair</h4>
                  <p className="text-xs text-[#5A6B66]">Pune, India</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#D9DFD6] flex flex-col justify-between shadow-sm">
              <p className="text-sm text-[#1A2421] italic leading-relaxed mb-6">
                "Paramedics scanned my backpack tag after a cycling crash and saw my blood thinners warning. They told me it prevented critical complications."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF5A4E]/10 text-[#FF5A4E] flex items-center justify-center font-bold text-sm font-display">
                  S
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#11332D]">Sana Kulkarni</h4>
                  <p className="text-xs text-[#5A6B66]">Bengaluru, India</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#D9DFD6] flex flex-col justify-between shadow-sm">
              <p className="text-sm text-[#1A2421] italic leading-relaxed mb-6">
                "I put tags on my kids' schoolbags. The UI was so simple, I was able to set both profiles and print the cards in less than 10 minutes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF5A4E]/10 text-[#FF5A4E] flex items-center justify-center font-bold text-sm font-display">
                  A
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#11332D]">Arjun Diwan</h4>
                  <p className="text-xs text-[#5A6B66]">Indore, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1C5C53] font-mono">
              FAQ
            </span>
            <h2 className="text-3xl font-bold text-[#11332D] font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#D9DFD6] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center bg-[#F1F4EE]/20 hover:bg-[#F1F4EE]/40 transition-colors"
                >
                  <span className="font-bold text-[#11332D] text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#1C5C53] transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-4 bg-white text-xs sm:text-sm text-[#5A6B66] leading-relaxed border-t border-[#D9DFD6]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto bg-[#FF5A4E] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              Get peace of mind, before you need it.
            </h2>
            <p className="text-[#F1F4EE]/90 text-sm sm:text-base">
              Set up your unique profile in under five minutes. Download, print, or share your Emergency QR code tag to ensure safety.
            </p>
            <div>
              <Link
                to="/dashboard"
                className="inline-block px-8 py-4 bg-white text-[#FF5A4E] hover:bg-[#F1F4EE] font-bold rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Open Golden Hours Dashboard
              </Link>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full border-4 border-white/10"></div>
          <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full border-4 border-white/10"></div>
        </div>
      </section>

    </div>
  );
};
