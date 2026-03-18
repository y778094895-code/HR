# Tasks: Intelligent HR Performance System

**Branch**: `001-intelligent-hr-performance-system`
**Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)
**Data Model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/](./contracts/)
**Date**: 2026-03-18

**Legend**:
- `[P]` — parallelizable (no dependency on sibling tasks in the same group)
- `[USn]` — user story label
- Tasks within a phase may run in parallel unless otherwise noted
- Foundational phase must complete before any user story phase begins

---

## Phase 1 — Setup

- [x] T001 Create spec-kit feature branch `001-intelligent-hr-performance-system` from `main`
- [ ] T002 Verify all six Docker services start and pass health checks: `docker compose up -d && make health`
- [ ] T003 Confirm existing migration chain 0000–0021 is applied: `cd server && npm run drizzle:status`
- [ ] T004 Confirm frontend builds without TypeScript errors: `cd client && npm run build`
- [ ] T005 Confirm ML service starts and model loads: `curl http://localhost:8000/`

---

## Phase 2 — Foundational (blocks all user stories)

### Database — new migrations

- [x] T010 Write migration `postgres/migrations/0022_goals_kpis_objectives.sql`: create `goals`, `kpis`, `org_objectives`, `objective_departments` tables + enums `goal_status`, `kpi_frequency`, `objective_status`
- [x] T010b Write migration `postgres/migrations/0026_audit_logs.sql`: create `audit_logs` table with columns defined in `data-model.md`; add indexes `(entity, entity_id)`, `(user_id, created_at DESC)`, `(created_at DESC)` BRIN
- [x] T011 Write migration `postgres/migrations/0023_review_templates_participants.sql`: create `review_templates`, `review_participants` + enums `reviewer_type`, `participant_status`, `cycle_type` (extend existing `review_cycles`)
- [x] T012 Write migration `postgres/migrations/0024_training_suggestions.sql`: create `training_suggestions` + enum `training_status`
- [x] T013 Write migration `postgres/migrations/0025_notifications_extended.sql`: `ALTER TABLE notifications ADD COLUMN title_ar varchar(255), ADD COLUMN body_ar text`
- [ ] T014 Apply all new migrations and verify schema: `cd server && npm run drizzle:migrate && npm run drizzle:status`

### Shared types

- [x] T015 [P] Create `shared/types/goal.ts`: `Goal`, `KPI`, `GoalStatus`, `CreateGoalDto`, `UpdateGoalDto`
- [x] T016 [P] Create `shared/types/review.ts`: `ReviewCycle`, `ReviewTemplate`, `ReviewParticipant`, `Review`, `ReviewReport`
- [x] T017 [P] Create `shared/types/risk.ts`: `RiskScore`, `RiskBand`, `ShapFeature`, `RiskFeature`
- [x] T018 [P] Create `shared/types/integration.ts`: `SyncJob`, `IntegrationConfig`, `FieldMapping`, `ImportPreview`
- [x] T019 [P] Update `shared/types/employee.ts`: add `erpNextId`, `nameAr`, `deletedAt`, `latestRiskBand` fields

### NestJS scaffolding

- [x] T020 [P] Scaffold `server/src/goals/goals.module.ts`, `goals.service.ts`, `goals.controller.ts`, `goals.schema.ts`
- [x] T021 [P] Scaffold `server/src/reviews/reviews.module.ts`, `reviews.service.ts`, `reviews.controller.ts`, `reviews.schema.ts`
- [ ] T022 [P] Scaffold `server/src/risk/risk.module.ts`, `risk.service.ts`, `risk.controller.ts`, `risk.schema.ts`
- [ ] T023 [P] Scaffold `server/src/recommendations/recommendations.module.ts`, `recommendations.service.ts`, `recommendations.controller.ts`
- [ ] T024 [P] Scaffold `server/src/analytics/analytics.module.ts`, `analytics.service.ts`, `analytics.controller.ts`
- [ ] T025 [P] Scaffold `server/src/integrations/integrations.module.ts`, `integrations.service.ts`, `integrations.controller.ts`
- [ ] T026 [P] Scaffold `server/src/queue/queue.module.ts`, `queue.consumer.ts` (RabbitMQ consumer base)
- [ ] T027 Register T020–T026 modules in `server/src/app.module.ts`

