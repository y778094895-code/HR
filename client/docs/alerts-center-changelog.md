# Alerts Center — Changelog

> **Date:** 2026-02-27
> **Module:** Alerts Center (مركز التنبيهات)
> **Route:** `/dashboard/alerts`

---

## Added Files

| File Path | Purpose |
|-----------|---------|
| `src/types/alerts.ts` | All TypeScript type contracts: `Alert`, `AlertDetails`, `AlertAuditEvent`, `AlertFilters`, `AlertPermissions`, severity/status/type enums |
| `src/lib/alerts-permissions.ts` | RBAC permission matrix mapping roles (`admin`, `manager`, `employee`, `super_admin`) to alert actions (view/convert/dismiss/escalate/assign) with scope enforcement |
| `src/components/features/alerts/AlertCard.tsx` | Alert card component with severity color strips, status badges, quick actions menu, checkbox for multi-select, and hover preview popover |
| `src/components/features/alerts/AlertListPanel.tsx` | Scrollable alert list panel with multi-select support, shift+click range selection, loading/empty states |
| `src/components/features/alerts/AlertDetailsPanel.tsx` | Alert details panel with 5 sections: Summary, Signal Explanation (XAI), Suggested Action, Linked Entities, Audit Trail + action buttons |
| `src/components/features/alerts/AlertFilters.tsx` | Sticky filter bar with severity/type/status pill filters, search, sort, unread toggle, bulk actions menu, CSV export trigger |
| `src/styles/alerts-center.css` | Severity gradient system, dark mode overrides, slide animation, hover micro-interactions, split-pane layout, custom scrollbar |
| `docs/alerts-center-changelog.md` | This changelog file |

## Modified Files

| File Path | Changes |
|-----------|---------|
| `src/stores/business/alert.store.ts` | **Complete rewrite**: expanded from basic 2-alert store to full lifecycle state machine (NEW→ACKNOWLEDGED→ACTIONED→CLOSED→ARCHIVED) with 15 diverse mock alerts, immutable audit trail, XAI explanations, case conversion, bulk actions, and backward-compatible `SystemAlert` re-export |
| `src/pages/dashboard/AlertsPage.tsx` | **Complete rewrite**: replaced simple PageHeader+AlertsList with split-pane layout (left list ~40% + right details ~60%), sticky filters, pagination, keyboard shortcuts (A/C/E), CSV export, RBAC enforcement, toast notifications |
| `src/locales/ar.json` | Added `alerts.*` i18n keys (28 keys) for Arabic — page title, filters, actions, sections, badges |
| `src/locales/en.json` | Added matching `alerts.*` i18n keys (28 keys) for English |

## Replaced/Deprecated Files

| File Path | Reason |
|-----------|--------|
| `src/components/features/alerts/AlertsList.tsx` | Replaced by `AlertListPanel.tsx` + `AlertFilters.tsx`. Old DataTable-based list is now a deprecation stub. |
| `src/components/features/alerts/AlertDrawer.tsx` | Replaced by inline `AlertDetailsPanel.tsx` (right pane). Old SideDrawer-based view is now a no-op stub. |

## No Changes

| File Path | Reason |
|-----------|--------|
| `src/App.tsx` | Route `/dashboard/alerts` already exists (line 96) — no modification needed |
| `src/components/layout/_nav.ts` | Alerts nav entry already exists with sub-items — no modification needed |
| `src/components/layout/DashboardLayout.tsx` | Bell badge uses `useAlertStore.getUnreadCount()` — remains compatible |
| `src/stores/business/case.store.ts` | Case store is consumed by alert store for case conversion — no changes needed |
