import React from 'react';
import { Link } from 'react-router-dom';

export const GoldenHoursFooter: React.FC = () => {
  return (
    <footer className="bg-[#11332D] text-white border-t border-[#1C5C53] mt-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold font-display">
            <svg width="32" height="32" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }} className="w-8 h-8 flex-shrink-0" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" stroke="#1C5C53" strokeWidth="2" />
              <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-extrabold text-white">Golden Hours</span>
          </Link>
          <p className="text-[#F1F4EE]/85 text-sm max-w-sm leading-relaxed">
            Providing first responders and bystanders with instant, life-saving medical data when every second counts. Dynamic emergency QR identification cards, stickers, and crash response telemetry.
          </p>
        </div>

        {/* Platform Links */}
        <div>
          <h3 className="text-sm font-semibold text-[#F1F4EE] uppercase tracking-wider mb-4 font-mono">Platform</h3>
          <ul className="space-y-2 text-sm text-[#F1F4EE]/75">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link to="/dashboard/profile" className="hover:text-white transition-colors">Emergency Profile</Link></li>
            <li><Link to="/dashboard/qr" className="hover:text-white transition-colors">Printable QR Cards</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Admin Registry</Link></li>
          </ul>
        </div>

        {/* Emergency Network & Support */}
        <div>
          <h3 className="text-sm font-semibold text-[#F1F4EE] uppercase tracking-wider mb-4 font-mono">Emergency Network</h3>
          <ul className="space-y-2 text-sm text-[#F1F4EE]/75">
            <li><span className="text-white font-semibold">24/7 Cloud Dispatch</span></li>
            <li><span>Official Domain: goldenhours.com</span></li>
            <li><span>Standard: MedTech Emergency ID</span></li>
            <li><Link to="/demo" className="text-[#FF5A4E] hover:underline font-bold">Interactive Demo Room</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Disclaimer */}
      <div className="max-w-7xl mx-auto border-t border-[#1C5C53]/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F1F4EE]/60">
        <div>© 2026 Golden Hours. All rights reserved.</div>
        <div className="font-mono text-center md:text-right max-w-md">
          DISCLAIMER: Golden Hours is an emergency medical information platform. Scanning QR tags provides reference clinical summaries; it is not a direct healthcare service, a medical diagnosis, or a replacement for calling 112/108 emergency services.
        </div>
      </div>
    </footer>
  );
};