---

## Phase 3 — US-1: Goals, KPIs & Employee Management (P1)

### Backend

- [x] T030 [US1] Implement Drizzle schema in `server/src/goals/goals.schema.ts`: tables `goals`, `kpis`, `org_objectives`, `objective_departments`
- [x] T031 [US1] Implement `GoalsService` in `server/src/goals/goals.service.ts`: `create`, `findAll` (role-scoped), `findOne`, `update`, `archive`, validation of weight sum ≤ 100
- [x] T032 [US1] Implement `GoalsController` in `server/src/goals/goals.controller.ts`: routes `GET /goals`, `POST /goals`, `GET /goals/:id`, `PATCH /goals/:id`, `DELETE /goals/:id` per `contracts/backend-api.md`
- [x] T033 [US1] Implement KPI sub-routes in `GoalsController`: `POST /goals/:id/kpis`, `PATCH /goals/:id/kpis/:kpiId`, `DELETE /goals/:id/kpis/:kpiId`
- [x] T034 [US1] Implement `OrgObjectivesService` + controller routes `GET /objectives`, `POST /objectives`, `POST /objectives/:id/cascade`
- [ ] T035 [US1] Add `@Roles(Role.HR, Role.ADMIN)` and ownership guards: Manager sees only their reports' goals; Employee sees own goals
- [ ] T036 [US1] Extend `server/src/employees/employees.service.ts`: soft-delete (`deletedAt`), add `nameAr`, `erpNextId` fields, `GET /employees/:id/timeline`
- [ ] T037 [US1] Write unit tests `server/src/goals/goals.service.spec.ts`: weight-sum validation, role-scoping logic, state transition guards
- [ ] T038 [US1] Write integration tests `server/tests/goals.integration.spec.ts`: full CRUD cycle against real PostgreSQL

### Frontend

- [ ] T039 [US1] [P] Create `client/src/pages/Goals/GoalsPage.tsx`: employee/manager/hr scoped goal list with filter bar
- [ ] T040 [US1] [P] Create `client/src/components/goals/GoalForm.tsx`: create/edit form with real-time weight-sum validation, loading/error/empty states
- [ ] T041 [US1] [P] Create `client/src/components/goals/KPIWidget.tsx`: KPI progress bar with current/target values
- [ ] T042 [US1] [P] Create `client/src/components/goals/GoalStatusBadge.tsx`: status chip using Tailwind design tokens
- [ ] T043 [US1] [P] Create `client/src/services/goals.service.ts`: typed Axios client for all goals endpoints
- [ ] T044 [US1] [P] Add translation keys `client/src/locales/en/goals.json` + `client/src/locales/ar/goals.json`
- [ ] T045 [US1] [P] Create `client/src/pages/Employees/EmployeesPage.tsx`: paginated employee table with risk-band column
- [ ] T046 [US1] [P] Create `client/src/pages/Employees/EmployeeDetailPage.tsx`: page shell with Profile tab (employee fields), Goals tab (GoalsPage embedded), and Timeline tab (reverse-chronological event list from `GET /employees/:id/timeline`)
- [ ] T047 [US1] Write Playwright E2E test `tests/e2e/goals.spec.ts`: Create goal → add KPI → update progress → archive

---

## Phase 4 — US-2: Performance Review Engine & 360° Feedback (P1)

### Backend

