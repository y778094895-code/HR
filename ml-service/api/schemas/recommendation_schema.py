
from pydantic import BaseModel
from typing import List, Optional, Dict

class RecommendationResponse(BaseModel):
    type: str
    title: str
    description: str
    confidence: float
    reason_codes: List[str]
    estimated_impact: Optional[Dict[str, float]] = None

class RecommendationRequest(BaseModel):
    employee_id: str
    focus_area: Optional[str] = None
