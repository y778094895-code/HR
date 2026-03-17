from pydantic import BaseModel
from typing import List, Optional, Dict

class FairnessRequest(BaseModel):
    analysis_type: str # 'disparate_impact', 'equal_opportunity'
    protected_attribute: str # 'gender', 'age', 'ethnicity'
    outcome_column: str
    data: List[Dict]

class FairnessScore(BaseModel):
    attribute_value: str
    selection_rate: float
    score: float

class FairnessResponse(BaseModel):
    status: str
    overall_disparity: float
    scores: List[FairnessScore]
    recommendations: List[str]