- [x] T050 [US2] Implement Drizzle schema in `server/src/reviews/reviews.schema.ts`: `review_cycles`, `review_templates`, `review_participants`, `reviews`
- [ ] T051 [US2] Implement `ReviewCyclesService`: `create`, `launch` (transition → active, email participants via queue), `close`, `getReport`
- [x] T052 [US2] Implement `ReviewsService`: `saveDraft`, `submit` (compute `compositeScore`, `goalAttainmentPct`), `lock` (manager/HR), `acknowledge` (employee)
- [x] T053 [US2] Implement `ReviewParticipantsService`: assign reviewers (manager selects peers), HR override, uniqueness constraint enforcement
- [x] T054 [US2] Implement controllers: `ReviewCyclesController` (routes per `contracts/backend-api.md`) + `ReviewsController`
- [ ] T055 [US2] Implement `server/src/notifications/notifications.service.ts`: publish `review_assigned`, `review_overdue`, `review_locked` events to RabbitMQ
- [ ] T056 [US2] Implement `server/src/queue/queue.consumer.ts`: consume notifications queue, send emails via nodemailer (`SMTP_*` env vars), store in-app notification row
- [ ] T057 [US2] Add `@Cron('0 8 * * *')` reminder job in `ReviewsModule` for overdue participants
- [ ] T058 [US2] Write unit tests `server/src/reviews/reviews.service.spec.ts`: composite score weighting, state machine guards, overdue cron logic
- [ ] T059 [US2] Write integration tests `server/tests/reviews.integration.spec.ts`: full cycle — create → launch → submit → lock → acknowledge → calibrate → close
- [ ] T059b [US2] Implement `ReviewCyclesService.calibrate()`: transition `active → calibration`; lock all submitted reviews against further edits; add `PATCH /review-cycles/:id/calibrate` endpoint (HR role)
- [ ] T059c [US2] Add calibration state indicator to `client/src/pages/Reviews/CycleManagementPage.tsx`: "In Calibration" badge; disable participant assignment during calibration

### Frontend

- [ ] T060 [US2] [P] Create `client/src/pages/Reviews/ReviewsPage.tsx`: "My Tasks" list (pending reviews) with status badges
- [ ] T061 [US2] [P] Create `client/src/pages/Reviews/ReviewFormPage.tsx`: dynamic form generated from `review_template.sections`, star-rating per competency, open-text areas
- [ ] T062 [US2] [P] Create `client/src/pages/Reviews/CycleManagementPage.tsx`: HR cycle list, launch/close controls, participant assignment modal
- [ ] T063 [US2] [P] Create `client/src/components/reviews/ReviewReport.tsx`: aggregated scores, peer comment anonymisation toggle, goal attainment chart
- [ ] T064 [US2] [P] Create `client/src/components/reviews/PeerSelectorModal.tsx`: manager selects peers from direct-reports list
- [ ] T065 [US2] [P] Create `client/src/services/reviews.service.ts`: typed Axios client for review endpoints
- [ ] T066 [US2] [P] Add translation keys `client/src/locales/en/reviews.json` + `client/src/locales/ar/reviews.json`
- [ ] T067 [US2] Write Playwright E2E test `tests/e2e/reviews.spec.ts`: HR launches cycle → Employee submits self-review → Manager locks → Employee acknowledges

---

## Phase 5 — US-3: AI Attrition Risk Prediction (P2)

### ML service

- [ ] T070 [US3] Verify `ml-service/core/services/prediction/service.py` outputs `score`, `band`, `shap_values` matching `contracts/ml-service-api.md` schema
- [x] T071 [US3] Implement `ml-service/api/schemas/response_schemas.py`: `TurnoverPredictionResponse` with `shap_values: list[ShapFeature]`, `label_en`, `label_ar` per feature
- [x] T072 [US3] Add `label_en`/`label_ar` to `ml-service/core/services/prediction/pipeline.py` by loading `shared/xai/feature_labels.json` (single source of truth — do NOT duplicate in `ml-service/shared/`)
- [x] T073 [US3] Implement `ml-service/api/routes.py`: `POST /predict/turnover` + `POST /predict/turnover/batch` per contract
- [ ] T074 [US3] Write pytest contract tests `ml-service/tests/test_prediction_contract.py`: validate response schema stability, latency p95 ≤ 500 ms under 10 concurrent requests

### Backend

