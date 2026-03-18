# Feature Specification: Intelligent HR Performance Analysis & Management System

**Feature Branch**: `001-intelligent-hr-performance-system`
**Created**: 2026-03-18
**Status**: Draft
**Authors**: agy (AI), Product Team
**Constitution Version**: 1.0.0

---

## User Scenarios & Testing *(mandatory)*

> Stories are ordered by priority. Each story is independently testable and delivers standalone value.

---

### User Story 1 — Goal & KPI Tracking (Priority: P1)

**As** an Employee, Manager, or HR officer,
**I want** to create, assign, and track goals and KPIs across review cycles,
**So that** performance expectations are explicit, measurable, and aligned with organisational objectives.

**Why this priority**: Goals are the foundation of every other feature — reviews, dashboards, AI predictions, and recommendations all require structured goal data. Without this, the system has no performance signal.

**Independent Test**: An Employee can create a personal goal, a Manager can add a KPI to a direct report's goal, and both can see real-time progress percentage on the Goals page — with no AI, review, or dashboard feature required.

**Acceptance Scenarios**:

1. **Given** an authenticated Employee, **When** they navigate to "My Goals" and submit a new goal with title, description, target value, unit, due date, and weight, **Then** the goal appears in their list with status "In Progress" and 0 % completion.
2. **Given** a Manager viewing a direct report's goal list, **When** they add a KPI (metric name, target, measurement frequency), **Then** the KPI is linked to the goal and visible to both the Employee and the Manager.
3. **Given** an Employee with an active goal, **When** they update the current value of a KPI, **Then** completion percentage recalculates automatically and the Manager sees the change on their team overview.
4. **Given** a goal past its due date with < 100 % completion, **When** any stakeholder views it, **Then** the goal is marked "Overdue" with a visual indicator.
5. **Given** an HR officer, **When** they set an organisational objective and cascade it to departments, **Then** Managers in those departments see the objective and can align team goals to it.

**Edge Cases**:
- Goal with weight > 100 % or total weights per employee exceeding 100 % must be rejected with a validation error.
- Deleting a goal that already has review ratings must be blocked; archiving is allowed instead.
- Goals must be accessible in both Arabic and English; all field labels switch locale without data loss.

---

### User Story 2 — Performance Reviews & 360° Feedback (Priority: P1)

**As** HR or a Manager,
**I want** to launch structured review cycles (self-assessment, manager review, peer/360° feedback),
**So that** employees receive holistic, multi-source evaluations that feed career development plans.

**Why this priority**: Reviews are the primary data event in the performance lifecycle. AI predictions and recommendations depend on completed review data; dashboards are incomplete without it.

**Independent Test**: HR can open a review cycle, assign reviewers (self + manager + 2 peers), all reviewers submit ratings and comments, the system aggregates scores, and a final review report is visible — without the AI module running.

**Acceptance Scenarios**:

1. **Given** an HR Admin, **When** they create a review cycle (name, period, type: Annual / Mid-year / Quarterly, review template), **Then** the cycle appears in the HR dashboard with status "Scheduled".
2. **Given** a launched review cycle, **When** the system notifies participants via in-app notification and email, **Then** each reviewer sees only their assigned review forms (self, manager, peer) and cannot see other reviewers' responses before submission.
3. **Given** a 360° review with peer reviewers selected, **When** a peer submits competency ratings and open-text feedback, **Then** the peer's identity is anonymised in the aggregated report visible to the reviewee.
4. **Given** all reviewers have submitted, **When** HR or the Manager views the final report, **Then** the report shows weighted composite scores per competency, goal attainment percentage, and verbatim comments grouped by reviewer type (self / manager / peer — anonymous).
5. **Given** a submitted review, **When** a Manager marks it as "Calibrated", **Then** the final rating is locked and the Employee is notified to acknowledge the review.
6. **Given** a review cycle deadline, **When** a reviewer has not submitted by the due date, **Then** the system sends an automated reminder and flags the overdue review to HR.

**Edge Cases**:
- Employees on leave during the review window must be excludable per cycle.
- Peer reviewer pool must have at least 3 peers selected to preserve anonymity; fewer must trigger a warning.
- Review templates must support both Arabic and English field labels per locale setting.

---

### User Story 3 — AI Turnover / Attrition Risk Prediction (Priority: P1)

**As** an HR officer or Manager,
**I want** the system to calculate each employee's turnover risk score with explainable contributing factors,
**So that** I can prioritise retention actions before high-value employees leave.

