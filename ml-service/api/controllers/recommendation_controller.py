
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.recommendation_schema import RecommendationRequest, RecommendationResponse
from core.services.recommendation.engine import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

# Dependency Injection
def get_recommendation_engine():
    return RecommendationEngine()

@router.post("/", response_model=List[RecommendationResponse])
async def get_recommendations(
    request: RecommendationRequest,
    engine: RecommendationEngine = Depends(get_recommendation_engine)
):
    try:
        return await engine.generate(request.employee_id, request.focus_area)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
