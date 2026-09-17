import { 
  SensorReading, 
  CrashThresholdConfig, 
  CrashEvaluationResult, 
  MLClassification 
} from '../types/sensor.js';

export const DEFAULT_CRASH_CONFIG: CrashThresholdConfig = {
  impactGThreshold: 3.2,        // 3.2G (~31.4 m/s²) threshold for severe impact (differentiates from 2.0G potholes)
  jerkThreshold: 30.0,          // 30 m/s³ rate of sudden impulse change
  tiltAngleThresholdDeg: 50,    // 50° tilt / layover angle from calibrated upright
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
 * Uses a minimum dt safeguard of 20ms to filter out single-millisecond quantization noise.
 */
export function calculateJerk(
  curr: SensorReading, 
  prev: SensorReading
): number {
  const dt = Math.max((curr.timestamp - prev.timestamp) / 1000, 0.02);
  const dAx = curr.accel.x - prev.accel.x;
  const dAy = curr.accel.y - prev.accel.y;
  const dAz = curr.accel.z - prev.accel.z;
  const dMag = calculateMagnitude(dAx, dAy, dAz);
  return dMag / dt;
}

/**
 * Evaluates a window of sensor readings against calibrated threshold parameters.
 * Combines kinetic acceleration peak, impulse jerk, angular tumbling, and vehicle laydown angle.
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
  let maxAngularRate = 0; // max rotation rate in °/s
  let maxTiltAngle = 0;   // estimated tilt angle relative to gravity in degrees

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

    // Gyroscope rotation rate (°/s)
    if (r.gyro) {
      const gyroMag = Math.sqrt(
        (r.gyro.alpha || 0) ** 2 + 
        (r.gyro.beta || 0) ** 2 + 
        (r.gyro.gamma || 0) ** 2
      );
      if (gyroMag > maxAngularRate) {
        maxAngularRate = gyroMag;
      }
    }

    // Tilt angle estimation: angle of device screen/vertical axis from gravity vector
    if (mag > 0.1) {
      const cosZ = Math.min(Math.max(Math.abs(r.accel.z) / mag, 0), 1);
      const angleFromHorizontal = (1 - cosZ) * 90; // 0 deg if flat, up to 90 deg if vertical/tipped
      if (angleFromHorizontal > maxTiltAngle) {
        maxTiltAngle = angleFromHorizontal;
      }
    }
  }

  const peakG = mssToG(peakMagnitudeMss);

  // Heuristic Classification:
  // 1. Severe Impact Peak >= threshold AND (High Jerk OR Violent Tumbling >= 150°/s OR Laydown Tilt >= threshold)
  const isSevereImpact = peakG >= config.impactGThreshold;
  const hasCrashDynamics = (maxJerk >= config.jerkThreshold) || 
                           (maxAngularRate >= 150.0) || 
                           (maxTiltAngle >= config.tiltAngleThresholdDeg);

  if (isSevereImpact && hasCrashDynamics) {
    const confidence = Math.min(0.70 + (peakG / config.impactGThreshold) * 0.20, 0.96);
    return {
      detected: true,
      classification: 'POSSIBLE_CRASH',
      confidence: parseFloat(confidence.toFixed(2)),
      peakMagnitudeG: parseFloat(peakG.toFixed(2)),
      jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
      tiltDeltaDeg: parseFloat((maxAngularRate > 0 ? maxAngularRate : maxTiltAngle).toFixed(1)),
      reason: `Kinetic impact spike of ${peakG.toFixed(2)}G (threshold: ${config.impactGThreshold}G) with jerk ${maxJerk.toFixed(1)} m/s³ and angular motion ${maxAngularRate.toFixed(0)}°/s.`
    };
  }

  // 2. High acceleration on z-axis / moderate jerk without sustained angular tilt => POTHOLE_OR_BUMP
  if (peakG >= 1.8 && peakG < config.impactGThreshold && maxJerk > 12.0 && maxAngularRate < 100.0) {
    return {
      detected: false,
      classification: 'POTHOLE_OR_BUMP',
      confidence: 0.88,
      peakMagnitudeG: parseFloat(peakG.toFixed(2)),
      jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
      tiltDeltaDeg: parseFloat(maxTiltAngle.toFixed(1)),
      reason: `Transient vertical impulse peak of ${peakG.toFixed(2)}G consistent with road bump or pothole.`
    };
  }

  // 3. Sustained longitudinal acceleration / deceleration without high impact peak => HARD_BRAKING
  if (peakG >= 1.3 && peakG < 2.4 && maxJerk < 20.0 && maxAngularRate < 60.0) {
    return {
      detected: false,
      classification: 'HARD_BRAKING',
      confidence: 0.85,
      peakMagnitudeG: parseFloat(peakG.toFixed(2)),
      jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
      tiltDeltaDeg: parseFloat(maxTiltAngle.toFixed(1)),
      reason: `Deceleration profile (${peakG.toFixed(2)}G) without kinetic impact spike.`
    };
  }

  // 4. Baseline normal dynamics
  return {
    detected: false,
    classification: 'NORMAL_RIDING',
    confidence: 0.96,
    peakMagnitudeG: parseFloat(peakG.toFixed(2)),
    jerkMagnitude: parseFloat(maxJerk.toFixed(1)),
    tiltDeltaDeg: parseFloat(maxTiltAngle.toFixed(1)),
    reason: 'Motion parameters within standard safe riding thresholds.'
  };
}
