# Critical Breakpoints

These are the immediate failure points ("breakpoints") in the communication chain out-of-the-box:

## 1. Unregistered Backend Controllers (Guaranteed 404s)
The API Gateway correctly exposes routes like `/api/ml`, `/api/turnover`, `/api/performance`, `/api/training`, `/api/reports`, `/api/recommendations`, and potentially `/api/users` and `/api/impact`.
However, [server/api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts) **does not register** these controllers.
**Impact**: Frontend calls to these endpoints will pass the gateway and hit a 404 Not Found error at `employee-service`.

## 2. The Twin Port 8000 Collision (ML Services)
- [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) maps `ml-service` container port `8000` to host `8000`.
- `hr_ai_layer` (inside [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) and its own compose) exposes/runs on `8000`.
- If both try to bind host port 8000, Docker will throw a binding error.
- **Impact**: One of the ML services will fail to start, breaking any dependencies on it.

## 3. Ambiguous ML Frontend Client
- [client/src/config/api.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/config/api.ts) defines `mlServiceURL: ${GATEWAY_URL}/ml`.
- The Gateway `/api/ml` routes to `employee-service`.
- `employee-service` uses [ml.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/ml.controller.ts) to proxy requests to `ML_SERVICE_URL`.
- However, [.env](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/.env) for frontend defines `REACT_APP_ML_SERVICE_URL=http://localhost:8000`. If this is used directly anywhere in the frontend, it bypasses the Gateway and hits whichever ML service accidentally won the port 8000 war, causing CORS or Schema validation issues.

## 4. `hr_ai_layer` vs `ml-service` Scope Overlap
- `hr_ai_layer` has a `/predict` endpoint for Attrition (6M Random Forest). It writes back to `predictions` SQL table directly.
- `ml-service` has an [api/controllers/prediction_controller.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/ml-service/api/controllers/prediction_controller.py) with `/predictions/turnover` that accepts `PredictionRequest(employee_ids)`.
- **Impact**: The system has two brains competing for "turnover/attrition" prediction. The backend controller (when registered) needs to know definitively which one to call.

## 5. Gateway Auth Route Rewrite Risk
In Gateway [routes.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/infrastructure/api-gateway/src/routes.js):
```javascript
router.use('/auth', createServiceProxy(config.services.employee, {
    pathRewrite: (path, req) => {
        if (path.includes('/api/auth')) return path;
        if (path.startsWith('/auth')) return `/api${path}`;
        return `/api/auth${path}`;
    }
}));
```
If a frontend calls `http://localhost:8080/api/auth/login`, it passes through `app.use('/api', routes)`. The internal path passed to `/auth` router becomes `/auth/login`. The rewrite logic converts this to `/api/auth/login`. This works, but is fragile.
