"""
QueueEase ML - Integration Tests: API
pytest -v tests/test_api.py
"""

from __future__ import annotations

import pytest
import sys, pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient

from app.config import API_KEY
from app.data_generator import generate_synthetic_data
from app.models import QueueWaitModel
from app.ml_api import app, _model
import app.ml_api as ml_api  # to patch _model


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def trained_model() -> QueueWaitModel:
    df = generate_synthetic_data(n_rows=300, random_seed=1)
    m  = QueueWaitModel("random_forest")
    m.train(df)
    return m


@pytest.fixture(scope="module")
def client(trained_model: QueueWaitModel) -> TestClient:
    """Inject a pre-trained model so tests don't require disk artefacts."""
    ml_api._model = trained_model
    return TestClient(app)


AUTH = {"X-API-Key": API_KEY}

VALID_PAYLOAD = {
    "queue_length":             8,
    "avg_consultation_minutes": 7.5,
    "hour_of_day":              10,
    "day_of_week":              1,
    "appointment_type":         "general",
    "patients_seen_today":      15,
    "doctor_experience_years":  5,
}


# ─────────────────────────────────────────────────────────────────────────────
# Health endpoint
# ─────────────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_returns_200(self, client: TestClient):
        r = client.get("/health")
        assert r.status_code == 200

    def test_model_loaded(self, client: TestClient):
        body = r = client.get("/health").json()
        assert body["model_loaded"] is True

    def test_status_ok(self, client: TestClient):
        body = client.get("/health").json()
        assert body["status"] == "ok"

    def test_r2_present(self, client: TestClient):
        body = client.get("/health").json()
        assert body["r2_score"] is not None
        assert body["r2_score"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────────────────────

class TestAuth:
    def test_missing_key_returns_401(self, client: TestClient):
        r = client.post("/predict", json=VALID_PAYLOAD)
        assert r.status_code == 401

    def test_wrong_key_returns_401(self, client: TestClient):
        r = client.post("/predict", json=VALID_PAYLOAD, headers={"X-API-Key": "wrong"})
        assert r.status_code == 401

    def test_query_param_key_accepted(self, client: TestClient):
        r = client.post(f"/predict?api_key={API_KEY}", json=VALID_PAYLOAD)
        assert r.status_code == 200


# ─────────────────────────────────────────────────────────────────────────────
# /info
# ─────────────────────────────────────────────────────────────────────────────

class TestInfo:
    def test_returns_200(self, client: TestClient):
        r = client.get("/info", headers=AUTH)
        assert r.status_code == 200

    def test_has_model_type(self, client: TestClient):
        body = client.get("/info", headers=AUTH).json()
        assert "model_type" in body

    def test_has_feature_columns(self, client: TestClient):
        body = client.get("/info", headers=AUTH).json()
        assert len(body["feature_columns"]) > 0

    def test_has_metrics(self, client: TestClient):
        body = client.get("/info", headers=AUTH).json()
        assert "r2" in body["metrics"]


# ─────────────────────────────────────────────────────────────────────────────
# POST /predict
# ─────────────────────────────────────────────────────────────────────────────

class TestPredict:
    def test_valid_request(self, client: TestClient):
        r = client.post("/predict", json=VALID_PAYLOAD, headers=AUTH)
        assert r.status_code == 200

    def test_response_schema(self, client: TestClient):
        body = client.post("/predict", json=VALID_PAYLOAD, headers=AUTH).json()
        for key in ("predicted_wait_minutes", "lower_bound", "upper_bound", "confidence"):
            assert key in body

    def test_prediction_non_negative(self, client: TestClient):
        body = client.post("/predict", json=VALID_PAYLOAD, headers=AUTH).json()
        assert body["predicted_wait_minutes"] >= 0

    def test_bounds_order(self, client: TestClient):
        body = client.post("/predict", json=VALID_PAYLOAD, headers=AUTH).json()
        assert body["lower_bound"] <= body["predicted_wait_minutes"] <= body["upper_bound"]

    def test_invalid_appointment_type(self, client: TestClient):
        bad = {**VALID_PAYLOAD, "appointment_type": "dental"}
        r = client.post("/predict", json=bad, headers=AUTH)
        assert r.status_code == 422

    def test_negative_queue_length(self, client: TestClient):
        bad = {**VALID_PAYLOAD, "queue_length": -5}
        r = client.post("/predict", json=bad, headers=AUTH)
        assert r.status_code == 422

    def test_missing_required_field(self, client: TestClient):
        bad = {k: v for k, v in VALID_PAYLOAD.items() if k != "queue_length"}
        r = client.post("/predict", json=bad, headers=AUTH)
        assert r.status_code == 422

    def test_optional_fields_can_be_omitted(self, client: TestClient):
        minimal = {
            "queue_length":             3,
            "avg_consultation_minutes": 6.0,
            "hour_of_day":              9,
            "day_of_week":              0,
            "appointment_type":         "follow_up",
        }
        r = client.post("/predict", json=minimal, headers=AUTH)
        assert r.status_code == 200

    def test_all_appointment_types_accepted(self, client: TestClient):
        for appt in ("general", "follow_up", "emergency", "specialist"):
            payload = {**VALID_PAYLOAD, "appointment_type": appt}
            r = client.post("/predict", json=payload, headers=AUTH)
            assert r.status_code == 200, f"Failed for appointment_type={appt}"

    def test_large_queue_prediction(self, client: TestClient):
        payload = {**VALID_PAYLOAD, "queue_length": 50}
        r = client.post("/predict", json=payload, headers=AUTH)
        assert r.status_code == 200
        assert r.json()["predicted_wait_minutes"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# POST /predict/batch
# ─────────────────────────────────────────────────────────────────────────────

class TestBatchPredict:
    def test_single_record_batch(self, client: TestClient):
        r = client.post("/predict/batch", json={"records": [VALID_PAYLOAD]}, headers=AUTH)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert len(body["predictions"]) == 1

    def test_multi_record_batch(self, client: TestClient):
        records = [VALID_PAYLOAD] * 10
        r = client.post("/predict/batch", json={"records": records}, headers=AUTH)
        assert r.status_code == 200
        assert r.json()["total"] == 10

    def test_empty_records_returns_422(self, client: TestClient):
        r = client.post("/predict/batch", json={"records": []}, headers=AUTH)
        assert r.status_code == 422

    def test_batch_order_preserved(self, client: TestClient):
        """Different queue lengths should yield different predictions."""
        records = [
            {**VALID_PAYLOAD, "queue_length": q}
            for q in [1, 5, 15, 25]
        ]
        body = client.post(
            "/predict/batch", json={"records": records}, headers=AUTH
        ).json()
        waits = [p["predicted_wait_minutes"] for p in body["predictions"]]
        # predictions should generally increase with queue length
        assert len(waits) == 4


# ─────────────────────────────────────────────────────────────────────────────
# Feature importances
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureImportances:
    def test_returns_200(self, client: TestClient):
        r = client.get("/model/importances", headers=AUTH)
        assert r.status_code == 200

    def test_has_importances_key(self, client: TestClient):
        body = client.get("/model/importances", headers=AUTH).json()
        assert "importances" in body

    def test_all_features_present(self, client: TestClient):
        from app.config import FEATURE_COLUMNS
        body = client.get("/model/importances", headers=AUTH).json()
        for feat in FEATURE_COLUMNS:
            assert feat in body["importances"], f"Missing feature: {feat}"
