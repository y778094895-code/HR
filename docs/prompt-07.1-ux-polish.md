# UX Polish & Refactoring

## Overview
This document outlines the UX improvements and standardizations applied to the Smart HR System. The goal is to provide a consistent, responsive, and secure user experience across all modules.

## Standardized Components

### 1. EmptyState (`components/ui/feedback/EmptyState.tsx`)
-   **Usage**: Displayed when lists or tables have no data.
-   **Features**: Icon support, title, description, and optional action button.
-   **Integration**: Automatically used in `DataTable` when `data.length === 0`.

### 2. LoadingSkeleton (`components/ui/feedback/LoadingSkeleton.tsx`)
-   **Usage**: Displayed during asynchronous data fetching.
-   **Features**: Animated pulse effect, configurable rows and height.
-   **Integration**: Automatically used in `DataTable` when `isLoading === true`.

### 3. ErrorState (`components/ui/feedback/ErrorState.tsx`)
-   **Usage**: Displayed when API calls fail or data cannot be loaded.
-   **Features**: Error message and "Retry" button.
-   **Integration**: Automatically used in `DataTable` when `error` prop is present.

## Access Control (Role Guards)

Critical actions have been wrapped with `useAuth().hasRole()` to ensure only authorized users can perform them.

| Component | Feature | Roles Allowed |
| :--- | :--- | :--- |
| `EmployeePerformanceList` | **Initiate PIP** | Admin, Manager |
| `RiskList` | **Log Intervention** | Admin, Manager |
| `SettingsPage` | **Security/Integration Tabs** | Admin |

## RTL Support

-   **DataTable**: Table headers and cells now use `text-start` and `rtl:text-right` for correct alignment in Arabic.
-   **Navigation**: Pagination buttons (`Previous`/`Next`) are fully localized and direction-aware.
