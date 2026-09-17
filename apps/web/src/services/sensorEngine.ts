import { evaluateSensorWindow, DEFAULT_CRASH_CONFIG, calculateMagnitude, mssToG } from '@shared/utils/threshold';
import { SensorReading, CrashThresholdConfig, CrashEvaluationResult } from '@shared/types/sensor';

export type SensorTelemetryListener = (reading: SensorReading, latestEval: CrashEvaluationResult) => void;
export type CrashDetectedCallback = (evalResult: CrashEvaluationResult, snapshot: SensorReading[]) => void;
export type MotionPermissionState = 'not_required' | 'prompt' | 'granted' | 'denied';

export class SensorEngine {
  private isMonitoring: boolean = false;
  private buffer: SensorReading[] = [];
  private maxBufferSize: number = 30; // ~3 seconds at 10Hz
  private config: CrashThresholdConfig = { ...DEFAULT_CRASH_CONFIG };
  private listeners: Set<SensorTelemetryListener> = new Set();
  private onCrashDetected?: CrashDetectedCallback;
  private intervalId: any = null;
  private fallbackTimerId: any = null;
  private lastSimulatedMode: 'normal' | 'braking' | 'bump' | 'crash' = 'normal';
  private hasNativeSensors: boolean = false;
  private nativeEventCount: number = 0;
  private lastLogTime: number = 0;
  private currentOrientation: { beta: number; gamma: number } = { beta: 0, gamma: 0 };

  constructor() {
    this.checkNativeSensorSupport();
  }

