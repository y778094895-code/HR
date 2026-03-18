# API Contract: NestJS Backend (v1)

**Base URL**: `/api/v1` (via Nginx gateway on port 80)
**Auth**: `Authorization: Bearer <access_token>` on all protected routes
**Content-Type**: `application/json`
**Locale**: `Accept-Language: ar | en` (optional; falls back to user profile)

All responses follow:
```json
{ "data": <payload>, "meta": { "page": 1, "limit": 20, "total": 150 } }
```
Errors:
```json
{ "statusCode": 400, "message": "Validation failed", "errors": [{ "field": "weight", "message": "Must be ≤ 100" }] }
```

---

## Authentication

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/auth/login` | Public | Credentials → `{ accessToken, refreshToken, expiresIn }` |
| POST | `/auth/refresh` | Public | Refresh token → new access token |
| POST | `/auth/logout` | Any | Revoke refresh token |
| POST | `/auth/invite` | Admin | Send invite email to new user |
| PATCH | `/auth/me/locale` | Any | Update authenticated user's locale preference |

---

## Employees

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/employees` | HR, Admin | List employees; filters: `department`, `status`, `riskBand` |
| GET | `/employees/:id` | HR, Admin, Manager (own reports) | Employee detail |
| POST | `/employees` | HR, Admin | Create employee |
| PATCH | `/employees/:id` | HR, Admin | Update employee |
| DELETE | `/employees/:id` | Admin | Soft-delete (sets `deleted_at`) |
| GET | `/employees/:id/timeline` | HR, Manager (own) | Reverse-chronological event list (reviews, risk changes, goal completions) |

**GET /employees/:id/timeline response**:
```json
[
  { "type": "review_submitted", "occurredAt": "2026-03-10T14:22:00Z", "summary": "Self-review submitted for Q1 2026" },
  { "type": "risk_band_change", "occurredAt": "2026-02-01T09:00:00Z", "summary": "Risk band changed: medium → high" },
  { "type": "goal_completed", "occurredAt": "2026-01-15T16:45:00Z", "summary": "Goal 'Increase NPS score' marked completed" }
]
```

**GET /employees response item**:
```json
{
  "id": "uuid",
  "nameEn": "Ahmed Al-Rashidi",
  "nameAr": "أحمد الراشدي",
  "email": "ahmed@company.com",
  "department": { "id": "uuid", "name": "Engineering" },
  "jobTitle": { "id": "uuid", "name": "Senior Engineer" },
  "hireDate": "2021-06-01",
  "managerId": "uuid",
  "status": "active",
  "latestRiskBand": "medium"
}
```

---

## Goals & KPIs

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/goals` | Any (scoped) | List goals; Employee sees own; Manager sees team; HR/Admin all |
| POST | `/goals` | Employee, Manager, HR | Create goal |
| GET | `/goals/:id` | Owner, Manager, HR | Goal detail with KPIs |
| PATCH | `/goals/:id` | Owner, Manager | Update goal (status, current value) |
| DELETE | `/goals/:id` | Owner, HR | Archive if has ratings; hard-delete if draft |
| POST | `/goals/:id/kpis` | Manager, HR | Add KPI to goal |
| PATCH | `/goals/:id/kpis/:kpiId` | Employee, Manager | Update KPI current value |
| DELETE | `/goals/:id/kpis/:kpiId` | Manager, HR | Remove KPI |
| GET | `/objectives` | HR, Manager | Organisational objectives list |
| POST | `/objectives` | HR | Create org objective |
| POST | `/objectives/:id/cascade` | HR | Cascade to departments `{ departmentIds: [] }` |

**POST /goals body**:
```json
{
  "employeeId": "uuid",
  "title": "Increase customer satisfaction score",
  "description": "...",
  "category": "performance",
  "targetValue": 90,
  "unit": "%",
  "weight": 30,
  "dueDate": "2026-06-30",
  "cycleId": "uuid"
}
```

---

## Review Cycles & Reviews

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/review-cycles` | HR, Admin | List cycles |
| POST | `/review-cycles` | HR | Create cycle |
| PATCH | `/review-cycles/:id/launch` | HR | Transition to `active`; notify participants |
| PATCH | `/review-cycles/:id/close` | HR | Close cycle |
| GET | `/review-cycles/:id/participants` | HR | Participant list with status |
| POST | `/review-cycles/:id/participants` | HR | Add reviewee + assign reviewers |
| GET | `/reviews` | Any (scoped) | My pending review tasks |
| GET | `/reviews/:id` | Reviewer, HR | Review form / submitted review |
| PUT | `/reviews/:id` | Reviewer | Save draft |
| POST | `/reviews/:id/submit` | Reviewer | Submit review |
| POST | `/reviews/:id/lock` | Manager, HR | Lock and notify reviewee |
| POST | `/reviews/:id/acknowledge` | Reviewee (Employee) | Employee acknowledges locked review |
| GET | `/review-cycles/:id/report/:employeeId` | HR, Manager (own reports) | Aggregated report for one reviewee |

