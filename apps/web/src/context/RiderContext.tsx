import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api, MedicalProfile, Alert } from '../services/api';
import { sensorEngine } from '../services/sensorEngine';
import { SensorReading, CrashEvaluationResult, CrashThresholdConfig } from '@shared/types/sensor';
import { DEFAULT_CRASH_CONFIG } from '@shared/utils/threshold';

interface RiderContextType {
  profile: MedicalProfile | null;
  isLoadingProfile: boolean;
  isMonitoring: boolean;
  liveReading: SensorReading | null;
  latestEval: CrashEvaluationResult | null;
  showCrashModal: boolean;
  countdown: number;
  lastAlert: Alert | null;
  thresholdConfig: CrashThresholdConfig;
  loadProfile: () => Promise<void>;
  updateProfile: (updated: Partial<MedicalProfile>) => Promise<void>;
  createProfile: (data: Partial<MedicalProfile>) => Promise<MedicalProfile>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  triggerEmergencyAlert: (type?: Alert['detectionType']) => Promise<Alert>;
  cancelCrashEvent: (reason?: string) => void;
  confirmCrashNow: () => void;
  simulateImpact: () => void;
  simulateBraking: () => void;
  simulatePothole: () => void;
  updateThresholdConfig: (cfg: Partial<CrashThresholdConfig>) => void;
  resetAlertState: () => void;
  clearProfile: () => void;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<MedicalProfile | null>(() => {
    try {
      const saved = localStorage.getItem('gh_custom_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name.includes('Aarav') || parsed.name.includes('Mehta') || parsed.name === 'Emergency Rider')) {
          localStorage.removeItem('gh_custom_profile');
          return null;
        }
        return parsed;
      }
    } catch {
      localStorage.removeItem('gh_custom_profile');
    }
    return null;
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [liveReading, setLiveReading] = useState<SensorReading | null>(null);
  const [latestEval, setLatestEval] = useState<CrashEvaluationResult | null>(null);
  const [showCrashModal, setShowCrashModal] = useState<boolean>(false);
  const [crashEvalSnapshot, setCrashEvalSnapshot] = useState<CrashEvaluationResult | null>(null);
  const [countdown, setCountdown] = useState<number>(20);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const [thresholdConfig, setThresholdConfig] = useState<CrashThresholdConfig>({ ...DEFAULT_CRASH_CONFIG });

  const loadProfile = useCallback(async () => {
    if (!token || user?.role !== 'rider') return;
    setIsLoadingProfile(true);
    try {
      const res = await api.getProfile(token);
      if (res.profile) {
        setProfile(res.profile);
        localStorage.setItem('gh_custom_profile', JSON.stringify(res.profile));
      }
    } catch (err) {
      console.warn('[RiderContext] Profile fetch error, using fallback/cached profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token, user]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    try {
      localStorage.removeItem('gh_custom_profile');
    } catch {
      // safe
    }
  }, []);

  useEffect(() => {
    if (token && user?.role === 'rider') {
      loadProfile();
    } else if (!token || !user) {
      clearProfile();
    }
  }, [token, user, loadProfile, clearProfile]);

  const updateProfile = async (updated: Partial<MedicalProfile>) => {
    const activeToken = token || localStorage.getItem('gh_token');
    const activeUser = user || (localStorage.getItem('gh_user') ? JSON.parse(localStorage.getItem('gh_user')!) : null);
    const currentTagId = profile?.tagId || `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    const merged: MedicalProfile = {
      id: profile?.id || `profile-${Date.now()}`,
      ownerUserId: activeUser?.id || 'guest-user',
      tagId: updated.tagId || currentTagId,
      name: updated.name || profile?.name || activeUser?.name || 'Emergency User',
      bloodGroup: updated.bloodGroup || profile?.bloodGroup || 'Unknown',
      allergies: updated.allergies || profile?.allergies || [],
      medicalConditions: updated.medicalConditions || profile?.medicalConditions || [],
      medications: updated.medications || profile?.medications || [],
      doctorName: updated.doctorName !== undefined ? updated.doctorName : (profile?.doctorName || ''),
      doctorPhone: updated.doctorPhone !== undefined ? updated.doctorPhone : (profile?.doctorPhone || ''),
      insuranceProvider: updated.insuranceProvider !== undefined ? updated.insuranceProvider : (profile?.insuranceProvider || ''),
      insurancePolicy: updated.insurancePolicy !== undefined ? updated.insurancePolicy : (profile?.insurancePolicy || ''),
      organDonor: updated.organDonor !== undefined ? updated.organDonor : (profile?.organDonor ?? true),
      emergencyInstructions: updated.emergencyInstructions !== undefined ? updated.emergencyInstructions : (profile?.emergencyInstructions || ''),
      emergencyContacts: updated.emergencyContacts || profile?.emergencyContacts || [],
      notes: updated.notes || profile?.notes || '',
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updated
    };

    setProfile(merged);
    localStorage.setItem('gh_custom_profile', JSON.stringify(merged));

    if (activeToken) {
      try {
        const res = await api.updateProfile(activeToken, merged);
        if (res.profile) {
          setProfile(res.profile);
          localStorage.setItem('gh_custom_profile', JSON.stringify(res.profile));
        }
      } catch (err) {
        console.warn('[RiderContext] updateProfile network error, local profile kept');
      }
    }
  };

  const createProfile = async (data: Partial<MedicalProfile>): Promise<MedicalProfile> => {
    const activeToken = token || localStorage.getItem('gh_token');
    const activeUser = user || (localStorage.getItem('gh_user') ? JSON.parse(localStorage.getItem('gh_user')!) : null);
    const randomTag = `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: MedicalProfile = {
      id: `profile-${Date.now()}`,
      ownerUserId: activeUser?.id || `user-${Date.now()}`,
      tagId: data.tagId || randomTag,
      name: data.name || activeUser?.name || 'New Profile',
      bloodGroup: data.bloodGroup || 'Unknown',
      allergies: data.allergies || [],
      medicalConditions: data.medicalConditions || [],
      medications: data.medications || [],
      doctorName: data.doctorName || '',
      doctorPhone: data.doctorPhone || '',
      insuranceProvider: data.insuranceProvider || '',
      insurancePolicy: data.insurancePolicy || '',
      organDonor: data.organDonor !== undefined ? data.organDonor : true,
      emergencyInstructions: data.emergencyInstructions || '',
      emergencyContacts: data.emergencyContacts || [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    setProfile(newProfile);
    localStorage.setItem('gh_custom_profile', JSON.stringify(newProfile));

    if (activeToken) {
      try {
        const res = await api.updateProfile(activeToken, newProfile);
        if (res.profile) {
          setProfile(res.profile);
          localStorage.setItem('gh_custom_profile', JSON.stringify(res.profile));
          return res.profile;
        }
      } catch (err) {
        console.warn('[RiderContext] createProfile remote sync error, using local');
      }
    }

    return newProfile;
  };

  // Sensor subscription & crash trigger
  useEffect(() => {
    const unsub = sensorEngine.subscribeTelemetry((reading, evaluation) => {
      setLiveReading(reading);
      setLatestEval(evaluation);
    });

    sensorEngine.setCrashCallback((evalRes) => {
      if (!showCrashModal && !lastAlert) {
        setCrashEvalSnapshot(evalRes);
        setShowCrashModal(true);
        setCountdown(thresholdConfig.countdownDurationSec || 20);
      }
    });

    return () => {
      unsub();
    };
  }, [showCrashModal, lastAlert, thresholdConfig]);

  // Countdown timer when crash modal is active
  useEffect(() => {
    let timer: any = null;
    if (showCrashModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time expired -> Dispatch alert!
            triggerEmergencyAlert('threshold_impact');
            setShowCrashModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showCrashModal, countdown]);

  const startMonitoring = () => {
    sensorEngine.startMonitoring();
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    sensorEngine.stopMonitoring();
    setIsMonitoring(false);
  };

  const cancelCrashEvent = (reason = 'User confirmed OK') => {
    setShowCrashModal(false);
    setCountdown(20);
    console.log(`[RiderContext] Crash alert cancelled by rider. Reason: ${reason}`);
  };

  const confirmCrashNow = () => {
    setShowCrashModal(false);
    triggerEmergencyAlert(crashEvalSnapshot ? 'threshold_impact' : 'manual_sos');
  };

  const triggerEmergencyAlert = async (type: Alert['detectionType'] = 'manual_sos'): Promise<Alert> => {
    const geo = await sensorEngine.getGeolocation();
    const riderName = profile?.name || user?.name || 'Emergency Rider';
    const riderId = user?.id || 'user-rider-demo-01';
    const tagId = profile?.tagId || 'GH-7749';

    const res = await api.createAlert({
      riderId,
      riderName,
      riderPhone: user?.phone || '+919876543210',
      tagId,
      latitude: geo.latitude,
      longitude: geo.longitude,
      locationName: geo.latitude ? `Coordinates: ${geo.latitude.toFixed(4)}°, ${geo.longitude?.toFixed(4)}°` : 'Location unavailable',
      detectionType: type,
      confidence: crashEvalSnapshot?.confidence || 0.92,
      sensorSummary: crashEvalSnapshot ? {
        peakG: crashEvalSnapshot.peakMagnitudeG,
        maxJerk: crashEvalSnapshot.jerkMagnitude,
        tiltAngleDelta: crashEvalSnapshot.tiltDeltaDeg,
        speedEstimateKmh: 48
      } : undefined
    });

    setLastAlert(res.alert);
    return res.alert;
  };

  const simulateImpact = () => {
    if (!isMonitoring) startMonitoring();
    sensorEngine.triggerSimulatedCrash();
  };

  const simulateBraking = () => {
    if (!isMonitoring) startMonitoring();
    sensorEngine.triggerSimulatedBraking();
  };

  const simulatePothole = () => {
    if (!isMonitoring) startMonitoring();
    sensorEngine.triggerSimulatedPothole();
  };

  const updateThresholdConfig = (cfg: Partial<CrashThresholdConfig>) => {
    setThresholdConfig((prev: CrashThresholdConfig) => {
      const updated = { ...prev, ...cfg };
      sensorEngine.setConfig(updated);
      return updated;
    });
  };

  const resetAlertState = () => {
    setLastAlert(null);
    setShowCrashModal(false);
    setCountdown(20);
  };

  return (
    <RiderContext.Provider
      value={{
        profile,
        isLoadingProfile,
        isMonitoring,
        liveReading,
        latestEval,
        showCrashModal,
        countdown,
        lastAlert,
        thresholdConfig,
        loadProfile,
        updateProfile,
        createProfile,
        startMonitoring,
        stopMonitoring,
        triggerEmergencyAlert,
        cancelCrashEvent,
        confirmCrashNow,
        simulateImpact,
        simulateBraking,
        simulatePothole,
        updateThresholdConfig,
        resetAlertState,
        clearProfile
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => {
  const ctx = useContext(RiderContext);
  if (!ctx) throw new Error('useRider must be used within RiderProvider');
  return ctx;
};
