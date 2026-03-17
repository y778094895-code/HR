
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionRequest(BaseModel):
    employee_ids: List[str]
    features: Optional[Dict[str, Any]] = None
    model_version: str = "v1"

class TurnoverRequest(BaseModel):
    employee_id: str
    features: Dict[str, Any]
