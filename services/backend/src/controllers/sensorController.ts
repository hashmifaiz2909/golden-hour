import { Request, Response } from 'express';
import { config } from '../config/index.js';
import { evaluateSensorWindow, DEFAULT_CRASH_CONFIG } from '../../../../shared/utils/threshold.js';
import { CrashEvaluationResult, SensorReading } from '../../../../shared/types/sensor.js';

export const evaluateSensors = async (req: Request, res: Response) => {
  const { readings, thresholdConfig } = req.body;

  if (!readings || !Array.isArray(readings)) {
    return res.status(400).json({ error: 'Sensor readings array is required.' });
  }

  // 1. Attempt evaluation via ML microservice if accessible
  try {
    const mlResponse = await fetch(`${config.mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readings, thresholdConfig }),
      signal: AbortSignal.timeout(1500)
    });

    if (mlResponse.ok) {
      const mlData: any = await mlResponse.json();
      return res.status(200).json({
        engine: 'ml_microservice',
        result: mlData
      });
    }
  } catch (err) {
    // Graceful fallback to rule-based threshold engine
  }

  // 2. Fallback to robust threshold engine
  const result: CrashEvaluationResult = evaluateSensorWindow(
    readings as SensorReading[],
    thresholdConfig || DEFAULT_CRASH_CONFIG
  );

  return res.status(200).json({
    engine: 'threshold_engine',
    result
  });
};
