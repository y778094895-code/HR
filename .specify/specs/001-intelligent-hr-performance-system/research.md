# Research: Intelligent HR Performance System

**Phase**: 0 — Unknowns resolved
**Date**: 2026-03-18
**Feeds into**: `plan.md`, `data-model.md`, `contracts/`

---

## 1. NestJS Module Architecture for HR Domain

**Decision**: One NestJS feature module per domain aggregate (`goals`, `reviews`, `risk`, `recommendations`, `analytics`, `integrations`, `notifications`). Each module owns its Drizzle schema slice, service, controller, and guards.

**Rationale**: Constitution requires single-responsibility boundaries. Domain-per-module gives clean import graphs, allows independent testing, and maps 1:1 to the delivery phases in `plan.md`.

**Alternatives considered**:
- Monolithic `HRModule` — rejected; violates single-responsibility; creates circular dependencies at scale.
- Micro-services per domain — rejected; over-engineered for v1 single-tenant; adds network latency and deployment complexity with no benefit at 10 k employee scale.

---

## 2. RBAC Strategy (NestJS)

**Decision**: Custom `@Roles()` decorator + `RolesGuard` on every controller method. Roles stored as a PostgreSQL enum `user_role` (`employee`, `manager`, `hr`, `admin`). JWT payload includes `role` and `employeeId` claims.

**Rationale**: NestJS built-in guards with custom metadata is the lightest approach that still enforces server-side role checks on every endpoint (FR-001). No external authz library needed for four roles.

**Alternatives considered**:
- CASL (attribute-based access control) — considered for row-level ownership checks (manager can only see their direct reports). Will adopt for the `reviews` and `risk` modules where ownership matters; overkill for simpler endpoints.
- Keycloak / Auth0 — rejected for v1; adds external dependency and latency; JWT-first is sufficient.

---

## 3. Drizzle ORM Migration Strategy

**Decision**: Continue the existing numeric migration chain (`0000`–`0021`). New migrations are generated with `npm run drizzle:generate` and committed alongside schema changes. Migration files are the canonical source of truth — Drizzle push is only used in local dev.

**Rationale**: Chain already exists through `0021`. Constitution prohibits direct DB mutations outside migrations. CI runs `drizzle:status` to detect drift.

**Alternatives considered**:
- TypeORM synchronize — rejected; destructive; conflicts with existing Drizzle setup.
- Liquibase — rejected; adds Java dependency for no gain over Drizzle's built-in migration tool.

---

## 4. ML ↔ Backend Communication Pattern

**Decision**: Two-mode contract:
1. **Synchronous** (p95 ≤ 500 ms): Backend calls `POST /predict/turnover` via internal HTTP (Nginx routes `/ml/*` to port 8000). Result cached in Redis under `risk:employee:{id}` with TTL 900 s.
2. **Asynchronous** (> 500 ms or batch): NestJS publishes a `prediction.requested` event to RabbitMQ exchange `ml.events`. ML service consumer processes and publishes `prediction.completed` back. NestJS consumer updates DB and invalidates cache.

**Rationale**: Covers both low-latency interactive use (single employee) and batch re-scoring after review submission. Satisfies NFR-002 and the constitution's Redis TTL rule.

**Alternatives considered**:
- Polling — rejected; wastes connections; poor UX.
- gRPC — considered; would reduce serialisation overhead but requires proto maintenance and Nginx L7 proxy config. Deferred to v2 if latency becomes an issue.

---

## 5. SHAP / XAI Explainability Implementation

**Decision**: Use `shap` Python library (TreeExplainer for Random Forest / GBM, LinearExplainer for logistic baseline). SHAP values are computed per prediction and stored as `features JSONB` on the `risk_scores` table. The NestJS backend renders them into locale-aware human-readable sentences via a translation map in `shared/xai/`.

**Rationale**: SHAP is the industry standard for model-agnostic explainability. Storing per-prediction SHAP values allows audit replay without re-running the model. Human-readable rendering in the backend (not ML service) keeps the ML service stateless.

**Alternatives considered**:
- LIME — less stable for tree models; higher variance per explanation; rejected.
- Manual feature importance — global, not per-instance; rejected (FR-014 requires per-prediction explanations).

---

## 6. Fairness Metrics — Adverse Impact Ratio

**Decision**: Compute Adverse Impact Ratio (AIR) using the 4/5ths rule per protected attribute (gender, nationality) per review cycle. Implementation: `ml-service/core/services/fairness/` already exists. NestJS `analytics` module calls `GET /fairness/report?cycleId=&attribute=` and stores results in `fairness_runs` table (migration 0011).

**Rationale**: 4/5ths rule is the EEOC standard and widely defensible to auditors. Groups < 5 members are suppressed (spec edge case). Existing `fairness_runs` migration confirms this is already planned in the DB schema.

