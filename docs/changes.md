# Changelog

## 2026-02-07 - UI Providers Integration

### Added
- **Global Providers**: Integrated `TooltipProvider` and `Toaster` into `client/src/main.tsx`.
- **Documentation**: Created `docs/ui-providers-integration.md` detailing the setup.

### Modified
- `client/src/main.tsx`: Wrapped `<App />` with `TooltipProvider` and added `<Toaster />`.

### Details
This change fixes issues where toast notifications and tooltips were not functioning because their context providers or rendering components were missing from the component tree.

## 2026-03-06 - Alerts Real Data & Compatibility Hardening

### Added
- `docs/alerts-real-data-migration-2026-03-06.md` documenting all alerts-related changes and verification results.
- `server/.eslintrc.cjs` to enable TypeScript lint parsing in server scope.

### Modified
- Unified alert typing and compatibility fields in `client/src/types/alerts.ts`.
- Migrated remaining alerts pages from mock-based data to `useAlertStore`-driven real data views.
- Updated root and server scripts for stable `e2e`, `lint`, and formatting behavior.

### Validation
- Client: `typecheck`, `lint`, `build`, and unit tests are passing.
- Root e2e script is now correctly scoped to Playwright config and passes with no tests.
- Server build/lint pass; full integration tests still require RabbitMQ availability.

## 2026-03-06 - Alerts Backend Composite Integration

### Added
- `postgres/migrations/0019_alerts_center_details.sql` for alerts detail tables and constraints.
- `server/data/repositories/alerts.repository.ts` with composite alerts queries.
- `server/services/interfaces/i-alerts.service.ts` and `server/services/business/alerts.service.ts`.
- `server/api/controllers/alerts.controller.ts` (`GET /api/alerts`, `GET /api/alerts/:id`, `POST /api/alerts/:id/action`).
- `server/shared/dtos/alert.dto.ts` for backend-to-frontend alert payload mapping.
- `server/tests/services/alerts.service.test.ts` for service-level behavior.
- `docs/alerts-backend-integration-2026-03-06.md` documenting implementation details.

### Modified
- `server/data/models/alerts-reports.schema.ts` to include `alert_drivers`, `alert_recommendations`, `alert_audit_trail`, and `alert_linked_cases`.
- `server/shared/di/container.ts` to bind alerts repository/service/controller.
- `server/api/index.ts` to register alerts controller.
- `infrastructure/api-gateway/src/routes.js` to forward `/api/alerts/*` to employee-service.

### Validation
- Build and tests executed in server scope after adding the new alerts modules.

### Follow-up Update
- Added `implementation_plan.md` with phased execution and verification checklist.
- Completed dashboard-impact verification via `client npm run typecheck` and `client npm run build`.
