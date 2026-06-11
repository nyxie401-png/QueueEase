"""
QueueEase ML - Model
Encapsulates training, evaluation, persistence, and inference
for the Random Forest waiting-time predictor.
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    root_mean_squared_error,
    r2_score,
)
from sklearn.model_selection import KFold, cross_val_score, train_test_split

from .config import (
    CV_FOLDS,
    ENCODER_PATH,
    FEATURE_COLUMNS,
    GRADIENT_BOOSTING_PARAMS,
    METADATA_PATH,
    MIN_R2_SCORE,
    MODEL_PATH,
    RANDOM_FOREST_PARAMS,
    RANDOM_STATE,
    SCALER_PATH,
    TARGET_COLUMN,
    TEST_SIZE,
    MAX_MAE_MINUTES,
)
from .features import (
    build_preprocessing_pipeline,
    extract_target,
    prepare_features,
    validate_input_schema,
)
from .logger import get_logger

log = get_logger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class ModelMetrics:
    r2:    float = 0.0
    mae:   float = 0.0
    rmse:  float = 0.0
    cv_r2_mean: float = 0.0
    cv_r2_std:  float = 0.0
    train_samples: int = 0
    test_samples:  int = 0

    def passes_quality_gates(self) -> bool:
        return self.r2 >= MIN_R2_SCORE and self.mae <= MAX_MAE_MINUTES

    def __str__(self) -> str:
        return (
            f"R²={self.r2:.4f} | MAE={self.mae:.2f} min | "
            f"RMSE={self.rmse:.2f} min | "
            f"CV R²={self.cv_r2_mean:.4f} ± {self.cv_r2_std:.4f}"
        )


@dataclass
class ModelMetadata:
    model_type:      str = ""
    feature_columns: list[str] = field(default_factory=list)
    metrics:         dict[str, Any] = field(default_factory=dict)
    trained_at:      str = ""
    training_rows:   int = 0
    version:         str = "1.0.0"

    def to_json(self, path: Path | str) -> None:
        Path(path).write_text(json.dumps(asdict(self), indent=2))

    @classmethod
    def from_json(cls, path: Path | str) -> "ModelMetadata":
        data = json.loads(Path(path).read_text())
        return cls(**data)


# ─────────────────────────────────────────────────────────────────────────────
# QueueModel
# ─────────────────────────────────────────────────────────────────────────────

class QueueWaitModel:
    """
    Production-grade waiting-time predictor for QueueEase.

    Responsibilities
    ----------------
    * Preprocessing  – delegates to ``features.build_preprocessing_pipeline``
    * Training       – Random Forest (primary) + optional GBM comparison
    * Evaluation     – MAE, RMSE, R², k-fold CV, feature importances
    * Persistence    – joblib serialisation + JSON metadata
    * Inference      – single record and batch prediction with input validation

    Example
    -------
    >>> model = QueueWaitModel()
    >>> model.train(df)
    >>> model.save()
    >>> wait = model.predict_single({"queue_length": 8, ...})
    """

    def __init__(self, model_type: str = "random_forest"):
        if model_type not in ("random_forest", "gradient_boosting"):
            raise ValueError(f"Unknown model_type: {model_type}")

        self.model_type = model_type
        self._regressor: RandomForestRegressor | GradientBoostingRegressor | None = None
        self._pipeline  = build_preprocessing_pipeline(scale=False)
        self.metrics    = ModelMetrics()
        self.metadata   = ModelMetadata(
            model_type=model_type,
            feature_columns=FEATURE_COLUMNS,
        )
        self._is_fitted = False

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _build_regressor(self):
        if self.model_type == "random_forest":
            return RandomForestRegressor(**RANDOM_FOREST_PARAMS)
        return GradientBoostingRegressor(**GRADIENT_BOOSTING_PARAMS)

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> ModelMetrics:
        """
        Full training routine: split → preprocess → fit → evaluate → metadata.

        Args:
            df: Raw DataFrame returned by ``data_generator`` or loaded from CSV.

        Returns:
            Populated ``ModelMetrics`` dataclass.
        """
        log.info("Starting training on %d rows …", len(df))
        t0 = time.perf_counter()

        y = extract_target(df)
        X_raw_train, X_raw_test, y_train, y_test = train_test_split(
            df, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
        )

        # fit preprocessing on training split only
        X_train, self._pipeline = prepare_features(X_raw_train, fit=True)
        X_test, _               = prepare_features(X_raw_test, pipeline=self._pipeline)

        self._regressor = self._build_regressor()
        self._regressor.fit(X_train, y_train)
        self._is_fitted = True

        # ── Evaluate ──────────────────────────────────────────────────────────
        y_pred = self._regressor.predict(X_test)
        self.metrics = ModelMetrics(
            r2=float(r2_score(y_test, y_pred)),
            mae=float(mean_absolute_error(y_test, y_pred)),
            rmse=float(root_mean_squared_error(y_test, y_pred)),
            train_samples=len(y_train),
            test_samples=len(y_test),
        )

        # k-fold CV on the training set
        cv_scores = cross_val_score(
            self._build_regressor(),
            X_train, y_train,
            cv=KFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE),
            scoring="r2",
            n_jobs=-1,
        )
        self.metrics.cv_r2_mean = float(cv_scores.mean())
        self.metrics.cv_r2_std  = float(cv_scores.std())

        elapsed = time.perf_counter() - t0
        log.info("Training complete in %.1f s | %s", elapsed, self.metrics)

        if not self.metrics.passes_quality_gates():
            log.warning(
                "Quality gates NOT met (R²≥%.2f, MAE≤%.1f). "
                "Consider tuning or collecting more data.",
                MIN_R2_SCORE, MAX_MAE_MINUTES,
            )

        # ── Metadata ──────────────────────────────────────────────────────────
        self.metadata.metrics       = asdict(self.metrics)
        self.metadata.trained_at    = datetime.now(timezone.utc).isoformat()
        self.metadata.training_rows = int(len(df))

        return self.metrics

    # ── Evaluation helpers ────────────────────────────────────────────────────

    def feature_importances(self) -> pd.Series:
        """Return a sorted Series of feature importances (RF only)."""
        self._check_fitted()
        if not isinstance(self._regressor, RandomForestRegressor):
            raise NotImplementedError("Feature importances only for Random Forest.")
        return (
            pd.Series(
                self._regressor.feature_importances_,
                index=FEATURE_COLUMNS,
            )
            .sort_values(ascending=False)
        )

    def print_report(self) -> None:
        """Pretty-print training metrics to stdout."""
        self._check_fitted()
        sep = "─" * 50
        print(sep)
        print(f"  QueueEase Model Report  ({self.model_type})")
        print(sep)
        print(f"  R²   : {self.metrics.r2:.4f}")
        print(f"  MAE  : {self.metrics.mae:.2f} min")
        print(f"  RMSE : {self.metrics.rmse:.2f} min")
        print(f"  CV R²: {self.metrics.cv_r2_mean:.4f} ± {self.metrics.cv_r2_std:.4f}")
        print(f"  Train: {self.metrics.train_samples} samples")
        print(f"  Test : {self.metrics.test_samples} samples")
        print(sep)
        if isinstance(self._regressor, RandomForestRegressor):
            print("  Top-5 Feature Importances:")
            for feat, imp in self.feature_importances().head(5).items():
                print(f"    {feat:<35} {imp:.4f}")
        print(sep)

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict_single(self, record: dict) -> dict:
        """
        Predict waiting time for one patient.

        Args:
            record: Dict with at minimum the keys defined in
                    ``features.validate_input_schema``.

        Returns:
            Dict with ``predicted_wait_minutes``, ``lower_bound``,
            ``upper_bound`` (±1 MAE), and ``confidence``.

        Raises:
            ValueError: On invalid input.
        """
        self._check_fitted()
        validate_input_schema(record)

        df = pd.DataFrame([record])
        X, _ = prepare_features(df, pipeline=self._pipeline)
        raw_pred = float(self._regressor.predict(X)[0])
        pred     = max(0.0, round(raw_pred, 1))

        # simple uncertainty estimate using MAE
        margin = self.metrics.mae or 3.0
        return {
            "predicted_wait_minutes": pred,
            "lower_bound":  max(0.0, round(pred - margin, 1)),
            "upper_bound":  round(pred + margin, 1),
            "confidence":   "high" if self.metrics.r2 >= 0.80 else "medium",
            "model_version": self.metadata.version,
        }

    def predict_batch(self, records: list[dict]) -> list[dict]:
        """
        Predict waiting times for a list of patient records.

        Args:
            records: List of dicts (same schema as ``predict_single``).

        Returns:
            List of prediction dicts in the same order as ``records``.

        Raises:
            ValueError: If ``records`` is empty.
        """
        if not records:
            raise ValueError("records list must not be empty.")
        return [self.predict_single(r) for r in records]

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(
        self,
        model_path:    Path | str = MODEL_PATH,
        scaler_path:   Path | str = SCALER_PATH,
        encoder_path:  Path | str = ENCODER_PATH,
        metadata_path: Path | str = METADATA_PATH,
    ) -> None:
        """Serialise model artefacts to disk."""
        self._check_fitted()

        joblib.dump(self._regressor, model_path)
        joblib.dump(self._pipeline,  scaler_path)
        self.metadata.to_json(metadata_path)

        log.info("Model saved → %s", model_path)
        log.info("Pipeline saved → %s", scaler_path)
        log.info("Metadata saved → %s", metadata_path)

    @classmethod
    def load(
        cls,
        model_path:    Path | str = MODEL_PATH,
        scaler_path:   Path | str = SCALER_PATH,
        metadata_path: Path | str = METADATA_PATH,
    ) -> "QueueWaitModel":
        """Deserialise a previously saved model from disk."""
        log.info("Loading model from %s …", model_path)

        meta = ModelMetadata.from_json(metadata_path)
        instance = cls(model_type=meta.model_type)
        instance._regressor = joblib.load(model_path)
        instance._pipeline  = joblib.load(scaler_path)
        instance.metadata   = meta

        # restore metrics from metadata
        m = meta.metrics
        instance.metrics = ModelMetrics(**m) if m else ModelMetrics()
        instance._is_fitted = True

        log.info("Model loaded (trained at %s | %s)", meta.trained_at, instance.metrics)
        return instance

    # ── Guard ─────────────────────────────────────────────────────────────────

    def _check_fitted(self) -> None:
        if not self._is_fitted:
            raise RuntimeError(
                "Model is not fitted. Call .train() or .load() first."
            )
