"""
QueueEase ML - FastAPI Server
REST API exposing the waiting-time prediction model.

Endpoints
---------
GET  /health              – liveness + model status
GET  /info                – model metadata
POST /predict             – single prediction
POST /predict/batch       – batch prediction (up to 100)
GET  /model/importances   – feature importances (RF only)

Auth: pass  X-API-Key: <key>  header (or ?api_key=<key> query param).
"""

from __future__ import annotations

import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import API_KEY, METADATA_PATH, MODEL_PATH, SCALER_PATH
from .logger import get_logger
from .models import QueueWaitModel
from .schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    ErrorResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
)

log = get_logger(__name__)

# ── Module-level model registry ───────────────────────────────────────────────
_model: QueueWaitModel | None = None


def get_model() -> QueueWaitModel:
    if _model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded. Run train_model.py first.",
        )
    return _model


# ── Lifespan (load model on startup) ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global _model
    model_p    = Path(MODEL_PATH)
    scaler_p   = Path(SCALER_PATH)
    metadata_p = Path(METADATA_PATH)

    if model_p.exists() and scaler_p.exists() and metadata_p.exists():
        try:
            _model = QueueWaitModel.load(model_p, scaler_p, metadata_p)
            log.info("Model loaded on startup.")
        except Exception as exc:
            log.error("Model load failed: %s", exc)
            _model = None
    else:
        log.warning(
            "Model artefacts not found — run train_model.py to generate them."
        )

    yield  # ← application runs here

    log.info("Shutting down QueueEase API.")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="QueueEase ML API",
        description=(
            "AI-powered waiting-time prediction for private doctor clinics.\n\n"
            "Authenticate with `X-API-Key` header."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Auth dependency ───────────────────────────────────────────────────────

    def verify_api_key(
        x_api_key: str | None = Header(default=None),
        api_key:   str | None = Query(default=None),
    ) -> None:
        key = x_api_key or api_key
        if key != API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing API key.",
            )

    # ── Routes ────────────────────────────────────────────────────────────────

    @app.get(
        "/health",
        response_model=HealthResponse,
        tags=["System"],
        summary="Health check",
    )
    async def health() -> HealthResponse:
        """Liveness probe — safe to call without auth."""
        loaded = _model is not None and _model._is_fitted
        return HealthResponse(
            status="ok" if loaded else "degraded",
            model_loaded=loaded,
            model_type=_model.metadata.model_type if loaded else None,
            trained_at=_model.metadata.trained_at if loaded else None,
            r2_score=_model.metrics.r2 if loaded else None,
        )

    @app.get(
        "/info",
        response_model=ModelInfoResponse,
        tags=["System"],
        summary="Model metadata",
        dependencies=[Depends(verify_api_key)],
    )
    async def model_info(model: QueueWaitModel = Depends(get_model)) -> ModelInfoResponse:
        """Return training metadata and performance metrics."""
        meta = model.metadata
        return ModelInfoResponse(
            model_type=meta.model_type,
            feature_columns=meta.feature_columns,
            metrics=meta.metrics,
            trained_at=meta.trained_at,
            training_rows=meta.training_rows,
            version=meta.version,
        )

    @app.post(
        "/predict",
        response_model=PredictionResponse,
        tags=["Prediction"],
        summary="Predict waiting time for one patient",
        dependencies=[Depends(verify_api_key)],
        responses={422: {"model": ErrorResponse}},
    )
    async def predict(
        body: PredictionRequest,
        model: QueueWaitModel = Depends(get_model),
    ) -> PredictionResponse:
        """
        Returns the estimated waiting time in minutes along with
        confidence bounds.
        """
        t0 = time.perf_counter()
        try:
            result = model.predict_single(body.to_feature_dict())
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

        elapsed_ms = (time.perf_counter() - t0) * 1000
        log.debug("Single prediction: %.1f min (%.1f ms)", result["predicted_wait_minutes"], elapsed_ms)
        return PredictionResponse(**result)

    @app.post(
        "/predict/batch",
        response_model=BatchPredictionResponse,
        tags=["Prediction"],
        summary="Batch predict for multiple patients",
        dependencies=[Depends(verify_api_key)],
        responses={422: {"model": ErrorResponse}},
    )
    async def predict_batch(
        body: BatchPredictionRequest,
        model: QueueWaitModel = Depends(get_model),
    ) -> BatchPredictionResponse:
        """
        Accepts up to 100 patient records; returns predictions in the
        same order.
        """
        t0 = time.perf_counter()
        try:
            results = model.predict_batch(
                [r.to_feature_dict() for r in body.records]
            )
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

        elapsed_ms = (time.perf_counter() - t0) * 1000
        log.info("Batch (%d records) predicted in %.1f ms", len(results), elapsed_ms)
        return BatchPredictionResponse(
            predictions=[PredictionResponse(**r) for r in results],
            total=len(results),
        )

    @app.get(
        "/model/importances",
        tags=["Model"],
        summary="Feature importances (Random Forest only)",
        dependencies=[Depends(verify_api_key)],
    )
    async def feature_importances(
        model: QueueWaitModel = Depends(get_model),
    ) -> dict:
        """Returns a dict of {feature: importance} sorted descending."""
        try:
            imp = model.feature_importances()
        except NotImplementedError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"importances": imp.to_dict()}

    # ── Global exception handler ──────────────────────────────────────────────

    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        log.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error.", "code": 500},
        )

    return app


app = create_app()

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT, API_RELOAD

    uvicorn.run(
        "ml_api:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
        log_level="info",
    )
