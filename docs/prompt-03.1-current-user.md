# Current User Hook Documentation

## Overview
The `useAuth` hook is the primary interface for accessing the current user's state within the application. It wraps the `AuthContext`, which acts as a bridge between the React component tree and the Zustand `auth.store`.

## Usage
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
    const { user, role, isAuthenticated, refreshProfile } = useAuth();
    
    if (!isAuthenticated) return <Login />;
    
    return <div>Welcome, {user?.full_name} ({role})</div>;
};
```

## API Reference

### Properties
- **`user`**: `UserProfile | null` - The current user object.
- **`token`**: `string | null` - The JWT access token.
- **`role`**: `string | null` - Shortcut for `user.role`.
- **`permissions`**: `string[]` - Array of permission strings (currently empty, reserved for RBAC).
- **`isAuthenticated`**: `boolean` - True if a valid token exists.
- **`isLoading`**: `boolean` - True during initial load.
- **`error`**: `string | null` - Any authentication error.

### Methods
- **`login(email, password)`**: Authenticates the user.
- **`logout()`**: Clears session and redirects.
- **`refreshProfile()`**: Manually re-fetches the user profile from the server (`/auth/me`).

## Double-Fetch Prevention
The `AuthProvider` initializes state from `localStorage` immediately prevents an unnecessary network call on mount if the data is already present. The `refreshProfile` method allows explicit re-synchronization when needed (e.g., after updating user details).