- [x] T075 [US3] Implement `server/src/risk/risk.service.ts`: `predictForEmployee` (sync HTTP call to ML service via `ML_SERVICE_URL`), cache result in Redis `risk:employee:{id}` TTL 900 s, update `risk_scores` table
- [x] T076 [US3] Implement `server/src/risk/risk.service.ts`: async fallback — publish `prediction.requested` to RabbitMQ if ML latency exceeds 450 ms budget
- [ ] T077 [US3] Implement RabbitMQ consumer in `server/src/queue/queue.consumer.ts`: handle `prediction.completed` — update `risk_scores`, invalidate Redis cache, notify user if band changed
- [ ] T078 [US3] Implement `RiskController` in `server/src/risk/risk.controller.ts`: `GET /risk/employees/:id`, `POST /risk/employees/:id/predict`, `GET /risk/heatmap`, `GET /risk/employees/:id/history`
- [ ] T079 [US3] Implement Redis cache invalidation in `EmployeesService.update()`: set `is_stale = true` on risk_score row + delete Redis key when employee data changes
- [ ] T080 [US3] Write unit tests `server/src/risk/risk.service.spec.ts`: cache hit/miss logic, stale handling, band-change notification trigger
- [ ] T081 [US3] Write integration test `server/tests/risk.integration.spec.ts`: end-to-end predict → cache → retrieve → invalidate on employee update
- [x] T081b [US3] Implement `POST /risk/batch` in `RiskController`: accepts `{ departmentId?, staleOnly? }`, publishes batch job to RabbitMQ, returns 202 with `batchId`; ML service consumer handles `prediction.batch.requested` per `contracts/ml-service-api.md`

### Frontend

- [ ] T082 [US3] [P] Create `client/src/components/risk/RiskScoreCard.tsx`: score gauge, band badge, `predictedAt` timestamp, "Refresh" button
- [ ] T083 [US3] [P] Create `client/src/components/risk/RiskFeatureList.tsx`: ordered SHAP features with impact bar and locale-aware label (`label_en`/`label_ar`)
- [ ] T084 [US3] [P] Create `client/src/components/risk/RiskHeatmapTable.tsx`: department-level risk band counts, colour-coded cells (Tailwind tokens only)
- [ ] T085 [US3] [P] Create `client/src/services/risk.service.ts`: typed Axios client for risk endpoints
- [ ] T086 [US3] [P] Add translation keys `client/src/locales/en/risk.json` + `client/src/locales/ar/risk.json`
- [ ] T087 [US3] Write Playwright E2E test `tests/e2e/risk.spec.ts`: HR views employee risk score → risk features rendered → refreshes prediction → new score displayed

---

## Phase 6 — US-4: Recommendations & Training Paths (P2)

### ML service

- [ ] T090 [US4] Verify `ml-service/core/services/recommendation/engine.py` returns `recommendations[]` + `training_suggestions[]` matching `contracts/ml-service-api.md`
- [ ] T091 [US4] Add `title_ar`, `rationale_ar` fields to `ml-service/api/schemas/recommendation_schema.py` + populate via Arabic label map
- [ ] T092 [US4] Write pytest tests `ml-service/tests/test_recommendation_contract.py`: schema stability, at least one recommendation returned for band `high`/`critical`

### Backend

- [x] T093 [US4] Implement `RecommendationsService.generateForEmployee`: call `POST /recommendations` on ML service; on ML failure, apply rule-based fallback in `server/src/recommendations/rules/` (salary percentile, tenure, attendance)
- [x] T094 [US4] Implement `RecommendationsService`: `action`, `dismiss` (update status + note + `actionedBy`), `getByEmployee`, `getByDepartment`
- [ ] T095 [US4] Implement `TrainingService` in `server/src/recommendations/training.service.ts`: `getForEmployee`, `enroll`, `complete`
- [ ] T096 [US4] Implement `RecommendationsController` + `TrainingController`: routes per `contracts/backend-api.md`
- [ ] T097 [US4] Trigger recommendation generation automatically in `RiskService` when band transitions to `high` or `critical`
- [ ] T098 [US4] Write unit tests `server/src/recommendations/recommendations.service.spec.ts`: rule-based fallback triggers on ML 503, action/dismiss state transitions
- [ ] T099 [US4] Write integration test `server/tests/recommendations.integration.spec.ts`: risk score `high` → recommendations generated → manager actions one → status `actioned`

