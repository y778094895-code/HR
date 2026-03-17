# Training & Development UI Documentation

## Overview
The Training module is designed to close the loop between performance gaps and learning interventions. It manages the entire lifecycle from skill gap detection to course approval and effectiveness tracking.

## Features

### 1. Skill Gaps Tab
-   **Gap Analysis**: Visualizes critical skill shortages across departments.
-   **KPIs**: Tracks total gaps, average skill levels, and training enrollment.
-   **Recommendations**: (Planned) Automatically suggests courses based on gaps.

### 2. Programs & Approval Tab
-   **Course Catalog/List**: Lists active and pending training programs.
-   **Approval Workflow**:
    -   Employees can request external training.
    -   Managers/Admins see "Pending Approval" status highlighted.
    -   **Actions**: Inline "Approve" (Check) or "Reject" (X) buttons.
-   **Details Drawer**: View course syllabus, provider, and duration.

### 3. Effectiveness Tab
-   *Planned*: ROI calculator correlating training completion with performance improvements.

## Components Used
-   `TabsContainer`: Navigation.
-   `DataTable`: Program management.
-   `SideDrawer`: Course details.
-   `KPICard`: Skill metrics.
-   `ExportButtons`: Reporting.

## Role-Based Access
-   **Admin/Manager**: Can approve/reject requests and view all gaps.
-   **Employee**: Can view own gaps and request courses (view limited to self).