**GET /review-cycles/:id/report/:employeeId response**:
```json
{
  "reviewee": { "id": "uuid", "nameEn": "..." },
  "cycle": { "id": "uuid", "name": "Q1 2026" },
  "compositeScore": 3.8,
  "goalAttainmentPct": 74.5,
  "sectionScores": [
    { "key": "leadership", "labelEn": "Leadership", "labelAr": "القيادة", "weightedScore": 4.1 }
  ],
  "peerComments": ["Strong collaborator", "Meets deadlines"],
  "status": "locked"
}
```

---

## Risk Scores & Predictions

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/risk/employees/:id` | HR, Admin, Manager (own) | Latest risk score + features |
| POST | `/risk/employees/:id/predict` | HR, Admin | Trigger sync prediction (queues if > 500 ms) |
| POST | `/risk/batch` | HR, Admin | Trigger batch re-score for all stale employees (or a department) |
| GET | `/risk/heatmap` | HR, Admin | All employees risk bands (no individual score to peers) |
| GET | `/risk/employees/:id/history` | HR, Admin | Historical risk scores over time |

**POST /risk/batch body** (optional filter):
```json
{ "departmentId": "uuid", "staleOnly": true }
```
**POST /risk/batch response 202**:
```json
{ "batchId": "uuid", "employeeCount": 87, "message": "Batch prediction queued" }
```

**GET /risk/employees/:id response**:
```json
{
  "employeeId": "uuid",
  "score": 72,
  "band": "high",
  "isStale": false,
  "predictedAt": "2026-03-18T09:00:00Z",
  "modelVersion": "rf-v2.1.0",
  "features": [
    {
      "key": "salary_gap",
      "labelEn": "Salary below market median",
      "labelAr": "الراتب أقل من متوسط السوق",
      "impact": 18.2,
      "direction": "positive"
    }
  ]
}
```

---

## Recommendations & Training

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/recommendations/employees/:id` | HR, Manager (own) | List recommendations for employee |
| PATCH | `/recommendations/:id/action` | Manager, HR | Mark actioned `{ note: "..." }` |
| PATCH | `/recommendations/:id/dismiss` | Manager, HR | Mark dismissed `{ note: "..." }` |
| GET | `/training/employees/:id` | HR, Manager, Employee (own) | Training suggestions |
| PATCH | `/training/:id/enroll` | Employee | Mark enrolled |
| PATCH | `/training/:id/complete` | HR, Manager | Mark completed |
| GET | `/recommendations/department/:deptId` | HR | Bulk view — all open interventions by dept |

---

## Analytics & Fairness

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/dashboard` | Any (scoped by role) | Dashboard KPIs for current user's role |
| GET | `/analytics/department/:id` | HR, Manager | Department performance summary |
| GET | `/analytics/fairness` | HR | List fairness runs |
| POST | `/analytics/fairness` | HR | Generate fairness report `{ cycleId, attribute }` |
| GET | `/analytics/fairness/:id` | HR | Fairness run detail with results |
| GET | `/analytics/export` | HR, Admin | Export analytics to CSV/XLSX `?format=csv&type=employees` |

**GET /analytics/dashboard (HR role) response**:
```json
{
  "role": "hr",
  "kpis": {
    "totalEmployees": 340,
    "atRiskCount": 28,
    "activeCycles": 2,
    "avgGoalCompletion": 71.3
  },
  "riskHeatmap": [
    { "departmentId": "uuid", "departmentName": "Engineering", "critical": 2, "high": 8, "medium": 14, "low": 36 }
  ],
  "equityMetrics": {
    "genderPayGapPct": -6.2,
    "genderRatingGapPct": 0.4
  }
}
```

---

## Integrations & Import-Export

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/integrations/config` | Admin | Current integration configs |
| PUT | `/integrations/config/:provider` | Admin | Save/update integration credentials |
| POST | `/integrations/sync/:provider` | Admin | Trigger manual sync |
| GET | `/integrations/sync/jobs` | Admin | List sync jobs |
| GET | `/integrations/sync/jobs/:id` | Admin | Sync job detail + errors |
| POST | `/import/employees` | HR, Admin | Upload CSV/XLSX `multipart/form-data` |
| POST | `/import/goals` | HR | Upload goals CSV/XLSX |
| GET | `/export/employees` | HR, Admin | Export employees |
| GET | `/export/goals` | HR, Manager | Export goals |

**POST /import/employees response** (preview step):
```json
{
  "jobId": "uuid",
  "preview": [
    { "row": 1, "nameEn": "Sara Ahmed", "email": "sara@co.com", "valid": true },
    { "row": 2, "nameEn": "", "email": "bad-email", "valid": false, "errors": ["nameEn required", "Invalid email"] }
  ],
  "summary": { "total": 500, "valid": 498, "invalid": 2 }
}
```

---

## Notifications

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/notifications` | Any | User's notifications (paginated) |
| PATCH | `/notifications/:id/read` | Any | Mark read |
| PATCH | `/notifications/read-all` | Any | Mark all read |

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | `{ status: "ok", db: "ok", redis: "ok", queue: "ok" }` |
