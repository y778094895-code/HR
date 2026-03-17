# PR-03: Frontend Stores Unification — Normalization Report

## Store Normalization Status

| Store / Selector | Status | Key Changes |
|------------------|--------|-------------|
| `alert.store.ts` | ✅ Normalized | Switched to unified `Alert` types from `@/types/alerts`. Migrated `unread` flag to `readAt: string | null`. |
| `case.store.ts` | ✅ Cleaned | Removed `mockCases` seeding. State initialized as empty array. |
| `employee.store.ts`| ✅ Normalized | Aligned with unified `Employee` type. Strengthened error handling using `ApiClientError`. |
| `turnover.selectors.ts`| ✅ Typed | Verified `riskScore` usage. Added proper store state typing. |

## Detailed Migration Notes

### 1. Alert Store: `readAt` Semantics
- **Before**: `unread: boolean` was used to determine the read state.
- **After**: `readAt: string | null` (ISO timestamp) is now the canonical source.
- **Derivation**: `unreadCount` is derived via `data.filter(a => !a.readAt).length`.
- **Action**: `markAsRead` now sets `readAt` to the current ISO timestamp.

### 2. Alert Store: Status Alignment
The unified `AlertStatus` introduces a drift from the previous local definition:
- `ACTIONED` replaces `IN_PROGRESS` and `RESOLVED`.
- `CLOSED` replaces `DISMISSED`.
- `ARCHIVED` is newly supported in the type.

### 3. Employee Store: Error Handling
Catch blocks now explicitly cast errors to `ApiClientError` (from PR-02). This allows components to access `error.code` or `error.details` for more granular UI feedback (e.g., distinguishing between a 403 Forbidden and a generic network error).

## Known Consumer Files Requiring Follow-up (PR-04)

The following files reference old store properties (`unread`) or old status values and will likely show TypeScript errors during full build:

### Alert Consumers (`unread` -> `readAt`)
- `src/pages/dashboard/AlertsPage.tsx`
- `src/components/features/alerts/AlertCard.tsx`
- `src/components/features/alerts/AlertListPanel.tsx`

### Alert Status Consumers
- `src/components/features/alerts/AlertDetailsPanel.tsx` (Status badge colors/labels)
- `src/pages/dashboard/alerts/ResponseLogPage.tsx`

### Case Store Consumers
- `src/pages/dashboard/cases/CasesPage.tsx` (Now starts with empty state)

## Intentionally Deferred
- **Store-to-Service migration for Cases**: Remained local-only as no backend case service was provided in the current scope.
- **UI component updates**: All page and component edits are deferred to PR-04 to maintain strict PR boundaries.
- **Mock data extraction**: `MOCK_ALERTS` in `alert.store.ts` (donor version) was ignored in favor of the primary `client2` base which already used `apiGet`.
