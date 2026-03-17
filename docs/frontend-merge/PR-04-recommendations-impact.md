# PR-04: Recommendations & Impact Migration

## Overview
This PR migrates the **Recommendations** and **Impact** dashboard pages to the normalized frontend data layer. It removes reliance on hardcoded mock data and production-only constants, connecting the UI to resilient hooks powered by the `interventionService`.

## Component Pedigree
- **Root Frontend (client2)**: Provided the core page structures, `TabsContainer` integration, and `PageHeader` layouts.
- **Donor References (client)**: Provided the rich card designs for recommendations and the `recharts`-based impact visualization logic.

## Mock Data Removal
- **Recommendations**: Removed dependency on internal `MOCK_RECOMMENDATIONS`. The `useRecommendations` hook now fetches exclusively from the `interventionService.getRecommendations()` endpoint.
- **Impact**: Removed hardcoded trend arrays from `ImpactPage.tsx`. The page now renders dynamic data from `useImpact`, providing a loading skeleton while the `interventionService.getAnalytics()` call is in flight.

## Data Mapping & PR-01 Alignment
All consumed fields have been mapped to the PR-01 contract shapes:
- **Recommendations**:
  - Uses `confidenceScore` (as a normalized string/number).
  - Uses `suggestedInterventionType` for categorization.
  - Linked actions (`Apply`/`Reject`) are now dispatched through the API handler.
- **Impact**:
  - Metrics utilize `totalInterventions`, `completedCount`, and `successRate` from the normalized analytics model.
  - Added support for dynamic `trends` and `outcomes` distributions.

## Unresolved Dependencies
- None at this stage. The pages are fully integrated with the existing `interventionService`.

## Deferred Areas
- **What-If Simulation**: UI structure is present but backend integration is deferred to a future PR.
- **Batch Generation**: The button is in the UI for forward-compatibility but not yet wired to a specific backend operation.

## Next Recommended Files (PR-05)
- `src/stores/business/fairness.store.ts`
- `src/pages/dashboard/FairnessPage.tsx`
- `src/components/features/fairness/FairnessAudit.tsx`