  private checkNativeSensorSupport() {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      this.hasNativeSensors = true;
    }
  }

  /**
   * Returns true if native physical sensors are currently transmitting events
   */
  public isUsingRealHardware(): boolean {
    return this.nativeEventCount > 3;
  }

  /**
   * Detects iOS 13+ device (iPhone/iPad) where permission must be requested via direct user gesture
   */
  public isIosMotionPermissionRequired(): boolean {
    if (typeof window === 'undefined') return false;
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return (
      isIosDevice &&
      typeof (window.DeviceMotionEvent as any)?.requestPermission === 'function'
    );
  }

  /**
   * Retrieves persistent motion permission state
   */
  public getMotionPermissionState(): MotionPermissionState {
    if (!this.isIosMotionPermissionRequired()) {
      return 'not_required';
    }
    const saved = localStorage.getItem('gh_ios_motion_permission');
    if (saved === 'granted') return 'granted';
    if (saved === 'denied') return 'denied';
    return 'prompt';
  }

  /**
   * Synchronously invoked inside a direct user click on iOS 13+
   */
  public async requestIosMotionPermission(): Promise<MotionPermissionState> {
    if (!this.isIosMotionPermissionRequired()) {
      return 'not_required';
    }

    try {
      const permission = await (window.DeviceMotionEvent as any).requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('gh_ios_motion_permission', 'granted');
        console.log('[SensorEngine] iOS motion sensor access GRANTED by user.');
        // If monitoring was active or requested, start listeners immediately
        if (this.isMonitoring) {
          this.hookDeviceMotionListeners();
        }
        return 'granted';
      } else {
        localStorage.setItem('gh_ios_motion_permission', 'denied');
        console.warn('[SensorEngine] iOS motion sensor access DENIED by user.');
        return 'denied';
      }
    } catch (err) {
      console.warn('[SensorEngine] iOS motion permission request error:', err);
      localStorage.setItem('gh_ios_motion_permission', 'denied');
      return 'denied';
    }
  }

  public setConfig(newConfig: Partial<CrashThresholdConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('[SensorEngine] Threshold config updated:', this.config);
  }

  public getConfig(): CrashThresholdConfig {
    return this.config;
  }

  public subscribeTelemetry(listener: SensorTelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setCrashCallback(cb: CrashDetectedCallback) {
    this.onCrashDetected = cb;
  }

  public startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.buffer = [];
    this.nativeEventCount = 0;

    console.log('[SensorEngine 🚀] Starting Safety Monitoring Engine...');
    console.log(`[SensorEngine] Configured thresholds: Impact=${this.config.impactGThreshold}G, Jerk=${this.config.jerkThreshold}m/s³, Tilt=${this.config.tiltAngleThresholdDeg}°`);

    // 1. Hook physical device motion/orientation listeners if permitted
    this.hookDeviceMotionListeners();

    // 2. Start a watchdog: If no real hardware events arrive within 800ms (e.g. desktop Mac/PC),
    // start gentle synthetic simulation so UI waveforms and demo dashboard remain functional.
    if (this.fallbackTimerId) clearTimeout(this.fallbackTimerId);
    this.fallbackTimerId = setTimeout(() => {
      if (this.nativeEventCount === 0 && this.isMonitoring) {
        console.log('[SensorEngine ℹ️] No native hardware events received (desktop or simulated environment). Enabling visual telemetry synthesis.');
        this.startSyntheticLoop();
      }
    }, 800);
  }

  private hookDeviceMotionListeners() {
    if (typeof window === 'undefined') return;

    const permState = this.getMotionPermissionState();
    if (permState === 'not_required' || permState === 'granted') {
      window.addEventListener('devicemotion', this.handleDeviceMotion, true);
      window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
      console.log('[SensorEngine] Native devicemotion & deviceorientation listeners attached.');
    } else {
      console.log('[SensorEngine] Waiting for user permission on iOS before attaching devicemotion.');
    }
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion, true);
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.fallbackTimerId) {
      clearTimeout(this.fallbackTimerId);
      this.fallbackTimerId = null;
    }
    console.log('[SensorEngine 🛑] Monitoring stopped.');
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  private handleDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta !== null && e.gamma !== null) {
      this.currentOrientation = {
        beta: e.beta || 0,
        gamma: e.gamma || 0
      };
    }
  };

  /**
   * PRIMARY REAL HARDWARE HANDLER:
   * Called continuously by phone hardware accelerometer and gyroscope (typically 60Hz)
   */
  private handleDeviceMotion = (e: DeviceMotionEvent) => {
    if (!this.isMonitoring) return;

    // Prefer accelerationIncludingGravity because it captures total kinetic G-force and tilt relative to Earth
    const accel = e.accelerationIncludingGravity || e.acceleration;
    if (!accel || accel.x === null || accel.y === null || accel.z === null) {
      return;
    }

    this.nativeEventCount++;

    // If native events are streaming, STOP the synthetic simulation loop immediately
    // to prevent fake random noise from contaminating real physical sensor data
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[SensorEngine 🟢] Real phone motion stream ACTIVE. Synthetic generator deactivated.');
    }

    const ax = accel.x;
    const ay = accel.y;
    const az = accel.z;

    const gx = e.rotationRate?.alpha || 0;
    const gy = e.rotationRate?.beta || 0;
    const gz = e.rotationRate?.gamma || 0;

    this.pushReading({
      timestamp: Date.now(),
      accel: { x: ax, y: ay, z: az },
      gyro: { alpha: gx, beta: gy, gamma: gz }
    }, true);
  };

  private startSyntheticLoop() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.tickTelemetry();
    }, 100); // 10Hz sampling for synthetic preview
  }

  /**
   * Fallback simulator loop (only active when NO native sensors exist, e.g. desktop Mac)
   */
  private tickTelemetry() {
    if (!this.isMonitoring) return;

    const now = Date.now();
    let ax = (Math.random() - 0.5) * 0.4;
    let ay = (Math.random() - 0.5) * 0.4;
    let az = 9.80665 + (Math.random() - 0.5) * 0.6; // ~1.0G baseline
    let gx = (Math.random() - 0.5) * 4;
    let gy = (Math.random() - 0.5) * 4;
    let gz = (Math.random() - 0.5) * 4;

    if (this.lastSimulatedMode === 'bump') {
      az = 9.8 + (Math.random() * 12 + 6); // ~2.0G vertical bump
      this.lastSimulatedMode = 'normal';
    } else if (this.lastSimulatedMode === 'braking') {
      ay = -14.0 - Math.random() * 4; // ~1.5G forward deceleration
      this.lastSimulatedMode = 'normal';
    } else if (this.lastSimulatedMode === 'crash') {
      // Severe kinetic crash profile: 4.5G resultant + high jerk + 80 deg tumble
      ax = 26.0 + Math.random() * 10;
      ay = -28.0 + Math.random() * 10;
      az = 16.0 + Math.random() * 8;
      gx = 240.0;
      gy = 180.0;
      gz = 320.0;
      this.lastSimulatedMode = 'normal';
    }

    this.pushReading({
      timestamp: now,
      accel: { x: ax, y: ay, z: az },
      gyro: { alpha: gx, beta: gy, gamma: gz }
    }, false);
  }

  private pushReading(reading: SensorReading, isNative: boolean) {
    this.buffer.push(reading);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Evaluate current window
    const evalResult = evaluateSensorWindow(this.buffer, this.config);

    // Notify UI subscribers (graphs, gauges, countdown modal)
    for (const listener of this.listeners) {
      listener(reading, evalResult);
    }

    // REAL-TIME CONSOLE TELEMETRY LOGGING (Throttled to every 600ms during normal riding)
    const now = Date.now();
    const magMss = calculateMagnitude(reading.accel.x, reading.accel.y, reading.accel.z);
    const gVal = mssToG(magMss);
    const gyroMag = reading.gyro ? Math.sqrt((reading.gyro.alpha || 0)**2 + (reading.gyro.beta || 0)**2 + (reading.gyro.gamma || 0)**2) : 0;

    if (now - this.lastLogTime > 600) {
      this.lastLogTime = now;
      const srcTag = isNative ? '🟢 NATIVE SENSOR' : '🟡 DEMO SIMULATOR';
      console.log(
        `%c[MotionSensor] %c${srcTag} %c| G: ${gVal.toFixed(2)}G | Accel: [ax: ${reading.accel.x.toFixed(1)}, ay: ${reading.accel.y.toFixed(1)}, az: ${reading.accel.z.toFixed(1)}] | Gyro: ${gyroMag.toFixed(0)}°/s | Peak: ${evalResult.peakMagnitudeG}G | Status: ${evalResult.classification}`,
        'color: #0ea5e9; font-weight: bold;',
        isNative ? 'color: #10b981; font-weight: bold;' : 'color: #f59e0b;',
        'color: inherit;'
      );
    }

    // Highlight any noticeable impulse spike in console
    if (evalResult.peakMagnitudeG >= 2.0 && evalResult.classification !== 'NORMAL_RIDING' && !evalResult.detected) {
      console.warn(
        `[MotionSensor ⚡ DYNAMICS SPIKE] Peak: ${evalResult.peakMagnitudeG}G | Jerk: ${evalResult.jerkMagnitude}m/s³ | Classification: ${evalResult.classification} | Reason: ${evalResult.reason}`
      );
    }

    // CRASH DETECTION TRIGGER
    if (evalResult.detected && this.onCrashDetected) {
      console.error(
        `%c[MotionSensor 🚨 CRASH CONFIRMED BY TELEMETRY] Peak: ${evalResult.peakMagnitudeG}G (Threshold: ${this.config.impactGThreshold}G) | Jerk: ${evalResult.jerkMagnitude}m/s³ | Triggering 20s confirmation safeguard!`,
        'color: #ef4444; font-weight: bold; font-size: 13px;'
      );
      this.onCrashDetected(evalResult, [...this.buffer]);
    }
  }

  /**
   * Triggers an immediate simulated crash impulse for demo/testing
   */
  public triggerSimulatedCrash() {
    this.lastSimulatedMode = 'crash';
    this.tickTelemetry();
  }

  public triggerSimulatedPothole() {
    this.lastSimulatedMode = 'bump';
    this.tickTelemetry();
  }

  public triggerSimulatedBraking() {
    this.lastSimulatedMode = 'braking';
    this.tickTelemetry();
  }

  /**
   * Directly feeds physical or test motion reading into the detection pipeline.
   * Enables automated CI and physical sensor calibration without requiring synthetic mode.
   */
  public injectMotionReading(reading: { accel: { x: number; y: number; z: number }; gyro?: { alpha: number; beta: number; gamma: number } }) {
    this.nativeEventCount++;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.pushReading({
      timestamp: Date.now(),
      accel: reading.accel,
      gyro: reading.gyro
    }, true);
  }

  /**
   * Helper to fetch real GPS or realistic fallback
   */
  public async getGeolocation(): Promise<{ latitude: number | null; longitude: number | null; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return { latitude: null, longitude: null, error: 'Geolocation not supported by device' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          console.warn('[SensorEngine] Real GPS unavailable, using demo fallback:', err.message);
          resolve({
            latitude: 28.6139,
            longitude: 77.2090,
            error: 'Real GPS permission denied or unavailable. Fallback coordinates active.'
          });
        },
        { timeout: 4000, enableHighAccuracy: true }
      );
    });
  }
}

export const sensorEngine = new SensorEngine();

if (typeof window !== 'undefined') {
  (window as any).__goldenHourSensorEngine = sensorEngine;
}

