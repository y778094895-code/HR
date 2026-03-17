# Sidebar Accordion & Sub-Pages Implementation

## Overview
The application's sidebar navigation has been refactored to support a single-open accordion behavior with deep URL syncing. The primary layout ensures that when a parent menu item is clicked, it expands to reveal its sub-items, effectively closing any previously expanded parent item to maintain a clean UI.

Each parent item corresponds to a major feature module (e.g., Performance, Attrition, Training). Clicking a sub-item navigates the user to the respective **Module Hub** page and appends a `?view=` query parameter to the URL (e.g., `/dashboard/performance?view=continuous`).

## Module Hub Pattern
All major feature pages have been refactored into "Module Hubs".
A Module Hub is a single React component page that acts as a router for its sub-features, relying on the `?view=` URL parameter instead of React Router's nested routes.

Key characteristics of a Module Hub:
1. **Dynamic Page Title**: The `<h1>` title of the page dynamically updates to match the currently selected sub-item in the sidebar.
2. **Sub-item Specific Tabs**: When a sub-item is selected, the page displays a specific set of horizontal tabs relevant *only* to that sub-item.
3. **Deep Linking**: `TabsContainer` is configured with `syncWithUrl="tab"` to allow deep linking to specific tabs within a sub-item's view (e.g., `/dashboard/performance?view=continuous&tab=team`).
4. **Placeholder Content**: Tabs that are pending implementation display a unified "Coming Soon" placeholder.

## Section to Sub-Item Mapping

| Parent Menu Item | Sub-Items (`view` parameter) | Description / Horizontal Tabs |
| :--- | :--- | :--- |
| **Performance** | `continuous`, `kpi`, `underperformance` | Continuous Analysis, KPIs, Early Underperformance |
| **Attrition** | `risk`, `drivers`, `cost` | Risk Prediction, Risk Drivers, Attrition Cost |
| **Training** | `needs`, `programs`, `impact` | Training Need Prediction, Program Matching, Training Impact |
| **Fairness** | `monitoring`, `alerts`, `explanations` | Fairness Monitoring, Alerts & Reports, Fairness Explanations |
| **Cases** | `open`, `progress`, `review`, `closed` | Open, In Progress, Under Review, Closed |
| **Recommendations**| `smart`, `uplift`, `simulation` | Smart Recommendations, Expected Uplift, What-If Simulation |
| **Impact** | `performance`, `attrition`, `training`, `comparison` | Impact on Performance, Attrition, Training, and Period Comparison |
| **Reports** | `library`, `builder`, `exports` | Report Library, Report Builder, Exports & Downloads |
| **Data Quality** | `scan`, `policies`, `audit`, `alerts` | Missing Data Scan, Policies, Audit Log, Critical Alerts |
| **Users** | `users`, `roles`, `visibility`, `audit` | Users List, Roles, Data Visibility, Access Audit Log |
| **Settings** | `org`, `thresholds`, `models`, `notifications`, `export` | Organization, Thresholds, Models, Notifications, Export |
| **Help** | `guide`, `faq`, `support` | User Guide, FAQ, Support Tickets |

## Modified Files
The following files were significantly modified or created during this refactoring:

1. **`client/src/components/layout/DashboardLayout.tsx`**: Updated to implement the single-open accordion behavior. Selected states and expanded states are now synchronized with the current route and `view` query parameter.
2. **`client/src/pages/dashboard/PerformancePage.tsx`**: Refactored to act as a Module Hub.
3. **`client/src/pages/dashboard/AttritionPage.tsx`**: Refactored to act as a Module Hub.
4. **`client/src/pages/dashboard/TrainingPage.tsx`**: Refactored to act as a Module Hub.
5. **`client/src/pages/dashboard/FairnessPage.tsx`**: Refactored to act as a Module Hub.
6. **`client/src/pages/dashboard/RecommendationsPage.tsx`**: Refactored to act as a Module Hub.
7. **`client/src/pages/dashboard/ImpactPage.tsx`**: Refactored to act as a Module Hub.
8. **`client/src/pages/dashboard/ReportsPage.tsx`**: Refactored to act as a Module Hub.
9. **`client/src/pages/dashboard/DataQualityPage.tsx`**: Refactored to act as a Module Hub.
10. **`client/src/pages/dashboard/UserManagementPage.tsx`**: Refactored to act as a Module Hub.
11. **`client/src/pages/dashboard/SettingsPage.tsx`**: Refactored to act as a Module Hub.
12. **`client/src/pages/dashboard/HelpPage.tsx`**: Refactored to act as a Module Hub.
13. **`client/src/components/features/cases/CaseDetailsDrawer.tsx`**: Added missing tabs ("Monitoring", "Notes/Attachments").

## Role-Based Access Control (RBAC) & RTL
- The sidebar navigation utilizes `filterNavByRole` from `_nav.ts` to ensure users only see menu items they are authorized to access.
- All refactored pages and the `TabsContainer` support RTL (Right-to-Left) rendering, aligning with the primary Arabic interface requirement. The accordion icons properly flip direction in RTL mode.
