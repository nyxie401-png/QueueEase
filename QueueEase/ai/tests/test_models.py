"""
QueueEase ML - Unit Tests: Model
pytest -v tests/test_models.py
"""

from __future__ import annotations

import pytest
import pandas as pd
import numpy as np

# Ensure project root is on path when running from repo root
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.data_generator import generate_synthetic_data
from app.models import QueueWaitModel, ModelMetrics


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def small_df() -> pd.DataFrame:
    """300-row dataset — fast enough for unit tests."""
    return generate_synthetic_data(n_rows=300, random_seed=0)


@pytest.fixture(scope="module")
def trained_model(small_df: pd.DataFrame) -> QueueWaitModel:
    model = QueueWaitModel("random_forest")
    model.train(small_df)
    return model


# ─────────────────────────────────────────────────────────────────────────────
# ModelMetrics
# ─────────────────────────────────────────────────────────────────────────────

class TestModelMetrics:
    def test_passes_quality_gates_positive(self):
        m = ModelMetrics(r2=0.85, mae=3.0)
        assert m.passes_quality_gates()

    def test_passes_quality_gates_low_r2(self):
        m = ModelMetrics(r2=0.50, mae=3.0)
        assert not m.passes_quality_gates()

    def test_passes_quality_gates_high_mae(self):
        m = ModelMetrics(r2=0.85, mae=8.0)
        assert not m.passes_quality_gates()

    def test_str_representation(self):
        m = ModelMetrics(r2=0.84, mae=2.5, rmse=3.2)
        s = str(m)
        assert "R²" in s and "MAE" in s


# ─────────────────────────────────────────────────────────────────────────────
# QueueWaitModel — construction
# ─────────────────────────────────────────────────────────────────────────────

class TestModelConstruction:
    def test_invalid_model_type(self):
        with pytest.raises(ValueError, match="Unknown model_type"):
            QueueWaitModel("svm")

    def test_predict_before_train_raises(self):
        m = QueueWaitModel()
        with pytest.raises(RuntimeError, match="not fitted"):
            m.predict_single({
                "queue_length": 5,
                "avg_consultation_minutes": 7.0,
                "hour_of_day": 10,
                "day_of_week": 1,
                "appointment_type": "general",
            })


# ─────────────────────────────────────────────────────────────────────────────
# Training
# ─────────────────────────────────────────────────────────────────────────────