### Frontend

- [ ] T100 [US4] [P] Create `client/src/components/risk/RecommendationCard.tsx`: type icon, rationale, effort badge, owner badge, action/dismiss buttons
- [ ] T101 [US4] [P] Add Risk tab to existing `client/src/pages/Employees/EmployeeDetailPage.tsx` (created in T046): compose RiskScoreCard + RiskFeatureList + RecommendationCard list + TrainingSuggestionCard list
- [ ] T102 [US4] [P] Create `client/src/components/risk/TrainingSuggestionCard.tsx`: category, gap competency, enroll/dismiss controls
- [ ] T103 [US4] [P] Create `client/src/services/recommendations.service.ts`: typed Axios client
- [ ] T104 [US4] [P] Add translation keys `client/src/locales/en/recommendations.json` + `client/src/locales/ar/recommendations.json`
- [ ] T105 [US4] Write Playwright E2E test `tests/e2e/recommendations.spec.ts`: Manager opens at-risk employee → sees recommendations → actions one → status badge updates

---

## Phase 7 — US-5: Dashboards & Reports (P2)

### Backend

- [x] T110 [US5] Implement `AnalyticsService.getDashboard(userId, role)`: role-scoped KPIs — Employee (own), Manager (team), HR (org-wide), Admin (org-wide + system stats)
- [x] T111 [US5] Implement `AnalyticsService.getDepartmentSummary(deptId)`: avg goal completion, avg review score, risk band distribution
- [x] T112 [US5] Implement export service `server/src/analytics/export.service.ts`: CSV via `json2csv`, XLSX via `exceljs`; streaming for > 1000 rows
- [x] T113 [US5] Implement `AnalyticsController`: `GET /analytics/dashboard`, `GET /analytics/department/:id`, `GET /analytics/export`
- [x] T114 [US5] Cache dashboard queries in Redis (TTL 300 s); invalidate on review lock or goal status change
- [ ] T115 [US5] Write unit tests `server/src/analytics/analytics.service.spec.ts`: role-scoping, KPI computations, equity metric formulas
- [ ] T116 [US5] Write integration test `server/tests/analytics.integration.spec.ts`: seeded data → dashboard response matches expected KPIs

### Frontend

- [ ] T117 [US5] [P] Create `client/src/pages/Dashboard/DashboardPage.tsx`: role-aware layout (Employee/Manager/HR/Admin views), loading skeleton, error boundary
- [ ] T118 [US5] [P] Create `client/src/components/dashboard/KPICard.tsx`: metric label, value, trend indicator — uses Tailwind tokens, ARIA label
- [ ] T119 [US5] [P] Create `client/src/components/dashboard/RiskDistributionChart.tsx`: Recharts stacked bar per department, RTL-safe
- [ ] T120 [US5] [P] Create `client/src/components/dashboard/GoalCompletionChart.tsx`: Recharts radial/donut chart, responsive at 1280/1024/768 px
- [ ] T121 [US5] [P] Create `client/src/components/dashboard/EquityMetricsPanel.tsx`: gender pay gap %, rating gap % — suppress if n < 5
- [ ] T122 [US5] [P] Create `client/src/components/shared/ExportButton.tsx`: format selector (CSV/XLSX), triggers `GET /analytics/export`
- [ ] T123 [US5] [P] Create `client/src/services/analytics.service.ts`: typed Axios client
- [ ] T124 [US5] [P] Add translation keys `client/src/locales/en/dashboard.json` + `client/src/locales/ar/dashboard.json`
- [ ] T125 [US5] Write Playwright E2E test `tests/e2e/dashboard.spec.ts`: HR login → dashboard KPIs rendered → risk chart visible → export downloads file

---

## Phase 8 — US-6: Explainable AI & Fairness Metrics (P3)

### ML service

