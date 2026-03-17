from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.recommendation_engine import recommendation_engine
from services.impact_estimator import impact_estimator

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

class GenerateRequest(BaseModel):
    employee_id: str
    focus_area: Optional[str] = None

class ImpactRequest(BaseModel):
    employee_id: str
    intervention_type: str

@router.post("/generate")
async def generate_recommendations(request: GenerateRequest):
    try:
        recommendations = await recommendation_engine.generate(
            request.employee_id, request.focus_area
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/estimate-impact")
async def estimate_impact(request: ImpactRequest):
    try:
        impact = await impact_estimator.estimate(
            request.intervention_type, request.employee_id
        )
        return impact
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
