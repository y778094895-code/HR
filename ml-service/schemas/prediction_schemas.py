from pydantic import BaseModel
from typing import List, Dict, Any

class PredictionRequest(BaseModel):
    employee_ids: List[str]
    features: Dict[str, Any]
    model_version: str = "v1"

class PredictionResponse(BaseModel):
    predictions: Dict[str, float]
    confidence_scores: Dict[str, float]
    model_version: str
    processing_time: float
