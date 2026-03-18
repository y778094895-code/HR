# Data Model: Intelligent HR Performance System

**Phase**: 1 — Design
**Date**: 2026-03-18
**ORM**: Drizzle — `postgres/migrations/` (chain 0000–0021 + new)
**Existing migrations noted** — new tables/columns call out which migration they extend or follow.

---

## Entity Map (overview)

```
User ──────────────────── Employee (1:1)
  │                           │
  │              ┌────────────┼────────────────┐
  │              │            │                │
  │            Goal ────── KPI        ReviewCycle
  │           (many)       (many)         │
  │                                  ReviewParticipant
  │                                       │
  │                               Review (submission)
  │                                   ratings: JSONB
  │                                   (keyed by template section)
  │
  ├── RiskScore ──────── features: JSONB (SHAP values array)
  │        │
  │   Recommendation ── status: ENUM (open|actioned|dismissed|expired)
  │
  ├── TrainingSuggestion
  ├── FairnessRun
  ├── Notification
  ├── SyncJob
  ├── IntegrationConfig
  └── AuditLog
```

---

## Core Entities

### `users`
Extends existing auth table (migration 0002).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `email` | `varchar(255)` UNIQUE | |
| `password_hash` | `varchar(255)` | bcrypt |
| `role` | `user_role` ENUM | `employee \| manager \| hr \| admin` |
| `locale` | `varchar(10)` | `en` or `ar`, default `en` |
| `is_active` | `boolean` | default `true` |
| `mfa_enabled` | `boolean` | default `false` (migration 0020) |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### `employees`
Extends migration 0003 (`hr_master_tables`).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `users` | nullable (HR-created before invite) |
| `name_en` | `varchar(255)` | |
| `name_ar` | `varchar(255)` | |
| `email` | `varchar(255)` | |
| `department_id` | `uuid` FK → `departments` | |
| `job_title_id` | `uuid` FK → `job_titles` | |
| `manager_id` | `uuid` FK → `employees` | self-referential, nullable |
| `hire_date` | `date` | |
| `salary` | `numeric(14,2)` | |
| `salary_currency` | `varchar(3)` | ISO 4217, default `SAR` |
| `erp_next_id` | `varchar(100)` | nullable; ERPNext `name` field |
| `status` | `employee_status` ENUM | `active \| on_leave \| terminated` |
| `deleted_at` | `timestamptz` | soft-delete |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Indexes**: `(department_id)`, `(manager_id)`, `(erp_next_id)`, `(status)`, `(hire_date)`

---

### `goals`
New module — new migration after 0021.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `employee_id` | `uuid` FK → `employees` | |
| `cycle_id` | `uuid` FK → `review_cycles` | nullable (standalone goal) |
| `parent_objective_id` | `uuid` FK → `org_objectives` | nullable |
| `title` | `varchar(500)` | |
| `description` | `text` | |
| `category` | `varchar(100)` | e.g., `performance`, `development`, `operational` |
| `target_value` | `numeric(14,4)` | |
| `current_value` | `numeric(14,4)` | default 0 |
| `unit` | `varchar(50)` | e.g., `%`, `count`, `revenue` |
| `weight` | `numeric(5,2)` | 0–100; total per employee per cycle must ≤ 100 |
| `due_date` | `date` | |
| `status` | `goal_status` ENUM | `draft \| in_progress \| overdue \| completed \| archived` |
| `created_by` | `uuid` FK → `users` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Validation**: DB `CHECK (weight >= 0 AND weight <= 100)`. Application-level sum check per employee.
**Indexes**: `(employee_id, status)`, `(cycle_id)`, `(due_date)`

---

