# Quickstart: Intelligent HR Performance System

**For**: New contributors, reviewers, and the AI agent (agy)
**Date**: 2026-03-18

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | ≥ 4.28 | https://docs.docker.com/get-docker/ |
| Node.js | 20 LTS | `nvm install 20` |
| Python | 3.11 | `pyenv install 3.11` |
| Git | any | — |

---

## 1. Clone & Bootstrap

```bash
git clone <repo-url>
cd smart_performance_system

# Install all npm workspaces
npm install

# Copy environment template
cp .env.example .env
# Fill in: POSTGRES_PASSWORD, JWT_SECRET, INTEGRATION_ENCRYPTION_KEY, REDIS_URL, RABBITMQ_URL
```

---

## 2. Start All Services (Docker Compose)

```bash
# Start the full stack (detached)
docker compose up -d

# Watch logs
docker compose logs -f server ml-service
```

Services started:
| Service | Port | Health check |
|---------|------|-------------|
| Nginx gateway | 80 | `curl http://localhost/api/health` |
| NestJS backend | 3000 (internal) | `GET /api/health` |
| FastAPI ML service | 8000 (internal) | `GET /` |
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |
| RabbitMQ | 5672 / 15672 (UI) | — |

---

## 3. Run Database Migrations

```bash
cd server
npm run drizzle:push       # dev only (applies schema directly)
# OR for production-style:
npm run drizzle:migrate    # runs migration chain 0000–0021+
```

---

## 4. Seed Development Data

```bash
# Seed 50 employees, 2 review cycles, and risk scores
cd server
npm run seed:dev

# Verify seed
curl http://localhost/api/v1/employees | jq '.meta.total'
# Expected: 50
```

---

## 5. Start Individual Services (Dev Mode)

```bash
# Backend (hot reload)
cd server && npm run start:dev

# Frontend (Vite HMR)
cd client && npm run dev
# Opens http://localhost:5173

# ML service (auto-reload)
cd ml-service && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 6. Run Tests

```bash
# Backend unit tests
cd server && npm run test

# Backend integration tests (requires running PostgreSQL)
cd server && npm run test:integration

# Frontend unit tests
cd client && npm run test

# E2E (requires full stack running)
npm run test:e2e

# ML service tests
cd ml-service && pytest

# Check coverage (must be ≥ 80 %)
cd server && npm run test:cov
```

---

## 7. Key Development Flows

### Adding a new NestJS module

```bash
cd server
npx nest generate module <domain>
npx nest generate service <domain>
npx nest generate controller <domain>
# Add to AppModule imports
# Add Drizzle schema slice in src/<domain>/<domain>.schema.ts
# Generate migration: npm run drizzle:generate
```

### Adding a new database migration

```bash
cd server
# Edit schema file first, then:
npm run drizzle:generate
# Review generated SQL in postgres/migrations/
# Commit both schema + migration
```

### Adding a translation key

```
client/src/locales/en/common.json  ← add English
client/src/locales/ar/common.json  ← add Arabic
# Use in component: const { t } = useTranslation('common'); t('my.key')
# Missing key → fallback to `en`; never shows raw key string
```

### Triggering a risk prediction manually

```bash
curl -X POST http://localhost/api/v1/risk/employees/<employee_id>/predict \
  -H "Authorization: Bearer <hr_token>"
# Returns risk score or 202 if queued
```

---

## 8. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `RABBITMQ_URL` | Yes | AMQP connection string |
| `JWT_SECRET` | Yes | Access token signing secret (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `INTEGRATION_ENCRYPTION_KEY` | Yes | AES-256 key for credential encryption (32 bytes hex) |
| `ML_SERVICE_URL` | Yes | Internal URL: `http://ml-service:8000` |
| `ML_SERVICE_TOKEN` | Yes | Service-to-service auth token |
| `SMTP_HOST` | No | Email delivery |
| `SMTP_PORT` | No | Default `587` |
| `SMTP_USER` | No | |
| `SMTP_PASS` | No | |
| `NODE_ENV` | No | `development \| production \| test` |

---

## 9. Architecture Quick Reference

```
Browser (5173 dev / 80 prod)
    └── Nginx (80)
          ├── /api/*          → NestJS (3000)
          │      ├── /auth
          │      ├── /employees
          │      ├── /goals
          │      ├── /review-cycles
          │      ├── /risk        ──HTTP──► ML Service (8000)
          │      ├── /recommendations
          │      ├── /analytics
          │      ├── /integrations
          │      └── /notifications
          │
          └── /ml/*           → ML Service (8000) [internal only]

NestJS ──AMQP──► RabbitMQ ──► NestJS workers
                    └──────► ML service consumers

NestJS ──► Redis (cache: risk scores, sessions)
NestJS ──► PostgreSQL (all persistent data)
```

---

## 10. Useful Make Targets

```bash
make up           # docker compose up -d
make down         # docker compose down
make logs         # docker compose logs -f
make migrate      # run drizzle migrations
make seed         # seed dev data
make test         # all tests
make lint         # eslint + prettier check
make build        # production builds (server + client)
make health       # curl all health endpoints
```

---

## 11. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `drizzle:push` fails with "relation already exists" | Run `drizzle:migrate` instead; push is idempotent only on fresh DBs |
| ML service returns 503 | Model artefacts not loaded — check `ml-service/models/` for `.pkl` files; run `POST /models/reload` |
| Arabic text renders LTR | Check `<html dir>` attribute — ensure `LocaleProvider` wraps the app root |
| RabbitMQ consumers not processing | Verify `RABBITMQ_URL` in `.env`; check management UI at `http://localhost:15672` |
| ERPNext sync fails with 401 | Re-enter API credentials in Settings → Integration; ensure token has `Employee: Read` permission in ERPNext |
| Risk scores show "stale" | Cache was invalidated but prediction job is queued; wait for RabbitMQ worker to process `prediction.requested` |
