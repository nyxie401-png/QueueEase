"""
QueueEase ML - Feature Engineering
All transformations, derived features, and preprocessing pipelines.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .config import APPOINTMENT_TYPES, FEATURE_COLUMNS, PEAK_HOURS, TARGET_COLUMN
from .logger import get_logger

log = get_logger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Custom Transformers
# ─────────────────────────────────────────────────────────────────────────────

class PeakHourEncoder(BaseEstimator, TransformerMixin):
    """Derive ``is_peak_hour`` from ``hour_of_day`` if not already present."""

    def fit(self, X: pd.DataFrame, y=None) -> "PeakHourEncoder":
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        if "hour_of_day" in X.columns and "is_peak_hour" not in X.columns:
            X["is_peak_hour"] = X["hour_of_day"].isin(PEAK_HOURS).astype(int)
        return X


class AppointmentTypeEncoder(BaseEstimator, TransformerMixin):
    """Ordinal-encode ``appointment_type`` into ``appointment_type_encoded``."""

    def __init__(self, categories: list[str] = APPOINTMENT_TYPES):
        self.categories = categories
        self._mapping: dict[str, int] = {}

    def fit(self, X: pd.DataFrame, y=None) -> "AppointmentTypeEncoder":
        self._mapping = {cat: idx for idx, cat in enumerate(self.categories)}
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        if "appointment_type" in X.columns:
            X["appointment_type_encoded"] = (
                X["appointment_type"]
                .map(self._mapping)
                .fillna(0)
                .astype(int)
            )
        return X


class RollingWaitImputer(BaseEstimator, TransformerMixin):
    """
    Impute ``rolling_avg_wait_last_5`` when it is missing.
    Uses a simple estimate: queue_length × avg_consultation_minutes.
    """

    def fit(self, X: pd.DataFrame, y=None) -> "RollingWaitImputer":
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        if "rolling_avg_wait_last_5" not in X.columns:
            X["rolling_avg_wait_last_5"] = (
                X["queue_length"] * X["avg_consultation_minutes"]
            )
        else:
            mask = X["rolling_avg_wait_last_5"].isna()
            X.loc[mask, "rolling_avg_wait_last_5"] = (
                X.loc[mask, "queue_length"]
                * X.loc[mask, "avg_consultation_minutes"]
            )
        return X


class FeatureSelector(BaseEstimator, TransformerMixin):
    """Select only the columns in FEATURE_COLUMNS and return a numpy array."""

    def __init__(self, columns: list[str] = FEATURE_COLUMNS):
        self.columns = columns

    def fit(self, X: pd.DataFrame, y=None) -> "FeatureSelector":
        missing = [c for c in self.columns if c not in X.columns]
        if missing:
            raise ValueError(f"FeatureSelector: missing columns {missing}")
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        return X[self.columns].values


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline factory
# ─────────────────────────────────────────────────────────────────────────────

def build_preprocessing_pipeline(scale: bool = True) -> Pipeline:
    """
    Build a reusable sklearn preprocessing pipeline.

    Steps:
        1. PeakHourEncoder       – derive is_peak_hour
        2. AppointmentTypeEncoder – ordinal-encode appointment type
        3. RollingWaitImputer    – fill missing rolling wait
        4. FeatureSelector       – keep only model features
        5. StandardScaler        – (optional) z-score normalisation

    Args:
        scale: Whether to apply StandardScaler at the end.

    Returns:
        Unfitted sklearn Pipeline.
    """
    steps: list = [
        ("peak_hour",   PeakHourEncoder()),
        ("appt_type",   AppointmentTypeEncoder()),
        ("rolling_imp", RollingWaitImputer()),
        ("selector",    FeatureSelector()),
    ]
    if scale:
        steps.append(("scaler", StandardScaler()))

    return Pipeline(steps)


# ─────────────────────────────────────────────────────────────────────────────
# Standalone helpers
# ─────────────────────────────────────────────────────────────────────────────

def prepare_features(
    df: pd.DataFrame,
    pipeline: Pipeline | None = None,
    fit: bool = False,
) -> tuple[np.ndarray, Pipeline]:
    """
    Apply the preprocessing pipeline to a DataFrame.

    Args:
        df:       Raw DataFrame (must include all raw feature columns).
        pipeline: Existing pipeline to use; creates a new one if None.
        fit:      If True, fit the pipeline on ``df``; otherwise just transform.

    Returns:
        Tuple of (X_array, fitted_pipeline).
    """
    if pipeline is None:
        pipeline = build_preprocessing_pipeline()

    if fit:
        X = pipeline.fit_transform(df)
        log.info("Preprocessing pipeline fitted — output shape: %s", X.shape)
    else:
        X = pipeline.transform(df)

    return X, pipeline


def extract_target(df: pd.DataFrame) -> np.ndarray:
    """Return the target column as a 1-D numpy array."""
    if TARGET_COLUMN not in df.columns:
        raise KeyError(f"Target column '{TARGET_COLUMN}' not found in DataFrame.")
    return df[TARGET_COLUMN].values


def validate_input_schema(data: dict) -> None:
    """
    Lightweight schema check for a single prediction request dict.
    Raises ValueError with a descriptive message on failure.
    """
    required = {
        "queue_length":             (int, float),
        "avg_consultation_minutes": (int, float),
        "hour_of_day":              (int,),
        "day_of_week":              (int,),
        "appointment_type":         (str,),
    }
    for field, types in required.items():
        if field not in data:
            raise ValueError(f"Missing required field: '{field}'")
        if not isinstance(data[field], types):
            raise ValueError(
                f"Field '{field}' expected type {types}, got {type(data[field])}"
            )

    if data["appointment_type"] not in APPOINTMENT_TYPES:
        raise ValueError(
            f"appointment_type must be one of {APPOINTMENT_TYPES}, "
            f"got '{data['appointment_type']}'"
        )

    if not 0 <= data["hour_of_day"] <= 23:
        raise ValueError("hour_of_day must be between 0 and 23.")

    if not 0 <= data["day_of_week"] <= 6:
        raise ValueError("day_of_week must be between 0 (Mon) and 6 (Sun).")

    if data["queue_length"] < 0:
        raise ValueError("queue_length cannot be negative.")

    if data["avg_consultation_minutes"] <= 0:
        raise ValueError("avg_consultation_minutes must be positive.")
