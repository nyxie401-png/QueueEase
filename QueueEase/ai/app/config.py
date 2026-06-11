"""
QueueEase ML - Configuration
All hyperparameters, paths, and constants in one place.
"""

import os
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
MODEL_DIR  = BASE_DIR / "artifacts"
LOG_DIR    = BASE_DIR / "logs"
DATA_DIR   = BASE_DIR / "data"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH    = MODEL_DIR / "queue_wait_model.joblib"
SCALER_PATH   = MODEL_DIR / "scaler.joblib"
ENCODER_PATH  = MODEL_DIR / "label_encoders.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

# ─── Feature Engineering ──────────────────────────────────────────────────────
FEATURE_COLUMNS = [
    "queue_length",
    "avg_consultation_minutes",
    "hour_of_day",
    "day_of_week",
    "is_peak_hour",
    "patients_seen_today",
    "doctor_experience_years",
    "appointment_type_encoded",
    "rolling_avg_wait_last_5",
]

TARGET_COLUMN = "actual_wait_minutes"

CATEGORICAL_COLUMNS = ["appointment_type"]
APPOINTMENT_TYPES   = ["general", "follow_up", "emergency", "specialist"]

PEAK_HOURS = list(range(9, 12)) + list(range(17, 20))   # 9-11 AM, 5-7 PM

# ─── Model Hyperparameters ────────────────────────────────────────────────────
RANDOM_FOREST_PARAMS = {
    "n_estimators":      200,
    "max_depth":         12,
    "min_samples_split": 5,
    "min_samples_leaf":  2,
    "max_features":      "sqrt",
    "bootstrap":         True,
    "oob_score":         True,
    "n_jobs":            -1,
    "random_state":      42,
}

GRADIENT_BOOSTING_PARAMS = {
    "n_estimators":   300,
    "learning_rate":  0.05,
    "max_depth":      5,
    "subsample":      0.8,
    "random_state":   42,
}

# ─── Training ─────────────────────────────────────────────────────────────────
TEST_SIZE        = 0.20
VALIDATION_SIZE  = 0.10   # fraction of training set used for validation
RANDOM_STATE     = 42
CV_FOLDS         = 5

# ─── Data Generation (synthetic training data) ────────────────────────────────
SYNTHETIC_ROWS          = 5_000
SYNTHETIC_RANDOM_SEED   = 42
AVG_CONSULTATION_MEAN   = 8.0    # minutes
AVG_CONSULTATION_STD    = 2.5
MAX_QUEUE_LENGTH        = 30

# ─── API ──────────────────────────────────────────────────────────────────────
API_HOST    = os.getenv("API_HOST", "0.0.0.0")
API_PORT    = int(os.getenv("API_PORT", 8000))
API_RELOAD  = os.getenv("API_RELOAD", "false").lower() == "true"
API_KEY     = os.getenv("API_KEY", "queueease-dev-key-change-in-prod")

# ─── Logging ──────────────────────────────────────────────────────────────────
LOG_LEVEL  = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE   = LOG_DIR / "queueease.log"

# ─── Quality Gates ────────────────────────────────────────────────────────────
MIN_R2_SCORE = 0.75
MAX_MAE_MINUTES = 5.0