### `kpis`
Child of `goals`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `goal_id` | `uuid` FK → `goals` ON DELETE RESTRICT | |
| `name` | `varchar(255)` | |
| `target_value` | `numeric(14,4)` | |
| `current_value` | `numeric(14,4)` | |
| `unit` | `varchar(50)` | |
| `measurement_frequency` | `kpi_frequency` ENUM | `daily \| weekly \| monthly` |
| `last_updated_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |

---

### `org_objectives`
Organisational objectives cascaded from HR to departments.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `title` | `varchar(500)` | |
| `description` | `text` | |
| `owner_id` | `uuid` FK → `users` | HR user |
| `target_date` | `date` | |
| `status` | `objective_status` ENUM | `active \| closed` |
| `created_at` | `timestamptz` | |

### `objective_departments` (join table)
`objective_id` FK, `department_id` FK — many-to-many cascade.

---

### `review_cycles`
Extends migration 0007.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `varchar(255)` | |
| `type` | `cycle_type` ENUM | `annual \| mid_year \| quarterly` |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `template_id` | `uuid` FK → `review_templates` | |
| `status` | `cycle_status` ENUM | `scheduled \| active \| calibration \| closed` |
| `created_by` | `uuid` FK → `users` | |
| `created_at` | `timestamptz` | |

---

### `review_templates`
Configurable competency framework per cycle.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `varchar(255)` | |
| `rating_scale` | `smallint` | 1–5 default; custom max |
| `sections` | `jsonb` | `[{ "key": "leadership", "label_en": "...", "label_ar": "...", "weight": 30 }]` |
| `open_text_enabled` | `boolean` | |
| `created_at` | `timestamptz` | |

---

### `review_participants`
Who is reviewed in a cycle, and who their reviewers are.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `cycle_id` | `uuid` FK → `review_cycles` | |
| `reviewee_id` | `uuid` FK → `employees` | |
| `reviewer_id` | `uuid` FK → `employees` | |
| `reviewer_type` | `reviewer_type` ENUM | `self \| manager \| peer` |
| `status` | `participant_status` ENUM | `pending \| in_progress \| submitted \| overdue` |
| `assigned_at` | `timestamptz` | |

**Constraint**: UNIQUE `(cycle_id, reviewee_id, reviewer_id)`
**Indexes**: `(cycle_id, reviewee_id)`, `(reviewer_id, status)`

---

### `reviews`
The completed review submission.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `participant_id` | `uuid` FK → `review_participants` | |
| `ratings` | `jsonb` | `{ "leadership": 4, "technical": 3, … }` — keys match template sections |
| `comments` | `jsonb` | `{ "leadership": "...", "overall": "..." }` |
| `goal_attainment_pct` | `numeric(5,2)` | computed from goals at submit time |
| `composite_score` | `numeric(5,2)` | weighted average of ratings |
| `status` | `review_status` ENUM | `draft \| submitted \| calibrated \| locked \| acknowledged` |
| `submitted_at` | `timestamptz` | |
| `locked_at` | `timestamptz` | |
| `locked_by` | `uuid` FK → `users` | |
| `acknowledged_at` | `timestamptz` | |

---

### `risk_scores`
Extends migration 0009.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `employee_id` | `uuid` FK → `employees` | |
| `score` | `numeric(5,2)` | 0–100 |
| `band` | `risk_band` ENUM | `low \| medium \| high \| critical` |
| `features` | `jsonb` | SHAP values: `[{ "name": "salary_gap", "value": 0.18, "direction": "positive", "label_en": "...", "label_ar": "..." }]` |
| `model_version` | `varchar(50)` | e.g., `rf-v2.1.0` |
| `is_stale` | `boolean` | default `false`; set `true` on employee data write |
| `predicted_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |

**Indexes**: `(employee_id, predicted_at DESC)`, `(band)`, `(is_stale)`
**Redis key**: `risk:employee:{employee_id}` → `score + band + features` (TTL 900 s)

---

### `recommendations`
Extends migration 0010.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `employee_id` | `uuid` FK → `employees` | |
| `risk_score_id` | `uuid` FK → `risk_scores` | nullable |
| `source` | `rec_source` ENUM | `ml \| rule_based` |
| `type` | `rec_type` ENUM | `compensation \| recognition \| career \| workload \| training \| engagement` |
| `title` | `varchar(500)` | |
| `rationale` | `text` | |
| `expected_risk_reduction` | `numeric(5,2)` | percentage points |
| `effort_level` | `effort_level` ENUM | `low \| medium \| high` |
| `owner_role` | `user_role` ENUM | `manager \| hr` |
| `status` | `rec_status` ENUM | `open \| actioned \| dismissed \| expired` |
| `actioned_at` | `timestamptz` | |
| `actioned_by` | `uuid` FK → `users` | |
| `note` | `text` | manager/HR note |
| `created_at` | `timestamptz` | |

**Indexes**: `(employee_id, status)`, `(risk_score_id)`

---

### `training_suggestions`
AI-generated training paths from performance gaps.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `employee_id` | `uuid` FK → `employees` | |
| `cycle_id` | `uuid` FK → `review_cycles` | |
| `category` | `varchar(100)` | e.g., `Leadership`, `Technical Skills` |
| `title` | `varchar(500)` | |
| `description` | `text` | |
| `resource_url` | `varchar(2048)` | nullable |
| `gap_competency` | `varchar(100)` | links to template section key |
| `gap_score` | `numeric(5,2)` | actual score that triggered suggestion |
| `status` | `training_status` ENUM | `suggested \| enrolled \| completed \| dismissed` |
| `created_at` | `timestamptz` | |

---

