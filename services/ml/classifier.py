from typing import Dict, Any
from feature_extractor import FeatureExtractor

class AccidentClassifier:
    """
    Modular Accident Classification Engine.
    Uses extracted physical features and multi-stage decision boundaries.
    Easily expandable to load weights from Random Forest / SVM / Neural Network models.
    """

    def __init__(self, impact_g_threshold: float = 3.8, jerk_threshold: float = 18.0):
        self.impact_g_threshold = impact_g_threshold
        self.jerk_threshold = jerk_threshold
        self.extractor = FeatureExtractor()

    def classify_readings(self, readings: list, custom_config: Dict[str, Any] = None) -> Dict[str, Any]:
        features = self.extractor.extract_features(readings)

        impact_thresh = custom_config.get("impactGThreshold", self.impact_g_threshold) if custom_config else self.impact_g_threshold
        jerk_thresh = custom_config.get("jerkThreshold", self.jerk_threshold) if custom_config else self.jerk_threshold

        peak_g = features["peak_g"]
        max_jerk = features["max_jerk"]
        max_gyro = features["max_gyro_rate"]

        # Classification Logic
        if peak_g >= impact_thresh and (max_jerk >= jerk_thresh or max_gyro >= 45.0):
            # Potential severe impact + abnormal orientation or rapid deceleration
            return {
                "detected": True,
                "classification": "POSSIBLE_CRASH",
                "confidence": round(min(0.70 + (peak_g / impact_thresh) * 0.20, 0.94), 2),
                "peakMagnitudeG": peak_g,
                "jerkMagnitude": max_jerk,
                "tiltDeltaDeg": max_gyro,
                "features": features,
                "reason": f"Abnormal kinetic impulse detected (Peak: {peak_g}G, Jerk: {max_jerk} m/s³)."
            }

        if 2.0 <= peak_g < impact_thresh and max_jerk >= 10.0:
            return {
                "detected": False,
                "classification": "POTHOLE_OR_BUMP",
                "confidence": 0.88,
                "peakMagnitudeG": peak_g,
                "jerkMagnitude": max_jerk,
                "tiltDeltaDeg": max_gyro,
                "features": features,
                "reason": "Vertical transient impulse consistent with road surface irregularity."
            }

        if 1.4 <= peak_g < 2.5 and max_jerk < 12.0:
            return {
                "detected": False,
                "classification": "HARD_BRAKING",
                "confidence": 0.85,
                "peakMagnitudeG": peak_g,
                "jerkMagnitude": max_jerk,
                "tiltDeltaDeg": max_gyro,
                "features": features,
                "reason": "Longitudinal braking deceleration within controllable limits."
            }

        return {
            "detected": False,
            "classification": "NORMAL_RIDING",
            "confidence": 0.95,
            "peakMagnitudeG": peak_g,
            "jerkMagnitude": max_jerk,
            "tiltDeltaDeg": max_gyro,
            "features": features,
            "reason": "Telemetry within standard riding dynamics envelope."
        }
