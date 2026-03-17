# Sidebar Nested Sub-Navigation

## Overview
This document outlines the architectural implementation of the nested/expandable sidebar sidebar navigation logic integrated within the Smart HR Client. It transitions the application from a flat side menu to a hierarchical structure, aligning neatly with the newly outlined **Case-Centric Information Architecture**.

## Architectural Features

1. **Nested Items & Deep Links**
    - The core `NavItem` interface now supports an optional `children: NavItem[]` property.
    - Child items utilize query-level **deep links** (e.g., `?view=risk` or `?tab=admin`) to hook seamlessly into existing `TabsContainer` structures on primary pages without needing to invent or define unnecessary React Router endpoints.
2. **Expand / Collapse Interaction**
    - Parent items that contain children render as toggles (featuring `Chevron` indicators).
    - Clicking on a parent item toggles its children's visibility.
    - Navigating (by clicking) straight to a child item on mobile will securely retract the outer `Sheet` overlay, providing an uninterrupted UI focus.
3. **Persistent State Management**
    - The `expandedSections` local state is persisted to the browser's `localStorage` dictionary via the key `sidebar_expanded_sections_v1`.
    - This ensures users don't repeatedly lose their place when hard-refreshing or leaving the dashboard context.
4. **Auto-Expansion**
    - `DashboardLayout` automatically expands a parent's category on component mount or path changes if a child's path matches the user's active `location.pathname`.
5. **Role-Based Access Control (RBAC)**
    - Both primary parents and nested child items are subjected to the strict `rolesAllowed` properties filtering function (`filterNavByRole`).
    - The filtering algorithm operates recursively: if a parent item originally possessed sub-items, but all sub-items are rejected due to RBAC limitations for that specific user context, the parent section is dynamically stripped from the UI to avoid presenting an "empty" accordion tab.
6. **Arabic RTL / LTR Compliance**
    - `ChevronRight` rotates dynamically using Tailwind's `rtl:rotate-180` to point leftward in Arabic locales.
    - Indentations for nested items are controlled through responsive block-levels like `ms-6 rtl:me-6 rtl:ms-0` allowing stable multi-directional spacing.

## IA Mapping (Main Centers & Sub-items)
The new hierarchical implementation encompasses:
- **Dashboard** -> Admin, Executive, HR, Manager, Analyst  
- **Alerts Center** -> All, Unread, High Severity, Response Log  
- **Case Management** -> Open, In Progress, Under Review, Closed  
- **Employees** -> Directory + Filters  
- **Performance Intelligence** -> Continuous Analysis, KPIs, Early Underperformance  
- **Attrition & Turnover** -> Risk Prediction, Risk Drivers, Attrition Cost  
- **Training Needs** -> Training Need Prediction, Program Matching, Training Impact  
- **Fairness Monitoring** -> Fairness Monitoring, Alerts & Reports, Fairness Explanations  
- **Recommendations & What-if** -> Smart Recommendations, Expected Uplift, What-if Simulation  
- **Impact Analysis** -> Impact on Performance, Impact on Attrition, Training Impact, Period Comparison  
- **Reports & Analytics** -> Report Library, Report Builder, Exports  
- **Data Quality** -> Missing/Conflicting Scan, Policies, Audit Log, Critical Alerts  
- **User Management** -> Users, Roles, Data Visibility, Audit  
- **System Settings** -> Organization, Thresholds, Models, Notifications, Exports  
- **Help Center** -> Guide, FAQ, Support

## Affected Files
- `client/src/components/layout/_nav.ts` (Interface & IA Data Definitions, Filtering)
- `client/src/components/layout/DashboardLayout.tsx` (Sidebar UI Rendering, Persistence logic)
- `client/src/locales/ar.json` (Arabic UI Strings)
- `client/src/locales/en.json` (English UI Strings)
