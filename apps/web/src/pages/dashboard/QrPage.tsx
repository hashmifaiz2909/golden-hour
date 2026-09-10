import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, ArrowLeft, Shield, Heart, QrCode, Sparkles, ExternalLink } from 'lucide-react';
import { useRider } from '../../context/RiderContext';
import { useAuth } from '../../context/AuthContext';

export const QrPage: React.FC = () => {
  const { profile } = useRider();
  const { user } = useAuth();
  const [template, setTemplate] = useState<'card' | 'sticker' | 'wristband'>('card');

  const tagId = profile?.tagId || 'GH-DEMO';
  const name = (profile?.name && !profile.name.includes('Aarav') && !profile.name.includes('Mehta')) 
    ? profile.name 
    : (user?.name && !user.name.includes('Aarav') && !user.name.includes('Mehta') ? user.name : 'Emergency Profile');
  const bloodGroup = profile?.bloodGroup || 'O+';
  const allergies = profile?.allergies?.join(', ') || 'None listed';
  const contactName = profile?.emergencyContacts?.[0]?.name || 'Primary ICE Contact';
  const contactPhone = profile?.emergencyContacts?.[0]?.phone || '+91 98765 43210';

  const [publicBaseUrl, setPublicBaseUrl] = useState<string>(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://those-fully-maiden-restored.trycloudflare.com';
    }
    return window.location.origin;
  });
  const [copied, setCopied] = useState(false);

  const scanUrl = `${publicBaseUrl.replace(/\/$/, '')}/id/${tagId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F1F4EE] text-[#1A2421] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Controls */}
        <div className="no-print flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C5C53] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#FF5A4E]" />
              <span>Print Card / Label</span>
            </button>
          </div>
        </div>

        {/* Template Selector Bar */}
        <div className="no-print bg-white p-4 rounded-3xl border border-[#D9DFD6] shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-[#11332D] font-display">Printable Emergency Tags</h1>
            <p className="text-xs text-[#5A6B66]">Choose standard layout dimensions for wallets, helmets, or wristbands.</p>
          </div>

          <div className="flex items-center gap-2 bg-[#F1F4EE] p-1 rounded-2xl border border-[#D9DFD6]">
            <button
              onClick={() => setTemplate('card')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'card' ? 'bg-white text-[#11332D] shadow-sm' : 'text-[#5A6B66]'
              }`}
            >
              Wallet Card (CR80)
            </button>
            <button
              onClick={() => setTemplate('sticker')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'sticker' ? 'bg-white text-[#11332D] shadow-sm' : 'text-[#5A6B66]'
              }`}
            >
              Helmet Sticker
            </button>
            <button
              onClick={() => setTemplate('wristband')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'wristband' ? 'bg-white text-[#11332D] shadow-sm' : 'text-[#5A6B66]'
              }`}
            >
              Wristband
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex justify-center py-6">
          
          {/* TEMPLATE 1: WALLET CARD (Standard CR80 3.375" x 2.125") */}
          {template === 'card' && (
            <div className="print-card w-full max-w-md aspect-[1.586/1] bg-white rounded-3xl border-2 border-[#11332D] shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#D9DFD6] pb-2">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" style={{ width: 24, height: 24, minWidth: 24, minHeight: 24 }} className="w-6 h-6 flex-shrink-0" viewBox="0 0 30 30" fill="none">
                    <circle cx="15" cy="15" r="14" stroke="#1C5C53" strokeWidth="2" />
                    <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-extrabold text-sm text-[#11332D] font-display">Golden Hours</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#FF5A4E]/15 text-[#FF5A4E] px-2 py-0.5 rounded-full">
                  MEDICAL ID CARD
                </span>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-12 gap-3 items-center py-2">
                {/* QR Code */}
                <div className="col-span-5 flex flex-col items-center justify-center">
                  <div className="p-2 bg-white rounded-xl border border-[#D9DFD6] shadow-sm">
                    <QRCodeSVG value={scanUrl} size={105} level="H" />
                  </div>
                  <span className="text-[9px] font-mono text-[#5A6B66] mt-1">{tagId}</span>
                </div>

                {/* Patient Vitals */}
                <div className="col-span-7 space-y-1.5 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-[#5A6B66] uppercase block">Cardholder</span>
                    <strong className="text-[#11332D] font-bold text-sm block truncate">{name}</strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-[#5A6B66] uppercase block">Blood Group</span>
                      <span className="text-base font-black text-[#FF5A4E]">{bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#5A6B66] uppercase block">Organ Donor</span>
                      <span className="text-xs font-bold text-[#1C5C53]">YES</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#5A6B66] uppercase block">Emergency ICE Contact</span>
                    <span className="font-semibold text-[#11332D] block truncate">{contactName}</span>
                    <span className="text-[11px] font-mono text-[#1C5C53] block">{contactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-[#D9DFD6] pt-1.5 flex items-center justify-between text-[9px] text-[#5A6B66]">
                <span>Scan with any camera in emergency</span>
                <span className="font-mono font-bold text-[#1C5C53]">goldenhours.com</span>
              </div>
            </div>
          )}

          {/* TEMPLATE 2: HELMET STICKER */}
          {template === 'sticker' && (
            <div className="print-card w-64 h-64 bg-[#11332D] text-white rounded-3xl p-5 flex flex-col items-center justify-between text-center border-4 border-[#FF5A4E] shadow-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF5A4E]">
                <Heart className="w-4 h-4 fill-[#FF5A4E]" />
                <span>HELMET EMERGENCY TAG</span>
              </div>

              <div className="p-2.5 bg-white rounded-2xl shadow-md">
                <QRCodeSVG value={scanUrl} size={120} level="H" />
              </div>

              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">{name} ({bloodGroup})</div>
                <div className="text-[10px] text-[#D9DFD6] font-mono">SCAN FOR MEDICAL INFO & ICE</div>
              </div>
            </div>
          )}

          {/* TEMPLATE 3: WRISTBAND */}
          {template === 'wristband' && (
            <div className="print-card w-full max-w-xl h-24 bg-white rounded-2xl border-2 border-[#1C5C53] shadow-lg p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-[#D9DFD6] rounded-lg">
                  <QRCodeSVG value={scanUrl} size={64} level="H" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#11332D] uppercase font-display">Golden Hours Band</div>
                  <div className="text-sm font-black text-[#11332D]">{name}</div>
                  <div className="text-xs text-[#FF5A4E] font-bold">Blood: {bloodGroup} • ICE: {contactPhone}</div>
                </div>
              </div>
              <div className="text-right text-[10px] font-mono text-[#5A6B66]">
                <span>Tag: {tagId}</span>
                <div className="text-[#10B981] font-bold">Emergency Active</div>
              </div>
            </div>
          )}

        </div>

        {/* Public Link Preview & Domain Configuration */}
        <div className="no-print bg-white p-6 rounded-3xl border border-[#D9DFD6] shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-[#11332D] text-sm block">Live QR Destination URL</span>
              <p className="text-[#5A6B66]">This is the exact destination encoded inside the printed QR code above.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-full bg-[#1C5C53] hover:bg-[#11332D] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{copied ? '✓ Link Copied!' : 'Copy Emergency Link'}</span>
              </button>

              <a
                href={scanUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full border border-[#D9DFD6] hover:border-[#1C5C53] text-[#11332D] font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#1C5C53]" />
              </a>
            </div>
          </div>

          <div className="p-3 bg-[#F1F4EE] rounded-2xl border border-[#D9DFD6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="font-mono font-bold text-[#1C5C53] break-all select-all">
              {scanUrl}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPublicBaseUrl('https://those-fully-maiden-restored.trycloudflare.com')}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                  publicBaseUrl.includes('trycloudflare.com')
                    ? 'bg-[#1C5C53] text-white border-[#1C5C53]'
                    : 'bg-white text-[#5A6B66] border-[#D9DFD6] hover:text-[#11332D]'
                }`}
              >
                Use Cloudflare Tunnel
              </button>
              <button
                type="button"
                onClick={() => setPublicBaseUrl(window.location.origin)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                  publicBaseUrl === window.location.origin
                    ? 'bg-[#1C5C53] text-white border-[#1C5C53]'
                    : 'bg-white text-[#5A6B66] border-[#D9DFD6] hover:text-[#11332D]'
                }`}
              >
                Use Current Origin
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
