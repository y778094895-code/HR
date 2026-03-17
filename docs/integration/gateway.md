# API Gateway & Service Mesh Documentation

## 1. Architecture
The API Gateway serves as the single entry point for all client requests (`http://localhost:8080` locally). It handles:
- **Routing**: Dispatches requests to appropriate backend services using `http-proxy-middleware`.
- **Authentication**: Validates JWTs before forwarding.
- **Resilience**: Implements circuit breakers (Opossum) and rate limiting (Redis).
- **Tracing**: Injects `x-trace-id` for distributed tracing.
- **Static Serving**: Serves the React frontend from `client/dist`.

## 2. Routing Table
| Path | Target Service | Port | Description |
|---|---|---|---|
| `/api/auth/*` | `employee-service` | 3001 | Public auth endpoints |
| `/api/employees/*` | `employee-service` | 3001 | Employee management |
| `/api/fairness/*` | `fairness-service` | 3002 | Bias analysis |
| `/api/interventions/*` | `intervention-service` | 3003 | Corrective actions |
| `/api/ml/*` | `ml-service` | 8000 | AI predictions |
| `/*` | Frontend | - | Static assets from `client/dist` |

## 3. Resilience Configuration
### Circuit Breaker
Implemented using `opossum`.
- **Timeout**: 5000ms
- **Error Threshold**: 50%
- **Reset Timeout**: 30000ms
- **Bulkhead**: Max 100 concurrent requests

### Rate Limiting
Implemented using `rate-limit-redis`.
- **Global Limit**: 1000 requests / 15 mins
- **Strategy**: Sliding window log

## 4. Development
Running locally:
```bash
cd infrastructure/api-gateway
npm install
npm run dev
```
Port: `8080`
