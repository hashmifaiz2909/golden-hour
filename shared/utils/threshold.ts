import { 
  SensorReading, 
  CrashThresholdConfig, 
  CrashEvaluationResult, 
  MLClassification 
} from '../types/sensor.js';

export const DEFAULT_CRASH_CONFIG: CrashThresholdConfig = {
  impactGThreshold: 3.8,        // 3.8G (~37.2 m/s²) threshold for severe impact
  jerkThreshold: 18.0,          // Sudden impulse change
  tiltAngleThresholdDeg: 55,    // Bike/rider laid down angle
  countdownDurationSec: 20      // 20 second rider confirmation window
};

const GRAVITY_MSS = 9.80665;

/**
 * Calculates resultant acceleration magnitude: sqrt(x² + y² + z²)
 */
export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Converts m/s² to G-force units
 */
export function mssToG(magnitudeMss: number): number {
  return magnitudeMss / GRAVITY_MSS;
}

/**
 * Calculates jerk magnitude between two consecutive sensor readings (m/s³)
 */
export function calculateJerk(
  curr: SensorReading, 
  prev: SensorReading
): number {
  const dt = Math.max((curr.timestamp - prev.timestamp) / 1000, 0.01);
  const dAx = curr.accel.x - prev.accel.x;
  const dAy = curr.accel.y - prev.accel.y;
  const dAz = curr.accel.z - prev.accel.z;
  const dMag = calculateMagnitude(dAx, dAy, dAz);
  return dMag / dt;
}

/**
 * Evaluates a window of sensor readings against threshold parameters.
 * Realistic rule-based heuristics to separate ordinary bumps & hard braking from crashes.
 */
export function evaluateSensorWindow(
  readings: SensorReading[],
  config: CrashThresholdConfig = DEFAULT_CRASH_CONFIG
): CrashEvaluationResult {
  if (!readings || readings.length === 0) {
    return {
      detected: false,
      classification: 'NORMAL_RIDING',
      confidence: 0.95,
      peakMagnitudeG: 1.0,
      jerkMagnitude: 0,
      tiltDeltaDeg: 0,
      reason: 'No telemetry motion.'
    };
  }

  let peakMagnitudeMss = 0;
  let maxJerk = 0;
  let maxTiltDelta = 0;

  for (let i = 0; i < readings.length; i++) {
    const r = readings[i];
    const mag = calculateMagnitude(r.accel.x, r.accel.y, r.accel.z);
    if (mag > peakMagnitudeMss) {
      peakMagnitudeMss = mag;
    }

    if (i > 0) {
      const jerk = calculateJerk(r, readings[i - 1]);
      if (jerk > maxJerk) {
        maxJerk = jerk;
      }
    }

    if (r.gyro) {
      const gyroMag = Math.sqrt(
        (r.gyro.alpha || 0) ** 2 + 
        (r.gyro.beta || 0) ** 2 + 
        (r.gyro.gamma || 0) ** 2
      );
      if (gyroMag > maxTiltDelta) {
        maxTiltDelta = gyroMag;
      }
    }
  }

  const peakG = mssToG(peakMagnitudeMss);

  // Heuristic Classification:
  // 1. Severe Impact + High Jerk => POSSIBLE_CRASH
  if (peakG >= config.impactGThreshold && (maxJerk >= config.jerkThreshold || maxTiltDelta >= config.tiltAngleThresholdDeg)) {
    const confidence = Math.min(0.65 + (peakG / config.impactGThreshold) * 0.25, 0.94);
    return {
      detected: true,
      classification: 'POSSIBLE_CRASH',
      confidence: parseFloat(confidence.toFixed(2)),
      peakMagnitudeG: parseFloat(peakG.toFixed(2)),
      jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
      tiltDeltaDeg: parseFloat(maxTiltDelta.toFixed(1)),
      reason: `High impact acceleration peak of ${peakG.toFixed(1)}G with high impulse jerk (${maxJerk.toFixed(1)} m/s³).`
    };
  }

  // 2. High acceleration on z-axis / moderate jerk without sustained angular tilt => POTHOLE_OR_BUMP
  if (peakG >= 2.0 && peakG < config.impactGThreshold && maxJerk > 10.0) {
    return {
      detected: false,
      classification: 'POTHOLE_OR_BUMP',
      confidence: 0.88,
      peakMagnitudeG: parseFloat(peakG.toFixed(2)),
      jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
      tiltDeltaDeg: parseFloat(maxTiltDelta.toFixed(1)),
      reason: `Transient vertical impulse peak of ${peakG.toFixed(1)}G consistent with road bump or pothole.`
    };
  }

  // 3. Sustained longitudinal acceleration / deceleration without high impact peak => HARD_BRAKING
  if (peakG >= 1.4 && peakG < 2.5 && maxJerk < 12.0) {
    return {
      detected: false,
      classification: 'HARD_BRAKING',
      confidence: 0.85,
      peakMagnitudeG: parseFloat(peakG.toFixed(2)),
      jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
      tiltDeltaDeg: parseFloat(maxTiltDelta.toFixed(1)),
      reason: `Sustained deceleration detected without sharp impact spike.`
    };
  }

  // 4. Baseline normal dynamics
  return {
    detected: false,
    classification: 'NORMAL_RIDING',
    confidence: 0.96,
    peakMagnitudeG: parseFloat(peakG.toFixed(2)),
    jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
    tiltDeltaDeg: parseFloat(maxTiltDelta.toFixed(1)),
    reason: 'Motion parameters within standard safe riding thresholds.'
  };
}
