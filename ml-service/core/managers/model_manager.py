from typing import Dict, Any
from models.base.model_registry import ModelRegistry
from infrastructure.storage.client import StorageClient

class ModelManager:
    def __init__(self, model_registry: ModelRegistry, storage_client: StorageClient):
        self.model_registry = model_registry
        self.storage_client = storage_client
        self.loaded_models: Dict[str, Any] = {}
        
    async def load_model(self, model_name: str, version: str = "latest") -> Any:
        """Load model into memory"""
        cache_key = f"{model_name}:{version}"
        
        if cache_key in self.loaded_models:
            return self.loaded_models[cache_key]
        
        # Load from registry
        model_info = await self.model_registry.get_model(model_name, version)
        
        # Download model files
        model_path = await self.storage_client.download_model(
            model_info.location,
            model_info.checksum
        )
        
        # Load model based on type
        model = self._load_model_file(model_path, model_info.format)
        
        # Cache in memory
        self.loaded_models[cache_key] = model
        
        # Monitor memory usage
        # self._monitor_memory_usage()
        
        return model
    
    async def unload_model(self, model_name: str, version: str = None):
        """Unload model from memory"""
        if version:
            cache_key = f"{model_name}:{version}"
            if cache_key in self.loaded_models:
                del self.loaded_models[cache_key]
        else:
            # Unload all versions
            keys_to_remove = [k for k in self.loaded_models.keys() 
                            if k.startswith(f"{model_name}:")]
            for key in keys_to_remove:
                del self.loaded_models[key]
                
    async def list_models(self, model_name: str):
        # Helper to check loaded models
        return [k.split(':')[1] for k in self.loaded_models.keys() if k.startswith(model_name)]
    
    def _load_model_file(self, path: str, format: str) -> Any:
        """Load model based on format (pickle, joblib, onnx, etc.)"""
        # Mock loading for now since we don't have real model files
        return DummyModel()

class DummyModel:
    def predict(self, features):
        return {"score": 0.5}
