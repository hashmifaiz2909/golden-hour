import React, { useEffect, useRef } from 'react';
import { Activity, Gauge } from 'lucide-react';
import { SensorReading, CrashEvaluationResult } from '@shared/types/sensor';
import { calculateMagnitude, mssToG } from '@shared/utils/threshold';

interface Props {
  liveReading: SensorReading | null;
  latestEval: CrashEvaluationResult | null;
}

export const TelemetryGraph: React.FC<Props> = ({ liveReading, latestEval }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>([]);

  const ax = liveReading?.accel?.x || 0;
  const ay = liveReading?.accel?.y || 0;
  const az = liveReading?.accel?.z || 9.8;
  const resultantMss = calculateMagnitude(ax, ay, az);
  const currentG = mssToG(resultantMss);

  // Update rolling history buffer for canvas waveform
  useEffect(() => {
    historyRef.current.push(currentG);
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline 1.0G Threshold Line
    const baselineY = height - (1.0 / 5.0) * height;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();

    // 3.8G Impact Threshold Line
    const crashThresholdY = height - (3.8 / 5.0) * height;
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, crashThresholdY);
    ctx.lineTo(width, crashThresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Live Waveform
    const history = historyRef.current;
    if (history.length > 1) {
      ctx.beginPath();
      ctx.lineWidth = 2.5;

      // Color wave based on current classification
      if (latestEval?.classification === 'POSSIBLE_CRASH') {
        ctx.strokeStyle = '#E11D48';
      } else if (latestEval?.classification === 'POTHOLE_OR_BUMP' || latestEval?.classification === 'HARD_BRAKING') {
        ctx.strokeStyle = '#F59E0B';
      } else {
        ctx.strokeStyle = '#0284C7';
      }

      for (let i = 0; i < history.length; i++) {
        const x = (i / (history.length - 1)) * width;
        const val = Math.min(Math.max(history[i], 0), 5.0);
        const y = height - (val / 5.0) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [currentG, latestEval]);

  const getStatusColor = () => {
    switch (latestEval?.classification) {
      case 'POSSIBLE_CRASH':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'POTHOLE_OR_BUMP':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'HARD_BRAKING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Waveform Canvas */}
      <div className="rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-900">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="font-mono">LIVE KINETIC WAVEFORM (0 - 5.0 G)</span>
          </div>
          <span className="font-mono text-slate-500">10 Hz Telemetry</span>
        </div>
        <canvas ref={canvasRef} width={380} height={110} className="w-full h-[110px]" />
      </div>

      {/* Sensor Metric Tiles */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500">Peak G-Force</div>
          <div className="text-lg font-extrabold font-mono text-slate-900">
            {currentG.toFixed(2)}<span className="text-xs text-slate-500 font-normal">G</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500">Axial Jerk</div>
          <div className="text-lg font-extrabold font-mono text-slate-900">
            {(latestEval?.jerkMagnitude || 0).toFixed(1)}<span className="text-xs text-slate-500 font-normal"> m/s³</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500">Angular Tilt</div>
          <div className="text-lg font-extrabold font-mono text-slate-900">
            {(latestEval?.tiltDeltaDeg || 0).toFixed(0)}<span className="text-xs text-slate-500 font-normal">°</span>
          </div>
        </div>
      </div>

      {/* Real-time Classification State */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">Classification State</div>
            <div className="text-xs font-bold tracking-tight">
              {latestEval?.classification || 'NORMAL_RIDING'}
            </div>
          </div>
        </div>
        <div className="text-right text-[11px]">
          <span className="font-semibold">Confidence: </span>
          <span className="font-mono font-bold">{((latestEval?.confidence || 0.95) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