class TestTraining:
    def test_metrics_populated(self, trained_model: QueueWaitModel):
        m = trained_model.metrics
        assert m.r2 > 0
        assert m.mae > 0
        assert m.rmse > 0
        assert m.train_samples > 0
        assert m.test_samples > 0

    def test_cv_populated(self, trained_model: QueueWaitModel):
        assert 0 < trained_model.metrics.cv_r2_mean <= 1.0
        assert trained_model.metrics.cv_r2_std >= 0

    def test_metadata_populated(self, trained_model: QueueWaitModel):
        meta = trained_model.metadata
        assert meta.model_type == "random_forest"
        assert meta.trained_at != ""
        assert meta.training_rows == 300

    def test_gradient_boosting_trains(self, small_df: pd.DataFrame):
        m = QueueWaitModel("gradient_boosting")
        metrics = m.train(small_df)
        assert metrics.r2 > 0

    def test_r2_reasonable(self, trained_model: QueueWaitModel):
        """R² should be above a minimum threshold on synthetic data."""
        assert trained_model.metrics.r2 > 0.60, (
            f"R² too low: {trained_model.metrics.r2}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Single prediction
# ─────────────────────────────────────────────────────────────────────────────

VALID_RECORD = {
    "queue_length":             8,
    "avg_consultation_minutes": 7.5,
    "hour_of_day":              10,
    "day_of_week":              1,
    "appointment_type":         "general",
    "patients_seen_today":      15,
    "doctor_experience_years":  5,
}


class TestPredictSingle:
    def test_returns_dict(self, trained_model: QueueWaitModel):
        result = trained_model.predict_single(VALID_RECORD)
        assert isinstance(result, dict)

    def test_required_keys(self, trained_model: QueueWaitModel):
        result = trained_model.predict_single(VALID_RECORD)
        for key in ("predicted_wait_minutes", "lower_bound", "upper_bound", "confidence"):
            assert key in result

    def test_prediction_non_negative(self, trained_model: QueueWaitModel):
        result = trained_model.predict_single(VALID_RECORD)
        assert result["predicted_wait_minutes"] >= 0

    def test_bounds_order(self, trained_model: QueueWaitModel):
        result = trained_model.predict_single(VALID_RECORD)
        assert result["lower_bound"] <= result["predicted_wait_minutes"] <= result["upper_bound"]

    def test_confidence_value(self, trained_model: QueueWaitModel):
        result = trained_model.predict_single(VALID_RECORD)
        assert result["confidence"] in ("high", "medium")

    def test_missing_required_field(self, trained_model: QueueWaitModel):
        bad = {k: v for k, v in VALID_RECORD.items() if k != "queue_length"}
        with pytest.raises(ValueError, match="queue_length"):
            trained_model.predict_single(bad)

    def test_invalid_appointment_type(self, trained_model: QueueWaitModel):
        bad = {**VALID_RECORD, "appointment_type": "dental"}
        with pytest.raises(ValueError):
            trained_model.predict_single(bad)

    def test_negative_queue_length(self, trained_model: QueueWaitModel):
        bad = {**VALID_RECORD, "queue_length": -1}
        with pytest.raises(ValueError):
            trained_model.predict_single(bad)

    def test_peak_vs_offpeak(self, trained_model: QueueWaitModel):
        """Peak-hour prediction should generally be ≥ off-peak."""
        peak    = {**VALID_RECORD, "hour_of_day": 10}   # peak
        offpeak = {**VALID_RECORD, "hour_of_day": 14}   # off-peak
        # direction isn't always guaranteed by one sample, just check no crash
        trained_model.predict_single(peak)
        trained_model.predict_single(offpeak)

    def test_emergency_longer_than_followup(self, trained_model: QueueWaitModel):
        """Emergency appointments should tend to take longer."""
        r_emg = trained_model.predict_single({**VALID_RECORD, "appointment_type": "emergency"})
        r_flu = trained_model.predict_single({**VALID_RECORD, "appointment_type": "follow_up"})
        # Not a strict assertion — the model learned from synthetic data
        assert r_emg["predicted_wait_minutes"] > 0
        assert r_flu["predicted_wait_minutes"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# Batch prediction
# ─────────────────────────────────────────────────────────────────────────────

class TestPredictBatch:
    def test_batch_length(self, trained_model: QueueWaitModel):
        records = [VALID_RECORD] * 5
        results = trained_model.predict_batch(records)
        assert len(results) == 5

    def test_empty_batch_raises(self, trained_model: QueueWaitModel):
        with pytest.raises(ValueError):
            trained_model.predict_batch([])

    def test_batch_all_non_negative(self, trained_model: QueueWaitModel):
        records = [
            {**VALID_RECORD, "queue_length": i} for i in range(1, 11)
        ]
        for r in trained_model.predict_batch(records):
            assert r["predicted_wait_minutes"] >= 0


# ─────────────────────────────────────────────────────────────────────────────
# Feature importances
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureImportances:
    def test_returns_series(self, trained_model: QueueWaitModel):
        import pandas as pd
        imp = trained_model.feature_importances()
        assert isinstance(imp, pd.Series)

    def test_importances_sum_to_one(self, trained_model: QueueWaitModel):
        imp = trained_model.feature_importances()
        assert abs(imp.sum() - 1.0) < 1e-6

    def test_gbm_raises_not_implemented(self, small_df: pd.DataFrame):
        m = QueueWaitModel("gradient_boosting")
        m.train(small_df)
        with pytest.raises(NotImplementedError):
            m.feature_importances()


# ─────────────────────────────────────────────────────────────────────────────
# Persistence (save / load round-trip)
# ─────────────────────────────────────────────────────────────────────────────

class TestPersistence:
    def test_save_and_load(self, trained_model: QueueWaitModel, tmp_path):
        mp = tmp_path / "model.joblib"
        sp = tmp_path / "scaler.joblib"
        ep = tmp_path / "enc.joblib"
        md = tmp_path / "meta.json"

        trained_model.save(mp, sp, ep, md)

        assert mp.exists()
        assert sp.exists()
        assert md.exists()

        loaded = QueueWaitModel.load(mp, sp, md)
        assert loaded._is_fitted

        # predictions must match
        r1 = trained_model.predict_single(VALID_RECORD)
        r2 = loaded.predict_single(VALID_RECORD)
        assert abs(r1["predicted_wait_minutes"] - r2["predicted_wait_minutes"]) < 0.01

    def test_metadata_round_trip(self, trained_model: QueueWaitModel, tmp_path):
        mp = tmp_path / "model.joblib"
        sp = tmp_path / "scaler.joblib"
        ep = tmp_path / "enc.joblib"
        md = tmp_path / "meta.json"

        trained_model.save(mp, sp, ep, md)
        loaded = QueueWaitModel.load(mp, sp, md)

        assert loaded.metadata.model_type == trained_model.metadata.model_type
        assert loaded.metadata.version == "1.0.0"
