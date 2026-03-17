from typing import Dict, Any, Optional
from pydantic import BaseModel

class ModelInfo(BaseModel):
    name: str
    version: str
    location: str
    format: str
    checksum: str
    status: str = "active"

class ModelRegistry:
    def __init__(self):
        self._registry: Dict[str, ModelInfo] = {}

    async def get_model(self, name: str, version: str) -> ModelInfo:
        # Mock implementation - in reality would query DB or service
        key = f"{name}:{version}"
        if key not in self._registry:
             # Return dummy info for development
             return ModelInfo(
                 name=name,
                 version=version,
                 location=f"models/trained_models/{name}/{version}/model.pkl",
                 format="pickle",
                 checksum="dummy-hash"
             )
        return self._registry[key]

    async def register_model(self, info: ModelInfo):
        key = f"{info.name}:{info.version}"
        self._registry[key] = info

    async def set_production_version(self, name: str, version: str):
        # Update production pointer
        pass
