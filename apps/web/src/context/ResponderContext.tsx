import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, Alert } from '../services/api';

interface ResponderStats {
  total: number;
  pending: number;
  acknowledged: number;
  responding: number;
  resolved: number;
  activeIncidents: number;
}

interface ResponderContextType {
  alerts: Alert[];
  selectedAlert: Alert | null;
  stats: ResponderStats;
  isLoading: boolean;
  filterStatus: string;
  hasNewAlertPing: boolean;
  setSelectedAlert: (alert: Alert | null) => void;
  setFilterStatus: (status: string) => void;
  loadAlerts: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  markResponding: (id: string) => Promise<void>;
  markOnScene: (id: string, notes?: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  dismissAlertPing: () => void;
}

const ResponderContext = createContext<ResponderContextType | undefined>(undefined);

export const ResponderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [stats, setStats] = useState<ResponderStats>({
    total: 0,
    pending: 0,
    acknowledged: 0,
    responding: 0,
    resolved: 0,
    activeIncidents: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [hasNewAlertPing, setHasNewAlertPing] = useState<boolean>(false);

  const calculateStats = (list: Alert[]) => {
    const pending = list.filter(a => a.status === 'pending').length;
    const acknowledged = list.filter(a => a.status === 'acknowledged').length;
    const responding = list.filter(a => a.status === 'responding').length;
    const resolved = list.filter(a => a.status === 'resolved').length;
    setStats({
      total: list.length,
      pending,
      acknowledged,
      responding,
      resolved,
      activeIncidents: pending + acknowledged + responding
    });
  };

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getResponderAlerts();
      setAlerts(res.alerts);
      calculateStats(res.alerts);
      if (!selectedAlert && res.alerts.length > 0) {
        setSelectedAlert(res.alerts[0]);
      }
    } catch (err) {
      console.warn('[ResponderContext] Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAlert]);

  useEffect(() => {
    loadAlerts();
  }, []);

  // Connect to Real-Time SSE Stream for Zero-Latency Emergency Pings
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'ALERT_CREATED') {
            const newAlert: Alert = payload.data;
            setAlerts(prev => {
              const updated = [newAlert, ...prev.filter(a => a.id !== newAlert.id)];
              calculateStats(updated);
              return updated;
            });
            setSelectedAlert(newAlert);
            setHasNewAlertPing(true);
          } else if (payload.type === 'ALERT_STATUS_UPDATED') {
            const updatedAlert: Alert = payload.data;
            setAlerts(prev => {
              const updated = prev.map(a => a.id === updatedAlert.id ? updatedAlert : a);
              calculateStats(updated);
              return updated;
            });
            setSelectedAlert(prev => (prev?.id === updatedAlert.id ? updatedAlert : prev));
          }
        } catch (e) {
          // heartbeat parse
        }
      };
    } catch (e) {
      console.warn('[ResponderContext] SSE not available in environment, using polling fallback');
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const acknowledgeAlert = async (id: string) => {
    const res = await api.updateResponderTriage(id, 'acknowledged', 'Officer Triage Unit');
    setAlerts(prev => prev.map(a => a.id === id ? res.alert : a));
    setSelectedAlert(res.alert);
    calculateStats(alerts);
  };

  const markResponding = async (id: string) => {
    const res = await api.updateResponderTriage(id, 'responding', 'EMS Ambulance Unit 4');
    setAlerts(prev => prev.map(a => a.id === id ? res.alert : a));
    setSelectedAlert(res.alert);
    calculateStats(alerts);
  };

  const markOnScene = async (id: string, notes?: string) => {
    const res = await api.updateResponderTriage(id, 'on_scene', 'EMS Rapid Response Team', notes || 'Paramedic arrival on scene confirmed');
    setAlerts(prev => prev.map(a => a.id === id ? res.alert : a));
    setSelectedAlert(res.alert);
    calculateStats(alerts);
  };

  const resolveAlert = async (id: string) => {
    const res = await api.updateResponderTriage(id, 'resolved', 'Dr. Emergency Lead');
    setAlerts(prev => prev.map(a => a.id === id ? res.alert : a));
    setSelectedAlert(res.alert);
    calculateStats(alerts);
  };

  const dismissAlertPing = () => {
    setHasNewAlertPing(false);
  };

  return (
    <ResponderContext.Provider
      value={{
        alerts,
        selectedAlert,
        stats,
        isLoading,
        filterStatus,
        hasNewAlertPing,
        setSelectedAlert,
        setFilterStatus,
        loadAlerts,
        acknowledgeAlert,
        markResponding,
        markOnScene,
        resolveAlert,
        dismissAlertPing
      }}
    >
      {children}
    </ResponderContext.Provider>
  );
};

export const useResponder = () => {
  const ctx = useContext(ResponderContext);
  if (!ctx) throw new Error('useResponder must be used within ResponderProvider');
  return ctx;
};