**Why this priority**: This is the core AI differentiator of the product. Attrition is expensive; early intervention requires a reliable, explainable risk signal.

**Independent Test**: HR can open an employee's risk profile page and see: a risk score (0–100), a risk band (Low / Medium / High / Critical), the top 5 contributing factors with their directional impact, and a timestamp of last prediction — all without navigating to any other feature.

**Acceptance Scenarios**:

1. **Given** an employee record with ≥ 6 months of data (tenure, attendance, salary positioning, performance trend, engagement), **When** the ML service computes a prediction, **Then** the risk score updates in the backend and is cached in Redis for 15 minutes.
2. **Given** a risk score is displayed, **When** HR or a Manager views it, **Then** they see: numeric score, band label with colour coding (green / amber / orange / red), and ranked feature contributions (e.g., "Salary below market median: +18 pts").
3. **Given** an employee's underlying data changes (e.g., new performance review submitted), **When** the change is saved, **Then** a re-prediction job is enqueued to RabbitMQ and the stale cache entry is invalidated.
4. **Given** the ML service is unavailable, **When** the backend requests a prediction, **Then** the last cached score is returned with a "stale" indicator; if no cache exists, a "prediction unavailable" placeholder is shown — the app does not error.
5. **Given** an HR officer, **When** they view the team or department risk heatmap, **Then** all employees are listed with their risk band, sortable and filterable, with no individual-level data exposed to peers.

**Edge Cases**:
- Employees with < 6 months tenure must show "Insufficient data" rather than a fabricated score.
- Risk scores must not be visible to the employee themselves — only to HR, Manager (for their reports), and Admins.
- Prediction latency > 500 ms p95 must trigger async queue delivery with a loading indicator.

---

### User Story 4 — AI Recommendations, Intervention Plans & Training Paths (Priority: P2)

**As** a Manager or HR officer,
**I want** the AI to generate specific, actionable retention interventions and training suggestions per employee,
**So that** I have a concrete starting point for career conversations and development planning.

**Why this priority**: Risk scores without actions are insight without impact. Recommendations close the loop between prediction and response.

**Independent Test**: A Manager can open an employee's development panel and see at least one AI-generated intervention card (e.g., "Schedule a salary review: employee's base is 12 % below department median") and one training suggestion (e.g., "Recommended: Project Management Fundamentals course") — and mark each as "Actioned" or "Dismissed" with a note.

**Acceptance Scenarios**:

1. **Given** an employee with a computed risk score, **When** the ML service generates recommendations, **Then** at least 3 intervention suggestions are returned, each with: title, rationale, expected risk reduction, effort level (Low/Medium/High), and owner role (Manager / HR).
2. **Given** an employee's performance gaps (goal completion < 70 % in a competency), **When** the system generates training suggestions, **Then** each suggestion links to a training category or external resource relevant to the gap.
3. **Given** a Manager views an intervention, **When** they mark it "Actioned" and add a note, **Then** the action is timestamped, stored, and visible in the employee's timeline.
4. **Given** an HR officer, **When** they bulk-view interventions across a department, **Then** they see a summary of open/actioned/dismissed interventions per employee, exportable to Excel.
5. **Given** an intervention is actioned and 30 days pass, **When** the next risk prediction runs, **Then** the recommendation engine assesses whether the risk score moved and surfaces a follow-up nudge if not.

**Edge Cases**:
- Recommendations must not reference protected attributes (gender, age, nationality) as intervention levers.
- If the ML service cannot generate recommendations, a static rule-based fallback (salary band check, tenure milestone check) must fire instead.

---

### User Story 5 — Dashboards & Reports (Priority: P2)

**As** any authenticated user (scoped by role),
**I want** role-appropriate dashboards with KPI cards, charts, and drill-downs,
**So that** I can make data-driven decisions at a glance.

**Why this priority**: Dashboards are the primary daily touchpoint and the surface where all other features converge visually.

**Independent Test**: Each role (Employee, Manager, HR, Admin) can log in and see a dashboard with at least 4 populated KPI cards and one chart that reflects real data — without needing to configure anything.

**Acceptance Scenarios**:

