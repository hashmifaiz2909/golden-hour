import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Activity, Sparkles, Printer, Shield, 
  Smartphone, Clock, Heart, CheckCircle2, ArrowRight 
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <main className="py-16 bg-[#F1F4EE]/40 text-[#1A2421]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A4E] font-mono bg-[#FF5A4E]/10 px-3.5 py-1 rounded-full">
            Full Feature Catalog
          </span>
          <h1 className="text-4xl font-bold text-[#11332D] font-display sm:text-5xl leading-tight">
            Safety features designed for extreme speed.
          </h1>
          <p className="text-[#5A6B66] text-base leading-relaxed">
            Every detail of Golden Hours is engineered to be instantly visible, legible, and operational in the critical moments of an emergency.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1C5C53]/10 flex items-center justify-center text-[#1C5C53]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#11332D] font-display">Family Accounts</h3>
            <p className="text-sm text-[#5A6B66] leading-relaxed">
              Manage profiles for your spouse, children, and elderly parents under a single login. Keep track of everyone's emergency tags and scan histories in one dashboard.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5A4E]/10 flex items-center justify-center text-[#FF5A4E]">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#11332D] font-display">Instant SMS Alerts</h3>
            <p className="text-sm text-[#5A6B66] leading-relaxed">
              Whenever a tag is scanned, primary emergency contacts receive an instant text notification with exact GPS latitude and longitude coordinates.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1C5C53]/10 flex items-center justify-center text-[#1C5C53]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#11332D] font-display">Gemini AI Summaries</h3>
            <p className="text-sm text-[#5A6B66] leading-relaxed">
              Raw medical charts are parsed by Google's Gemini AI model to generate concise, 10-second first responder guidance highlighting life-saving warnings.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1C5C53]/10 flex items-center justify-center text-[#1C5C53]">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#11332D] font-display">Printable QR Studio</h3>
            <p className="text-sm text-[#5A6B66] leading-relaxed">
              Download standard CR80 wallet card templates, helmet/fuel tank vinyl stickers, and wristbands with high-contrast, waterproof layouts.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1C5C53]/10 flex items-center justify-center text-[#1C5C53]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#11332D] font-display">Medical Document Vault</h3>
            <p className="text-sm text-[#5A6B66] leading-relaxed">
              Securely store health insurance policies, hospital registration numbers, and prescription details, unlocked strictly during verified responder scans.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5A4E]/10 flex items-center justify-center text-[#FF5A4E]">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#11332D] font-display">Hospital Handoff Protocol</h3>
            <p className="text-sm text-[#5A6B66] leading-relaxed">
              Provides paramedics and triage doctors with standardized clinical summaries ready for seamless emergency room transfer.
            </p>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="bg-[#11332D] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display">
            Start protecting your family with Golden Hours today.
          </h2>
          <p className="text-[#F1F4EE]/75 text-sm max-w-lg mx-auto">
            Set up your profile in minutes and download your free printable emergency QR code.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FF5A4E] hover:bg-[#FF5A4E]/90 text-white font-bold text-xs shadow-lg transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
};
