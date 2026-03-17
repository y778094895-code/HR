# Service Decoupling - Migration Guide

## 1. Architecture Overview
The system has been refactored into a clear 3-tier architecture:

### Server (Node.js/Express)
- **API Layer** (`server/api/`): Handles HTTP requests, routing, and validation.
- **Service Layer** (`server/services/`): Contains business logic and domain entities.
- **Data Layer** (`server/data/`): Handles database interactions via Drizzle ORM.
- **Dependency Injection**: Managed by InversifyJS in `server/shared/di/container.ts`.

### ML Service (Python/FastAPI)
- **API Layer** (`ml-service/api/`): FastAPI routers and controllers.
- **Core Layer** (`ml-service/core/`): Business logic, ML pipelines.
- **Data Layer** (`ml-service/data/`): Data access and caching.

## 2. Server Migration Steps
To migrate an existing module (e.g., `OldModule`):

1. **Create Repository**:
   - Create `server/data/repositories/old-module.repository.ts`.
   - Extend `BaseRepository`.

2. **Define Interface**:
   - Create `server/services/interfaces/i-old-module.service.ts`.

3. **Implement Service**:
   - Create `server/services/business/old-module.service.ts`.
   - Implement the interface and inject Repository.

4. **Create Controller**:
   - Create `server/api/controllers/old-module.controller.ts`.
   - Use `inversify-express-utils` decorators (`@controller`, `@httpGet`).

5. **Register in DI Container**:
   - Add bindings in `server/shared/di/container.ts`.

## 3. Running the System
### Server
```bash
cd server
npm install
npm run start
# Runs ts-node api/index.ts
```

### ML Service
```bash
cd ml-service
python -m venv venv
# Activate venv
pip install -r requirements.txt
python main.py
```
