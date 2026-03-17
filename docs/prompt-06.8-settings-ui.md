# Settings UI Documentation

## Overview
The Settings module allows authorized users to configure the Smart HR System. Access to specific tabs is governed by Role-Based Access Control (RBAC).

## Features & Tabs

### 1. General
-   **Company Information**: Name, localization settings.
-   **Access**: All Users.

### 2. Users (Admin/Manager)
-   **User Management**: Invite, Edit, or Deactivate users.
-   **Role Assignment**: Assign Admin, Manager, or Employee roles.

### 3. Permissions (Admin Only)
-   **RBAC Config**: Define fine-grained access policies for each role.

### 4. Integrations (Admin Only)
-   **Connections**: Manage API links to Slack, Google Workspace, Jira, etc.

### 5. Security (Admin Only)
-   **Policies**: Configure Password requirements, MFA enforcement, and Session timeouts.

### 6. Appearance
-   **Theming**: Light/Dark mode toggles.
-   **Branding**: Custom accent colors (stubbed).

## Security
-   **Guards**: `SettingsPage` filters tabs based on `useAuth().hasRole()`.
-   **API**: Backend endpoints for saving settings should also enforce these checks.
