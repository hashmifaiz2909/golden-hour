import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, CheckCircle2, AlertOctagon, 
  Radio, Shield, QrCode, Phone, Activity, ArrowRight, ExternalLink 
} from 'lucide-react';
import { useRider } from '../../context/RiderContext';
import { useResponder } from '../../context/ResponderContext';
import { IncidentMap } from '../../components/map/IncidentMap';
import { TelemetryGraph } from '../../components/sensor/TelemetryGraph';
import { CrashCountdownModal } from '../../components/sensor/CrashCountdownModal';
import { AlertStatusBadge } from '../../components/common/AlertStatusBadge';
import { QRCodeSVG } from 'qrcode.react';

export const DemoSuitePage: React.FC = () => {
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
    simulateImpact, 
    cancelCrashEvent, 
    confirmCrashNow, 
    resetAlertState 
  } = useRider();

  const { 
    alerts, 
    selectedAlert, 
    setSelectedAlert, 
    acknowledgeAlert, 
    markResponding, 
    resolveAlert,
    loadAlerts 
  } = useResponder();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const steps = [
    { num: 1, title: 'Rider Profile Verified', desc: 'Blood group O+, Penicillin allergy, & emergency contacts loaded.' },
    { num: 2, title: 'QR Tag Generated', desc: 'Helmet tag GH-7749 linked with public emergency lookup endpoint.' },
    { num: 3, title: 'Safety Monitoring Active', desc: 'Continuous 10Hz accelerometer & gyroscope telemetry stream.' },
    { num: 4, title: 'High-G Crash Event', desc: 'Sudden 4.8G kinetic impulse detected by threshold & ML engine.' },
    { num: 5, title: 'Are You OK? 20s Safeguard', desc: 'Rider confirmation timer starts. Unconscious victim fails to respond.' },
    { num: 6, title: 'Distress Dispatch & GPS', desc: 'Exact coordinates captured & broadcast to emergency responder network.' },
    { num: 7, title: 'Emergency SMS Sent', desc: 'Mock/Twilio SMS dispatched to family with Google Maps navigation link.' },
    { num: 8, title: 'Responder Map Alert', desc: 'Incident marker flashes in real-time on command center GIS map.' },
    { num: 9, title: 'Medical Dossier Review', desc: 'Responder opens vital blood group and drug allergy warnings.' },
    { num: 10, title: 'Acknowledge & Dispatch', desc: 'Trauma command dispatches quick response ambulance unit.' },
    { num: 11, title: 'Incident Resolved', desc: 'Patient received at trauma center within the Golden Hour.' }
  ];

  // Auto-pilot sequence logic for presentation
  useEffect(() => {
    let timer: any = null;
    if (isAutoPlaying) {
      if (currentStep === 1) {
        timer = setTimeout(() => {
          setCurrentStep(2);
        }, 2000);
      } else if (currentStep === 2) {
        timer = setTimeout(() => {
          startMonitoring();
          setCurrentStep(3);
        }, 2500);
      } else if (currentStep === 3) {
        timer = setTimeout(() => {
          simulateImpact();
          setCurrentStep(4);
        }, 3000);
      } else if (currentStep === 4) {
        timer = setTimeout(() => {
          setCurrentStep(5);
        }, 2000);
      } else if (currentStep === 5 && !showCrashModal && lastAlert) {
        setCurrentStep(6);
      } else if (currentStep === 6) {
        timer = setTimeout(() => {
          setCurrentStep(7);
        }, 2500);
      } else if (currentStep === 7) {
        timer = setTimeout(() => {
          setCurrentStep(8);
        }, 2500);
      } else if (currentStep === 8 && lastAlert) {
        setSelectedAlert(lastAlert);
        timer = setTimeout(() => {
          setCurrentStep(9);
        }, 3000);
      } else if (currentStep === 9 && selectedAlert) {
        timer = setTimeout(async () => {
          await acknowledgeAlert(selectedAlert.id);
          setCurrentStep(10);
        }, 3000);
      } else if (currentStep === 10 && selectedAlert) {
        timer = setTimeout(async () => {
          await markResponding(selectedAlert.id);
          timer = setTimeout(async () => {
            await resolveAlert(selectedAlert.id);
            setCurrentStep(11);
            setIsAutoPlaying(false);
          }, 4000);
        }, 3500);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoPlaying, currentStep, showCrashModal, lastAlert, selectedAlert]);

  const handleResetDemo = () => {
    setIsAutoPlaying(false);
    resetAlertState();
    setCurrentStep(1);
    loadAlerts();
  };

  const currentTag = profile?.tagId || 'GH-7749';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 flex flex-col space-y-6">
      
      {/* 20s Countdown Modal */}
      <CrashCountdownModal
        isOpen={showCrashModal}
        countdown={countdown}
        onCancel={cancelCrashEvent}
        onConfirmNow={confirmCrashNow}
        peakG={latestEval?.peakMagnitudeG || 4.8}
      />

      {/* Top Banner & Demo Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#FF5A4E]/20 text-[#FF5A4E] px-2.5 py-1 rounded-full border border-[#FF5A4E]/40">
                ⚠️ GOLDEN HOURS LIVE SIMULATION SUITE
              </span>
              <span className="text-xs text-slate-400 font-mono">Domain: goldenhours.com</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Golden Hour End-to-End Simulation Room
            </h1>
            <p className="text-xs text-slate-400">
              Live interactive split-screen comparing the Rider Phone telemetry with the Responder Command Center in real-time.
            </p>
          </div>

          {/* Controller Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isAutoPlaying 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAutoPlaying ? 'Pause Auto-Walkthrough' : 'Start Auto-Walkthrough'}</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset State</span>
            </button>
          </div>

        </div>

        {/* Step-by-Step Progress Pipeline */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-1.5 text-[10px]">
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-500/20 border-sky-500 text-sky-200 font-bold ring-1 ring-sky-500'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-slate-850/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span>#{step.num}</span>
                  )}
                </div>
                <div className="truncate font-semibold">{step.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split Screen: Left = Rider Phone, Right = Responder Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* LEFT: RIDER SIMULATION VIEW (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Rider Telemetry Simulator
              </h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isMonitoring ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {isMonitoring ? 'Active 10Hz' : 'Standby'}
            </span>
          </div>

          {/* Telemetry live graph */}
          <TelemetryGraph liveReading={liveReading} latestEval={latestEval} />

          {/* Rider Profile Snapshot & QR */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-850 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Rider Identity</div>
              <div className="font-bold text-white">{profile?.name || 'Emergency Rider'}</div>
              <div className="text-[11px] text-rose-400 font-semibold">Blood: {profile?.bloodGroup || 'O+'}</div>
              <div className="text-[10px] text-slate-400">Tag: {currentTag}</div>
            </div>

            <div className="p-3 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
              <QRCodeSVG value={`${window.location.origin}/id/${currentTag}`} size={64} level="M" />
              <div className="text-left text-[10px] space-y-1">
                <span className="text-slate-400 font-bold block">HELMET QR</span>
                <a
                  href={`/id/${currentTag}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>View QR</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Manual Crash Trigger for Judges */}
          <div className="mt-auto pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 font-medium">
              Stage Controls:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (!isMonitoring) startMonitoring();
                  else stopMonitoring();
                }}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>

              <button
                onClick={simulateImpact}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Simulate 4.8G Impact</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: RESPONDER COMMAND CENTER VIEW (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Responder Command Feed
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Total Incidents: {alerts.length}
            </span>
          </div>

          {/* Map Preview */}
          <div className="h-[240px] rounded-2xl overflow-hidden border border-slate-800">
            <IncidentMap
              alerts={alerts}
              selectedAlert={selectedAlert}
              onSelectAlert={setSelectedAlert}
              className="h-full"
            />
          </div>

          {/* Incident Triage Box */}
          {selectedAlert ? (
            <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-white">{selectedAlert.riderName}</div>
                  <div className="text-xs text-slate-400">
                    Location: {selectedAlert.locationName || 'GPS: 28.6139°, 77.2090°'} • Tag: {selectedAlert.tagId}
                  </div>
                </div>
                <AlertStatusBadge status={selectedAlert.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Blood Group</span>
                  <span className="font-bold text-white text-sm">{selectedAlert.medicalSummary?.bloodGroup || 'O+'}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Drug Allergies</span>
                  <span className="font-bold text-rose-300 text-xs">{selectedAlert.medicalSummary?.allergies?.join(', ') || 'Penicillin'}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Peak Telemetry</span>
                  <span className="font-bold text-sky-400 font-mono text-xs">{selectedAlert.sensorSummary?.peakG || 4.6}G</span>
                </div>
              </div>

              {/* Triage Actions */}
              <div className="flex items-center gap-2 pt-1">
                {selectedAlert.status === 'pending' && (
                  <button
                    onClick={() => acknowledgeAlert(selectedAlert.id)}
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    Acknowledge Alert
                  </button>
                )}

                {(selectedAlert.status === 'pending' || selectedAlert.status === 'acknowledged') && (
                  <button
                    onClick={() => markResponding(selectedAlert.id)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    Mark Responding
                  </button>
                )}

                {selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => resolveAlert(selectedAlert.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-850 border border-slate-800 text-center text-xs text-slate-500">
              No incident currently selected.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
