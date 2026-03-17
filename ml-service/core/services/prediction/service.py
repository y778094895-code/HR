import numpy as np
from typing import List, Dict, Any
from schemas.prediction_schemas import PredictionRequest, PredictionResponse
import time

class PredictionService:
    def __init__(self, model_loader=None, feature_repo=None, cache_manager=None):
        self.model_loader = model_loader
        self.feature_repo = feature_repo
        self.cache_manager = cache_manager

    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        start_time = time.time()
        
        # In a real scenario, we'd fetch features from repo
        # and use the model_loader to load the specific version
        
        predictions = {}
        confidence_scores = {}
        
        for emp_id in request.employee_ids:
            # Simulate ML model inference
            # We use a deterministic but employee-specific "random" score for consistency in demos
            seed = sum(ord(c) for c in emp_id)
            np.random.seed(seed)
            
            score = np.random.beta(2, 8) # Most employees have low risk
            predictions[emp_id] = float(score)
            confidence_scores[emp_id] = float(0.85 + np.random.random() * 0.1)
            
        return PredictionResponse(
            predictions=predictions,
            confidence_scores=confidence_scores,
            model_version=request.model_version,
            processing_time=time.time() - start_time
        )

    async def batch_predict(self, requests: List[PredictionRequest]) -> List[PredictionResponse]:
        return [await self.predict(r) for r in requests]