1. **Given** an Employee logs in, **When** the dashboard loads, **Then** they see: goal completion %, current review status, next review date, and training suggestions count — all scoped to themselves.
2. **Given** a Manager logs in, **When** the dashboard loads, **Then** they see: team average goal completion, headcount by risk band (without individual names shown unless they drill in), pending review tasks, and top 3 employees needing attention.
3. **Given** an HR officer, **When** they open the HR Analytics dashboard, **Then** they see: department-level attrition risk heatmap, average performance distribution, gender equity metrics (pay gap %, review rating gap), and active review cycles status.
4. **Given** an Admin, **When** they view the System dashboard, **Then** they see: user counts by role, ERPNext sync status, ML service health, last migration timestamp, and audit log summary.
5. **Given** any dashboard widget, **When** a user clicks "Export", **Then** the underlying data downloads as a CSV or Excel file within 5 seconds.
6. **Given** the UI locale is set to Arabic, **When** any dashboard renders, **Then** all labels, numbers, and chart axes display in Arabic with RTL layout; no English text bleeds through except proper nouns.

**Edge Cases**:
- Dashboard must show a "No data yet" state for new tenants with zero employees — no broken charts.
- Large datasets (> 10 k employees) must paginate or virtualise — no full-table render on the client.

---

### User Story 6 — Fairness Metrics & Explainable AI (Priority: P2)

**As** an HR officer,
**I want** to see fairness reports that detect adverse impact across demographic groups,
**So that** I can ensure review outcomes and risk scores are equitable and defensible to auditors.

**Why this priority**: Legal and ethical obligation; also a key differentiator for enterprise HR buyers.

**Independent Test**: HR can navigate to "Fairness Report", select a review cycle and a protected attribute (gender), and see: selection rate ratio, statistical significance flag, and a plain-language explanation — without any other feature being used.

**Acceptance Scenarios**:

1. **Given** completed review cycle data, **When** HR generates a fairness report for gender, **Then** the report shows average performance ratings by gender, the Adverse Impact Ratio (AIR), and a flag if AIR < 0.8 (4/5ths rule).
2. **Given** an AI risk score, **When** HR views the explainability panel, **Then** SHAP-style feature attributions show each factor's contribution in natural language (e.g., "Long tenure in current role: −5 pts risk").
3. **Given** a fairness flag is raised, **When** HR views the detail, **Then** a plain-language explanation and suggested audit steps are displayed — not raw statistical jargon.
4. **Given** an HR officer, **When** they export the fairness report, **Then** the export includes all metrics, group sizes, and a compliance disclaimer footer.

**Edge Cases**:
- Groups with < 5 members must be suppressed from fairness reports to protect privacy.
- Fairness reports must not store raw demographic data in browser localStorage or cookies.

---

### User Story 7 — Arabic / English Bilingual UI (Priority: P2)

**As** any user,
**I want** to switch the UI between Arabic (RTL) and English (LTR) at any time,
**So that** the system is usable by all employees regardless of language preference.

**Why this priority**: Explicit product requirement; any page that breaks in Arabic is a blocker for Arabic-speaking markets.

**Independent Test**: A user can toggle locale in Settings; every page, form, chart, and notification then re-renders in the selected language with correct text directionality and no layout breakage.

**Acceptance Scenarios**:

1. **Given** a user sets locale to Arabic, **When** any page loads, **Then** the `<html>` element has `dir="rtl" lang="ar"`, Tailwind RTL classes apply, and all navigation, labels, and form fields display in Arabic.
2. **Given** a user switches locale mid-session, **When** the locale is saved, **Then** the preference persists across logout/login and all pages honour it.
3. **Given** a chart or data table in Arabic locale, **When** it renders, **Then** numeric formats use Arabic-Indic digits if the locale setting specifies, and date formats follow the Arabic locale convention.

**Edge Cases**:
- Missing translation keys must fall back to English, not show a raw key string.
- RTL layout must not break PDF exports — exported reports must detect locale and apply mirroring.

---

### User Story 8 — HRIS / ERP Integration & CSV/Excel Import-Export (Priority: P3)

**As** an HR Admin,
**I want** to sync employee records from ERPNext (and other HRIS systems) via REST API, and import/export data via CSV/Excel,
**So that** the system stays in sync with the source-of-truth HRIS without manual data entry.

**Why this priority**: Reduces data ops burden and is a hard requirement for enterprise customers who already have an HRIS. Ranked P3 because manual entry can be a temporary substitute during early rollout.

**Independent Test**: An Admin can configure an ERPNext API endpoint and credentials in Settings, trigger a manual sync, and see the imported employees appear in the employee list — with a sync log showing success/failure counts.

**Acceptance Scenarios**:

