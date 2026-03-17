from fastapi import APIRouter, Depends
from .schemas import TurnoverRequest, TurnoverResponse
from services.prediction_service import PredictionService

router = APIRouter()
prediction_service = PredictionService()

@router.post("/predict/turnover", response_model=TurnoverResponse)
async def predict_turnover(request: TurnoverRequest):
    result = prediction_service.predict_turnover(request.dict())
    return result

@router.get("/health")
async def health_check():
    return {"status": "healthy"}
