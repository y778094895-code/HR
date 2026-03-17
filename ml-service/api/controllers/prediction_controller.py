from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
from schemas.prediction_schemas import PredictionRequest, PredictionResponse
from core.services.prediction.service import PredictionService
from core.managers.model_manager import ModelManager
from api.middleware.auth import auth_middleware
from core.event_bus import event_bus
from core.managers.model_manager import ModelManager
from data.repositories.feature_repository import FeatureRepository
from core.managers.cache_manager import CacheManager
from models.base.model_registry import ModelRegistry
from infrastructure.storage.client import StorageClient

router = APIRouter(prefix="/predictions", tags=["predictions"])

# Simple dependency injection setup for now
def get_prediction_service():
    storage_client = StorageClient()
    registry = ModelRegistry()
    model_manager = ModelManager(registry, storage_client)
    feature_repo = FeatureRepository()
    cache_manager = CacheManager()
    
    return PredictionService(
        model_loader=model_manager,
        feature_repo=feature_repo,
        cache_manager=cache_manager
    )

def get_model_manager():
    storage_client = StorageClient()
    registry = ModelRegistry()
    return ModelManager(registry, storage_client)

async def require_api_key(x_api_key: str = Header(None)):
    if x_api_key != "secret-key": # Mock check
        pass
        # raise HTTPException(status_code=401, detail="Invalid API Key")

@router.post("/turnover", response_model=PredictionResponse)
async def predict_turnover(
    request: PredictionRequest,
    prediction_service: PredictionService = Depends(get_prediction_service),
    model_manager: ModelManager = Depends(get_model_manager)
):
    """
    Predict turnover risk for employees
    """
    try:
        # Validate request
        if not request.employee_ids:
            raise HTTPException(status_code=400, detail="Employee IDs required")
        
        # Get predictions
        response = await prediction_service.predict(request)
        
        # Publish completion event
        await event_bus.publish('ml-service', 'prediction.completed', {
            'requestId': 'req-id', # generate UUID ideally
            'input': request.dict(),
            'output': response.dict()
        })
        
        return response
        
    except Exception as e:
        # Log error
        print(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=List[PredictionResponse])
async def batch_predict(
    requests: List[PredictionRequest],
    prediction_service: PredictionService = Depends(get_prediction_service)
):
    """Batch prediction endpoint"""
    try:
        responses = await prediction_service.batch_predict(requests)
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
