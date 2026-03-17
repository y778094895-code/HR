# Documentation - PR-06: Profile and Turnover Alignment

This document summarizes the changes made to align the Employee Profile and Turnover views with the unified frontend contracts (PR-01).

## Scope
The alignment focused on ensuring that risk scores, contributing factors, and directional indicators are handled consistently across the application, moving away from ad-hoc mock shapes.

## Field Migrations Applied

### 1. Employee Profile (Attrition Tab & XAI Drawer)
- **XAIDetailDrawer**: Now strictly consumes the `RiskDriver` type from `profileDataAdapter`.
- **AttritionTab**: 
    - Verified that `riskScore` and `confidenceScore` are treated as 0-1 range floats.
    - Display logic uses `Math.round(val * 100)` for consistency.
    - Contributing factors are rendered using the structured `RiskFactor` model.
- **FairnessTab**:
    - Refactored to use status-based signals (`'warning'`, `'critical'`) instead of `breached` booleans.
    - Added helper `isFlagged` for consistent status checking across metrics.

### 2. Turnover Dashboard & Components
- **TurnoverDashboard**: 
    - Passed raw `riskScore` (float) to cards.
    - Simplified mapping logic.
- **EmployeeRiskCard (both versions)**: 
    - Updated `riskScore` prop to accept 0-1 float (normalized across both `features/turnover` and `turnover` versions).
    - `contributingFactors` updated from `string[]` to `RiskFactor[]`.
    - Rendering logic updated to access `f.factor`.
- **RiskMatrix**:
    - Fixed threshold bug: changed checks from `> 70` to `> 0.7` and `> 40` to `> 0.4` to correctly handle normalized scores.

## Duplicated EmployeeRiskCard Strategy
Both `src/components/features/turnover/components/EmployeeRiskCard.tsx` and `src/components/turnover/EmployeeRiskCard.tsx` were updated to share the same data contract (`RiskFactor[]` and float scores). While they remain duplicated in location, their underlying logic and API consumption are now consistent.

## UI Assumptions & Remaining Inconsistencies
- **Trend Data**: Currently `trend: []` in the profile adapter. Next PR should wire this to the historical risk endpoint.
- **Fairness Details**: Aggregate pattern flags are shown, but individual subgroup comparison data is still simplified in the UI.

## Deferred Work
- **PR-07 Focus**: Finalize the "Interventions" area alignment and wire the profile "Actions" to real backend persistence (moving away from localStorage).
- **Service Unification**: `TurnoverRiskDashboard` (legacy test page) still uses raw axios; should be migrated to `turnoverService` in a future refactor.
