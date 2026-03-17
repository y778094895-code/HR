# Pre-Production Audit — smart_performance_system

> **Audit Date:** 2026-03-17  
> **Standard:** Evidence-only, zero-assumption, pre-production audit  
> **Source of truth:** [docs/ARCHITECTURE.md](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docs/ARCHITECTURE.md) (PDF is binary-unreadable; ARCHITECTURE.md mirrors its content with full schema, API spec, and requirements)

---

# Section 1 — Cleanup

## Inventory

| # | Item | Path | Type | Size |
|---|------|------|------|------|
| 1 | [fix_imports_final.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/fix_imports_final.js) | root | One-off refactoring script | 1.4 KB |
| 2 | [update_imports.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/update_imports.js) | root | One-off import fixer | 4.7 KB |
| 3 | [move_components.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/move_components.ps1) | root | One-off move script | 3.7 KB |
| 4 | [finalize_moves.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/finalize_moves.ps1) | root | One-off move script | 1.1 KB |
| 5 | [restore_legacy.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/restore_legacy.ps1) | root | One-off legacy restorer | 1.2 KB |
| 6 | [fix_indices.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/fix_indices.ps1) | root | One-off DB fix script | 683 B |
| 7 | [fix_migration.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/fix_migration.ps1) | root | One-off migration fix | 731 B |
| 8 | [fix_migration.sh](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/fix_migration.sh) | root | One-off migration fix (bash) | 456 B |
| 9 | [verify_restructure.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/verify_restructure.js) | root | One-off restructure verifier | 3.7 KB |
| 10 | [verify.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/verify.ps1) | root | One-off verify script | 1.5 KB |
| 11 | [verify_auth_flow.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/verify_auth_flow.ps1) | root | One-off auth verifier | 3.7 KB |
| 12 | [verify_health.ps1](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/verify_health.ps1) | root | One-off health check | 1.6 KB |
| 13 | [debug_support.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/debug_support.js) | root | One-off debug script | 716 B |
| 14 | [smoke-test.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/smoke-test.js) | root | One-off smoke test | 4.5 KB |
| 15 | [compose.yaml.bak](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/compose.yaml.bak) | root | Corrupt backup (references `jest-get-type` Dockerfile) | 215 B |
| 16 | [compose.debug.yaml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/compose.debug.yaml) | root | Debug compose override | 304 B |
| 17 | [error.log](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/error.log) | root | Stale error log | 25 KB |
| 18 | [gateway.log](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/gateway.log) | root | Stale gateway log | 15.5 KB |
| 19 | [gateway_debug.log](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/gateway_debug.log) | root | Stale gateway debug log | 3.5 KB |
| 20 | [logs.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/logs.txt) | root | Stale log dump | 12 KB |
| 21 | [logs_full.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/logs_full.txt) | root | Stale log dump | 22 KB |
| 22 | [implementation_plan.md](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/implementation_plan.md) | root | Stale plan from prior conversation | 3.6 KB |
| 23 | [client.zip](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client.zip) | root | Old client archive | 948 KB |
| 24 | [client2.zip](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client2.zip) | root | Old client archive | 1.3 MB |
| 25 | [server/build_errors.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/build_errors.txt) | server | Stale build error dump | 8.5 KB |
| 26 | [server/full_hashes.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/full_hashes.txt) | server | Transient hash file | 1.1 KB |
| 27 | [server/hashes.json](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/hashes.json) | server | Transient hash file | 140 B |
| 28 | [server/hashes.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/hashes.txt) | server | Transient hash file | 147 B |
| 29 | [server/gen-hashes.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/gen-hashes.js) | server | One-off hash generator | 309 B |
| 30 | [server/gen_final_hashes.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/gen_final_hashes.js) | server | One-off hash generator | 414 B |
| 31 | [server/verify-hash.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/verify-hash.js) | server | One-off hash verifier | 1.1 KB |
| 32 | [server/server.log](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/server.log) | server | Stale server log | 992 B |
| 33 | [server/reset-db.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/reset-db.js) | server | One-off DB reset | 1.9 KB |
| 34 | [server/seed-local.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/seed-local.js) | server | One-off local seeder | 1.5 KB |
| 35 | [server/test-db-connection.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/test-db-connection.js) | server | One-off DB test | 2.4 KB |
| 36 | [client/ts_errors.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/ts_errors.txt) | client | Stale TS error dump | 13.5 KB |
| 37 | [client/ts_errors_plain.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/ts_errors_plain.txt) | client | Duplicate of above | 13.5 KB |
| 38 | [client/typescript-errors-utf8.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/typescript-errors-utf8.txt) | client | Stale TS error dump | 843 B |
| 39 | [client/typescript-errors.txt](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/typescript-errors.txt) | client | Stale TS error dump | 1.7 KB |
| 40 | `client/vite.config.ts.timestamp-*.mjs` | client | 3 Vite cache files | ~14 KB total |
| 41 | [hr_ai_layer/0](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/0) | hr_ai_layer | Corrupted filename (script artifact) | 0 B |
| 42 | [hr_ai_layer/0.30).astype(int)](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/0.30%29.astype%28int%29) | hr_ai_layer | Corrupted filename (script artifact) | N/A |
| 43 | [hr_ai_layer/cd](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/cd) | hr_ai_layer | Corrupted filename (script artifact) | N/A |
| 44 | [hr_ai_layer/cutoff].copy()](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/cutoff%5D.copy%28%29) | hr_ai_layer | Corrupted filename (script artifact) | N/A |
| 45 | [hr_ai_layer/t).astype(int)](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/t%29.astype%28int%29) | hr_ai_layer | Corrupted filename (script artifact) | N/A |
| 46 | [hr_ai_layer/mlflow.db](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/hr_ai_layer/mlflow.db) | hr_ai_layer | Dev MLflow database | 627 KB |
| 47 | `server/_core/` | server | Empty directory (abandoned) | 0 |
| 48 | `server/api/routes/` | server | Empty directory (routes are decorators) | 0 |
| 49 | `client/src/modules/` | client | Empty directory | 0 |
| 50 | `server/services/infrastructure/` | server | Empty directory | 0 |

