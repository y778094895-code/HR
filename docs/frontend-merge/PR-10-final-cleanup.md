# PR-10: Final Frontend Cleanup & Documentation Hardening

## Overview
PR-10 serves as the final cleanup and stabilization phase for the frontend merge effort. It removes leftover mock data, simplifies simulated logic in non-integrated pages, and ensures the documentation set is coherent.

## Key Changes

### 1. Mock Data Removal
- **Alerts**: Removed `MOCK_ALERTS` and `MOCK_AUDIT_LOGS` from `src/types/alerts.types.ts`. All alert-related components now rely strictly on state or API data.
- **Profile Adapter**: Cleaned up the header in `profileDataAdapter.ts`, removing transitional notes and localStorage warnings as the domain alignment is now complete.

### 2. UI Hardening
- **Page Descriptors**: Removed "(UI Mocks)" labels from `AlertsPage.tsx`.
- **Export Simulators**: Refactored `AttritionPage`, `FairnessPage`, `TrainingPage`, and `PerformancePage` to remove hardcoded CSV/PDF blob generation. These now include explicit `TODO` markers for integration with the `reportsService`.

### 3. Build & Type Hygiene
- Standardized `alerts.types.ts` to use canonical types from `./alerts` without redundant `@deprecated` warnings for the merge phase.
- Cleaned up legacy route comments in `Dashboard.tsx`.

## Remaining Technical Debt
- **Reports Integration**: The export buttons on dashboard pages are ready for `reportsService` integration but currently log to console.
- **Timeline Backend**: While `profileDataAdapter.ts` is ready, the underlying timeline and cases logic in that specific adapter still uses localStorage as a temporary store (as noted in PR-02/PR-04). Full migration to the new `case.store.ts` is recommended for future work.

## Merge Effort Summary
With the completion of PR-10, the frontend has been successfully migrated to a unified type system (camelCase), with normalized API services and aligned UI components across all major feature areas.
