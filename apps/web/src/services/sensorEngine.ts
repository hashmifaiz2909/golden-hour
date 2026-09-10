import { evaluateSensorWindow, DEFAULT_CRASH_CONFIG, calculateMagnitude } from '@shared/utils/threshold';
import { SensorReading, CrashThresholdConfig, CrashEvaluationResult } from '@shared/types/sensor';

export type SensorTelemetryListener = (reading: SensorReading, latestEval: CrashEvaluationResult) => void;
export type CrashDetectedCallback = (evalResult: CrashEvaluationResult, snapshot: SensorReading[]) => void;

export class SensorEngine {
  private isMonitoring: boolean = false;
  private buffer: SensorReading[] = [];
  private maxBufferSize: number = 30; // ~3 seconds at 10Hz
  private config: CrashThresholdConfig = { ...DEFAULT_CRASH_CONFIG };
  private listeners: Set<SensorTelemetryListener> = new Set();
  private onCrashDetected?: CrashDetectedCallback;
  private intervalId: any = null;
  private lastSimulatedMode: 'normal' | 'braking' | 'bump' | 'crash' = 'normal';
  private hasNativeSensors: boolean = false;

  constructor() {
    this.checkNativeSensorSupport();
  }

  private checkNativeSensorSupport() {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      this.hasNativeSensors = true;
    }
  }

  public setConfig(newConfig: Partial<CrashThresholdConfig>) {
    this.config = { ...this.config, ...newConfig };
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

    // 1. Hook native accelerometer/gyroscope if permission granted
    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleDeviceMotion, true);
    }

    // 2. Start simulation / synthesis loop for telemetry & visual graphs
    this.intervalId = setInterval(() => {
      this.tickTelemetry();
    }, 100); // 10Hz sampling
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      window.removeEventListener('devicemotion', this.handleDeviceMotion, true);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  private handleDeviceMotion = (e: DeviceMotionEvent) => {
    if (!this.isMonitoring || !e.accelerationIncludingGravity) return;

    const ax = e.accelerationIncludingGravity.x || 0;
    const ay = e.accelerationIncludingGravity.y || 0;
    const az = e.accelerationIncludingGravity.z || 9.8;

    const gx = e.rotationRate?.alpha || 0;
    const gy = e.rotationRate?.beta || 0;
    const gz = e.rotationRate?.gamma || 0;

    this.pushReading({
      timestamp: Date.now(),
      accel: { x: ax, y: ay, z: az },
      gyro: { alpha: gx, beta: gy, gamma: gz }
    });
  };

  /**
   * Generates realistic telemetry ticks (normal riding baseline, bump, hard braking, or crash simulation)
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
      az = 9.8 + (Math.random() * 14 + 8); // ~2.2G vertical spike
      this.lastSimulatedMode = 'normal';
    } else if (this.lastSimulatedMode === 'braking') {
      ay = -16.0 - Math.random() * 4; // ~1.7G forward deceleration
      this.lastSimulatedMode = 'normal';
    } else if (this.lastSimulatedMode === 'crash') {
      // Severe kinetic crash profile: 4.8G resultant + 70 deg tilt
      ax = 28.0 + Math.random() * 12;
      ay = -32.0 + Math.random() * 10;
      az = 18.0 + Math.random() * 8;
      gx = 65.0;
      gy = 45.0;
      gz = 80.0;
      this.lastSimulatedMode = 'normal';
    }

    this.pushReading({
      timestamp: now,
      accel: { x: ax, y: ay, z: az },
      gyro: { alpha: gx, beta: gy, gamma: gz }
    });
  }

  private pushReading(reading: SensorReading) {
    this.buffer.push(reading);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Evaluate window
    const evalResult = evaluateSensorWindow(this.buffer, this.config);

    // Notify telemetry UI listeners
    for (const listener of this.listeners) {
      listener(reading, evalResult);
    }

    // Trigger crash confirmation if threshold reached
    if (evalResult.detected && this.onCrashDetected) {
      this.onCrashDetected(evalResult, [...this.buffer]);
    }
  }

  /**
   * Triggers an immediate simulated crash impulse for demo/testing
   */
  public triggerSimulatedCrash() {
    this.lastSimulatedMode = 'crash';
    // Immediate tick for responsive demo
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
          // Delhi Connaught Place / Ring Road coordinates for demo reliability
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
