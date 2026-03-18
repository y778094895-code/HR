# Implementation Plan: Intelligent HR Performance Analysis & Management System

**Branch**: `001-intelligent-hr-performance-system` | **Date**: 2026-03-18
**Spec**: [spec.md](./spec.md)
**Constitution**: [../../memory/constitution.md](../../memory/constitution.md) v1.0.0

---

## Summary

Build a multi-role HR performance management platform with AI-driven attrition risk prediction,
360° review cycles, goal/KPI tracking, and a bilingual (Arabic/English) React frontend.
The system is a Dockerised monorepo: NestJS backend → PostgreSQL/Redis/RabbitMQ;
FastAPI ML service; Nginx API gateway. ERPNext and CSV/Excel integration complete the data layer.

---

## Technical Context

| Dimension | Value |
|-----------|-------|
| **Backend language** | TypeScript — Node 20 LTS, NestJS 10 |
| **Frontend language** | TypeScript — React 18, Vite 5, Tailwind CSS 3 |
| **ML service language** | Python 3.11, FastAPI 0.111 |
| **Primary DB** | PostgreSQL 16, Drizzle ORM |
| **Cache / Sessions** | Redis 7 |
| **Queue** | RabbitMQ 3.13 (AMQP) |
| **Gateway** | Nginx 1.25 (reverse proxy + static serving) |
| **Testing — backend** | Jest (unit), Supertest (integration, real PG) |
| **Testing — frontend** | Vitest + React Testing Library, Playwright (E2E) |
| **Testing — ML** | pytest, httpx (contract) |
| **ORM / migrations** | Drizzle ORM — migrations in `postgres/migrations/` (0000–0021 already exist) |
| **Target platform** | Docker Compose (dev/prod), Kubernetes (k8s manifests in `kubernetes/`) |
| **Performance goals** | API p95 ≤ 300 ms (list), ≤ 150 ms (single); ML p95 ≤ 500 ms; Lighthouse ≥ 85 |
| **Scale/Scope** | Single-tenant v1; ~10 k employees upper bound; 50 concurrent users |
| **Localisation** | i18next — `ar` (RTL) + `en` (LTR), locale files in `client/src/locales/` |
| **Auth** | JWT (access + refresh), role-based guards in NestJS |
| **Containerisation** | Docker Compose orchestrates all 6 services; K8s manifests in `kubernetes/` |
| **CI/CD** | GitHub Actions (`.github/workflows/`) |

---

## Constitution Check

*GATE: Must pass before Phase 0. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| **Code Quality** | No `any` casts; single-responsibility NestJS modules; Drizzle migrations for every schema change; ESLint/Prettier enforced in CI | ✅ PASS — architecture enforces boundaries; migration chain 0000–0021 already exists |
| **Testing Standards** | ≥ 80 % branch coverage; real PG in integration tests; ML contract tests; Playwright E2E for Login, Dashboard, Employee Detail, Risk Score | ✅ PASS — test directories exist; constitution §2 requires ≥ 80 % branch coverage |
| **UX Consistency** | Shared Tailwind tokens; loading/error/empty states; ARIA labels; 1280/1024/768 px breakpoints | ✅ PASS — `client/tailwind.config.ts` is the single source; RTL via `tailwindcss-rtl` |
| **Performance Requirements** | API p95 ≤ 300 ms list / ≤ 150 ms single; ML p95 ≤ 500 ms; Redis TTL 900 s; no full-table scans on tables > 10 k rows; images start ≤ 30 s | ✅ PASS — budgets in spec.md NFR-1–6; indexed queries required by constitution §4 |
| **Architecture Standards** | All traffic via Nginx gateway; shared types in `shared/`; no hard-coded secrets | ✅ PASS — Docker Compose routes all via port 80; `shared/` exists |

**Post-Phase 1 re-check**: see `research.md` §Decisions — no violations introduced.

---

## Project Structure

### Documentation (this feature)

