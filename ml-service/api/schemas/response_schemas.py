
from pydantic import BaseModel
from typing import Dict, List, Optional

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
