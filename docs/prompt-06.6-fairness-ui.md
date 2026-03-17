# Fairness & Equity UI Documentation

## Overview
The Fairness module provides a suite of tools to audit organizational equity. It highlights disparities in pay, promotion, and performance ratings across demographic groups.

## Features

### 1. Equity Overview
-   **Scorecard**: High-level metrics for Equity Score, Pay Gap, and Promotion Parity.
-   **Alerts**: Immediate notifications if bias incidents or statistically significant deviations are detected.

### 2. Demographic Analysis
-   **Comparative Tables**: Detailed breakdown of performance and compensation by Gender, Ethnicity, or Age Group.
-   **Disparity Flags**: Automatically flags groups where metrics deviate significantly (p < 0.05) from the organizational average.

### 3. AI Recommendations
-   **Actionable Insights**: Suggested remediations (e.g., "Review Salary Bands for Role X").
-   **Impact Assessment**: Categorizes recommendations by High/Medium/Low impact.

## Components Used
-   `TabsContainer`: Navigation.
-   `DataTable`: Demographic data.
-   `KPICard`: Equity metrics.
-   `ExportButtons`: Audit reporting.

## Security
-   Access restricted to HR Admins via `ProtectedRoute` and Role Guards.
-   Data is anonymized where possible in aggregation views.