```text
.specify/specs/001-intelligent-hr-performance-system/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── backend-api.md           ← NestJS REST contract
│   ├── ml-service-api.md        ← FastAPI ML contract
│   └── erpnext-integration.md   ← ERPNext sync contract
└── tasks.md             ← Phase 2 output (created)
```

### Source Code (repository root)

```text
client/                          # React + Vite frontend
├── src/
│   ├── components/              # Shared UI components (design-token-compliant)
│   │   ├── goals/
│   │   ├── reviews/
│   │   ├── risk/
│   │   ├── dashboard/
│   │   └── shared/              # Buttons, forms, charts, empty states
│   ├── pages/                   # Route-level pages
│   │   ├── Dashboard/
│   │   ├── Goals/
│   │   ├── Reviews/
│   │   ├── Employees/
│   │   ├── Analytics/           # Fairness & equity reports
│   │   └── Settings/            # Locale, integration config
│   ├── locales/                 # i18next translation files
│   │   ├── en/
│   │   └── ar/
│   ├── stores/                  # Zustand state slices
│   ├── services/                # Axios API clients (typed)
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # Frontend-only types (not shared)
└── tests/                       # Vitest + Playwright

server/                          # NestJS backend
├── src/
│   ├── auth/                    # JWT strategy, guards, decorators
│   ├── users/                   # User + role management
│   ├── employees/               # Employee CRUD + ERPNext field mapping
│   ├── goals/                   # Goals + KPI module
│   ├── reviews/                 # Review cycles, templates, 360° logic
│   ├── risk/                    # Risk score cache + ML client
│   ├── recommendations/         # Intervention + training plan module
│   ├── analytics/               # Dashboard aggregation + fairness reports
│   ├── integrations/            # ERPNext sync, CSV/Excel import-export
│   ├── notifications/           # In-app + email (RabbitMQ producer)
│   ├── queue/                   # RabbitMQ consumers (workers)
│   └── shared/                  # Pipes, interceptors, base entities
├── drizzle.config.ts
└── tests/

ml-service/                      # FastAPI ML service (exists)
├── api/                         # Route controllers + schemas
├── core/
│   ├── services/
│   │   ├── prediction/          # Turnover risk pipeline
│   │   ├── recommendation/      # Intervention engine
│   │   └── fairness/            # AIR / fairness metrics
│   ├── processors/              # Feature engineering, validation
│   └── managers/                # Model registry, cache manager
├── models/                      # Trained model artefacts
└── tests/

shared/                          # Cross-service TypeScript types
├── types/
│   ├── employee.ts
│   ├── goal.ts
│   ├── review.ts
│   ├── risk.ts
│   └── integration.ts

postgres/migrations/             # Drizzle migration chain (0000–0021 exist)

infrastructure/
├── docker/                      # Dockerfiles + Nginx config
└── k8s/                         # Kubernetes manifests

tests/                           # Playwright E2E
```

**Structure Decision**: Option 2 (web application) — existing monorepo layout preserved and extended.
Server modules follow NestJS domain-per-directory convention. `shared/` owns cross-boundary types.

---

## Complexity Tracking

*No constitution violations — no entries required.*

---

## Delivery Phases (high-level)

| Phase | Scope | Stories |
|-------|-------|---------|
| **P1 — Core Data & Auth** | Auth, Employee CRUD, Goal/KPI tracking | US-1 |
| **P2 — Review Engine** | Review cycles, 360° feedback, notifications | US-2 |
| **P3 — AI Risk** | ML prediction pipeline, Redis cache, RabbitMQ queue | US-3 |
| **P4 — Recommendations** | Intervention engine, training paths, rule-based fallback | US-4 |
| **P5 — Dashboards** | Role-scoped dashboards, charts, exports | US-5 |
| **P6 — XAI & Fairness** | SHAP attributions, AIR reports, audit export | US-6 |
| **P7 — i18n** | Arabic RTL, locale persistence, translation completeness | US-7 |
| **P8 — Integration** | ERPNext sync, CSV/Excel import-export, sync log | US-8 |

Tasks broken down in `tasks.md` (created by `/speckit.tasks`).
