import React, { useState, useEffect } from 'react';
import { 
  Radio, AlertOctagon, CheckCircle2, Clock, Truck, 
  MapPin, Phone, HeartPulse, User, Filter, RefreshCw, 
  Shield, AlertTriangle, ExternalLink, BellRing, Activity, History
} from 'lucide-react';
import { useResponder } from '../../context/ResponderContext';
import { IncidentMap } from '../../components/map/IncidentMap';
import { AlertStatusBadge } from '../../components/common/AlertStatusBadge';
import { api } from '../../services/api';

export const ResponderDashboard: React.FC = () => {
  const { 
    alerts, 
    selectedAlert, 
    setSelectedAlert, 
    stats, 
    isLoading, 
    filterStatus, 
    setFilterStatus, 
    loadAlerts,
    acknowledgeAlert, 
    markResponding, 
    markOnScene,
    resolveAlert,
    hasNewAlertPing,
    dismissAlertPing
  } = useResponder();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; old_status: string; new_status: string; changed_by: string; notes: string; timestamp: string }>>([]);
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);

  // Sync audit logs when selected alert changes
  React.useEffect(() => {
    if (selectedAlert?.id) {
      api.getAlertLogs(selectedAlert.id)
        .then(res => setAuditLogs(res.logs || []))
        .catch(() => setAuditLogs([]));
    } else {
      setAuditLogs([]);
    }
  }, [selectedAlert?.id, selectedAlert?.status]);

  const filteredAlerts = alerts.filter(a => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return a.status === 'pending' || a.status === 'acknowledged' || a.status === 'responding' || (a.status as any) === 'on_scene';
    return a.status === filterStatus;
  });

  const handleAcknowledge = async () => {
    if (!selectedAlert) return;
    setIsUpdatingStatus(true);
    try {
      await acknowledgeAlert(selectedAlert.id);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResponding = async () => {
    if (!selectedAlert) return;
    setIsUpdatingStatus(true);
    try {
      await markResponding(selectedAlert.id);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOnScene = async () => {
    if (!selectedAlert) return;
    setIsUpdatingStatus(true);
    try {
      await markOnScene(selectedAlert.id);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;
    setIsUpdatingStatus(true);
    try {
      await resolveAlert(selectedAlert.id);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Real-time Incident Ping Alert Banner */}
      {hasNewAlertPing && (
        <div className="bg-rose-600 text-white px-6 py-3 flex items-center justify-between animate-emergency-pulse z-30">
          <div className="flex items-center gap-3 font-bold text-sm">
            <BellRing className="w-5 h-5 animate-bounce" />
            <span>CRITICAL INCOMING ACCIDENT TELEMETRY DETECTED — NEW INCIDENT QUEUED</span>
          </div>
          <button
            onClick={dismissAlertPing}
            className="text-xs bg-rose-800 hover:bg-rose-900 px-3 py-1 rounded-lg font-bold border border-rose-400 cursor-pointer"
          >
            Acknowledge Ping
          </button>
        </div>
      )}

      {/* Top Operations Header & KPI Stats Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  EMERGENCY DISPATCH COMMAND
                </h1>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold px-2 py-0.5 rounded border border-rose-500/30">
                  LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Delhi NCR & Metropolitan Emergency Medical Response Sector
              </p>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0">
            
            <div className="bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-750 shrink-0 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Incidents</div>
              <div className="text-lg font-black text-rose-400 font-mono">{stats.activeIncidents}</div>
            </div>

            <div className="bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-750 shrink-0 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</div>
              <div className="text-lg font-black text-amber-400 font-mono">{stats.pending}</div>
            </div>

            <div className="bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-750 shrink-0 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">En Route</div>
              <div className="text-lg font-black text-indigo-400 font-mono">{stats.responding}</div>
            </div>

            <div className="bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-750 shrink-0 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Resolved</div>
              <div className="text-lg font-black text-emerald-400 font-mono">{stats.resolved}</div>
            </div>

            <button
              onClick={() => loadAlerts()}
              className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh Incidents"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

          </div>

        </div>
      </div>

      {/* Main 3-Column Command Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INCIDENT FEED (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Triage Filter Tabs */}
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-1.5 rounded-xl transition-colors ${
                filterStatus === 'all' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 py-1.5 rounded-xl transition-colors ${
                filterStatus === 'pending' ? 'bg-rose-950/80 text-rose-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus('responding')}
              className={`flex-1 py-1.5 rounded-xl transition-colors ${
                filterStatus === 'responding' ? 'bg-indigo-950/80 text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Responding ({stats.responding})
            </button>
          </div>

          {/* Scrollable Incident Cards List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[680px] pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                No incidents match the active filter.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedAlert?.id === alert.id;
                const isUrgent = alert.status === 'pending' || alert.status === 'acknowledged';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-850 border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isUrgent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        ) : null}
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {alert.tagId}
                        </span>
                      </div>
                      <AlertStatusBadge status={alert.status} size="sm" />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{alert.riderName}</span>
                        <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                          {alert.medicalSummary?.bloodGroup || 'O+'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{alert.locationName || 'GPS: 28.6139°, 77.2090°'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      <span className="font-mono text-slate-400">
                        Peak: {alert.sensorSummary?.peakG ? `${alert.sensorSummary.peakG}G` : '4.6G'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* CENTER & RIGHT COLUMN: MAP & SELECTED INCIDENT DOSSIER (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Live Incident Map */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>GEOSPATIAL INCIDENT TRACKER</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Target Coords: {selectedAlert?.latitude ? `${selectedAlert.latitude.toFixed(4)}°, ${selectedAlert.longitude?.toFixed(4)}°` : 'Live Telemetry'}
              </span>
            </div>
            <IncidentMap
              alerts={alerts}
              selectedAlert={selectedAlert}
              onSelectAlert={setSelectedAlert}
              className="h-[360px]"
            />
          </div>

          {/* Selected Incident Clinical Dossier Panel */}
          {selectedAlert ? (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{selectedAlert.riderName}</h2>
                    <span className="text-xs font-mono bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-500/30">
                      TAG {selectedAlert.tagId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Incident ID: {selectedAlert.id} • Dispatched at {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AlertStatusBadge status={selectedAlert.status} size="lg" />
                </div>
              </div>

              {/* Dossier Body: 3 Medical & Telemetry Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* 1. Essential Clinical Data */}
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400 text-[11px]">
                    <HeartPulse className="w-4 h-4" />
                    <span>Emergency Medical</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Blood Type</span>
                    <span className="text-xl font-black text-white">{selectedAlert.medicalSummary?.bloodGroup || 'O+'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Drug Allergies</span>
                    <span className="font-semibold text-rose-300">
                      {selectedAlert.medicalSummary?.allergies?.join(', ') || 'Penicillin'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Pre-existing</span>
                    <span className="text-slate-300">
                      {selectedAlert.medicalSummary?.medicalConditions?.join(', ') || 'Mild Asthma'}
                    </span>
                  </div>
                </div>

                {/* 2. Impact Telemetry */}
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-sky-400 text-[11px]">
                    <Activity className="w-4 h-4" />
                    <span>Kinetic Impact</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Peak Acceleration</span>
                    <span className="text-xl font-black text-white font-mono">
                      {selectedAlert.sensorSummary?.peakG || 4.6} <span className="text-xs text-slate-400">G</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Impulse Jerk</span>
                    <span className="font-semibold font-mono text-slate-200">
                      {selectedAlert.sensorSummary?.maxJerk || 24.2} m/s³
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Detection Engine</span>
                    <span className="text-slate-300 uppercase font-mono">
                      {selectedAlert.detectionType} ({(selectedAlert.confidence || 0.92) * 100}%)
                    </span>
                  </div>
                </div>

                {/* 3. Emergency Contact & Map Link */}
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400 text-[11px]">
                    <Phone className="w-4 h-4" />
                    <span>Emergency Contacts</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Primary Contact</span>
                    <span className="font-bold text-white block">
                      {selectedAlert.medicalSummary?.emergencyContacts?.[0]?.name || 'Primary ICE Contact'}
                    </span>
                    <a
                      href={`tel:${selectedAlert.medicalSummary?.emergencyContacts?.[0]?.phone || '+919876543211'}`}
                      className="text-emerald-400 font-mono text-xs hover:underline"
                    >
                      {selectedAlert.medicalSummary?.emergencyContacts?.[0]?.phone || '+919876543211'}
                    </a>
                  </div>

                  <div className="pt-1">
                    <a
                      href={`https://maps.google.com/?q=${selectedAlert.latitude},${selectedAlert.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Triage Action Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Triage Actions:
                </span>

                {selectedAlert.status === 'pending' && (
                  <button
                    onClick={handleAcknowledge}
                    disabled={isUpdatingStatus}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Acknowledge Alert</span>
                  </button>
                )}

                {(selectedAlert.status === 'pending' || selectedAlert.status === 'acknowledged') && (
                  <button
                    onClick={handleResponding}
                    disabled={isUpdatingStatus}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Dispatch EMS (Mark Responding)</span>
                  </button>
                )}

                {(selectedAlert.status === 'responding' || (selectedAlert.status as any) === 'acknowledged') && (
                  <button
                    onClick={handleOnScene}
                    disabled={isUpdatingStatus}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Mark On-Scene</span>
                  </button>
                )}

                {selectedAlert.status !== 'resolved' && selectedAlert.status !== 'cancelled' && (
                  <button
                    onClick={handleResolve}
                    disabled={isUpdatingStatus}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Incident Resolved</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAuditLogs(!showAuditLogs)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    showAuditLogs 
                      ? 'bg-slate-700 text-white border-slate-600' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-sky-400" />
                  <span>Audit Trail ({auditLogs.length})</span>
                </button>

                <a
                  href={`/id/${selectedAlert.tagId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <span>View Public Medical Tag</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Collapsible Chronological Audit Trail Drawer */}
              {showAuditLogs && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Chronological Chain-of-Custody & Triage Audit Trail</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">Immutable Log ID: {selectedAlert.id}</span>
                  </div>

                  {auditLogs.length > 0 ? (
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                                {log.old_status} &rarr; <strong className="text-emerald-400">{log.new_status}</strong>
                              </span>
                              <span className="font-semibold text-slate-200">{log.changed_by}</span>
                            </div>
                            {log.notes && <p className="text-[11px] text-slate-400 italic">{log.notes}</p>}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-850 rounded-xl border border-slate-800">
                      No status transitions recorded yet for this incident.
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-sm text-slate-500">
              Select an incident from the left queue to review its clinical dossier and dispatch status.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
