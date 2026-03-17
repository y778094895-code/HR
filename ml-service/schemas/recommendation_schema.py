from typing import List, Optional
from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    employee_id: str
    focus_area: Optional[str] = None
    department: Optional[str] = None

class RecommendationResponse(BaseModel):
    type: str
    title: str
    description: str
    confidence: float
    reason_codes: List[str]
    estimated_impact: dict
    metadata: Optional[dict] = None

class ImpactRequest(BaseModel):
    intervention_type: str
    employee_context: dict
    metrics_before: dict

class ImpactResponse(BaseModel):
    estimated_impact_score: float
    explanation: str
    confidence: float