### `fairness_runs`
Extends migration 0011.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `cycle_id` | `uuid` FK → `review_cycles` | |
| `protected_attribute` | `varchar(50)` | `gender`, `nationality`, etc. |
| `run_at` | `timestamptz` | |
| `results` | `jsonb` | array of group metrics (see below) |
| `has_flag` | `boolean` | true if any AIR < 0.8 |
| `requested_by` | `uuid` FK → `users` | |

**`results` jsonb shape**:
```json
[
  {
    "group": "female",
    "n": 42,
    "avg_rating": 3.7,
    "selection_rate": 0.62,
    "air": 0.89,
    "flagged": false,
    "p_value": 0.12
  }
]
```

*Groups with n < 5 are omitted from results.*

---

### `notifications`
Created in migration 0012; extended in migration 0025.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `users` | |
| `type` | `notification_type` ENUM | `review_assigned \| review_overdue \| review_locked \| risk_alert \| sync_completed` |
| `title_en` | `varchar(255)` | exists since migration 0012 |
| `title_ar` | `varchar(255)` | **added in migration 0025** via `ALTER TABLE` |
| `body_en` | `text` | exists since migration 0012 |
| `body_ar` | `text` | **added in migration 0025** via `ALTER TABLE` |
| `is_read` | `boolean` | default `false` |
| `created_at` | `timestamptz` | |
| `read_at` | `timestamptz` | |

**Index**: `(user_id, is_read, created_at DESC)`

---

### `sync_jobs`
Extends migration 0015.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `provider` | `varchar(50)` | `erpnext`, `csv`, `excel` |
| `trigger` | `sync_trigger` ENUM | `manual \| scheduled \| webhook` |
| `status` | `job_status` ENUM | `queued \| running \| completed \| failed \| partial` |
| `started_at` | `timestamptz` | |
| `completed_at` | `timestamptz` | |
| `records_created` | `integer` | |
| `records_updated` | `integer` | |
| `records_skipped` | `integer` | |
| `errors` | `jsonb` | `[{ "row": 3, "field": "email", "message": "..." }]` |
| `initiated_by` | `uuid` FK → `users` | nullable for scheduled |

---

### `integration_configs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `provider` | `varchar(50)` | `erpnext` |
| `base_url` | `varchar(2048)` | |
| `api_key_enc` | `text` | AES-256-GCM encrypted at rest |
| `api_secret_enc` | `text` | AES-256-GCM encrypted at rest |
| `field_mapping` | `jsonb` | `{ "date_of_joining": "hire_date", … }` |
| `sync_schedule` | `varchar(50)` | cron expression e.g. `0 2 * * *` |
| `is_active` | `boolean` | |
| `last_synced_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### `audit_logs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `users` | nullable for system actions |
| `action` | `varchar(100)` | e.g., `goal.create`, `review.lock`, `risk.predict` |
| `entity` | `varchar(100)` | table name |
| `entity_id` | `uuid` | |
| `before` | `jsonb` | snapshot before change |
| `after` | `jsonb` | snapshot after change |
| `ip_address` | `inet` | |
| `created_at` | `timestamptz` | |

**Index**: `(entity, entity_id)`, `(user_id, created_at DESC)`, `(created_at DESC)` BRIN

---

## State Transitions

### Goal Status
```
draft → in_progress → completed
             │              │
             └── overdue ───┘
             │
             └── archived  (from any non-completed state, if has ratings)
```

### Review Cycle Status
```
scheduled → active → calibration → closed
```

### Review Status
```
draft → submitted → calibrated → locked → acknowledged
```

### Risk Score → Recommendation
```
RiskScore computed
  └── band = high|critical
        └── Recommendations generated (ml or rule_based)
              └── open → actioned | dismissed | expired
```

---

## Migration Plan

| Migration | Tables / Changes |
|-----------|-----------------|
| `0022_goals_kpis_objectives.sql` | `goals`, `kpis`, `org_objectives`, `objective_departments` + enums |
| `0023_review_templates_participants.sql` | `review_templates`, `review_participants` (extends 0007 schema) |
| `0024_training_suggestions.sql` | `training_suggestions` |
| `0025_notifications_extended.sql` | `ALTER TABLE notifications ADD COLUMN title_ar varchar(255), ADD COLUMN body_ar text` |
| `0026_audit_logs.sql` | `audit_logs` table + indexes `(entity, entity_id)`, `(user_id, created_at DESC)`, `(created_at DESC)` BRIN |

*Migrations 0009, 0010, 0011, 0015 already provide `risk_scores`, `interventions`, `fairness_runs`, `integrations` — these will be extended in-place with `ALTER TABLE` in the above new migrations where needed.*
