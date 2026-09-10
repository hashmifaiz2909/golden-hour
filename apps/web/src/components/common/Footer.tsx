import React from 'react';
import { Shield, AlertTriangle, HeartPulse, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Mission & Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">GOLDEN HOUR</span>
            </div>
            <p className="text-sm text-slate-300 font-medium italic">
              "When a victim cannot call for help, technology should speak for them."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Golden Hour is an AI-assisted smartphone emergency response architecture designed to bridge critical delay gaps during road trauma incidents through autonomous impact detection, rider confirmation safeguards, and instant responder telemetry.
            </p>
          </div>

          {/* Col 2: Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Specifications</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li><strong className="text-slate-300">Platform:</strong> Golden Hours Emergency Cloud</li>
              <li><strong className="text-slate-300">Domain:</strong> goldenhours.com</li>
              <li><strong className="text-slate-300">Architecture:</strong> Kinetic Telemetry & QR</li>
              <li><strong className="text-slate-300">Theme:</strong> MedTech / HealthTech</li>
              <li><strong className="text-slate-300">Category:</strong> Emergency Dispatch</li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Portals</h4>
            <ul className="text-xs space-y-2">
              <li><a href="/mobile" className="hover:text-sky-400 transition-colors">Rider Mobile Telemetry</a></li>
              <li><a href="/responder/dashboard" className="hover:text-sky-400 transition-colors">Responder Command Center</a></li>
              <li><a href="/id/GH-7749" className="hover:text-sky-400 transition-colors">Emergency QR Medical Viewer</a></li>
              <li><a href="/demo" className="hover:text-sky-400 transition-colors font-medium text-sky-400">Interactive Demo Walkthrough</a></li>
            </ul>
          </div>

        </div>

        {/* Ethical Disclaimers Banner */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 mb-8 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>MedTech Ethics & Prototype Transparency Statement</span>
          </div>
          <p className="leading-relaxed">
            Golden Hours is an emergency response software platform engineered for rapid bystander access and telemetry triage. It operates on threshold heuristic and machine learning kinetic classifications of smartphone accelerometer & gyroscope readings. This software <strong>does not claim medical diagnosis</strong>, guaranteed 100% crash detection accuracy, or guaranteed survival improvements. Emergency bystander QR pages strictly display essential, user-authorized allergy and blood group information.
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-850 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Golden Hours Emergency Response System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><HeartPulse className="w-3.5 h-3.5 text-rose-500" /> MedTech Protocol GH-MED-2026</span>
            <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-sky-400" /> Active Emergency Network</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
