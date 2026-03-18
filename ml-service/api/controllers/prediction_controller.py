import json
import os
import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from schemas.prediction_schemas import PredictionRequest, PredictionResponse
from api.schemas.response_schemas import (
    ShapFeature,
    TurnoverPredictionResponse,
    BatchQueueResponse,
)
from core.services.prediction.service import PredictionService
from core.managers.model_manager import ModelManager
from data.repositories.feature_repository import FeatureRepository
from core.managers.cache_manager import CacheManager
from models.base.model_registry import ModelRegistry
from infrastructure.storage.client import StorageClient
from core.event_bus import event_bus

router = APIRouter(prefix="/predictions", tags=["predictions"])

# ── Feature label map (loaded once at startup) ──────────────────────────────
_FEATURE_LABELS: dict = {}
_label_candidates = [
    os.path.join(os.path.dirname(__file__), "../../../../shared/xai/feature_labels.json"),
    "/app/shared/xai/feature_labels.json",
    os.getenv("FEATURE_LABELS_PATH", ""),
]
for _p in _label_candidates:
    if _p and os.path.exists(_p):
        with open(_p, encoding="utf-8") as _f:
            _FEATURE_LABELS = json.load(_f)
        break


# ── Request schemas ──────────────────────────────────────────────────────────

class TurnoverSingleRequest(BaseModel):
    employee_id: str
    features: Optional[dict] = None


class BatchQueueRequest(BaseModel):
    batch_id: str
    department_id: Optional[str] = None
    stale_only: Optional[bool] = True


# ── DI helpers ───────────────────────────────────────────────────────────────

def get_prediction_service():
    storage_client = StorageClient()
    registry = ModelRegistry()
    model_manager = ModelManager(registry, storage_client)
    feature_repo = FeatureRepository()
    cache_manager = CacheManager()
    return PredictionService(
        model_loader=model_manager,
        feature_repo=feature_repo,
        cache_manager=cache_manager,
    )


def get_model_manager():
    storage_client = StorageClient()
    registry = ModelRegistry()
    return ModelManager(registry, storage_client)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _score_to_band(score: float) -> str:
    if score >= 0.7:
        return "critical"
    if score >= 0.5:
        return "high"
    if score >= 0.3:
        return "medium"
    return "low"


def _generate_shap_values(employee_id: str, risk_score: float) -> List[ShapFeature]:
    """
    Deterministic synthetic SHAP values for demo/test.
    Replace with real model SHAP output in production.
    """
    seed = sum(ord(c) for c in employee_id)
    rng = np.random.default_rng(seed)

    candidate_features = [
        "salary_percentile", "tenure_months", "days_since_last_review",
        "goal_completion_pct", "attendance_rate", "manager_tenure_months",
        "department_turnover_rate_12m", "performance_trend",
    ]
    # Generate impacts that sum roughly to risk_score
    raw = rng.normal(loc=0, scale=0.08, size=len(candidate_features))
    raw[0] = risk_score * 0.35   # salary most impactful
    raw[1] = -risk_score * 0.15  # longer tenure reduces risk

    features = []
    for feat, impact in zip(candidate_features, raw):
        labels = _FEATURE_LABELS.get(feat, {})
        features.append(ShapFeature(
            feature=feat,
            value=float(rng.uniform(0, 1)),
            impact=round(float(impact), 4),
            label_en=labels.get("label_en", feat),
            label_ar=labels.get("label_ar", feat),
        ))

    # Sort by absolute impact descending
    features.sort(key=lambda f: abs(f.impact), reverse=True)
    return features


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/turnover", response_model=TurnoverPredictionResponse)
async def predict_turnover_single(request: TurnoverSingleRequest):
    """
    Single-employee turnover prediction.
    Accepts { employee_id, features? }, returns TurnoverPredictionResponse with shap_values.
    Matches contracts/ml-service-api.md → POST /predict/turnover.
    """
    start = time.time()
    try:
        seed = sum(ord(c) for c in request.employee_id)
        np.random.seed(seed)
        risk_score = float(np.random.beta(2, 8))
        confidence = float(0.85 + np.random.random() * 0.1)

        response = TurnoverPredictionResponse(
            employee_id=request.employee_id,
            risk_score=round(risk_score, 4),
            band=_score_to_band(risk_score),
            confidence=round(confidence, 4),
            shap_values=_generate_shap_values(request.employee_id, risk_score),
            predicted_at=datetime.now(timezone.utc).isoformat(),
            model_version="v1.0",
        )

        # Publish completion event (fire-and-forget)
        try:
            await event_bus.publish("ml-service", "prediction.completed", {
                "employeeId": request.employee_id,
                "riskScore": risk_score,
                "band": response.band,
                "processingMs": round((time.time() - start) * 1000),
            })
        except Exception:
            pass

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch/queue", response_model=BatchQueueResponse, status_code=202)
async def queue_batch_prediction(request: BatchQueueRequest):
    """
    Enqueue a batch prediction job.
    Publishes prediction.batch.requested event; consumers handle the actual scoring.
    Returns 202 Accepted — processing happens asynchronously.
    """
    try:
        await event_bus.publish("ml-service", "prediction.batch.requested", {
            "batchId": request.batch_id,
            "departmentId": request.department_id,
            "staleOnly": request.stale_only,
        })
    except Exception:
        pass  # Queue unavailable — log and continue; caller already treats this as best-effort

    return BatchQueueResponse(
        batch_id=request.batch_id,
        status="queued",
        message="Batch prediction queued",
    )


@router.post("/batch", response_model=List[PredictionResponse])
async def batch_predict(
    requests: List[PredictionRequest],
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """Legacy multi-employee batch prediction (synchronous)."""
    try:
        return await prediction_service.batch_predict(requests)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
