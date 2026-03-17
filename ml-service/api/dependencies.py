from ..core.services.prediction_service import PredictionService
from ..core.managers.model_manager import ModelManager
from ..core.managers.cache_manager import CacheManager
from ..data.repositories.feature_repository import FeatureRepository

# Singleton instances
model_manager = ModelManager()
cache_manager = CacheManager()
feature_repo = FeatureRepository()

def get_prediction_service():
    return PredictionService(
        model_loader=model_manager,
        feature_repo=feature_repo,
        cache_manager=cache_manager
    )