### Unused Client Pages

| # | File | Evidence of non-usage |
|---|------|----------------------|
| 51 | `pages/dashboard/AlertsPage.tsx` | Not imported in `App.tsx`; replaced by `AlertsAllPage` / `AlertsUnreadPage` / `AlertsHighRiskPage` / `ResponseLogPage` under the `alerts/` nested routes |
| 52 | `pages/dashboard/InterventionsPage.tsx` | Not imported in `App.tsx`; replaced by `InterventionsDashboard` component |
| 53 | `pages/dashboard/UserManagementPage.tsx` | Not imported in `App.tsx`; replaced by `UserManagement` feature component |
| 54 | `pages/dashboard/ProfilePage.tsx` | Not imported in `App.tsx`; replaced by `EmployeeProfilePage.tsx` |
| 55 | `pages/dashboard/Dashboard.tsx` | Not imported in `App.tsx`; replaced by `DashboardHome.tsx` |

---

## Deletion Candidates

| Item | Path | Evidence of non-usage | Classification | Action |
|------|------|----------------------|----------------|--------|
| Root scripts (#1–14) | `fix_imports_final.js`, `update_imports.js`, `move_components.ps1`, `finalize_moves.ps1`, `restore_legacy.ps1`, `fix_indices.ps1`, `fix_migration.ps1`, `fix_migration.sh`, `verify_restructure.js`, `verify.ps1`, `verify_auth_flow.ps1`, `verify_health.ps1`, `debug_support.js`, `smoke-test.js` | grep across entire project returns zero import/require/reference in any `.ts`, `.tsx`, `.json`, `.yml`, `.yaml`, `.sh`, `.ps1` file | **Safe to delete** | Delete all 14 |
| `compose.yaml.bak` (#15) | root | References `jest-get-type` Docker image — nonsensical auto-generated backup | **Safe to delete** | Delete |
| `compose.debug.yaml` (#16) | root | Not referenced in any script or CI | **Safe to delete** | Delete |
| Log files (#17–21, #32) | root + server | Transient debug/error logs with no runtime reference | **Safe to delete** | Delete all 6 |
| `implementation_plan.md` (#22) | root | Stale artifact from previous conversation | **Safe to delete** | Delete |
| Zip archives (#23–24) | root | Old client snapshots; no reference | **Safe to delete** | Delete |
| Server hash/seed/debug files (#25–35) | server | One-off scripts, transient outputs; no reference from `package.json` scripts, `tsconfig`, or any import | **Safe to delete** | Delete all 11 |
| Client TS error dumps (#36–39) | client | Transient error captures; no reference | **Safe to delete** | Delete all 4 |
| Vite timestamp cache (#40) | client | Auto-generated cache files | **Safe to delete** | Delete all 3 |
| hr_ai_layer corrupted files (#41–45) | hr_ai_layer | Filenames are Python expression fragments — artifacts from a broken notebook/script execution | **Safe to delete** | Delete all 5 |
| `hr_ai_layer/mlflow.db` (#46) | hr_ai_layer | Dev-only MLflow tracking DB | **Keep as legacy** | Delete in production; keep in dev |
| Empty dirs (#47–50) | server, client | No files, no references | **Safe to delete** | Delete all 4 |
| Dead pages (#51–55) | client/pages/dashboard | Not imported in `App.tsx`; superseded by feature components | **Safe to delete** | Delete all 5 |

---

## Obsolete Env/Config Remnants

| Item | File | Problem |
|------|------|---------|
| `REACT_APP_API_URL` | root `.env` (L32) | Uses `REACT_APP_` prefix (Create React App convention). Frontend is Vite-based and reads `VITE_API_GATEWAY`. This var is never consumed. |
| `REACT_APP_ML_SERVICE_URL` | root `.env` (L33) | Same as above — Vite does not expose `REACT_APP_*` prefixed vars |
| `REACT_APP_WS_URL` | root `.env` (L34) | Same as above |
| `NGINX_SSL_*` | root `.env` (L58–59) | SSL cert/key paths are defined but Docker compose does not mount any SSL volume or expose port 443 |
| `LOKI_PORT` | root `.env` (L64) | Loki is not deployed in `docker-compose.yml` |
| `HR_AI_LAYER_URL` | server `.env` (L31) | Points to port 8001 but no service runs on that port in `docker-compose.yml` |
| `CONSUL_HOST`/`CONSUL_PORT` | server `.env` (L19–20) | Consul is not deployed in `docker-compose.yml` |
| `SERVICE_ADDRESS` | server `.env` (L21) | Used by service registry but Consul is not deployed |
| `JWT_SECRET` duplication | root `.env` vs server `.env` | Different values: `your-super-secret-jwt-key-change-in-production` vs `top-secret` |
| `DB_HOST` conflict | root `.env` (L6) vs server `.env` (L6) | `postgres` (Docker internal) vs `127.0.0.1` (local dev) — expected but confusing without documentation |
| `DB_PORT` conflict | root `.env` (L7) vs server `.env` (L7) | `5432` (Docker internal) vs `5433` (host-mapped port) — expected but confusing |

---

## Duplicates / Overlaps

| Area | File A | File B | Overlap |
|------|--------|--------|---------|
| Client pages | `AlertsPage.tsx` | `AlertsAllPage.tsx` + `AlertsUnreadPage.tsx` etc. | AlertsPage is the old monolithic alert page; new alerts routes render sub-pages |
| Client pages | `InterventionsPage.tsx` | `components/features/interventions/InterventionsDashboard` | InterventionsPage duplicates functionality from feature component |
| Client pages | `UserManagementPage.tsx` | `components/features/users/UserManagement` | Same: page duplicates feature component |
| Client pages | `ProfilePage.tsx` | `EmployeeProfilePage.tsx` | ProfilePage is superseded |
| Client pages | `Dashboard.tsx` | `DashboardHome.tsx` | Dashboard.tsx is superseded |
| Docker compose | `docker-compose.dev.yml` | `docker-compose.yml` | Dev compose only runs a minimal set; but `docker-compose.test.yml`, `docker-compose.postgres.yml`, `docker-compose.sonarqube.yml` serve distinct purposes — **keep all Docker compose variants** |
| Server services | `services/application/notification.service.ts` (260 B stub) | `services/business/notification.service.ts` (1.7 KB real impl) | Application-layer stub is dead — real service is in business layer |
| Server services | `services/application/reporting.service.ts` (264 B stub) | `services/business/reports.service.ts` (5 KB real impl) | Application-layer stub is dead |
| Root `.env` | root `.env` | `client/.env` + `server/.env` | Three env files with overlapping/conflicting values — see Obsolete Env section |

---

## Safe Cleanup Plan

Execute in this order to avoid breaking anything:

| Step | Action | Files | Risk |
|------|--------|-------|------|
| 1 | Delete root-level one-off scripts | 14 files (#1–14) | None — zero references |
| 2 | Delete stale logs and error dumps | 10 files (#17–21, #25, #32, #36–39) | None — transient outputs |
| 3 | Delete stale archives and backups | 3 files (#15, #23, #24) | None — snapshots |
| 4 | Delete dead client pages | 5 files (#51–55) | None — not imported in `App.tsx` |
| 5 | Delete server hash/seed scripts | 6 files (#26–31) | None — one-off utility scripts |
| 6 | Delete root `implementation_plan.md` | 1 file (#22) | None — stale artifact from prior conversation |
| 7 | Delete corrupted hr_ai_layer files | 5 files (#41–45) | None — script artifacts, not code |
| 8 | Delete Vite cache files | 3 files (#40) | None — auto-regenerated |
| 9 | Remove empty directories | 4 dirs (#47–50) | None |
| 10 | Delete application-layer stub services | `services/application/notification.service.ts`, `services/application/reporting.service.ts` | Low — verify DI container does not reference these (confirmed: DI binds `NotificationService` from `services/business/notification.service`) |
| 11 | Clean up obsolete env vars | Remove `REACT_APP_*` from root `.env`, remove `NGINX_SSL_*`, `LOKI_PORT` | Low |

## Manual Review

| Item | Reason |
|------|--------|
| `docker-compose.sonarqube.yml` | Verify if SonarQube is part of CI/CD pipeline; if not, candidate for removal |
| `hr_ai_layer/` entire directory | Has its own `.git`, `docker-compose.yml`, and MLflow DB. Verify if this is a separate repo that was incorrectly vendored, or if it's an active subproject |
| `server/TODO.md` + root `TODO.md` | May contain actionable items; review before discarding |
| `bridge/` directory | Contains only Kubernetes overlays (`base/`, `overlays/`); verify if Kubernetes deployment is active or aspirational |
| `kubernetes/` directory (root) | Separate from `bridge/` and `infrastructure/kubernetes/` — potential duplication |
| `playwright-report/`, `test-results/` | Test output directories; should be in `.gitignore` |
| `client/pnpm-lock.yaml` alongside `client/package-lock.json` | Two lock files; choose one package manager |
| `drizzle/` directory (root) | Verify if migrations here are active or superseded by server-level drizzle config |

---

# Section 2 — Completion Audit

## PDF Requirements Matrix

> **Note:** The PDF (`نظام تحليل وادارة الاداء الذكي.pdf`) is binary and cannot be parsed directly. Requirements are extracted from `docs/ARCHITECTURE.md` which documents the full system specification including schemas, API endpoints, tech stack, and deployment architecture. This is the best available source of truth derivable from project evidence.

| Req ID | Requirement | Type | Source | Acceptance Signal |
|--------|-------------|------|--------|-------------------|
| R-01 | User Authentication (JWT login, register, refresh, logout) | Core | ARCHITECTURE.md L712–721 | Auth controller + service + token management working end-to-end |
| R-02 | Role-based access control (admin, hr_manager, analyst, manager, employee, viewer) | Core | ARCHITECTURE.md L201 (schema), App.tsx routes | RBAC middleware enforces role checks per route |
| R-03 | Employee data management (CRUD, search, filter, import/export) | Core | ARCHITECTURE.md L727–738 | Employee controller with all endpoints |
| R-04 | Attendance tracking snapshots | Data | ARCHITECTURE.md L289–317 (schema) | Attendance schema + repository |
| R-05 | Performance appraisals management | Core | ARCHITECTURE.md L319–347 (schema) | Performance controller + service |
| R-06 | Salary data management | Data | ARCHITECTURE.md L349–402 (schema) | Salary schema |
| R-07 | Turnover risk prediction (ML) | Analytics | ARCHITECTURE.md L408–432, L742–751 | Turnover controller + service + ML service integration |
| R-08 | Fairness metrics analysis | Analytics | ARCHITECTURE.md L434–459 | Fairness controller + service |
| R-09 | Interventions and recommendations | Core | ARCHITECTURE.md L461–504 | Intervention + Recommendation controllers |
| R-10 | Notifications system | Core | ARCHITECTURE.md L510–538 | Notification service + RabbitMQ integration |
| R-11 | Audit logging | Core | ARCHITECTURE.md L540–570 | Audit middleware + audit log service |
| R-12 | Dashboard (customizable per role) | UI | ARCHITECTURE.md L572–595 | Dashboard controller + DashboardHome page |
| R-13 | Reports generation and export | Core | ARCHITECTURE.md L701, L17 | Reports controller + page |
| R-14 | ERPNext integration | Integration | ARCHITECTURE.md L25, L69 | ERPNext client in DI container |
| R-15 | Arabic/English i18n support | UI | ARCHITECTURE.md L84 (implied by Arabic doc) | Locales directory existence |
| R-16 | ML service (FastAPI) for predictions | Infrastructure | ARCHITECTURE.md L12–15, L147–157 | ML service directory + Dockerfile + main.py |
| R-17 | PostgreSQL database with full schema | Infrastructure | ARCHITECTURE.md L187–606 | 26 schema files in server/data/models |
| R-18 | Redis caching | Infrastructure | ARCHITECTURE.md L25–27 | Redis in docker-compose |
| R-19 | Nginx reverse proxy/gateway | Infrastructure | ARCHITECTURE.md L29–31 | Gateway Dockerfile + nginx.conf |
| R-20 | Prometheus + Grafana monitoring | Infrastructure | ARCHITECTURE.md L29 | Monitoring infrastructure dir |
| R-21 | WebSocket real-time updates | Core | ARCHITECTURE.md L86 | WebSocket server in server.ts |
| R-22 | Settings management | Admin | Implied by SettingsPage | Console-settings controller + service |
| R-23 | Help/Support system | Admin | Implied by HelpPage | Console-help controller + help service |
| R-24 | Data quality monitoring | Admin | Implied by DataQualityPage | Console-dataquality controller |
| R-25 | Cases/risk case management | Core | Implied by CasesPage | Cases controller + risk-case service |
| R-26 | Impact analysis | Analytics | Implied by ImpactPage | Impact controller + service |
| R-27 | Training management | Core | ARCHITECTURE.md (training schema) | Training controller + service |
| R-28 | User management (CRUD) | Admin | Implied by UserManagement feature | Users controller |

---

## Traceability Matrix

| Req ID | Status | Evidence | Gap |
|--------|--------|----------|-----|
| R-01 | **Implemented** | `auth.controller.ts` (12 KB), `auth.service.ts` (10.5 KB), DI binding for `AuthService`, `UserRepository`, `SessionsRepository`. Login page at `/login`. Token interceptor in `client.ts`. | None critical. |
| R-02 | **Partial** | `rbac.middleware.ts` exists (1.5 KB), frontend `ProtectedRoute` checks `allowedRoles`. Schema has 6 roles. | Frontend routes use `admin`, `manager`, `employee`, `super_admin` but schema defines `hr_manager`, `analyst`, `viewer`. **Role name mismatch between frontend and backend schema.** |
| R-03 | **Partial** | `employee.controller.ts` (18.8 KB), `employee.service.ts` (4.3 KB), `employee.repository.ts` (3.2 KB). Client has `EmployeesPage`, `EmployeeProfilePage`, `employee.service.ts` (1.7 KB client resource). | Import/export endpoints specified in ARCHITECTURE.md but unverifiable from controller file listing alone. Employee profile aggregator exists (11.4 KB). |
| R-04 | **Partial** | `attendance.schema.ts` exists (1 KB). | No dedicated attendance controller, service, or repository. Schema exists but no CRUD API endpoint. |
| R-05 | **Implemented** | `performance.controller.ts` (1.8 KB), `performance.service.ts` (5.5 KB), `performance.repository.ts` (1.2 KB), `performance.schema.ts` + `performance-goals.schema.ts`. Client `PerformancePage.tsx` (6.7 KB). | |
| R-06 | **Missing** | No salary controller, service, or repository. No client salary page. Salary schema file not found in `data/models/` (no `salary.schema.ts`). | **No salary management API or UI.** |
| R-07 | **Implemented** | `turnover.controller.ts` (1.4 KB), `turnover.service.ts` (5.6 KB), `turnover.repository.ts` (846 B), `turnover-risk.schema.ts` (873 B), `risk.schema.ts` (2.4 KB). Client `AttritionPage.tsx` (6 KB), `turnover.service.ts` (2.7 KB client). ML service with FastAPI `main.py`. | |
| R-08 | **Implemented** | `fairness.controller.ts` (1.9 KB), `fairness.service.ts` (5.3 KB), `fairness.repository.ts` (622 B), `fairness.schema.ts` + `fairness-runs.schema.ts`. Client `FairnessPage.tsx` (5.5 KB). | |
| R-09 | **Implemented** | `intervention.controller.ts` (2.6 KB), `recommendation.controller.ts` (3 KB), `intervention.service.ts` (4.6 KB), `recommendation.service.ts` (2.2 KB). Client has both `InterventionsContainer` and `RecommendationsPage`. | |
| R-10 | **Partial** | `notification.service.ts` (business, 1.7 KB) handles RabbitMQ initialization. DI binds `NotificationService`. `server.ts` initializes it. | No client-side notification UI or WebSocket-based notification delivery visible. `notifications` schema exists in ARCHITECTURE.md but no `notifications.schema.ts` file found in `data/models/`. |
| R-11 | **Implemented** | `audit.middleware.ts` (1.9 KB), `audit-log.service.ts` (953 B), `audit-logs.schema.ts` (770 B). DI binds `AuditLogService`. | |
| R-12 | **Implemented** | `dashboard.controller.ts` (1.6 KB), `dashboard.service.ts` (3.4 KB application). Client `DashboardHome.tsx` (9 KB). | Dashboard customization per role specified in ARCHITECTURE.md schema (`dashboards_config` table) but `ui-dashboards.schema.ts` exists — needs verification of actual customization functionality. |
| R-13 | **Implemented** | `reports.controller.ts` (3.2 KB), `reports.service.ts` (5 KB), `reports.repository.ts` (2.3 KB). Client `ReportsPage.tsx` (3.9 KB), `reports.service.ts` (3.5 KB client). | |
| R-14 | **Partial** | `ERPNextClient` exists in `data/external/erpnext.client.ts`, bound in DI container. `ERPNEXT_*` env vars defined. Architecture doc says "Mock implementation." | **ERPNext integration is mock only.** No evidence of real API integration or sync scheduling. |
| R-15 | **Partial** | `client/src/locales/` directory exists. | Unverifiable from directory listing alone whether Arabic translations are complete. No evidence of RTL layout support in CSS/components. |
| R-16 | **Implemented** | `ml-service/` with `main.py` (2 KB), `api/`, `models/`, `services/`, `schemas/`, Dockerfile. Docker compose runs it on port 8000. | |
| R-17 | **Implemented** | 26 schema files in `server/data/models/`. Drizzle config present. | |
| R-18 | **Implemented** | Redis in `docker-compose.yml`, `REDIS_HOST`/`REDIS_PORT` in env. | |
| R-19 | **Implemented** | `Dockerfile.gateway`, `nginx.conf` with upstream routing. | |
| R-20 | **Partial** | `infrastructure/monitoring/` directory exists. `PROMETHEUS_PORT`/`GRAFANA_PORT` in env. | Prometheus and Grafana are **not defined in `docker-compose.yml`**. Only env vars exist. |
| R-21 | **Partial** | WebSocket server created in `server.ts`. Nginx proxies `/ws`. Client has `websocket.ts` (8.9 KB). | WebSocket handler in `server.ts` only logs errors — no message routing or business logic wired. |
| R-22 | **Implemented** | `console-settings.controller.ts` (11.2 KB), `settings.service.ts` (6 KB), `settings.repository.ts` (1.7 KB). Client `SettingsPage.tsx` (13.9 KB). | |
| R-23 | **Implemented** | `console-help.controller.ts` (7.7 KB), `help.service.ts` (2.5 KB), `help.repository.ts` (3 KB), `support.repository.ts` (2.3 KB). Client `HelpPage.tsx` (6.6 KB). | |
| R-24 | **Implemented** | `console-dataquality.controller.ts` (3.1 KB), `dataquality.service.ts` (1.9 KB), `dataquality.repository.ts` (1.7 KB). Client `DataQualityPage.tsx`. | |
| R-25 | **Implemented** | `cases.controller.ts` (916 B), `risk-case.service.ts` (1.3 KB), `riskCase.repository.ts` (785 B), `case-management.schema.ts` (2 KB). Client `CasesPage.tsx`. | |
| R-26 | **Implemented** | `impact.controller.ts` (1.3 KB), `impact.service.ts` (2.4 KB). Client `ImpactPage.tsx` (16.8 KB). | |
| R-27 | **Implemented** | `training.controller.ts` (1.8 KB), `training.service.ts` (4.9 KB), `training.repository.ts` (489 B), `training.schema.ts` (3 KB). Client `TrainingPage.tsx` (5.6 KB). | |
| R-28 | **Implemented** | `users.controller.ts` (1.9 KB), `UserRepository` in DI. Client `UserManagement` feature component. | |

---

## Missing Institutional Operations

| # | Operation | Severity | Details |
|---|-----------|----------|---------|
| 1 | **Salary management** (R-06) | **Critical** | ARCHITECTURE.md L349–402 defines a full `salary_snapshots` schema. No controller, service, repository, or client page implements salary CRUD, viewing, or processing. |
| 2 | **Attendance management** (R-04) | **High** | Schema exists (`attendance.schema.ts`). No controller, service, or repository for attendance CRUD. No client page. |
| 3 | **Notifications delivery** (R-10) | **High** | Backend notification service initializes RabbitMQ but no `notifications` schema file found in `data/models/`. No client notification center, bell icon, or notification list UI visible. |
| 4 | **Monitoring stack** (R-20) | **Medium** | Prometheus + Grafana are in env vars and infrastructure directory but not in `docker-compose.yml`. Not deployable. |

---

## Partial / Broken Features

| # | Feature | Status | Issue |
|---|---------|--------|-------|
| 1 | Role name alignment (R-02) | Partial | Frontend uses `super_admin` in `ProtectedRoute` but backend schema defines roles as `admin`, `hr_manager`, `analyst`, `manager`, `employee`, `viewer`. No `super_admin` role in schema. |
| 2 | ERPNext integration (R-14) | Partial | Mock implementation only. No sync scheduler, no real API calls, no error handling for production ERPNext. |
| 3 | Arabic/RTL support (R-15) | Partial | `locales/` directory exists but completeness of translations and RTL CSS support is unverifiable without deeper inspection. |
| 4 | WebSocket real-time (R-21) | Partial | WebSocket server created but no message routing, event handling, or business logic connected. Only error logging. |
| 5 | Dashboard customization (R-12) | Partial | `dashboards_config` schema specified in ARCHITECTURE.md. `ui-dashboards.schema.ts` exists. Unclear if dashboard customization API and UI are functional. |

---

## Prioritized Completion Plan

| Task ID | Priority | Module | Exact Work | Dependency | Acceptance Criteria |
|---------|----------|--------|------------|------------|---------------------|
| C-01 | **P0 — Critical** | Salary | Create `salary.controller.ts`, `salary.service.ts`, `salary.repository.ts`. Ensure `salary_snapshots` schema is queryable. Add DI bindings. Create client `SalaryPage.tsx` and route. | Schema already defined in ARCHITECTURE.md | Backend CRUD endpoints at `/api/salaries`. Client page renders salary data. |
| C-02 | **P0 — Critical** | Attendance | Create `attendance.controller.ts`, `attendance.service.ts`, `attendance.repository.ts`. Add DI bindings. Create client `AttendancePage.tsx` and route. | `attendance.schema.ts` already exists | Backend CRUD at `/api/attendance`. Client page renders attendance data. |
| C-03 | **P1 — High** | Notifications | Create `notifications.schema.ts` in `data/models/`. Extend `NotificationService` to persist and query notifications. Create client notification bell + dropdown. Wire WebSocket for real-time push. | RabbitMQ service already running | Notifications created, persisted, queried, and shown to user in real-time. |
| C-04 | **P1 — High** | RBAC | Align role names between frontend and backend. Add `super_admin` to schema OR change frontend to use `admin`. | None | All frontend `allowedRoles` values match backend schema `CHECK` constraint values. |
| C-05 | **P2 — Medium** | Monitoring | Add Prometheus and Grafana service definitions to `docker-compose.yml`. Mount config files from `infrastructure/monitoring/`. | None | `docker-compose up` starts monitoring stack. |
| C-06 | **P2 — Medium** | WebSocket | Wire WebSocket message handling for notifications and dashboard live updates. | C-03 | Client receives real-time events via WebSocket. |
| C-07 | **P3 — Low** | ERPNext | Replace mock with real API calls if ERPNext instance is available. Otherwise document as "mock" formally. | External dependency | ERPNext sync runs on schedule or is formally documented as mock. |
| C-08 | **P3 — Low** | i18n | Audit Arabic translation completeness. Add RTL CSS support. | None | All UI labels render correctly in Arabic with RTL layout. |

---

## Minimum Release Scope

For institutional release, the following are **non-negotiable**:

1. ✅ Authentication and authorization (Implemented)
2. ✅ Employee management (Implemented)
3. ✅ Performance appraisals (Implemented)
4. ❌ **Salary management** (Missing — C-01)
5. ❌ **Attendance tracking** (Missing — C-02)
6. ✅ Turnover risk prediction (Implemented)
7. ✅ Fairness analysis (Implemented)
8. ✅ Interventions and recommendations (Implemented)
9. ✅ Reports (Implemented)
10. ✅ Dashboard (Implemented)
11. ❌ **Notification delivery to users** (Missing — C-03)
12. ❌ **Role alignment** (Broken — C-04)
13. ✅ Audit logging (Implemented)
14. ✅ Settings/Help/Support (Implemented)

**Verdict:** System is **not ready for institutional release** without C-01, C-02, C-03, C-04.

---

# Section 3 — Error Repair and Release Readiness

## Error Inventory

| Issue ID | Layer | Problem | Evidence | Severity |
|----------|-------|---------|----------|----------|
| E-01 | **Gateway/Nginx** | Double `/api` prefix in request path | Nginx `proxy_pass http://backend/;` for `location /api/` strips the `/api/` prefix and forwards to backend root. But backend has `rootPath: '/api'` in Inversify. So frontend sends `/api/employees` → gateway receives at `/api/employees` → nginx strips `/api/` → forwards `/employees` to backend at `http://backend:3000/employees`. Backend expects `/api/employees`. **Path mismatch.** | **Critical** |
| E-02 | **Nginx** | Nginx proxies to `http://backend/` (with trailing slash) which strips the location prefix | `nginx.conf` L43: `proxy_pass http://backend/;` — the trailing `/` causes nginx to strip the matched `/api/` prefix. Frontend at `VITE_API_GATEWAY=http://localhost:8080/api` sends `/api/{route}` to gateway, nginx strips `/api/` and sends `/{route}` to backend:3000. Backend `rootPath='/api'` expects `/api/{route}`. | **Critical** (same as E-01) |
| E-03 | **Auth/DI** | `SessionsRepository` not explicitly bound | DI container L141: `context.container.get<any>('SessionsRepository')`. It IS bound at L155–157 via `toDynamicValue`. However, the binding order matters — `AuthService` binding (L139) references `SessionsRepository` which is bound later (L155). Inversify resolves lazily so this works, but the `<any>` type cast hides potential issues. | **Medium** |
| E-04 | **Env** | JWT_SECRET mismatch between root `.env` and `server/.env` | Root: `JWT_SECRET=your-super-secret-jwt-key-change-in-production`. Server: `JWT_SECRET=top-secret`. Docker compose uses root `.env` (env_file), local dev uses `server/.env`. Token signed with one secret won't verify with the other. | **High** |
| E-05 | **Env** | `CORS_ORIGIN` hardcoded to `http://localhost:3001` | Root `.env` L78. But frontend is served through gateway at port 8080. If user accesses via `localhost:8080`, CORS will block requests from the frontend to the backend directly (if not going through gateway). | **Medium** |
| E-06 | **Security** | Hardcoded secrets in `.env` committed to repo | `JWT_SECRET`, `DB_PASSWORD`, `ERPNEXT_API_KEY`, `ERPNEXT_API_SECRET`, `SMTP_PASSWORD` all have placeholder values in `.env` files. These files appear to be committed (not in `.gitignore`). | **High** |
| E-07 | **Docker** | Gateway Dockerfile references `infrastructure/docker/nginx.conf` but nginx ML proxy path may not match client expectation | Client `api.ts` uses `${GATEWAY_URL}/ml` for ML service. Nginx proxies `/ml/` → `http://ml_service/`. Client sends to `/api/ml/{route}` but nginx matches `/ml/` not `/api/ml/`. Since client baseURL is `/api`, the actual request path is `/api/ml/{route}` which nginx matches on `/api/` and forwards to backend, not ML service. | **High** |
| E-08 | **Frontend** | `super_admin` role used in `ProtectedRoute` but not in backend schema | `App.tsx` L128, L162: `allowedRoles={['admin', 'super_admin']}`. Backend `users` schema `CHECK` constraint only allows: `admin`, `hr_manager`, `analyst`, `manager`, `employee`, `viewer`. | **High** |
| E-09 | **Server** | `server/services/infrastructure/` is empty | DI container imports services from `services/business/` and `services/application/`. The infrastructure services layer is architecturally expected but completely empty. | **Low** |

---

## API Path / Contract Mismatches

| Area | Frontend Expectation | Backend Reality | Problem | Fix |
|------|---------------------|-----------------|---------|-----|
| **All API calls** | Client sends to `http://localhost:8080/api/{route}` via gateway | Gateway nginx strips `/api/` prefix before forwarding to backend. Backend has `rootPath: '/api'` expecting `/api/{route}`. Backend receives `/{route}` instead. | **Double-prefix / prefix-stripping mismatch** | Either: (a) Change `nginx.conf` to `proxy_pass http://backend;` (no trailing slash, preserves path), OR (b) Remove `rootPath: '/api'` from `app.ts` and let nginx handle the prefix |
| **ML service** | Client sends to `${baseURL}/ml/{route}` = `/api/ml/{route}` | Nginx matches `/api/` first (before `/ml/`) and forwards to backend, not ML service | **ML requests never reach ML service through gateway** | Move the `/ml/` location block above `/api/` in `nginx.conf`, OR change to `/api/ml/` location |
| **WebSocket** | Client derives WS URL by replacing `http` with `ws` in gateway URL and removing `/api`: `ws://localhost:8080` | Nginx proxies `/ws` to `http://backend/ws` which would be `backend:3000/ws`. Backend WebSocket server listens on the root HTTP server (all paths). | Should work if client connects to `/ws`. But client `websocket.ts` URL derivation may send to root `/` instead. | Verify client WS connection URL targets exactly `/ws` at gateway |

---

## Build / Runtime / Env / Deployment Issues

| Issue | Details | Severity |
|-------|---------|----------|
| Three env files with conflicting values | Root `.env` (Docker), `server/.env` (local dev), `client/.env` (frontend). No documentation on precedence. `JWT_SECRET` differs. `DB_HOST` differs. | **High** |
| `.env` in version control | Root `.env` and `server/.env` appear committed. `.gitignore` should exclude them. | **High** |
| Prometheus/Grafana missing from compose | Env vars reference them, `infrastructure/monitoring/` exists, but no Docker compose service definitions. | **Medium** |
| `server/_core/` empty directory | Listed in project but contains nothing. Leftover from past restructuring. | **Low** |
| Client has both `pnpm-lock.yaml` and `package-lock.json` | Two package manager lock files creates ambiguity. Pick one. | **Low** |
| `hr_ai_layer` has corrupt filenames | Files named `0`, `cd`, `0.30).astype(int)`, `cutoff].copy()`, `t).astype(int)` — artifacts from broken script execution. | **Low** |

---

## Release Blockers

| # | Blocker | Severity | Impact |
|---|---------|----------|--------|
| **RB-01** | Nginx path-stripping breaks ALL API calls through gateway | **Critical** | No API call from frontend reaches the correct backend endpoint when deployed via Docker |
| **RB-02** | ML service unreachable through gateway | **Critical** | ML prediction features broken in production |
| **RB-03** | JWT_SECRET mismatch between Docker and local environments | **High** | Tokens generated in one env invalid in other |
| **RB-04** | `super_admin` role does not exist in backend schema | **High** | Users with `super_admin` role cannot be created; routes guarded by this role are inaccessible |
| **RB-05** | Hardcoded secrets in committed `.env` files | **High** | Security violation for any production deployment |
| **RB-06** | Missing salary management module | **Critical** | Core institutional requirement not implemented |
| **RB-07** | Missing attendance management module | **Critical** | Core institutional requirement not implemented |
| **RB-08** | No notification delivery mechanism | **High** | Alerts and notifications exist in backend but never delivered to users |

---

## Ordered Fix Plan

| Step ID | Priority | Module | Exact Fix | Acceptance Criteria |
|---------|----------|--------|-----------|---------------------|
| F-01 | **P0** | Gateway | Change `nginx.conf` L43 from `proxy_pass http://backend/;` to `proxy_pass http://backend;` (remove trailing slash to preserve path). This will forward `/api/{route}` as-is to `backend:3000/api/{route}`, matching `rootPath: '/api'`. | `curl http://localhost:8080/api/health` returns `200 OK` |
| F-02 | **P0** | Gateway | Move `/ml/` location block ABOVE `/api/` in `nginx.conf`, OR change to `location /api/ml/` with `proxy_pass http://ml_service/;` | ML service reachable at `http://localhost:8080/api/ml/health` |
| F-03 | **P0** | Env | Unify `JWT_SECRET` across all `.env` files. Use a single strong secret. Add `.env` to `.gitignore` and use `.env.example` for templates. | Single JWT_SECRET value across all environments |
| F-04 | **P0** | Auth/RBAC | Either add `super_admin` to backend `users` schema CHECK constraint, OR change frontend `allowedRoles` from `super_admin` to `admin`. | All `ProtectedRoute` role values are valid backend roles |
| F-05 | **P1** | Server | Create salary module: `salary.controller.ts`, `salary.service.ts`, `salary.repository.ts`, add DI bindings, add salary schema if missing | `/api/salaries` endpoints return data |
| F-06 | **P1** | Server | Create attendance module: `attendance.controller.ts`, `attendance.service.ts`, `attendance.repository.ts`, add DI bindings | `/api/attendance` endpoints return data |
| F-07 | **P1** | Server | Create `notifications.schema.ts`, extend `NotificationService`, wire to WebSocket for push delivery | Notifications persisted and delivered to connected clients |
| F-08 | **P1** | Client | Create `SalaryPage.tsx`, `AttendancePage.tsx`, add routes in `App.tsx`, add sidebar navigation items | Pages render with data from backend |
| F-09 | **P2** | Docker | Add Prometheus and Grafana services to `docker-compose.yml` | Monitoring accessible at configured ports |
| F-10 | **P2** | Cleanup | Execute Safe Cleanup Plan from Section 1 | All dead files removed without breaking any active flow |

---

## Release Readiness Checklist

| # | Item | Status |
|---|------|--------|
| 1 | All API endpoints reachable through gateway | ❌ FAIL (E-01 / RB-01) |
| 2 | ML service reachable through gateway | ❌ FAIL (E-07 / RB-02) |
| 3 | JWT tokens valid across environments | ❌ FAIL (E-04 / RB-03) |
| 4 | All frontend roles match backend schema | ❌ FAIL (E-08 / RB-04) |
| 5 | Secrets not in version control | ❌ FAIL (E-06 / RB-05) |
| 6 | Salary management implemented | ❌ FAIL (RB-06) |
| 7 | Attendance management implemented | ❌ FAIL (RB-07) |
| 8 | Notification delivery working | ❌ FAIL (RB-08) |
| 9 | Authentication working end-to-end | ✅ PASS (with JWT fix) |
| 10 | Employee CRUD working | ✅ PASS (pending gateway fix) |
| 11 | Performance appraisals working | ✅ PASS (pending gateway fix) |
| 12 | Turnover risk predictions working | ✅ PASS (pending gateway + ML fix) |
| 13 | Reports generation working | ✅ PASS (pending gateway fix) |
| 14 | Dashboard rendering | ✅ PASS (pending gateway fix) |
| 15 | Dead code removed | ❌ FAIL (Section 1 cleanup pending) |
| 16 | Database schema complete | ⚠️ PARTIAL (notifications schema missing) |
| 17 | Arabic/RTL support | ⚠️ UNVERIFIABLE |
| 18 | Monitoring stack deployed | ❌ FAIL |

---

## Final Verdict

# **NOT READY**

**8 release blockers identified.** 2 are critical infrastructure issues (nginx path-stripping, ML routing) that break ALL production API traffic. 2 are critical missing features (salary, attendance). 4 are high-severity issues (JWT mismatch, role mismatch, secrets exposure, notification delivery).

**Minimum path to CONDITIONALLY READY:** Fix F-01, F-02, F-03, F-04 (infrastructure/auth/security — estimated 2-4 hours of focused work). This unblocks all existing features.

**Minimum path to READY:** Add F-05 through F-08 (salary + attendance + notifications — estimated 2-3 days), then F-09, F-10 (monitoring + cleanup — 1 day).
