"""
QueueEase ML - Synthetic Data Generator
Produces realistic queue-clinic data for model training and testing.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .config import (
    APPOINTMENT_TYPES,
    AVG_CONSULTATION_MEAN,
    AVG_CONSULTATION_STD,
    MAX_QUEUE_LENGTH,
    PEAK_HOURS,
    SYNTHETIC_RANDOM_SEED,
    SYNTHETIC_ROWS,
    TARGET_COLUMN,
)
from .logger import get_logger

log = get_logger(__name__)


def generate_synthetic_data(
    n_rows: int = SYNTHETIC_ROWS,
    random_seed: int = SYNTHETIC_RANDOM_SEED,
) -> pd.DataFrame:
    """
    Generate a synthetic dataset that mimics real clinic queue behaviour.

    The wait time is modelled as:

        wait ≈ queue_length × avg_consultation
              + peak_penalty
              + appointment_type_bonus
              + Gaussian noise

    Args:
        n_rows:      Number of records to generate.
        random_seed: NumPy random seed for reproducibility.

    Returns:
        DataFrame with feature columns + ``actual_wait_minutes``.
    """
    rng = np.random.default_rng(random_seed)
    log.info("Generating %d synthetic records (seed=%d)…", n_rows, random_seed)

    # ── Raw features ─────────────────────────────────────────────────────────
    queue_length = rng.integers(1, MAX_QUEUE_LENGTH + 1, n_rows)

    avg_consultation = np.clip(
        rng.normal(AVG_CONSULTATION_MEAN, AVG_CONSULTATION_STD, n_rows),
        a_min=3.0,
        a_max=30.0,
    )

    hour_of_day  = rng.integers(8, 21, n_rows)        # clinic hours 08:00–20:00
    day_of_week  = rng.integers(0, 7, n_rows)         # 0=Monday … 6=Sunday

    is_peak_hour = np.isin(hour_of_day, PEAK_HOURS).astype(int)

    patients_seen_today    = rng.integers(0, 60, n_rows)
    doctor_experience      = rng.integers(1, 31, n_rows)   # years

    appointment_type       = rng.choice(APPOINTMENT_TYPES, n_rows)
    appt_type_factor       = np.select(
        [
            appointment_type == "emergency",
            appointment_type == "specialist",
            appointment_type == "follow_up",
        ],
        [2.0, 1.5, 0.8],
        default=1.0,
    )

    rolling_avg_wait = (
        queue_length * avg_consultation * 0.9
        + rng.normal(0, 2, n_rows)
    ).clip(min=0)

    # ── Target variable (actual wait time) ───────────────────────────────────
    base_wait   = queue_length * avg_consultation * appt_type_factor
    peak_bonus  = is_peak_hour * rng.uniform(5, 15, n_rows)
    exp_factor  = np.maximum(1.0, 1.5 - doctor_experience * 0.02)
    noise       = rng.normal(0, 3, n_rows)

    actual_wait = (base_wait * exp_factor + peak_bonus + noise).clip(min=0)

    # ── Label-encode appointment type ─────────────────────────────────────────
    appt_type_encoded = pd.Categorical(
        appointment_type, categories=APPOINTMENT_TYPES
    ).codes

    df = pd.DataFrame(
        {
            "queue_length":               queue_length,
            "avg_consultation_minutes":   avg_consultation,
            "hour_of_day":                hour_of_day,
            "day_of_week":                day_of_week,
            "is_peak_hour":               is_peak_hour,
            "patients_seen_today":        patients_seen_today,
            "doctor_experience_years":    doctor_experience,
            "appointment_type":           appointment_type,
            "appointment_type_encoded":   appt_type_encoded,
            "rolling_avg_wait_last_5":    rolling_avg_wait,
            TARGET_COLUMN:                actual_wait,
        }
    )

    log.info(
        "Dataset ready — shape: %s | wait-time stats: mean=%.1f min, std=%.1f min",
        df.shape,
        df[TARGET_COLUMN].mean(),
        df[TARGET_COLUMN].std(),
    )
    return df


def load_or_generate(csv_path: str | None = None, **kwargs) -> pd.DataFrame:
    """
    Load data from CSV if the path exists, otherwise generate synthetic data.

    Args:
        csv_path: Optional path to a real CSV dataset.
        **kwargs: Forwarded to ``generate_synthetic_data``.

    Returns:
        DataFrame ready for training.
    """
    if csv_path:
        import pathlib
        p = pathlib.Path(csv_path)
        if p.exists():
            log.info("Loading real data from %s", p)
            return pd.read_csv(p)
        log.warning("CSV not found at %s — falling back to synthetic data.", p)

    return generate_synthetic_data(**kwargs)


# ── CLI entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    from config import DATA_DIR

    df = generate_synthetic_data()
    out = DATA_DIR / "synthetic_training_data.csv"
    df.to_csv(out, index=False)
    log.info("Saved to %s", out)
    print(df.describe().to_string())
