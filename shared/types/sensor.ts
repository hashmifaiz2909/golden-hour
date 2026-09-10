export type MLClassification = 
  | 'NORMAL_RIDING' 
  | 'HARD_BRAKING' 
  | 'POTHOLE_OR_BUMP' 
  | 'POSSIBLE_CRASH';

export interface AccelerometerReading {
  x: number; // m/s²
  y: number;
  z: number;
}

export interface GyroscopeReading {
  alpha: number; // deg/s or rad/s
  beta: number;
  gamma: number;
}

export interface SensorReading {
  timestamp: number;
  accel: AccelerometerReading;
  gyro?: GyroscopeReading;
  speedKmh?: number;
}

export interface CrashThresholdConfig {
  impactGThreshold: number;       // Default ~3.5G - 4.5G (35 - 45 m/s²)
  jerkThreshold: number;          // Rate of change in acceleration
  tiltAngleThresholdDeg: number;  // Sudden orientation shift > 55 degrees
  countdownDurationSec: number;   // Default 20s
}

export interface CrashEvaluationResult {
  detected: boolean;
  classification: MLClassification;
  confidence: number;
  peakMagnitudeG: number;
  jerkMagnitude: number;
  tiltDeltaDeg: number;
  reason: string;
}
