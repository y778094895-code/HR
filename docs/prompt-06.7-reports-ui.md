# Reports & Analytics UI Documentation

## Overview
The Reports module acts as the centralized retrieval point for all system data. It supports both quick, pre-defined templates and a flexible custom builder for ad-hoc analysis.

## Features

### 1. Quick Templates
-   **Grid View**: Visual cards for common reports (e.g., Performance Summary, Attrition Risks).
-   **One-Click Run**: Instantly triggers generation for the current period.

### 2. Custom Builder
-   **Flexible Configuration**:
    -   **Data Source**: Select from Performance, Attrition, Training, or Fairness domains.
    -   **Time Period**: Last 30 days, 90 days, or YTD.
    -   **Format**: PDF for presentation or Excel/CSV for raw data.
-   **Validation**: Ensures required fields are selected before submission.

### 3. Download Center
-   **Async Job Tracking**:
    -   Handles long-running reports without blocking the UI.
    -   **Statuses**: Processing (Spinner), Ready (Green Check), Failed (Red Alert).
-   **Persistence**: Jobs remain available for download for a configured retention period.

## Workflow
1.  User selects a **Template** OR builds a **Custom Report**.
2.  System initiates an **Async Job** (mocked currently, would call `reports.service.ts`).
3.  User is directed to **Download Center** to watch progress.
4.  Once `completed`, the **Download** button becomes active.

## Components Used
-   `TabsContainer`: Navigation.
-   `DataTable`: Job list.
-   `ReportTemplatesGrid`: Template selection.
-   `ReportBuilder`: Form inputs.
