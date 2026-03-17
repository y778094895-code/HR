# Runtime Architecture Inspection

This document reconstructs the true runtime architecture as derived directly from the code, configurations, and network definitions.

## 1. Service Inventory

| Service Name | Framework / Tech | Port Config | Main Config File | Primary Purpose |
|---|---|---|---|---|
| **API Gateway** | Node.js (Express) | `8080` (Host & Container) | [infrastructure/api-gateway/src/app.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/infrastructure/api-gateway/src/app.js) | Reverse proxy, JWT Auth verification, rate limiting, and static file serving. |
| **Frontend UI** | React (Vite/CRA) | `3001` (Host) | [client/src/config/api.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/config/api.ts) | SPA client. Expects to hit API Gateway for all data. |
| **Backend (Employee Service)** | Node.js (Inversify Express) | `3000` (Host & Container) | [server/api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts) | Main business logic, DB interactions, orchestrator for ML calls (BFF). |
| **ML Service** | Python (FastAPI) | `8000` (Host & Container) | [ml-service/main.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/ml-service/main.py) | Generic predictions (`/predictions/turnover`) and recommendations. |
| **HR AI Layer** | Python (FastAPI) | `8000` (Exposed Internally) | [hr_ai_layer/src/hr_ai_layer/serving/app.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/src/hr_ai_layer/serving/app.py) | Dedicated Attrition Random Forest serving. Reads/writes direct to DB. |
| **Postgres** | PostgreSQL 14 | `5433` (Host) -> `5432` (Container) | [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) (lines 110-121) | Primary relational database (`hr_system`). |
| **Redis** | Redis 7 Alpine | `6379` (Host & Container) | [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) (lines 123-128) | Caching and JWT blacklist storage. |

## 2. End-to-End Request Flow (File-Level Evidence)

### 2.1 Frontend -> Gateway
* **Evidence**: [client/src/config/api.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/config/api.ts) (Lines 4-10) defines `API_CONFIG.baseURL = GATEWAY_URL` which defaults to `http://localhost:8080/api` or reads `VITE_API_GATEWAY`.
* **Flow**: Axios client ([client/src/services/api/client.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/services/api/client.ts), Line 10) attaches Bearer tokens and directs calls to the Gateway.

### 2.2 Gateway -> Backend (Authorization & Proxying)
* **Evidence (Auth Middleware)**: [infrastructure/api-gateway/src/middleware/auth.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/infrastructure/api-gateway/src/middleware/auth.js) (Lines 14-39). Reads `Authorization` header, verifies JWT with `config.jwtSecret`, and checks Redis (`blacklist:${token}`) before passing requests.
* **Evidence (Routes)**: [infrastructure/api-gateway/src/routes.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/infrastructure/api-gateway/src/routes.js) (Lines 37-162). Every protected route maps via `createServiceProxy(config.services.employee)`. Example:
  * `/api/dashboard` -> proxies to `employee-service:3000/api/dashboard`
  * `/api/ml` -> proxies to `employee-service:3000/api/ml`
  * `/api/turnover` -> proxies to `employee-service:3000/api/turnover`

### 2.3 Backend Controller Registration
* **Evidence**: [server/api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts) (Lines 8-16). The `InversifyExpressServer` registers routes automatically, **BUT** it relies on explicit imports to process the decorators.
* **Flow**: Only the following controllers are imported: `employee`, `fairness`, `intervention`, `dashboard`, [auth](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/infrastructure/api-gateway/src/middleware/auth.js#41-54), `console-bff`, `alerts`.
* **Break**: If a request routes to `/api/turnover`, there is no controller imported, resulting in a 404 response.

### 2.4 Backend -> ML / HR AI Layer (Downstream Integrations)
* **Evidence**: [server/api/controllers/ml.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/ml.controller.ts) (Lines 11-15) and [server/api/controllers/turnover.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/turnover.controller.ts) (Line 29) rely on internal services (`IMLServiceClient` and `TurnoverService`).
* **Evidence**: [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) (Lines 42-45) for `employee-service` injects:
  * `ML_SERVICE_URL=http://ml-service:8000`
  * `HR_AI_LAYER_URL=http://hr-ai-layer:8000`
* **Flow**: The backend intends to orchestrate external calls to the Python layers via these local network URLs.

### 2.5 ML Service and HR AI Layer Structures
* **HR AI Layer Evidence**: [hr_ai_layer/src/hr_ai_layer/serving/app.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/src/hr_ai_layer/serving/app.py) (Lines 235-267). Exposes `POST /predict`. Reads directly from the `sim_survival_horizon_dataset_v1` table and executes a database `INSERT INTO predictions` via [_writeback()](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/src/hr_ai_layer/serving/app.py#192-223). It has no authentication.
* **ML Service Evidence**: [ml-service/main.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/ml-service/main.py) (Line 8-10) includes routers. [ml-service/api/controllers/prediction_controller.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/ml-service/api/controllers/prediction_controller.py) (Line 40) exposes `POST /predictions/turnover`. It depends on an internal cache, model registry, and event bus publish.

---

## 3. Mismatch List: Intended vs. Actual Implementation

### Mismatch 1: Environment Variable Naming (Frontend)
* **File**: [.env](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/.env) (Lines 26-27) defines `REACT_APP_API_URL=http://localhost:3000/api` (pointing directly to Backend, bypassing gateway) and `REACT_APP_ML_SERVICE_URL=http://localhost:8000`.
* **File**: [client/src/config/api.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/config/api.ts) (Line 4) looks for `VITE_API_GATEWAY`.
* **Reality**: The [.env](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/.env) file uses Create-React-App syntax but the configuration uses Vite syntax. If Vite is the bundler, the [.env](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/.env) configuration is actively ignored. If CRA is used, it points clients to the wrong port (3000 instead of 8080).

### Mismatch 2: The Missing Controller 404s
* **File**: [infrastructure/api-gateway/src/routes.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/infrastructure/api-gateway/src/routes.js) explicitly configures proxies for `/api/ml`, `/api/turnover`, `/api/performance`, `/api/training`, `/api/reports`, `/api/users`, `/api/impact`, and `/api/recommendations`.
* **File**: [server/api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts) **omits** importing any of those equivalent controllers.
* **Reality**: Any request to these endpoints will successfully pass the Gateway's auth middleware and then immediately crash into a Backend `404 Not Found`.

### Mismatch 3: Competing AI Responsibilities & Data Integrity
* **File**: [hr_ai_layer/src/hr_ai_layer/serving/app.py](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/src/hr_ai_layer/serving/app.py) (`POST /predict`) writes directly to the DB table `predictions` using raw SQL (`INSERT INTO`).
* **File**: [server/api/controllers/turnover.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/turnover.controller.ts) likely expects to manage business logic and writes via the standard Drizzle ORM pipeline.
* **Reality**: `hr_ai_layer` performs unauthorized shadow-writes to the core database, entirely bypassing the Backend's abstraction, auditing, and ORM layer.

### Mismatch 4: The Port 8000 Network Collision
* **File**: [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) (Line 105) binds `ml-service` to host port `"8000:8000"`.
* **File**: [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) (Line 66) configures `hr-ai-layer` to expose port `"8000"` (internal docker network only).
* **Reality**: While Docker prevents a port crash because `hr-ai-layer` isn't bound to the host, both exist inside the `smart-performance` network as `http://hr-ai-layer:8000` and `http://ml-service:8000`. This creates massive configuration confusion if environment URLs are misassigned or if developers try to test `hr-ai-layer` from their host machine.