- [ ] T130 [US6] Verify `ml-service/core/services/fairness/service.py` returns AIR + p-value per group, suppresses groups n < 5, matching `contracts/ml-service-api.md`
- [x] T131 [US6] Add `POST /fairness/report` route in `ml-service/api/routes.py` per contract
- [ ] T132 [US6] Write pytest tests `ml-service/tests/test_fairness_contract.py`: AIR calculation, suppression rule, schema validation

### Backend

- [x] T133 [US6] Implement `AnalyticsService.generateFairnessReport`: POST to ML `/fairness/report`, store result in `fairness_runs` table
- [x] T134 [US6] Implement `AnalyticsController`: `POST /analytics/fairness`, `GET /analytics/fairness`, `GET /analytics/fairness/:id`
- [x] T135 [US6] Implement XAI rendering service `server/src/risk/xai.service.ts`: convert `shap_values` JSONB to locale-aware human-readable sentences using label map from `shared/xai/feature_labels.json`
- [x] T136 [US6] Ensure `GET /risk/employees/:id` response includes `features[].labelEn` + `features[].labelAr` (via `xai.service.ts`)
- [ ] T137 [US6] Write unit tests `server/src/risk/xai.service.spec.ts`: locale switching, all known feature keys resolve to non-empty labels, missing-key graceful fallback
- [ ] T138 [US6] Write integration test `server/tests/fairness.integration.spec.ts`: seeded cycle with gender data → fairness report → AIR computed, flag set correctly

### Frontend

- [ ] T139 [US6] [P] Create `client/src/pages/Analytics/FairnessReportPage.tsx`: attribute selector, run report button, result table with AIR + flag indicators
- [ ] T140 [US6] [P] Create `client/src/components/analytics/FairnessGroupTable.tsx`: group rows, AIR column with colour (< 0.8 = red token), suppressed groups notice
- [ ] T141 [US6] [P] Create `client/src/components/risk/XAIExplanationPanel.tsx`: ordered feature contributions, positive/negative colouring, locale-aware labels
- [ ] T142 [US6] [P] Add translation keys `client/src/locales/en/fairness.json` + `client/src/locales/ar/fairness.json`
- [ ] T143 [US6] Write Playwright E2E test `tests/e2e/fairness.spec.ts`: HR navigates to Fairness → selects cycle + gender → generates report → AIR column visible

---

## Phase 9 — US-7: Arabic / English Localisation (P3)

- [x] T150 [US7] [P] Install and configure `tailwindcss-rtl` plugin in `client/tailwind.config.ts`; verify existing components render correctly in RTL
- [x] T151 [US7] [P] Implement `client/src/contexts/LocaleProvider.tsx`: toggle `<html dir>` on locale change; persist selection to `PATCH /auth/me/locale` + localStorage fallback
- [x] T152 [US7] Configure `i18next` in `client/src/config/i18n.ts`: lazy-loaded namespaces, `ar`/`en` language detection, `en` fallback
- [x] T153 [US7] Complete Arabic translation files for all namespaces: `common`, `goals`, `reviews`, `risk`, `recommendations`, `dashboard`, `fairness`, `settings`, `errors`
- [ ] T154 [US7] Audit all `client/src/components/` for RTL layout issues: flex direction, text alignment, icon mirroring — fix any failing `tailwindcss-rtl` logical properties
- [x] T155 [US7] Configure `dayjs` with `ar` locale; use `Intl.NumberFormat('en-US-u-nu-latn')` for numerals (western digits in AR locale per OQ-4)
- [ ] T156 [US7] Update `client/src/components/shared/` Recharts charts: add `rtl` prop on `ResponsiveContainer` when `dir === 'rtl'`
- [ ] T157 [US7] Write Playwright E2E test `tests/e2e/localisation.spec.ts`: switch locale to AR → `<html dir="rtl">` set → dashboard labels render in Arabic → switch back to EN

---

## Phase 10 — US-8: HRIS/ERP Integration & Import-Export (P3)

### Backend

