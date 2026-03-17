# PR-02: API Services & Adapters — Normalization Report

## Chosen Base Behavior for API Client

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| HTTP library | **Axios** (via `services/api/client.ts`) | Stronger auth interceptors, structured error handling, singleton pattern |
| Auth attachment | Request interceptor reads `useAuthStore.getState().token` | Centralized — every request auto-attaches Bearer token |
| 401 handling | `logout()` + redirect to `/login` | Prevents stale UI state after session expiry |
| Error shape | Structured `ApiClientError` with `status`, `code`, `message`, `details` | Consumers catch typed errors instead of raw `AxiosError` |
| `lib/api.ts` (fetch) | **Not deleted** but **no longer imported** by any in-scope file | Other consumers (stores, components) still reference it — cleanup in PR-03/PR-04 |

## Normalization Decisions

### Transport Key Normalization

A new `services/api/normalizers.ts` provides:
- `snakeToCamel(str)` — single key conversion (e.g. `overall_score` → `overallScore`)
- `normalizeKeys<T>(obj)` — recursive deep transformation

Every service/adapter applies `normalizeKeys` on raw API responses. If the backend already returns camelCase, the normalization is a safe no-op.

### Service Interface Alignment

| Service | Before | After |
|---------|--------|-------|
| `performance.service.ts` | `overall_score`, `department_id`, `suggested_action`, `impact_score` | `overallScore`, `departmentId`, `suggestedAction`, `impactScore` |
| `training.service.ts` | `skill_name`, `required_level`, `match_score`, `program_id`, `completion_rate`, `avg_score_improvement`, `roi_score`, `feedback_rating` | `skillName`, `requiredLevel`, `matchScore`, `programId`, `completionRate`, `avgScoreImprovement`, `roiScore`, `feedbackRating` |
| `fairness.service.ts` | Types already camelCase | Added `normalizeKeys` at transport boundary |
| `DepartmentPerformance` | Name collided with `dashboard.types.ts` | Renamed to `DepartmentPerformanceSummary` |

### Adapter Changes

| Adapter | Key Changes |
|---------|------------|
| `dashboardDataAdapter.ts` | Migrated from `apiGet` (fetch) → `apiClient` (Axios). Added `normalizeKeys`. Typed empty defaults for risk/performance/fairness. |
| `profileDataAdapter.ts` | Migrated from `apiGet` → `apiClient`. Imported `TurnoverRisk`/`RiskFactor` from PR-01 types. `RiskDriver` re-exported as `RiskFactor & { direction? }` for component compat. `any` retained for bundle fields consumed by untouched components. |

## Parameter Naming Assumptions at Transport Boundary

| Endpoint | Direction | Assumed Format | Notes |
|----------|-----------|---------------|-------|
| `GET /dashboard/stats` | Response | snake_case possible | Normalized by `normalizeKeys` |
| `GET /performance/overview` | Response | `overall_score` etc. | Normalized |
| `GET /performance/departments` | Response | `department_id`, `average_score` | Normalized |
| `GET /training/effectiveness` | Query param | `program_id` sent as snake_case | Backend expectation |
| `GET /training/effectiveness` | Response | `completion_rate`, `roi_score` etc. | Normalized |
| `GET /fairness/metrics` | Response | snake_case possible | Normalized |
| `GET /turnover/risk/:id` | Response | `risk_score`, `contributing_factors` | Normalized |
| `GET /employees/:id/performance` | Response | `current_rating` | Normalized |

## Unresolved Backend Contract Ambiguity

1. **Exact backend key casing** — The backend may already return camelCase for some endpoints. `normalizeKeys` handles both cases as a no-op for already-camelCase keys.
2. **`RiskDriver.direction`** — The backend `contributing_factors` may not include a `direction` field. The adapter infers direction from the sign of the impact value.
3. **Dashboard endpoint granularity** — `GET /dashboard/stats` is assumed to return an aggregated payload. If the backend splits this across multiple endpoints, the adapter will need updating.
4. **Performance detail endpoint** — `GET /performance/employees/:id` shape is assumed but not verified against the backend schema.

## UI Layers Intentionally Untouched

- `src/pages/*` — no page changes
- `src/stores/*` — no store changes
- `src/components/*` — no component changes
- `src/config/*` — no config changes
- `src/lib/api.ts` — not modified (still has external consumers)
- Routing — unchanged
- Server / ML service / infrastructure — completely untouched

## Completion Status

All resource services now apply `normalizeKeys` at the transport boundary:

| Service | Status |
|---------|--------|
| `performance.service.ts` | ✅ Normalized (session 1) |
| `training.service.ts` | ✅ Normalized (session 1) |
| `fairness.service.ts` | ✅ Normalized |
| `dashboard.service.ts` | ✅ Normalized |
| `turnover.service.ts` | ✅ Normalized + camelCase fields |
| `employee.service.ts` | ✅ Normalized |
| `intervention.service.ts` | ✅ Normalized |
| `reports.service.ts` | ✅ Normalized + `ReportTemplateSummary` rename |
| `auth.service.ts` | ✅ `getCurrentUser` normalized |
| `user.service.ts` | ✅ Normalized |
| `dashboardDataAdapter.ts` | ✅ Normalized (session 1) |
| `profileDataAdapter.ts` | ✅ Normalized (session 1) |

### Additional Changes
- `ReportTemplate` in `reports.service.ts` renamed to `ReportTemplateSummary` to avoid clash with `types/reports.ts` canonical `ReportTemplate`
- Barrel `index.ts` updated with `employee.service` and `user.service` exports

