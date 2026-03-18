# Specification: Intelligent HR Performance Analysis & Management System

**Feature**: `001-intelligent-hr-performance-system`
**Date**: 2026-03-18
**Status**: Approved
**Plan**: [plan.md](./plan.md) | **Tasks**: [tasks.md](./tasks.md)

---

## System Overview

An intelligent HR performance management platform serving four roles. Core capabilities:
- Goal and KPI tracking aligned to organisational objectives
- Performance review cycles including 360° peer feedback
- AI-driven attrition risk prediction with explainable outputs (SHAP)
- Actionable intervention recommendations and training path suggestions
- Role-scoped dashboards, equity/fairness analytics, and exports
- Arabic/English bilingual UI with full RTL support
- HRIS/ERP integration (ERPNext REST API) and CSV/Excel import-export

---

## User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Employee** | Individual contributor | View own goals, submit self-review, view own risk trend (opt-in), enroll in training |
| **Manager** | Team lead with direct reports | Create/manage goals for team, assign reviewers, lock reviews, view team risk scores and recommendations, action/dismiss interventions |
| **HR** | HR business partner | Full employee CRUD, launch/close review cycles, generate fairness reports, trigger ERPNext sync, export data |
| **Admin** | System administrator | All HR permissions + integration config, user management, system settings |

---

## User Stories & Acceptance Criteria

### US-1 — Goals, KPIs & Employee Management

**As an** Employee/Manager/HR, **I want to** create and track goals with weighted KPIs aligned to org objectives, **so that** performance can be measured objectively.

**Acceptance Criteria**:
- [ ] An Employee can create a goal with title, description, category, target value, unit, weight, and due date
- [ ] Goal weights per employee per cycle must sum to ≤ 100; system rejects creation if adding the new weight would exceed this
- [ ] A Manager can create goals on behalf of their direct reports
- [ ] HR can cascade an `org_objective` to selected departments; employees in those departments see the parent objective on their goal
- [ ] KPIs can be added to any goal; each KPI tracks current vs target value with a measurement frequency
- [ ] Goal status transitions follow: `draft → in_progress → completed | overdue | archived`
- [ ] An Employee can view only their own goals; a Manager sees their team's goals; HR/Admin see all
- [ ] `GET /employees/:id/timeline` returns a reverse-chronological list of events: `{ type, occurredAt, summary }` covering review submissions, risk band changes, and goal completions
- [ ] Employees can be soft-deleted (preserves review history); hard-delete is not permitted
- [ ] Employee records include `nameAr` and `erpNextId` fields

---

### US-2 — Performance Review Engine & 360° Feedback

**As an** HR user, **I want to** run structured review cycles with self, manager, and peer reviews, **so that** employees receive multi-perspective performance feedback.

**Acceptance Criteria**:
- [ ] HR can create a review cycle with name, type (`annual | mid_year | quarterly`), date range, and a template
- [ ] A review template defines competency sections (`key`, `label_en`, `label_ar`, `weight`) and a rating scale (1–5 default)
- [ ] HR launches a cycle: status transitions `scheduled → active`; all assigned participants receive a notification
- [ ] A Manager assigns peer reviewers for their direct reports; HR can override any assignment
- [ ] Each reviewee has exactly one self-review, one manager review, and ≥ 0 peer reviews
- [ ] An Employee submits their self-review using the dynamic template form; composite score is computed as a weighted average of section ratings
- [ ] `goal_attainment_pct` is computed from the employee's goals at submission time
- [ ] A Manager or HR can lock a submitted review; the reviewee is notified and can acknowledge
- [ ] Overdue participants receive a daily reminder notification at 08:00
- [ ] HR can advance the cycle to `calibration` status; during calibration, locked reviews cannot be changed
- [ ] HR closes the cycle (`calibration → closed`); no further submissions accepted
- [ ] `GET /review-cycles/:id/report/:employeeId` returns aggregated scores per section, peer comments, and goal attainment

---

### US-3 — AI Attrition Risk Prediction

**As an** HR/Admin user, **I want to** see AI-generated attrition risk scores for employees with SHAP explanations, **so that** I can identify at-risk employees and understand why.

**Acceptance Criteria**:
- [ ] HR/Admin can trigger a risk prediction for a single employee; if ML p95 ≤ 500 ms the result is returned synchronously; otherwise a 202 is returned and the result arrives asynchronously via RabbitMQ
- [ ] HR/Admin can trigger batch re-scoring for all stale employees via `POST /risk/batch`
- [ ] Risk scores are cached in Redis with TTL 900 s; any write to the employee record sets `is_stale = true` and evicts the cache
- [ ] Each risk score includes: `score` (0–100), `band` (`low|medium|high|critical`), `modelVersion`, `predictedAt`, and top SHAP features
- [ ] Each SHAP feature includes `labelEn`, `labelAr`, `impact` (percentage points), and `direction` (`positive|negative`)
- [ ] HR can view a risk heatmap of all employees aggregated by department (band counts only — individual scores are not shown to peers)
- [ ] HR can view a risk score history for an individual employee
- [ ] ML service contract tests assert response schema stability and p95 ≤ 500 ms under 10 concurrent requests

---

### US-4 — Recommendations & Training Paths

**As a** Manager/HR user, **I want to** receive AI-generated intervention recommendations and training suggestions for at-risk or low-performing employees, **so that** I can take targeted action.

