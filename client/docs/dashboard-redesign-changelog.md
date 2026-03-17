# Dashboard Redesign Changelog

**Date:** 2026-02-26  
**Type:** Major Redesign — Case-Centric Intelligence Hub  
**Version:** 2.1.0

---

## Summary

Rebuilt the main Dashboard (`/dashboard`) from a simple KPI + tab layout into a Case-Centric Intelligence Hub with 6 analytical sections, RBAC-scoped rendering, sticky smart filters, a Risk Drawer, a Create Case Modal, and an Action Feed.

---

## Added Files

| File | Reason |
|------|--------|
| `src/types/dashboard.types.ts` | Dashboard-specific TypeScript models: `DashboardResponse`, `DashboardKPI`, `RiskEmployee`, `XAIDriver`, `FairnessData`, `ActionFeedItem`, `DashboardFilters`, etc. |
| `src/services/adapters/dashboardDataAdapter.ts` | Mock data adapter providing realistic Arabic-localized data for all 6 sections. 5-min client-side cache. Reads live cases from Zustand store. |
| `src/hooks/useDashboardScope.ts` | RBAC scope hook mapping `admin`/`manager`/`employee`/`super_admin` to section visibility, data scope, and capabilities. |
| `src/styles/dashboard.css` | Dashboard-specific CSS: risk colors, 16px card radius, shadow levels, sparkline/heatmap/trend/feed styling, sticky filter bar, skeleton animations, dark mode. |
| `src/components/features/dashboard/KPIStrip.tsx` | 5 KPI cards with mini SVG sparklines, context-aware trend coloring, tooltips, deep-link navigation, loading/error states. |
| `src/components/features/dashboard/RiskIntelligencePanel.tsx` | Two-column layout: department heatmap grid, risk distribution bars, 6-month SVG trend line, Top 10 high-risk employees table. |
| `src/components/features/dashboard/RiskDrawer.tsx` | Slide-in sheet: risk score, XAI contributing factors with weighted bars, suggested intervention, working "Open Case" button, timeline. RTL-aware. |
| `src/components/features/dashboard/PerformanceIntelligencePanel.tsx` | SVG trend chart, department comparison bars, early decline detection badge, drilldown to `/dashboard/performance`. |
| `src/components/features/dashboard/FairnessMonitoringPanel.tsx` | 4 indicator cards (salary gap, evaluation bias, promotion equity, overall status) with breach alerts. |
| `src/components/features/dashboard/ActiveCasesTable.tsx` | Compact table from `useCaseStore`: case ID, title, owner, color-coded severity/status badges, date, deep-links. |
| `src/components/features/dashboard/ActionFeed.tsx` | Chronological feed with type-colored borders, emoji icons, View/Open Case/Dismiss actions. Dismiss persists to localStorage. |
| `src/components/features/dashboard/CreateCaseModal.tsx` | Dialog: title, description, priority, optional employee. Creates case via `useCaseStore.addCase()` and navigates to cases page. |
| `src/components/features/dashboard/DashboardSmartFilters.tsx` | Sticky filter bar: 5 dropdowns (time period, department, location, contract type, job grade), debounced (300ms), URL param sync, Reset + Save View. |
| `docs/dashboard-redesign-changelog.md` | This file. |

## Modified Files

| File | Changes |
|------|---------|
| `src/pages/dashboard/DashboardHome.tsx` | **Full rewrite.** Replaced simple KPI/tab layout with 6-section Intelligence Hub using `DashboardSmartFilters`, `KPIStrip`, `RiskIntelligencePanel`, `PerformanceIntelligencePanel`, `FairnessMonitoringPanel`, `ActiveCasesTable` (lazy), `ActionFeed` (lazy), `RiskDrawer`, and `CreateCaseModal`. Added RBAC scoping via `useDashboardScope`, progressive rendering (KPIs first), independent widget states (loading/error/data per section), and window event for topbar Create Case. |
| `src/components/layout/DashboardLayout.tsx` | **Topbar enhanced.** Added: Global Search (expandable input with ⌘K hint), "Quick Create Case" button (dispatches `dashboard:create-case` event), Notifications bell with unread count badge from `useAlertStore`, Language toggle (AR↔EN), User Profile dropdown (Profile/Settings/Logout). Sidebar logic fully preserved. |

## Removed/Replaced Files

None. All existing files remain intact with zero breaking changes to other routes.

---

## Key Design Decisions

1. **No endpoint changes.** The `DashboardDataAdapter` provides mock data shaped as `DashboardResponse`. Wiring to real APIs later only requires replacing the adapter body.
2. **RBAC without role tabs.** `useDashboardScope` reads `user.role` and returns visibility config. `super_admin` sees no analytics — only Active Cases and Action Feed.
3. **Progressive rendering.** KPIs load first, then Risk/Performance (100ms stagger), then Fairness/Feed (200ms stagger). Active Cases and Action Feed use `React.lazy`/`Suspense`.
4. **Lightweight charts.** SVG-only sparklines, trend lines, and heatmap — no chart library dependency added.
5. **Dismiss persistence.** Dismissed Action Feed items stored in `localStorage` (`dashboard_dismissed_feed`) and survive page refreshes.
6. **Topbar ↔ Dashboard communication.** "Quick Create Case" button in topbar dispatches a `window` event caught by `DashboardHome`, enabling cross-component communication without prop drilling.
