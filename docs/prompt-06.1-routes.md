# Route Configuration

## Overview
The application uses `react-router-dom` for client-side routing. All dashboard routes are nested within the `/dashboard` path and wrapped in the `DashboardLayout` shell. Access control is managed via `ProtectedRoute` guards using role-based checks.

## Route Table

| Path | Component | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `Login` | *Public* | Authentication page. |
| `/dashboard` | `DashboardHome` | *Authenticated* | Main landing overview. |
| `/dashboard/performance` | `PerformancePage` | `admin`, `manager` | KPIs and performance metrics. |
| `/dashboard/attrition` | `AttritionPage` | `admin`, `manager` | Turnover risk analysis. |
| `/dashboard/training` | `TrainingPage` | `admin`, `manager`, `employee` | Skill gaps and learning. |
| `/dashboard/fairness` | `FairnessPage` | `admin` | Bias detection and equity. |
| `/dashboard/reports` | `ReportsPage` | `admin`, `manager` | System report generation. |
| `/dashboard/interventions` | `InterventionsContainer` | *Authenticated* | Action tracking (legacy). |
| `/dashboard/users` | `UserManagementContainer` | `admin`, `super_admin` | User administration. |
| `/dashboard/settings` | `SettingsPage` | *Authenticated* | User/System settings. |
| `/dashboard/help` | `HelpPage` | *Authenticated* | Support resources. |

## Guarding Strategy
-   **Authentication**: `ProtectedRoute` checks for a valid session token.
-   **Authorization**: `allowedRoles` prop checks against the current user's role.
-   **Redirection**: Unauthorized access redirects to `/login` or shows an access denied message (handled by `ProtectedRoute`).
