# Alerts Center Backend Integration - 2026-03-06

## Summary
Implemented backend support for the Alerts Center composite model so the frontend can request enriched alert details (drivers, recommendations, linked cases, and audit trail) instead of relying on flat alert records.

## What Was Added

### 1) Database schema extension (Drizzle model)
Updated:
- `server/data/models/alerts-reports.schema.ts`

New tables:
- `alert_drivers`
  - `id`, `alert_id`, `factor`, `impact`, `type`, `created_at`
- `alert_recommendations`
  - `id`, `alert_id`, `intervention`, `estimated_impact`, `risk_reduction`, `created_at`
- `alert_audit_trail`
  - `id`, `alert_id`, `actor_user_id`, `action`, `from_status`, `to_status`, `note`, `created_at`
- `alert_linked_cases`
  - `id`, `alert_id`, `case_id`, `ref_type`, `created_at`

### 2) SQL migration
Added:
- `postgres/migrations/0019_alerts_center_details.sql`

Migration includes:
- table creation statements for the four new alerts detail tables
- FK constraints to `alerts.id`
- FK constraint from `alert_audit_trail.actor_user_id` to `users.id`
- indexes on `alert_id` for faster detail fetches

### 3) Repository layer
Added:
- `server/data/repositories/alerts.repository.ts`

Capabilities:
- list alerts with filters (`status`, `severity`, `type`, `channel`)
- fetch single alert
- fetch composite details bundle (drivers + recommendations + linked cases + audit trail)
- append audit trail events
- update alert status with timestamps

### 4) DTO + mapping
Added:
- `server/shared/dtos/alert.dto.ts`

Includes:
- normalized DTO contracts (`AlertDto`, `AlertDetailsDto`, `AlertAuditEventDto`)
- mapping functions from DB rows to API payload shape
- normalization for status/type/severity

### 5) Service layer
Added:
- `server/services/interfaces/i-alerts.service.ts`
- `server/services/business/alerts.service.ts`

Implemented methods:
- `getAlerts(filters)`
- `getAlertDetails(alertId)`
- `logAlertAction(alertId, action, userId, payload)`

Action handling:
- maps timeline actions to state transitions (`ACKNOWLEDGE`, `ESCALATE`, `DISMISS`, `ARCHIVE`, etc.)
- persists audit event with `fromStatus` and `toStatus`

### 6) API controller + route registration
Added:
- `server/api/controllers/alerts.controller.ts`

Endpoints:
- `GET /api/alerts/` -> list alerts (filterable)
- `GET /api/alerts/:id` -> composite alert details
- `GET /api/alerts/:id/details` -> compatibility alias for details endpoint
- `POST /api/alerts/:id/action` -> timeline/action event + optional status transition

Wiring updates:
- updated `server/shared/di/container.ts` to bind `AlertsRepository`, `IAlertsService`, `AlertsService`, `AlertsController`
- updated `server/api/index.ts` to register `alerts.controller`

### 7) API Gateway routing
Updated:
- `infrastructure/api-gateway/src/routes.js`

Added protected gateway routes:
- `router.use('/alerts', ... createRewrite('/api/alerts'))`
- `router.use('/v1/alerts', ... createRewrite('/api/alerts'))`

This ensures frontend requests to gateway `/api/alerts/*` or `/api/v1/alerts/*` are forwarded to employee-service `/api/alerts/*`.

### 8) Tests
Added:
- `server/tests/services/alerts.service.test.ts`

Coverage focus:
- composite detail mapping correctness
- action logging + state transition behavior
- not-found error path

## Endpoint Naming Note
Current backend paths are:
- Gateway: `/api/alerts/*` and `/api/v1/alerts/*`
- Employee service internal: `/api/alerts/*`

If frontend Axios/RTK Query expects a different path shape, only route mapping changes are needed.

## Validation Commands
Run from `server/`:
- `npm run lint`
- `npm run build`
- `npx jest tests/services/alerts.service.test.ts --runInBand`

## Known Follow-up
- Existing `alerts` base table is still minimal; current DTO mapper derives some UI fields (title/description/severity) from existing columns and conventions.
- For production-grade parity with frontend contracts, consider adding explicit alert metadata columns (`title`, `description`, `severity`, `employee_id`, `department`, `risk_score`).