- [ ] T160 [US8] Implement `server/src/integrations/erpnext/erpnext.client.ts`: HTTP client using `axios` with API-key/secret Basic-auth header, pagination (`limit_start`/`limit_page_length`), and filter support (`?filters=`)
- [ ] T161 [US8] Implement `server/src/integrations/erpnext/field-mapper.service.ts`: apply `integration_configs.field_mapping` JSONB to raw ERPNext employee record
- [ ] T162 [US8] Implement `server/src/integrations/sync.service.ts`: full sync loop (create/update/soft-delete logic per `contracts/erpnext-integration.md`), write `sync_jobs` record
- [ ] T163 [US8] Implement retry + error handling per contract: 3× exponential backoff, `429` Retry-After, per-row validation errors → `sync_jobs.errors`
- [ ] T164 [US8] Encrypt/decrypt credentials in `server/src/integrations/crypto.service.ts`: AES-256-GCM using `INTEGRATION_ENCRYPTION_KEY`, redact from logs
- [ ] T165 [US8] Implement scheduled sync via `@Cron()` in `IntegrationsModule` using `integration_configs.sync_schedule`
- [ ] T166 [US8] Implement `POST /integrations/webhook/erpnext`: HMAC-SHA256 signature verification, then trigger `sync.service.ts` for single employee
- [ ] T167 [US8] Implement `server/src/integrations/import/import.service.ts`: `multer` upload, `papaparse` (CSV) + `exceljs` (XLSX) parse, Zod validation, preview response, atomic DB insert
- [ ] T168 [US8] Implement `server/src/integrations/export/export.service.ts`: employees + goals export to CSV/XLSX, streamed response
- [ ] T169 [US8] Implement `IntegrationsController`: all routes per `contracts/backend-api.md` — config CRUD, manual sync trigger, job list, import, export
- [ ] T170 [US8] Write unit tests `server/src/integrations/sync.service.spec.ts`: create/update/skip logic, retry behaviour, HMAC verification
- [ ] T171 [US8] Write integration test `server/tests/integrations.integration.spec.ts`: mock ERPNext server → sync → employees created in DB → job record completed

### Frontend

- [ ] T172 [US8] [P] Create `client/src/pages/Settings/IntegrationSettingsPage.tsx`: config form (base URL, masked key/secret), connection test button, last-synced status
- [ ] T173 [US8] [P] Create `client/src/pages/Settings/SyncJobsPage.tsx`: job history table — status, counts (created/updated/skipped/errors), expandable error list
- [ ] T174 [US8] [P] Create `client/src/components/import/ImportWizard.tsx`: file upload → preview table (valid/invalid rows) → confirm import → progress indicator
- [ ] T175 [US8] [P] Create `client/src/services/integrations.service.ts`: typed Axios client for all integration endpoints
- [ ] T176 [US8] [P] Add translation keys `client/src/locales/en/integrations.json` + `client/src/locales/ar/integrations.json`
- [ ] T177 [US8] Write Playwright E2E test `tests/e2e/import.spec.ts`: Admin uploads valid employees CSV → preview renders → confirms → employees appear in list

---

## Phase 11 — Polish & Cross-Cutting

### Notifications

- [ ] T180 [P] Create `client/src/components/shared/NotificationBell.tsx`: unread count badge, dropdown list, mark-all-read; polls `GET /notifications` every 30 s
- [ ] T181 [P] Create `client/src/services/notifications.service.ts`: typed Axios client

### Risk Opt-In & Training Categories

- [x] T181b [P] Add `showRiskToEmployee` boolean to `employees` table (migration 0026 or new 0027); gate `GET /risk/employees/:id/history` endpoint: Employee role only sees history if this flag is `true`; add toggle to `EmployeeDetailPage.tsx` Profile tab (HR/Admin only)
- [x] T181c [P] Create `server/src/recommendations/training-categories.ts`: canonical category enum `['Leadership', 'Technical Skills', 'Communication', 'Project Management', 'Data & Analytics', 'Compliance']`; use in `TrainingService` validation and `ImportWizard` category selector dropdown

### Auth & Security

- [x] T182 [P] Implement `server/src/auth/guards/ownership.guard.ts`: CASL `can('read', Employee, { managerId: user.employeeId })` for manager-scoped endpoints
- [x] T183 [P] Add `helmet()` and `ThrottlerModule` (rate-limiting: 100 req/min per IP) to `server/src/main.ts`
- [x] T184 [P] Add `Content-Security-Policy` header in `infrastructure/docker/nginx.conf`

