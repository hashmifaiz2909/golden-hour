import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Shield, Heart } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <main className="py-16 bg-[#F1F4EE]/40 text-[#1A2421]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#1C5C53] font-mono bg-[#1C5C53]/10 px-3.5 py-1 rounded-full">
            Simple Pricing
          </span>
          <h1 className="text-4xl font-bold text-[#11332D] font-display sm:text-5xl">
            Protect yourself and your loved ones.
          </h1>
          <p className="text-[#5A6B66] text-base leading-relaxed">
            Every emergency profile includes our core QR system for free. Upgrade to Premium for real-time tracking and clinical AI features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-3">
          <span className={`text-sm font-bold ${!isAnnual ? 'text-[#11332D]' : 'text-[#5A6B66]'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-[#1C5C53] rounded-full p-0.5 transition-all focus:outline-none flex items-center"
            style={{ justifyContent: isAnnual ? 'flex-end' : 'flex-start' }}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md" />
          </button>
          <span className={`text-sm font-bold ${isAnnual ? 'text-[#11332D]' : 'text-[#5A6B66]'}`}>
            Annual Billing{' '}
            <span className="text-[#FF5A4E] text-xs font-bold font-mono bg-[#FF5A4E]/10 px-2 py-0.5 rounded-full ml-1">
              Save 33%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Plan 1: Free */}
          <div className="p-8 bg-white border border-[#D9DFD6] rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-xl font-bold text-[#11332D] font-display">LifeSaver Free</h3>
              <p className="text-xs text-[#5A6B66] mt-1.5">
                Essential medical profile and printable emergency QR code.
              </p>
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#11332D] font-display">$0</span>
                <span className="text-sm text-[#5A6B66]">/ forever</span>
              </div>
              <hr className="border-[#D9DFD6]/60 my-6" />
              <ul className="space-y-3 text-xs text-[#5A6B66]">
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Public QR medical identification page</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Unlimited profile updates (allergies, blood group)</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Direct one-click emergency contact calling</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Printable wallet card & sticker templates</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                to="/dashboard"
                className="block text-center w-full py-3.5 rounded-full border border-[#D9DFD6] hover:border-[#1C5C53] text-[#11332D] font-bold text-xs transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Plan 2: Guardian Pro */}
          <div className="p-8 bg-white border-2 border-[#1C5C53] rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#FF5A4E] text-white text-[10px] font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider">
              POPULAR
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#11332D] font-display flex items-center gap-1.5">
                <span>Guardian Pro</span>
                <Sparkles className="w-4 h-4 text-[#FF5A4E]" />
              </h3>
              <p className="text-xs text-[#5A6B66] mt-1.5">
                Full emergency suite with automated SMS & Gemini AI briefings.
              </p>
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#11332D] font-display">
                  {isAnnual ? '$3.29' : '$4.99'}
                </span>
                <span className="text-sm text-[#5A6B66]">/ month</span>
              </div>
              <hr className="border-[#D9DFD6]/60 my-6" />
              <ul className="space-y-3 text-xs text-[#5A6B66]">
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span className="font-semibold text-[#11332D]">Everything in Free, plus:</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Automated family SMS alerts with live GPS coordinates</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Gemini AI clinical triage briefing synthesis</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Real-time scan logs with IP and browser audit trail</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-[#1C5C53] shrink-0" />
                  <span>Up to 5 family member profiles linked</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                to="/dashboard"
                className="block text-center w-full py-3.5 rounded-full bg-[#FF5A4E] hover:bg-[#FF5A4E]/90 text-white font-bold text-xs shadow-md transition-all animate-pulse-glow"
              >
                Upgrade to Guardian Pro
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
};
