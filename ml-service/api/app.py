
from fastapi import FastAPI
from .controllers.prediction_controller import router as prediction_router
from .controllers.recommendation_controller import router as recommendation_router
from .controllers.fairness_controller import router as fairness_router

app = FastAPI(title="Smart HR Performance System - ML Service")

app.include_router(prediction_router)
app.include_router(recommendation_router)
app.include_router(fairness_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