1. **Given** an Admin provides a valid ERPNext base URL and API token, **When** they trigger a manual sync, **Then** the system fetches employees from ERPNext's `Employee` doctype, upserts them into the local DB, and displays a sync summary (created, updated, skipped, errors).
2. **Given** an automated sync schedule (configurable: daily / hourly), **When** the cron fires, **Then** a sync job is enqueued in RabbitMQ and processed in the background without blocking the API.
3. **Given** a field mapping mismatch (e.g., ERPNext's `date_of_joining` → internal `hireDate`), **When** the mapping config is defined in Settings, **Then** the transformer applies it during every sync without code changes.
4. **Given** an HR officer, **When** they upload a CSV/Excel file of employees or goals, **Then** the system validates headers, previews the first 5 rows, reports validation errors per row, and on confirmation imports valid rows atomically.
5. **Given** any data table in the system, **When** a user clicks "Export to Excel", **Then** the file downloads with proper column headers in the active locale, formatted dates, and no password or sensitive fields exposed.
6. **Given** an integration failure (ERPNext unreachable), **When** the sync job runs, **Then** it retries 3 times with exponential backoff, then marks the job "Failed" with the error message in the sync log — no silent failure.

**Edge Cases**:
- CSV imports must reject files > 10 MB with a clear error.
- Deleted employees in ERPNext must be soft-deleted (not hard-deleted) in the local DB to preserve review history.
- API tokens must be stored encrypted at rest; they must never appear in logs or API responses.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Roles**

- **FR-001**: System MUST support four roles — Employee, Manager, HR, Admin — with role-based access control enforced server-side on every API endpoint.
- **FR-002**: System MUST support JWT-based authentication with refresh tokens; sessions expire after 8 hours of inactivity.
- **FR-003**: Admins MUST be able to invite users, assign/change roles, and deactivate accounts.

**Goals & KPIs**

- **FR-004**: System MUST allow Employees and Managers to create goals with: title, description, category, target value, current value, unit, weight (%), due date, and status.
- **FR-005**: System MUST support KPI attachment to goals with measurement frequency (daily / weekly / monthly).
- **FR-006**: System MUST calculate goal completion percentage automatically from current vs. target value.
- **FR-007**: HR MUST be able to define organisational objectives and cascade them to departments.

**Performance Reviews**

- **FR-008**: System MUST support configurable review cycles with: name, period, type (Annual/Mid-year/Quarterly), template, and participant assignment.
- **FR-009**: System MUST support 360° reviews with self, manager, and peer reviewer types; peer identities MUST be anonymised in reports.
- **FR-010**: Review templates MUST be configurable: competency categories, rating scales (1–5 or custom), and open-text fields.
- **FR-011**: System MUST send automated reminders for upcoming and overdue review submissions.
- **FR-012**: Final review ratings MUST be lockable by Manager or HR; locked reviews generate an employee acknowledgement notification.

**AI & ML**

- **FR-013**: System MUST compute turnover risk scores (0–100) for all employees with ≥ 6 months of data via the FastAPI ML service.
- **FR-014**: Risk scores MUST include ranked feature contributions (SHAP values or equivalent) in human-readable format.
- **FR-015**: System MUST generate at least 3 actionable intervention recommendations per at-risk employee.
- **FR-016**: System MUST suggest training paths based on performance gaps from review data.
- **FR-017**: AI outputs MUST include fairness metrics: Adverse Impact Ratio per protected attribute per review cycle.
- **FR-018**: Predictions MUST be cached in Redis (TTL: 15 min); cache MUST be invalidated on employee data changes.

**Dashboards & Reports**

- **FR-019**: System MUST provide role-scoped dashboards with KPI cards, trend charts, and drill-down navigation.
- **FR-020**: All dashboard data MUST be exportable to CSV and Excel.
- **FR-021**: HR MUST have access to a fairness/equity report covering pay gap, review rating gap, and promotion rate by demographic group.

**Localisation**

- **FR-022**: System MUST support Arabic (RTL) and English (LTR) UI; locale is user-selectable and persists.
- **FR-023**: All user-facing strings MUST be externalised to translation files (i18next or equivalent); no hard-coded UI text.
- **FR-024**: Date, number, and currency formats MUST follow the active locale.

**Integration**

- **FR-025**: System MUST integrate with ERPNext via REST API: sync `Employee` records with configurable field mapping.
- **FR-026**: Integration credentials MUST be stored encrypted; never logged or returned in API responses.
- **FR-027**: System MUST support CSV and Excel import for employees, goals, and historical review data.
- **FR-028**: Sync jobs MUST use RabbitMQ for async processing with retry logic (3 retries, exponential backoff).

### Non-Functional Requirements

- **NFR-001**: Backend API p95 response ≤ 300 ms (list), ≤ 150 ms (single resource) under 50 concurrent users.
- **NFR-002**: ML `/predict/turnover` p95 ≤ 500 ms; async queue fallback for longer predictions.
- **NFR-003**: Frontend Lighthouse Performance score ≥ 85 on Dashboard route.
- **NFR-004**: System MUST support HTTPS only in production; all HTTP redirected to HTTPS.
- **NFR-005**: All PII must be encrypted at rest (PostgreSQL) and in transit (TLS 1.2+).
- **NFR-006**: System MUST be containerised (Docker Compose) and deployable on a single VPS or Kubernetes.

### Key Entities

- **Employee**: Core HR record — id, name (ar/en), email, department, role, hireDate, salary, managerId, erpNextId, status.
- **Goal**: title, description, category, targetValue, currentValue, unit, weight, dueDate, status, employeeId, cycleId.
- **KPI**: name, targetValue, currentValue, unit, measurementFrequency, goalId.
- **ReviewCycle**: name, type, startDate, endDate, templateId, status.
- **Review**: cycleId, revieweeId, reviewerId, reviewerType (self/manager/peer), scores (JSON), comments (JSON), status, submittedAt.
- **RiskScore**: employeeId, score, band, features (JSON SHAP values), predictedAt, modelVersion, isStale.
- **Recommendation**: employeeId, riskScoreId, type, title, rationale, effortLevel, ownerRole, status, actionedAt, note.
- **SyncJob**: provider, status, startedAt, completedAt, created, updated, skipped, errors (JSON).
- **AuditLog**: userId, action, entity, entityId, before (JSON), after (JSON), timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An Employee can create a goal, a Manager can add a KPI, and goal completion recalculates in < 1 second — end-to-end in E2E tests.
- **SC-002**: HR can launch a 360° review cycle, all reviewers submit, and the aggregated report renders — completing the full flow in Playwright without manual intervention.
- **SC-003**: Turnover risk scores are returned for 95 % of eligible employees (≥ 6 months tenure) with p95 latency ≤ 500 ms.
- **SC-004**: Each risk score displays ≥ 3 ranked feature contributions in human-readable sentences in both English and Arabic.
- **SC-005**: Fairness reports detect adverse impact (AIR < 0.8) when seeded with intentionally imbalanced test data.
- **SC-006**: Switching locale from English to Arabic re-renders the entire app in RTL with 0 missing translation keys logged to the console.
- **SC-007**: ERPNext sync ingests 500 employee records in < 60 seconds via the async queue.
- **SC-008**: CSV import of 1,000 employee rows completes with per-row validation feedback in < 10 seconds.
- **SC-009**: Backend API suite (unit + integration) achieves ≥ 80 % branch coverage; all tests pass in CI.
- **SC-010**: Lighthouse Performance score ≥ 85 on the Dashboard route in a production build, verified in CI.
- **SC-011**: Dashboard KPI cards for all four roles are populated with non-zero data in the seeded staging environment.
- **SC-012**: Zero critical or high Snyk/OWASP vulnerabilities in production Docker images at time of first deployment.

---

## Open Questions & Deferred Decisions

| # | Question | Owner | Target Date |
|---|----------|-------|-------------|
| OQ-1 | Should employees be able to see their own historical risk trend (opt-in)? | Product | 2026-04-01 |
| OQ-2 | Which LMS platforms should training path links integrate with (Udemy, Coursera, internal)? | Product | 2026-04-01 |
| OQ-3 | Should peer reviewer selection be done by the employee, their manager, or HR? | HR SME | 2026-03-25 |
| OQ-4 | Is Arabic-Indic digit formatting required or Arabic locale with Western digits? | Localisation | 2026-03-25 |
| OQ-5 | Multi-tenancy (SaaS) vs. single-tenant deployment — affects DB schema isolation strategy | Architecture | 2026-04-15 |
| OQ-6 | What is the canonical model versioning strategy for the ML service between releases? | ML Lead | 2026-04-01 |

---

*Constitution alignment check: this spec is compliant with v1.0.0 — Code Quality (FR-001–028), Testing Standards (SC-001–012), UX Consistency (FR-022–024, US-7), Performance Requirements (NFR-001–003, SC-003, SC-007).*
