# Role Guard Documentation

## Overview
The `ProtectedRoute` component has been enhanced to support Role-Based Access Control (RBAC). It ensures that not only is a user authenticated, but they also possess the specific role(s) required to access a route.

## Usage

### Basic Authentication Guard
Blocks unauthenticated users and redirects them to `/login`.
```tsx
<ProtectedRoute>
  <DashboardLayout />
</ProtectedRoute>
```

### Role-Based Guard
Blocks authenticated users who do not have the required role. Redirects unauthorized users to `/dashboard`.
```tsx
<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <AdminPage />
</ProtectedRoute>
```

## Logic Flow
1.  **Loading**: Displays a spinner while `AuthContext` resolves state.
2.  **Unauthenticated**: Redirects to `/login` (preserves `from` state for post-login redirect).
3.  **Unauthorized (Role mismatch)**:
    -   If user's `role` is NOT included in `allowedRoles`.
    -   Redirects to `/dashboard`.
    -   *Safety*: If the user is already at `/dashboard` and is unauthorized (edge case), it renders a "Permission Denied" message to prevent redirect loops.
4.  **Authorized**: Renders the child component.

## Implementation Details
-   **Source**: `client/src/components/shared/ProtectedRoute.tsx`
-   **State Access**: Uses `useAuth()` hook to get `isAuthenticated`, `isLoading`, and `role`.
