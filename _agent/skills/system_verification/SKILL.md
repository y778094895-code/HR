---
name: system_verification
description: Procedures for verifying the health and integration of the Smart Performance System components.
---

# System Verification Skill

This skill covers the automation and manual steps required to ensure all parts of the `smart_performance_system` are working correctly.

## Verification Targets

### 1. Backend API (NestJS)
- **Health Check**: `GET /api/health`
- **Database**: Ensure Drizzle migrations are up to date and Postgres is reachable.

### 2. ML Service (FastAPI)
- **Health Check**: `GET /` (expecting FastAPI documentation or specific health endpoint)
- **Model Loading**: Verify that survival and risk models are successfully loaded into memory.

### 3. Frontend (React)
- **Build Status**: Ensure `npm run build` succeeds without type errors.
- **E2E Tests**: Use Playwright for critical path verification (Login, Dashboard loading).

## Common Tasks
- **Verify Full Stack**: Run `verify.ps1` to check connectivity across all services.
- **Check Logs**: Monitor `gateway.log` and `error.log` for runtime issues.
