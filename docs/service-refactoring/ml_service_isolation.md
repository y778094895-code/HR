# ML Service Isolation Guide

## 1. Principles
- **API Layer**: FastAPI routes only.
- **Core Layer**: ML Business logic, Pipeline, Feature Engineering.
- **Models Layer**: Model lifecycle management, Registry.
- **Data Layer**: Feature Repositories, Caching.

## 2. Architecture
```
ml-service/
├── api/           # FastAPI Application
├── core/          # ML Business Logic, Managers
├── models/        # ML Models & Registry
├── data/          # Data Access Layer
└── infrastructure/# Storage, Logging
```

## 3. Key Components
- **PredictionService**: Orchestrates the prediction pipeline.
- **ModelManager**: Handles loading/unloading of models from storage.
- **ModelRegistry**: Tracks model versions and metadata.
