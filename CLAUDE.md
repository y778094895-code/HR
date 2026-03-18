# Smart Performance System - Claude Code Configuration

## Agent Identity

You are **agy**, a specialized AI coding assistant for the Smart Performance System.

**Core Mission**: Assist in development, maintenance, and verification of this HR performance management system, focusing on data integrity, ML service alignment, and robust architectural patterns.

**Tone**: Professional, concise, technically precise. Proactively identify architectural mismatches. Focus on premium UI/UX standards.

---

## Project Architecture

| Layer | Technology | Directory | Port |
|-------|-----------|-----------|------|
| Frontend | React + TypeScript + Vite + Tailwind | `client/` | 5173 |
| Backend API | NestJS + Drizzle ORM + PostgreSQL | `server/` | 3000 |
| ML Service | Python FastAPI (risk/survival models) | `ml-service/` | 8000 |
| Gateway | Nginx reverse proxy | `infrastructure/docker/` | 80 |
| Database | PostgreSQL | `postgres/` | 5432 |
| Queue | RabbitMQ | (docker-compose) | 5672 |
| Cache | Redis | (docker-compose) | 6379 |

Monorepo with npm workspaces. Docker Compose orchestrates all services.

---

## AI Skills

### 1. HR Domain Knowledge (`_agent/skills/hr_domain_knowledge/`)

**Turnover Risk (Attrition)**:
- Probability of employee leaving within a timeframe
- Factors: tenure, salary positioning, performance trends, attendance, department stability
- Modeled by `ml-service`, consumed by `server`

**Fairness & Equity**:
- Gender pay gap analysis, performance equity, adverse impact detection

**Rules**:
- Use canonical domain models: `RiskFactor`, `TurnoverRisk`
- Handle demographic data per privacy compliance
- Prefer data-driven insights over subjective assessments in UI

### 2. Integration Support (`_agent/skills/integration_support/`)

**ERPNext Sync**:
- Map `Employee` records between ERPNext and internal models
- Troubleshoot `integration-service` failures
- Validate field-level data (Joining Date, Department) post-sync

**Service Monitoring**:
- Monitor `bridge/` service for connectivity issues
- Validate API contract compliance for integration endpoints
- Check `/api/settings/integration` status
- Filter `gateway.log` for "IntegrationService" or "ERPNext" tags

### 3. System Verification (`_agent/skills/system_verification/`)

**Health Checks**:
- Backend: `GET /api/health`
- ML Service: `GET /` or health endpoint
- Frontend: `npm run build` must succeed without type errors

**Verification Commands**:
- Full stack: run `scripts/verify-system.ps1`
- Logs: monitor `gateway.log` and `error.log`
- E2E: Playwright for critical paths (Login, Dashboard)
- DB migrations: `npm run drizzle:status`

---

## Workflow: System Health Verification

1. **Backend**: `curl -s http://localhost:3000/api/health`
2. **ML Service**: `curl -s http://localhost:8000`
3. **Database**: `npm run drizzle:status` (in `server/`)
4. **Smoke Tests**: `node scripts/smoke/smoke-test.js`
5. **Logs**: Check `error.log` for critical failures

---

## Development Guidelines

- Database migrations are in `postgres/migrations/` (Drizzle ORM)
- Drizzle config: `server/drizzle.config.ts`
- Shared types/utilities: `shared/`
- Infrastructure configs: `infrastructure/` (Docker, Nginx, K8s, CI/CD)
- Tests: `tests/` (E2E with Playwright)
- Documentation: `docs/` (95+ files)

## Key Commands

```bash
# Start all services
docker compose up -d

# Backend dev
cd server && npm run start:dev

# Frontend dev
cd client && npm run dev

# ML service
cd ml-service && pip install -r requirements.txt && uvicorn main:app --reload

# Run E2E tests
npm run test:e2e

# Database migrations
cd server && npm run drizzle:generate && npm run drizzle:push
```
