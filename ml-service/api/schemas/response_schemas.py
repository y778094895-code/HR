
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timezone


class PredictionResponse(BaseModel):
    predictions: Dict[str, float]
    confidence_scores: Dict[str, float]
    model_version: str
    processing_time: float


class TurnoverResponse(BaseModel):
    employee_id: str
    risk_score: float
    risk_level: str
    factors: List[str]


class ShapFeature(BaseModel):
    """Single SHAP feature contribution with locale-aware labels."""
    feature: str
    value: float          # raw feature value (may be 0.0 if unavailable)
    impact: float         # SHAP contribution (positive = increases risk)
    label_en: str
    label_ar: str


class TurnoverPredictionResponse(BaseModel):
    """
    Contract-aligned single-employee turnover prediction response.
    Matches contracts/ml-service-api.md → POST /predict/turnover.
    """
    employee_id: str
    risk_score: float                       # 0.0 – 1.0
    band: str                               # low | medium | high | critical
    confidence: float
    shap_values: List[ShapFeature]
    predicted_at: str                       # ISO-8601
    model_version: str


class BatchQueueResponse(BaseModel):
    batch_id: str
    status: str = "queued"
    message: str = "Batch prediction queued"
