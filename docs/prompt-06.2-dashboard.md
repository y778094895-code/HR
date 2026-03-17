# Dashboard Layout & Widgets

## Overview
The Dashboard serves as the command center for the Smart Performance System. It is designed to be **role-aware**, presenting different metrics and actions to Administrators/Managers versus standard Employees.

## Layout Structure
1.  **Header**:
    -   Welcome message with user context.
    -   **Export Actions**: PDF/Excel downloads.
    -   **Quick Actions**: Contextual buttons (e.g., "Add Goal").
2.  **Filters Bar**:
    -   Global filters affecting all widgets (Period, Department).
3.  **KPI Widget Grid**:
    -   4-column responsive grid displaying key metrics.
4.  **Main Content Area**:
    -   **Trends Chart**: Visual performance history (Placeholder).
    -   **Activity Feed**: Recent system events.

## Role-Based Content

### Admin & Manager View
-   **KPIs**:
    -   **Total Employees**: Headcount tracking.
    -   **High Risk Attrition**: Predictive turnover alerts (Red/Danger).
    -   **Training Completion**: Compliance % (Green/Success).
    -   **Avg Performance**: Departmental average score.
-   **Actions**: Department-wide reports, Bulk actions.

### Employee View
-   **KPIs**:
    -   **My Performance**: Personal score.
    -   **Pending Trainings**: Action items (Yellow/Warning).
    -   **Goals Met**: Achievement tracking.
    -   **Feedback Received**: Notification count.
-   **Actions**: Log self-assessment, Request leave.

## Components Used
-   `KPICard`: For metric display.
-   `FiltersBar`: For global filtering.
-   `ExportButtons`: For reporting.