**Alternatives considered**:
- Demographic parity difference — also valid; will be added as a secondary metric alongside AIR.
- Statistical significance testing (Fisher's exact) — will flag p-value alongside AIR for groups > 30 members.

---

## 7. Arabic/RTL Implementation

**Decision**:
- `tailwindcss-rtl` plugin for automatic logical property mirroring (margin, padding, flex direction).
- `i18next` + `react-i18next` with lazy-loaded namespace bundles (`client/src/locales/en/` and `ar/`).
- `<html dir>` toggled by a root `LocaleProvider` context on locale change.
- `dayjs` with `ar` locale for date formatting; `Intl.NumberFormat` for numbers.
- RTL-safe chart library: Recharts (supports `rtl` prop on `ResponsiveContainer`).

**Rationale**: `tailwindcss-rtl` is the lowest-overhead RTL strategy for Tailwind v3 — no duplicate CSS classes needed. i18next is the de-facto React i18n solution with namespace lazy-loading for bundle size.

**Alternatives considered**:
- CSS `[dir=rtl]` overrides — rejected; manual and fragile at scale.
- Separate Arabic bundle — rejected; doubles build surface; locale switch requires page reload.

---

## 8. ERPNext Integration

**Decision**: Use ERPNext REST API v2 (`/api/resource/Employee`). Token auth via API key + secret stored encrypted in `integration_configs` table (migration 0015). Field mapping is a configurable JSON document per integration. NestJS `IntegrationsModule` uses a `FieldMapper` service that applies the mapping at sync time. Sync jobs published to RabbitMQ `integrations.sync` queue.

**Rationale**: ERPNext exposes a well-documented REST API; no SDK required. Config-driven mapping satisfies FR-025 without code changes per customer.

**Alternatives considered**:
- ERPNext Python client — rejected; adds Python dependency to the Node backend.
- Direct DB connection to ERPNext MariaDB — rejected; bypasses ERPNext's access control and is fragile to schema changes.

---

## 9. CSV / Excel Import-Export

**Decision**:
- **Import**: `multer` for file upload; `papaparse` (CSV) and `exceljs` (XLSX) for parsing. Validation via Zod schema per import type. Preview first 5 rows, then atomic DB insert in a transaction.
- **Export**: `exceljs` for XLSX generation; `json2csv` for CSV. Triggered by a controller action; streamed as a response attachment.
- File size limit: 10 MB (enforced by Multer).

**Rationale**: `papaparse` and `exceljs` are the most widely maintained libraries for Node.js. Atomic import transactions prevent partial imports on validation failure.

**Alternatives considered**:
- `xlsx` (SheetJS) — licence changed to SSPL; rejected.
- Server-side streaming for very large exports — deferred; 10 k employee export is < 10 MB; streaming adds complexity for no current benefit.

---

## 10. Notification Architecture

**Decision**: In-app notifications stored in `notifications` table; email via nodemailer (SMTP config from env). NestJS `NotificationsModule` is a RabbitMQ consumer on the `notifications` exchange. Review reminders are cron-triggered by a `@Cron()` decorator in `ReviewsModule` that publishes to the queue.

**Rationale**: Queue-based notifications decouple the review submission path from email delivery latency. Stored in-app notifications allow the frontend to poll/websocket for real-time updates.

**Alternatives considered**:
- SendGrid / Mailgun — can be plugged in as a transport behind nodemailer; not a first-class dependency.
- WebSocket for real-time — deferred to v2; polling every 30 s is acceptable for v1 notification badge.

---

## 11. Docker / Kubernetes Readiness

**Decision**: All six services (`nginx`, `server`, `client`, `ml-service`, `postgres`, `redis`, `rabbitmq`) defined in `docker-compose.yml`. Kubernetes manifests in `kubernetes/` (already present). Health check endpoints: `GET /api/health` (NestJS), `GET /` (FastAPI). Services start within 30 s per constitution.

**Rationale**: Existing `docker-compose.yml` already orchestrates the stack. K8s manifests provide a migration path for cloud deployments.

**Alternatives considered**:
- Helm chart — useful for parameterised K8s deploys; deferred to v2.
- Single-container deployment — rejected; couples service lifecycles and prevents independent scaling of ML service.

---

## 12. Open Question Resolutions (from spec)

| OQ | Resolution |
|----|------------|
| OQ-1 | Employees see their own risk trend **opt-in only**, off by default. Requires a `settings.showRiskToEmployee` flag per employee. Deferred to P3 post-MVP. |
| OQ-2 | Training path links are **category-based** in v1 (e.g., "Leadership", "Technical Skills") with a URL field; LMS integration (Udemy/Coursera API) deferred to v2. |
| OQ-3 | Peer reviewer selection done by **Manager**, with HR override capability. Balances consistency with managerial visibility. |
| OQ-4 | **Western digits** in Arabic locale for v1. Decision: use `Intl.NumberFormat('en-US-u-nu-latn')` for all numerals. Rationale: matches HRIS/ERP export formats (ERPNext outputs western digits) and avoids mismatches in CSV reconciliation. Override via `VITE_NUMERAL_LOCALE` env var if a customer requires Arabic-Indic digits in a future deployment. **Status: CLOSED.** |
| OQ-5 | **Single-tenant** for v1. DB schema uses row-level `tenant_id` on core tables (future-proofing) but no multi-tenant routing logic in v1. |
| OQ-6 | ML model versions tracked in `model_registry` table (migration via `ml-service/models/base/model_registry.py`). Backend stores `modelVersion` on each `risk_scores` row for audit replay. |
