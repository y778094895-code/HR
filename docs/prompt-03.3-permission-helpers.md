# Permission Helpers Documentation

## Overview
The `useAuth` hook now includes helper methods to simplify permission checking in your components. This abstracts the underlying user object structure and provides a consistent API.

## API Reference

### `hasRole(role: string): boolean`
Checks if the current user has a specific role.

```tsx
const { hasRole } = useAuth();

if (hasRole('admin')) {
  // Render admin-only content
}
```

### `hasAnyRole(roles: string[]): boolean`
Checks if the current user has *at least one* of the provided roles.

```tsx
const { hasAnyRole } = useAuth();

if (hasAnyRole(['admin', 'manager'])) {
  // Render management controls
}
```

### `hasPermission(permission: string): boolean`
Checks if the current user has a specific granular permission.
> **Note**: Currently returns `false` as granular permissions are a future feature.

```tsx
const { hasPermission } = useAuth();

if (hasPermission('users.delete')) {
  <DeleteButton />
}
```

## Best Practices
-   Prefer **Role Guards** (`ProtectedRoute`) for entire routes.
-   Use **Permission Helpers** for conditional rendering within components (e.g., hiding a delete button).