**Acceptance Criteria**:
- [ ] When an employee's risk band transitions to `high` or `critical`, recommendations are automatically generated (ML engine, with rule-based fallback on ML 5xx)
- [ ] Each recommendation includes: type, `titleEn`/`titleAr`, `rationaleEn`/`rationaleAr`, `expectedRiskReduction`, `effortLevel`, and `ownerRole`
- [ ] A Manager or HR can mark a recommendation as `actioned` or `dismissed` with an optional note
- [ ] Training suggestions are generated from performance gaps (low section scores in a review); each links to a competency, gap score, and optional resource URL
- [ ] An Employee can mark a training suggestion as `enrolled`; HR/Manager can mark it `completed`
- [ ] HR can view all open interventions for a department in one view

---

### US-5 — Role-Scoped Dashboards & Reports

**As any** authenticated user, **I want to** see a dashboard with KPIs relevant to my role, **so that** I have immediate visibility into performance and risk across my scope.

**Acceptance Criteria**:
- [ ] **Employee dashboard**: own goal completion %, own latest risk band (if opt-in enabled), pending review tasks
- [ ] **Manager dashboard**: team avg goal completion, team risk band distribution, pending review tasks
- [ ] **HR dashboard**: org-wide KPIs (total employees, at-risk count, active cycles, avg goal completion), department risk heatmap, equity metrics (gender pay gap %, gender rating gap %)
- [ ] **Admin dashboard**: HR view + system stats (sync job status, last ERPNext sync, queue depth)
- [ ] Dashboard data is cached in Redis TTL 300 s; invalidated on review lock or goal status change
- [ ] HR/Admin can export employees and goals to CSV or XLSX
- [ ] Equity metrics suppress display if the group has < 5 members
- [ ] All charts are responsive at 1280 px, 1024 px, and 768 px; RTL-safe

---

### US-6 — Explainable AI & Fairness Metrics

**As an** HR user, **I want to** understand AI risk predictions and detect review bias, **so that** I can trust the AI outputs and demonstrate compliance.

**Acceptance Criteria**:
- [ ] Each risk score display includes a ranked list of SHAP features with locale-aware labels, impact bars, and direction colouring
- [ ] HR can generate a fairness report for any closed review cycle and any protected attribute (`gender`, `nationality`)
- [ ] The fairness report shows per-group: n, avg rating, selection rate, AIR, p-value (if n ≥ 30), and a flag if AIR < 0.8
- [ ] Groups with n < 5 are suppressed and listed separately as "insufficient data"
- [ ] Flagged reports surface a banner alert on the HR dashboard
- [ ] Fairness reports can be exported to XLSX for audit submission

---

### US-7 — Arabic / English Localisation

**As any** user, **I want to** switch between Arabic (RTL) and English (LTR) UI, **so that** the system is accessible in both languages without a page reload.

**Acceptance Criteria**:
- [ ] Locale toggle is available in the navigation bar and on the login page
- [ ] Switching locale updates `<html dir>` to `rtl|ltr` and persists the preference to `PATCH /auth/me/locale` and localStorage
- [ ] All UI text is translated; no raw i18next keys are ever displayed to the user (fallback to EN if AR key missing)
- [ ] All dates use `dayjs` with the active locale; numerals use western digits in both locales (per project decision)
- [ ] All Recharts charts are RTL-safe
- [ ] The system is fully functional (all CRUD operations, form validation, chart rendering) in both locales

---

### US-8 — HRIS/ERP Integration & Import-Export

**As an** Admin user, **I want to** sync employee data from ERPNext and import/export via CSV/XLSX, **so that** the system stays in sync with the company's HR system of record.

**Acceptance Criteria**:
- [ ] Admin can configure ERPNext credentials (base URL, API key, secret); credentials are encrypted at rest
- [ ] Admin can trigger a manual sync; the system fetches all active ERPNext employees and creates/updates/soft-deletes internal records
- [ ] Sync uses configurable field mapping (JSON document); default mapping covers all required fields
- [ ] Sync jobs are logged with status, record counts (created/updated/skipped/errors), and per-row error details
- [ ] Scheduled sync runs on a configurable cron expression
- [ ] ERPNext webhook: `POST /integrations/webhook/erpnext` with HMAC-SHA256 signature verification
- [ ] HR can upload a CSV/XLSX to import employees; a preview step shows valid/invalid rows before confirming
- [ ] File size limit: 10 MB; encoding: UTF-8; atomic import (all-or-nothing per upload)
- [ ] HR/Admin can export employees and goals to CSV or XLSX

---

## Non-Functional Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| NFR-1 | Backend API p95 ≤ 300 ms for list endpoints, ≤ 150 ms for single-resource under 50 concurrent users | Constitution §4 |
| NFR-2 | ML service p95 ≤ 500 ms for `/predict/turnover`; longer predictions queued to RabbitMQ | Constitution §4 |
| NFR-3 | Lighthouse Performance ≥ 85 on Dashboard route; bundle regressions > 10 % require justification | Constitution §4 |
| NFR-4 | Redis TTL: risk predictions 900 s; dashboard queries 300 s | Constitution §4 + research.md §4 |
| NFR-5 | No full-table scans on tables > 10 k rows; all WHERE clauses on indexed columns | Constitution §4 |
| NFR-6 | Docker images start and pass health checks within 30 s in CI | Constitution §4 |
| NFR-7 | Test coverage ≥ 80 % branch for all new server modules | Constitution §2 |
| NFR-8 | WCAG AA compliance: ARIA labels on all interactive elements; colour not the sole meaning conveyor | Constitution §3 |
