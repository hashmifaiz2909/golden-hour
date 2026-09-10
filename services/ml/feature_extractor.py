import math
from typing import List, Dict, Any

class FeatureExtractor:
    GRAVITY = 9.80665

    @staticmethod
    def calculate_magnitude(x: float, y: float, z: float) -> float:
        return math.sqrt(x * x + y * y + z * z)

    def extract_features(self, readings: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extracts statistical and dynamic features from a time window of sensor readings.
        """
        if not readings:
            return {
                "peak_g": 1.0,
                "mean_g": 1.0,
                "std_g": 0.0,
                "max_jerk": 0.0,
                "max_gyro_rate": 0.0,
                "tilt_variance": 0.0,
                "window_duration_ms": 0.0
            }

        magnitudes = []
        jerks = []
        gyro_rates = []

        for i, r in enumerate(readings):
            accel = r.get("accel", {})
            ax = float(accel.get("x", 0.0))
            ay = float(accel.get("y", 0.0))
            az = float(accel.get("z", self.GRAVITY))

            mag = self.calculate_magnitude(ax, ay, az)
            mag_g = mag / self.GRAVITY
            magnitudes.append(mag_g)

            # Jerk calculation (derivative of acceleration)
            if i > 0:
                prev_accel = readings[i - 1].get("accel", {})
                prev_mag = self.calculate_magnitude(
                    float(prev_accel.get("x", 0.0)),
                    float(prev_accel.get("y", 0.0)),
                    float(prev_accel.get("z", self.GRAVITY))
                )
                dt = max((r.get("timestamp", 0) - readings[i - 1].get("timestamp", 0)) / 1000.0, 0.01)
                jerk = abs(mag - prev_mag) / dt
                jerks.append(jerk)

            # Gyroscope rotational magnitude
            gyro = r.get("gyro", {})
            if gyro:
                gx = float(gyro.get("alpha", 0.0))
                gy = float(gyro.get("beta", 0.0))
                gz = float(gyro.get("gamma", 0.0))
                gyro_rates.append(self.calculate_magnitude(gx, gy, gz))

        peak_g = max(magnitudes) if magnitudes else 1.0
        mean_g = sum(magnitudes) / len(magnitudes) if magnitudes else 1.0
        variance_g = sum((m - mean_g) ** 2 for m in magnitudes) / len(magnitudes) if magnitudes else 0.0
        std_g = math.sqrt(variance_g)
        max_jerk = max(jerks) if jerks else 0.0
        max_gyro = max(gyro_rates) if gyro_rates else 0.0

        duration = 0.0
        if len(readings) > 1:
            duration = float(readings[-1].get("timestamp", 0) - readings[0].get("timestamp", 0))

        return {
            "peak_g": round(peak_g, 2),
            "mean_g": round(mean_g, 2),
            "std_g": round(std_g, 3),
            "max_jerk": round(max_jerk, 2),
            "max_gyro_rate": round(max_gyro, 2),
            "tilt_variance": round(std_g * 10.0, 2),
            "window_duration_ms": duration
        }
