from fastapi import FastAPI
from api.controllers.prediction_controller import router as prediction_router
from api.controllers.recommendation_controller import router as recommendation_router
from api.controllers.fairness_controller import router as fairness_controller

app = FastAPI(title="Smart HR ML Service")

app.include_router(prediction_router)
app.include_router(recommendation_router)
app.include_router(fairness_controller)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml-service"}

import consul
import socket
import os

@app.on_event("startup")
async def startup_event():
    c = consul.Consul(host=os.getenv('CONSUL_HOST', 'consul'), port=int(os.getenv('CONSUL_PORT', '8500')))
    service_id = f"ml-service-{socket.gethostname()}-{8000}"
    # ... (Consul registration code matches previous) ...
    try:
        c.agent.service.register(
            name="ml-service",
            service_id=service_id,
            address=socket.gethostname(),
            port=8000,
            tags=["ml", "python"],
            check={
                "http": f"http://{socket.gethostname()}:8000/health",
                "interval": "10s",
                "timeout": "5s",
                "deregister_critical_service_after": "30s"
            }
        )
        app.state.consul = c
        app.state.service_id = service_id
        print(f"Registered {service_id}")
    except Exception as e:
        print(f"Consul registration failed: {e}")

    # Start Event Listeners
    from core.event_handlers import handler
    import asyncio
    asyncio.create_task(handler.start_listening())

@app.on_event("shutdown")
async def shutdown_event():
    if hasattr(app.state, 'consul'):
        app.state.consul.agent.service.deregister(app.state.service_id)
        print(f"Deregistered {app.state.service_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
