from pydantic import BaseModel
from typing import Dict, Any, Optional

class TurnoverRequest(BaseModel):
    employee_id: str
    historical_data: Dict[str, Any]

class TurnoverResponse(BaseModel):
    risk_score: float
    risk_level: str
    factors: Optional[Dict[str, str]] = None
