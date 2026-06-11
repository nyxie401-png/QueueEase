"""
QueueEase ML - Unit Tests: Feature Engineering
pytest -v tests/test_features.py
"""

from __future__ import annotations

import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
import pytest

from app.features import (
    AppointmentTypeEncoder,
    FeatureSelector,
    PeakHourEncoder,
    RollingWaitImputer,
    build_preprocessing_pipeline,
    prepare_features,
    validate_input_schema,
)
from app.config import FEATURE_COLUMNS, PEAK_HOURS, APPOINTMENT_TYPES


def _base_df(n: int = 10) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    return pd.DataFrame(
        {
            "queue_length":               rng.integers(1, 20, n),
            "avg_consultation_minutes":   rng.uniform(5, 15, n),
            "hour_of_day":                rng.integers(8, 20, n),
            "day_of_week":                rng.integers(0, 7, n),
            "patients_seen_today":        rng.integers(0, 50, n),
            "doctor_experience_years":    rng.integers(1, 20, n),
            "appointment_type":           rng.choice(APPOINTMENT_TYPES, n),
            "rolling_avg_wait_last_5":    rng.uniform(10, 60, n),
            "actual_wait_minutes":        rng.uniform(5, 90, n),
        }
    )


class TestPeakHourEncoder:
    def test_creates_column(self):
        df = _base_df()
        enc = PeakHourEncoder().fit(df).transform(df)
        assert "is_peak_hour" in enc.columns

    def test_values_binary(self):
        df = _base_df()
        enc = PeakHourEncoder().fit(df).transform(df)
        assert set(enc["is_peak_hour"].unique()).issubset({0, 1})

    def test_peak_hours_flagged_correctly(self):
        df = pd.DataFrame({"hour_of_day": [9, 10, 14, 18]})
        result = PeakHourEncoder().fit(df).transform(df)
        expected = [int(h in PEAK_HOURS) for h in [9, 10, 14, 18]]
        assert list(result["is_peak_hour"]) == expected

    def test_does_not_overwrite_existing_column(self):
        df = _base_df()
        df["is_peak_hour"] = 99   # pre-existing
        result = PeakHourEncoder().fit(df).transform(df)
        assert result["is_peak_hour"].iloc[0] == 99


class TestAppointmentTypeEncoder:
    def test_creates_encoded_column(self):
        df = _base_df()
        enc = AppointmentTypeEncoder().fit(df).transform(df)
        assert "appointment_type_encoded" in enc.columns

    def test_values_within_range(self):
        df = _base_df()
        enc = AppointmentTypeEncoder().fit(df).transform(df)
        assert enc["appointment_type_encoded"].between(0, len(APPOINTMENT_TYPES) - 1).all()

    def test_unknown_type_gets_zero(self):
        df = pd.DataFrame({"appointment_type": ["dental"]})
        enc = AppointmentTypeEncoder().fit(pd.DataFrame({"appointment_type": APPOINTMENT_TYPES}))
        result = enc.transform(df)
        assert result["appointment_type_encoded"].iloc[0] == 0


class TestRollingWaitImputer:
    def test_no_change_when_column_present(self):
        df = _base_df()
        original = df["rolling_avg_wait_last_5"].copy()
        result = RollingWaitImputer().fit(df).transform(df)
        pd.testing.assert_series_equal(result["rolling_avg_wait_last_5"], original)

    def test_creates_column_when_absent(self):
        df = _base_df().drop(columns=["rolling_avg_wait_last_5"])
        result = RollingWaitImputer().fit(df).transform(df)
        assert "rolling_avg_wait_last_5" in result.columns
        assert (result["rolling_avg_wait_last_5"] >= 0).all()

    def test_fills_nans(self):
        df = _base_df()
        df.loc[[0, 1, 2], "rolling_avg_wait_last_5"] = np.nan
        result = RollingWaitImputer().fit(df).transform(df)
        assert result["rolling_avg_wait_last_5"].isna().sum() == 0


class TestFeatureSelector:
    def test_selects_correct_columns(self):
        df = _base_df()
        df = PeakHourEncoder().fit(df).transform(df)
        df = AppointmentTypeEncoder().fit(df).transform(df)
        sel = FeatureSelector(FEATURE_COLUMNS).fit(df)
        arr = sel.transform(df)
        assert arr.shape[1] == len(FEATURE_COLUMNS)

    def test_raises_on_missing_column(self):
        df = pd.DataFrame({"queue_length": [1, 2]})
        sel = FeatureSelector(FEATURE_COLUMNS)
        with pytest.raises(ValueError, match="missing columns"):
            sel.fit(df)


class TestBuildPipeline:
    def test_pipeline_fit_transform(self):
        df = _base_df()
        pipe = build_preprocessing_pipeline(scale=True)
        X = pipe.fit_transform(df)
        assert X.shape == (len(df), len(FEATURE_COLUMNS))

    def test_pipeline_no_scale(self):
        df = _base_df()
        pipe = build_preprocessing_pipeline(scale=False)
        X = pipe.fit_transform(df)
        assert X.shape == (len(df), len(FEATURE_COLUMNS))

    def test_pipeline_transform_after_fit(self):
        df1 = _base_df(50)
        df2 = _base_df(10)
        pipe = build_preprocessing_pipeline()
        pipe.fit_transform(df1)
        X2 = pipe.transform(df2)
        assert X2.shape == (10, len(FEATURE_COLUMNS))


class TestPrepareFeatures:
    def test_fit_true_returns_pipeline(self):
        df = _base_df()
        X, pipe = prepare_features(df, fit=True)
        assert X.shape[0] == len(df)
        assert pipe is not None

    def test_transform_with_existing_pipeline(self):
        df = _base_df(50)
        _, pipe = prepare_features(df, fit=True)
        df2 = _base_df(5)
        X2, _ = prepare_features(df2, pipeline=pipe, fit=False)
        assert X2.shape == (5, len(FEATURE_COLUMNS))


class TestValidateInputSchema:
    GOOD = {
        "queue_length":             5,
        "avg_consultation_minutes": 8.0,
        "hour_of_day":              10,
        "day_of_week":              1,
        "appointment_type":         "general",
    }

    def test_valid_passes(self):
        validate_input_schema(self.GOOD)   # no exception

    def test_missing_field(self):
        bad = {k: v for k, v in self.GOOD.items() if k != "queue_length"}
        with pytest.raises(ValueError, match="queue_length"):
            validate_input_schema(bad)

    def test_wrong_appointment_type(self):
        bad = {**self.GOOD, "appointment_type": "xyz"}
        with pytest.raises(ValueError):
            validate_input_schema(bad)

    def test_invalid_hour(self):
        with pytest.raises(ValueError, match="hour_of_day"):
            validate_input_schema({**self.GOOD, "hour_of_day": 25})

    def test_invalid_day(self):
        with pytest.raises(ValueError, match="day_of_week"):
            validate_input_schema({**self.GOOD, "day_of_week": 7})

    def test_negative_queue(self):
        with pytest.raises(ValueError, match="negative"):
            validate_input_schema({**self.GOOD, "queue_length": -1})

    def test_zero_consultation(self):
        with pytest.raises(ValueError):
            validate_input_schema({**self.GOOD, "avg_consultation_minutes": 0})
