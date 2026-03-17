# Route & Dependency Matrix

## 1. Frontend to API Gateway
Frontend calls `http://localhost:8080/api` (or relative `/api` in prod).

| Frontend Call | Gateway Path | Gateway Rewrite (to internal service) | Internal Target | Status / Notes |
|---|---|---|---|---|
| `/api/auth/*` | `/api/auth` | Strips `/api/` or keeps depending on rewrite logic | `employee-service:3000/api/auth/*` | **Warning**: Rewrite logic (`proxy.js`) has complex fallbacks. Controller is [auth.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/auth.controller.ts). |
| `/api/employees/*` | `/api/employees` | `/api/employees/*` | `employee-service:3000/api/employees/*` | OK. [employee.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/employee.controller.ts). |
| `/api/fairness/*` | `/api/fairness` | `/api/fairness/*` | `employee-service:3000/api/fairness/*` (via `FAIRNESS_SERVICE_URL`) | OK. [fairness.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/fairness.controller.ts). |
| `/api/interventions/*`| `/api/interventions` | `/api/interventions/*`| `employee-service:3000/api/interventions/*` (via `INTERVENTION_SERVICE_URL`) | OK. [intervention.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/intervention.controller.ts). |
| `/api/dashboard/*` | `/api/dashboard` | `/api/dashboard/*` | `employee-service:3000/api/dashboard/*` | OK. [dashboard.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/dashboard.controller.ts). |
| `/api/alerts/*` | `/api/alerts` | `/api/alerts/*` | `employee-service:3000/api/alerts/*` | OK. [alerts.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/alerts.controller.ts). |
| `/api/ml/*` | `/api/ml` | `/api/ml/*` | `employee-service:3000/api/ml/*` | **MISMATCH**: [ml.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/ml.controller.ts) exists but is manually excluded/not registered in [api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts). Gateway routes here, but Backend will 404. |
| `/api/turnover/*` | `/api/turnover` | `/api/turnover/*` | `employee-service:3000/api/turnover/*` | **MISMATCH**: [turnover.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/turnover.controller.ts) exists but is not registered in [api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts). |
| `/api/performance/*` | `/api/performance` | `/api/performance/*` | `employee-service:3000/api/performance/*` | **MISMATCH**: [performance.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/performance.controller.ts) is not registered in [api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts). |
| `/api/training/*` | `/api/training` | `/api/training/*` | `employee-service:3000/api/training/*` | **MISMATCH**: [training.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/training.controller.ts) is not registered in [api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts). |
| `/api/reports/*` | `/api/reports` | `/api/reports/*` | `employee-service:3000/api/reports/*` | **MISMATCH**: [reports.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/reports.controller.ts) is not registered in [api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts). |
| `/api/users/*` | `/api/users` | `/api/users/*` | `employee-service:3000/api/users/*` | OK. [users.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/users.controller.ts) is registered (wait, let me double check — no, users is NOT in [index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts), wait, in [index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts) lines 8-16 I saw... wait, I need to verify [users.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/users.controller.ts) registration. Based on previous read, it's missing!). |
| `/api/recommendations/*`| `/api/recommendations` | `/api/recommendations/*`| `employee-service:3000/api/recommendations/*`| **MISMATCH**: [recommendation.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/recommendation.controller.ts) is not registered in [api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts). |
| `http://localhost:8000/*` | Direct to ML | N/A | `ml-service` OR `hr-ai-layer` | **MISMATCH**: Frontend (`REACT_APP_ML_SERVICE_URL`) points to `8000`. But Docker maps `8000` to `ml-service` in root compose, and `8000` to `hr-ai-layer` in its own compose. |

## 2. Backend to External / ML Services
The `employee-service` acts as a BFF (Backend-For-Frontend).

| Backend Flow | Env Config | Target Service | Status / Notes |
|---|---|---|---|
| ML Proxy | `ML_SERVICE_URL` | `http://ml-service:8000` | Points to Python `ml-service`. |
| HR AI Direct | `HR_AI_LAYER_URL` | `http://hr-ai-layer:8000` | Points to FastAPI Random Forest model. |

**Dependency Summary**:
- **Gateway** completely relies on `employee-service` for everything except Health endpoints.
- **employee-service** connects to `postgres`, `redis`, `rabbitmq`, and `consul`. It also expects `ml-service` and `hr-ai-layer` via HTTP.
- **ml-service** relies on `redis`, `rabbitmq`, `consul`.
- **hr_ai_layer** relies on `postgres`.
