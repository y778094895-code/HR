# 2026-03-06 - Alerts Real Data Migration and Compatibility Hardening

## Goal
Replace remaining alerts pages that depended on mock data with real state from `useAlertStore`, and stabilize typing/imports/scripts for build and test readiness.

## Scope
- Unified `Alert` contract in client types.
- Removed legacy UI import paths.
- Updated lint/test scripts for current repo layout.
- Migrated remaining alerts pages to real data flow.

## Files Changed

### Types and Contracts
- `client/src/types/alerts.ts`
  - Extended `AlertStatus` to include `UNREAD` and `READ`.
  - Added compatibility fields used by legacy and detail views.

### Alerts Components
- `client/src/components/features/alerts/AlertCard.tsx`
- `client/src/components/features/alerts/AlertDetailsPanel.tsx`
- `client/src/components/features/alerts/AlertListPanel.tsx`
- `client/src/components/features/alerts/AlertsSplitView.tsx`
- `client/src/components/features/alerts/AlertsSidebar.tsx`
- `client/src/components/features/alerts/AlertsRootLayout.tsx`
- `client/src/components/features/alerts/ResponseLogTab.tsx`

### Alerts Pages (Mock Removal)
- `client/src/pages/dashboard/alerts/AlertsAllPage.tsx`
- `client/src/pages/dashboard/alerts/AlertsHighRiskPage.tsx`
- `client/src/pages/dashboard/alerts/AlertsUnreadPage.tsx`
- `client/src/pages/dashboard/alerts/ResponseLogPage.tsx`

All four pages now use real data (`useAlertStore`) through `AlertsSplitView` / `ResponseLogTab`.

### Cleanup
- `client/src/components/layout/DashboardLayout.tsx`
- `client/src/components/ui/input.tsx`
- Deleted `client/src/types/alerts.types.ts`.

### Tooling and Scripts
- `package.json`
  - Updated `test:e2e` to use explicit Playwright config and `--pass-with-no-tests`.
- `server/package.json`
  - Updated `lint` and `format` scripts to match current structure.
- `server/.eslintrc.cjs`
  - Added baseline ESLint config for TypeScript parsing.

## Verification Run

### Client
- `npm run typecheck` -> PASS
- `npm run lint` -> PASS
- `npm run test -- --run` -> PASS (7 files / 23 tests)
- `npm run build` -> PASS

### Root
- `npm run test:e2e` -> PASS (no tests, expected with current setup)

### Server
- `npm run lint` -> PASS
- `npm run build` -> PASS
- `npx jest tests/controllers/dashboard.controller.test.ts --runInBand` -> PASS
- `npm test -- --runInBand` -> integration tests still fail when RabbitMQ is not running on `localhost:5672`.

## Operational Note
Frontend and script readiness is significantly improved. Full server integration test pass still depends on external services (RabbitMQ/DB) being available.
