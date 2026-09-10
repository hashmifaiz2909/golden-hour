import React from 'react';
import { AlertOctagon, Check, Send, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  countdown: number;
  onCancel: () => void;
  onConfirmNow: () => void;
  peakG?: number;
}

export const CrashCountdownModal: React.FC<Props> = ({
  isOpen,
  countdown,
  onCancel,
  onConfirmNow,
  peakG = 4.6
}) => {
  if (!isOpen) return null;

  const totalTime = 20;
  const progressPercent = ((totalTime - countdown) / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Emergency Modal Card */}
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-rose-500 animate-emergency-pulse">
        
        {/* Top Emergency Banner */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold tracking-wide text-sm uppercase">
            <AlertOctagon className="w-5 h-5 animate-bounce" />
            <span>Possible Accident Detected</span>
          </div>
          <span className="text-xs font-mono bg-rose-700/80 px-2 py-0.5 rounded font-bold border border-rose-400">
            DEMO EVENT
          </span>
        </div>

        <div className="p-6 text-center space-y-6">
          
          {/* Main Question */}
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ARE YOU OK?
            </h2>
            <p className="text-sm text-slate-600">
              High kinetic impact ({peakG.toFixed(1)}G) recorded. If you do not respond, emergency dispatch will initiate automatically.
            </p>
          </div>

          {/* Animated Countdown Ring */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#FFE4E6"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#E11D48"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="377"
                strokeDashoffset={(377 * (totalTime - countdown)) / totalTime}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Numeric Countdown Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold font-mono text-rose-600">
                {countdown}
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-400">
                Seconds
              </span>
            </div>
          </div>

          {/* Critical Disclaimer */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-left">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>GPS location & medical profile will be transmitted to emergency responders when timer expires.</span>
          </div>

          {/* Dual Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>I'm OK — Cancel Alert</span>
            </button>

            <button
              onClick={onConfirmNow}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Alert Now (Immediate SOS)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