### Audit

- [ ] T185 [P] Implement `server/src/shared/audit/audit.interceptor.ts`: intercept mutating requests (POST/PATCH/DELETE), write to `audit_logs` (before/after snapshots)
- [ ] T186 [P] Register `AuditInterceptor` globally in `AppModule`

### Performance

- [ ] T187 [P] Add DB indexes defined in `data-model.md` to migrations: verify `EXPLAIN ANALYZE` on `employees`, `risk_scores`, `reviews` queries uses index scans
- [ ] T188 [P] Run Lighthouse audit on Dashboard route: score must be ≥ 85; fix any bundle-size regressions > 10 %

### Observability

- [x] T189 [P] Add `pino` structured logger to `server/src/main.ts`; add request-id correlation header; redact `api_key`/`api_secret` paths
- [ ] T190 [P] Verify ML service `ml-service/api/middleware/monitoring.py` emits latency histogram; confirm p95 ≤ 500 ms in pytest load test

### Docker / CI

- [ ] T191 [P] Verify `infrastructure/docker/Dockerfile.backend` builds production image and starts within 30 s health-check window
- [ ] T192 [P] Add GitHub Actions workflow `.github/workflows/ci.yml`: lint → unit tests → integration tests → build — blocks merge on failure
- [ ] T193 [P] Update `QUICK_START.md` (repo root) with new modules, env vars (`ML_SERVICE_TOKEN`, `INTEGRATION_ENCRYPTION_KEY`), and seed instructions; note that `.specify/specs/.../quickstart.md` is the spec artifact (separate file)

### Final verification

- [ ] T194 Run full E2E test suite: `npm run test:e2e` — all tests must pass
- [ ] T195 Run `cd server && npm run test:cov` — verify ≥ 80 % branch coverage on all new modules
- [ ] T196 Run `cd client && npm run build` — zero TypeScript errors, zero `any` casts introduced
- [ ] T197 Run `docker compose up -d && make health` — all six services healthy within 30 s
- [ ] T198 Merge PR to `main` — CI must be green

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
  └── Phase 2 (Foundational: T010-T027)
        ├── Phase 3  (US-1) ─────────────────────────────┐
        ├── Phase 4  (US-2) ─────────────────────────────┤
        ├── Phase 5  (US-3) ──────────────────────────── ┤
        ├── Phase 6  (US-4, depends on US-3 risk scores) ┤
        ├── Phase 7  (US-5, depends on US-1/2/3 data)    ┤
        ├── Phase 8  (US-6, depends on US-3/5 scores)    ┤
        ├── Phase 9  (US-7, no code deps, can run after P1)
        └── Phase 10 (US-8, independent)                 ┘
              └── Phase 11 (Polish — runs last, after all stories)
```

**Parallel opportunities**:
- T015–T019 (shared types) can all run simultaneously
- T020–T026 (NestJS scaffolding) can all run simultaneously
- Within each user story: `[P]`-marked frontend tasks are independent of each other
- US-7 (i18n) and US-8 (integration) can start immediately after Phase 2 in parallel with US-1 through US-6

**MVP scope** (minimum for first deploy): Phase 1 + Phase 2 + Phase 3 (US-1) + Phase 4 (US-2) + Phase 5 (US-3) + Phase 7 (US-5 dashboard)

---

## Task Summary

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Setup | 5 | 0 |
| Foundational | 19 | 12 |
| US-1 Goals/Employees | 19 | 9 |
| US-2 Reviews | 21 | 8 |
| US-3 AI Risk | 20 | 6 |
| US-4 Recommendations | 16 | 6 |
| US-5 Dashboards | 16 | 9 |
| US-6 XAI/Fairness | 14 | 5 |
| US-7 Localisation | 8 | 2 |
| US-8 Integration | 18 | 6 |
| Polish | 23 | 19 |
| **Total** | **179** | **82** |
