"""
QueueEase ML - API Schemas
Pydantic models for request validation and response serialisation.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from .config import APPOINTMENT_TYPES


# ─────────────────────────────────────────────────────────────────────────────
# Request schemas
# ─────────────────────────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """Payload for a single wait-time prediction."""

    queue_length: int = Field(
        ..., ge=0, le=200,
        description="Number of patients currently ahead in the queue.",
        examples=[8],
    )
    avg_consultation_minutes: float = Field(
        ..., gt=0, le=120,
        description="Average consultation duration in minutes.",
        examples=[7.5],
    )
    hour_of_day: int = Field(
        ..., ge=0, le=23,
        description="Current hour in 24-hour format.",
        examples=[10],
    )
    day_of_week: int = Field(
        ..., ge=0, le=6,
        description="0 = Monday … 6 = Sunday.",
        examples=[1],
    )
    appointment_type: str = Field(
        ...,
        description=f"One of: {APPOINTMENT_TYPES}.",
        examples=["general"],
    )
    patients_seen_today: Optional[int] = Field(
        default=0, ge=0, le=500,
        description="How many patients have been seen so far today.",
    )
    doctor_experience_years: Optional[int] = Field(
        default=5, ge=0, le=60,
        description="Doctor's years of clinical experience.",
    )
    rolling_avg_wait_last_5: Optional[float] = Field(
        default=None, ge=0,
        description="Average wait time of the last 5 patients (minutes). Auto-computed if omitted.",
    )

    @field_validator("appointment_type")
    @classmethod
    def validate_appointment_type(cls, v: str) -> str:
        if v not in APPOINTMENT_TYPES:
            raise ValueError(
                f"appointment_type must be one of {APPOINTMENT_TYPES}, got '{v}'"
            )
        return v

    def to_feature_dict(self) -> dict:
        """Return a plain dict ready for the model pipeline."""
        return self.model_dump()


class BatchPredictionRequest(BaseModel):
    """Payload for batch prediction (up to 100 records)."""

    records: List[PredictionRequest] = Field(
        ..., min_length=1, max_length=100,
        description="List of prediction requests.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Response schemas
# ─────────────────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    """Response for a single prediction."""

    predicted_wait_minutes: float = Field(
        description="Estimated waiting time in minutes."
    )
    lower_bound: float = Field(description="Lower confidence bound (minutes).")
    upper_bound: float = Field(description="Upper confidence bound (minutes).")
    confidence: str    = Field(description="'high' or 'medium'.")
    model_version: str = Field(description="Version string of the deployed model.")

    class Config:
        json_schema_extra = {
            "example": {
                "predicted_wait_minutes": 42.5,
                "lower_bound": 39.5,
                "upper_bound": 45.5,
                "confidence": "high",
                "model_version": "1.0.0",
            }
        }


class BatchPredictionResponse(BaseModel):
    """Response for batch predictions."""

    predictions: List[PredictionResponse]
    total: int = Field(description="Total number of predictions returned.")


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_type: Optional[str] = None
    trained_at:  Optional[str] = None
    r2_score:    Optional[float] = None
    version:     str = "1.0.0"


class ModelInfoResponse(BaseModel):
    model_type:      str
    feature_columns: List[str]
    metrics:         dict
    trained_at:      str
    training_rows:   int
    version:         str


class ErrorResponse(BaseModel):
    detail: str
    code:   int
