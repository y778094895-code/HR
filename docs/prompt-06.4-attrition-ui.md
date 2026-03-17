# Attrition & Risk UI Documentation

## Overview
The Attrition module leverages AI to predict employee turnover risk and suggests interventions. It provides a strategic view of retention health and actionable insights for at-risk employees.

## Features

### 1. Overview Tab
-   **Strategic KPIs**: Turnover Rate, Predicted Leavers, and Estimated Cost of Attrition.
-   **Visualizations**: Placeholders for Departmental Heatmaps and Driver Analysis.

### 2. Risk Analysis Tab (XAI)
-   **Risk Table**: Lists employees with high turnover probability (> 50%).
-   **Primary Driver**: Highlights the main reason for risk (e.g., "Salary", "Commute").
-   **Insight Drawer (XAI)**:
    -   Clicking "Analyze" or a row opens the drawer.
    -   **Explainability**: Shows "Why" the employee is at risk (e.g., "Salary is 15% below market").
    -   **Action**: "Log Intervention" button to start retention workflow.

### 3. Intervention Log
-   *Planned*: Tracks history of interventions and their success rates.

## Components Used
-   `TabsContainer`: Navigation.
-   `DataTable`: Risk listing.
-   `SideDrawer`: XAI details.
-   `KPICard`: Strategic metrics.
-   `ExportButtons`: Reporting.

## Data Integration
-   Currently uses mock data.
-   Future integration with `turnover.service.ts` will provide real-time ML predictions.
