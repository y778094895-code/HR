# Server Refactoring Guide: Express Routes vs Business Logic

## 1. Principles
- **Controller Layer**: Handles HTTP requests/responses only. No business logic.
- **Service Layer**: Pure business logic. No Express dependencies.
- **Repository Layer**: Data access only.
- **Dependency Injection**: All dependencies are injected via Inversify.

## 2. New Architecture
```
server/
├── api/           # HTTP Layer (Controllers, Routes, Middleware)
├── services/      # Business Layer (Domain, Business Logic)
├── data/          # Data Layer (Repositories, Models, Database)
└── shared/        # Shared Utilities
```

## 3. Migration Guide
To migrate an existing module:
1. Identify logic in routes/controllers.
2. Extract logic to a Service in `server/services/business/`.
3. Create a Repository in `server/data/repositories/` if database access is needed.
4. Update Controller to inject the Service using `DIContainer`.
