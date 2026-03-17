# Performance UI Documentation

## Overview
The Performance module provides a comprehensive view of organizational health and individual employee performance. It is divided into logical sections via tabs.

## Features

### 1. Overview Tab
-   **High-Level KPIs**: Displays aggregated metrics like Average Score, Review Completion %, and Active PIPs.
-   **Visualizations**: Placeholders for Score Distribution and 9-Box Grid charts.

### 2. Employees Tab
-   **Data Table**: List of employees with sortable columns for Name, Department, Score, Rating, and Status.
-   **Filtering**: Filter by Department or Search by Name.
-   **Employee Details Drawer**:
    -   Clicking a row opens a side drawer.
    -   Displays user details, current score, and historical trends.
    -   **Actionable Items**: HR/Managers can "Initiate PIP" for low performers (< 3.0) or "Start Review" for others.

### 3. Reviews Tab
-   *Planned*: Cycle management for quarterly/annual reviews.

## Components Used
-   `TabsContainer`: For tabbed navigation.
-   `DataTable`: For the employee list.
-   `SideDrawer`: For detailed employee view.
-   `KPICard`: For overview metrics.
-   `ExportButtons`: For report generation.

## Role-Based Access
-   **Admin/Manager**: Full access to all tabs and actions (PIP, Reviews).
-   **Employee**: Generally redirects to "My Performance" (Dashboard), but if allowed here, would see limited self-data.
