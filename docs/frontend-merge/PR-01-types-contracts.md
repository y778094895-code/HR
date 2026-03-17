# PR-01: Types & Contracts Unification

> Frontend domain types unified to camelCase on top of the client2-based root frontend.

## Contract Decisions

| Decision | Rationale |
|----------|-----------|
| `readAt: string \| null` determines read-state | Replaces UNREAD/READ status enum values. `null` = unread |
| `alerts.ts` is the canonical source | `alerts.types.ts` re-exports + keeps legacy UI shape |
| `any` replaced everywhere | All `any`-typed fields now have proper interfaces |
| Deprecated compat aliases added | Build stays green; removal deferred to PR-02 |
| MOCK_DATA kept but deprecated | 5+ page components import it; will be extracted to fixtures in PR-02 |

## Renamed Fields

| File | Old Field | New Field | Compat Alias? |
|------|-----------|-----------|---------------|
| `training.ts` | `skills_targeted` | `skillsTargeted` | Yes (`@deprecated`) |
| `xai.ts` | `explanationJson: any` | `drivers: ExplainabilityDriver[]` | Yes (`@deprecated explanationJson?: any`) |
| `risk.ts` | `contributingFactors: any` | `contributingFactors: RiskFactor[]` | No (type-only refinement) |
| `reports.ts` | `templateJson: any` | `templateJson: ReportTemplate` | No (type-only refinement) |
| `reports.ts` | `parameters: Record<string, any>` | `parameters: ReportParameters` | No (type-only refinement) |
| `intervention.ts` | `expectedOutcome: any` | `expectedOutcome: InterventionOutcome` | No (type-only refinement) |

## New Types Added

| File | Type |
|------|------|
| `risk.ts` | `RiskFactor` |
| `xai.ts` | `ExplainabilityDriver`, `FeatureImportance` |
| `fairness.ts` | `FairnessReport` |
| `intervention.ts` | `InterventionStatus`, `InterventionOutcome` |
| `reports.ts` | `ReportTemplate`, `ReportParameters` |

## New Fields Added

| File | Interface | Field |
|------|-----------|-------|
| `alerts.ts` | `Alert` | `resolvedAt`, `mlModelVersion`, `confidenceScore` |
| `alerts.types.ts` | `Alert` | `mlModelVersion`, `confidenceScore` |
| `dashboard.types.ts` | `RiskEmployee` | `mlModelVersion` |
| `fairness.ts` | `BiasMetric` | `confidenceScore` |
| `training.ts` | `TrainingModule` | `completionRate`, `enrolledCount` |
| `intervention.ts` | `Intervention` | `completedAt`, `assignedTo`, `linkedAlertId` |

## Compatibility Risks

1. **`contributingFactors` type change** — Code passing raw objects/arrays to `TurnoverRisk.contributingFactors` will get type errors. Impact: `services/resources/types.ts` re-exports this.
2. **`expectedOutcome` type change** — `Intervention.expectedOutcome` was `any`, now `InterventionOutcome`. Impact: any code setting arbitrary shapes will error.
3. **`templateJson`/`parameters` type changes** in `reports.ts` — Same pattern as above.
4. **`ExplainabilityRecord.explanationJson`** — Changed from required `any` to optional deprecated field; code must now use `drivers`.

## Downstream Files Likely Affected in PR-02

### Alert consumers (import from `alerts.types.ts`)
- `pages/dashboard/AlertsPage.tsx`
- `pages/dashboard/alerts/AlertsAllPage.tsx`
- `pages/dashboard/alerts/AlertsHighRiskPage.tsx`
- `pages/dashboard/alerts/AlertsUnreadPage.tsx`
- `pages/dashboard/alerts/ResponseLogPage.tsx`
- `components/features/alerts/AlertCard.tsx`
- `components/features/alerts/AlertDetailsPanel.tsx`
- `components/features/alerts/AlertListPanel.tsx`
- `components/features/alerts/AlertsSplitView.tsx`
- `components/features/alerts/AlertsSidebar.tsx`
- `components/features/alerts/AlertsRootLayout.tsx`
- `components/features/alerts/ResponseLogTab.tsx`

### Dashboard consumers (import from `dashboard.types.ts`)
- `pages/dashboard/DashboardHome.tsx`
- `components/features/dashboard/ActionFeed.tsx`
- `components/features/dashboard/KPIStrip.tsx`
- `components/features/dashboard/RiskDrawer.tsx`
- `components/features/dashboard/RiskIntelligencePanel.tsx`
- `components/features/dashboard/PerformanceIntelligencePanel.tsx`
- `components/features/dashboard/FairnessMonitoringPanel.tsx`
- `services/adapters/dashboardDataAdapter.ts`

### Resource barrel consumers
- `services/resources/types.ts` — re-exports kpi, risk, fairness, intervention, xai, training, reports

## Intentionally Not Changed

- **Services / API clients** — no service files modified
- **Stores / state management** — no store files modified
- **Hooks** — no hook files modified
- **Pages / components** — no UI files modified
- **Routing** — no routing changes
- **Mock data** — kept in place with `@deprecated` annotation (removal in PR-02)
- **`auth.ts`** — `access_token` in `LoginResponse` not renamed (out of scope for this PR)
- **`users.ts`** — `on_boarding` enum value not renamed (enum values are deliberate DB-mirror constants)
- **`kpi.ts`** — no changes needed (already clean camelCase)
- **Backend / infra** — zero backend files touched
