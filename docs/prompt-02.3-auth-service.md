# Authentication Service Documentation

## Overview
The authentication system is built using a layered architecture:
- **Service**: `auth.service.ts` (API communication, Type normalization)
- **Store**: `auth.store.ts` (State management via Zustand)
- **Context**: `AuthContext.tsx` (React integration, Legacy support)

## Endpoints
The service communicates with the following API endpoints (mounted under `/api` via Gateway):

| Method | Endpoint              | Description              | Request Type      | Response Type    |
| :----- | :-------------------- | :----------------------- | :---------------- | :--------------- |
| POST   | `/auth/login`         | User login               | `LoginRequest`    | `LoginResponse`  |
| POST   | `/auth/register`      | User registration        | `RegisterRequest` | `LoginResponse`  |
| POST   | `/auth/logout`        | User logout              | -                 | `void`           |
| GET    | `/auth/me`            | Get current user profile | -                 | `UserProfile`    |
| POST   | `/auth/refresh-token` | Refresh access token     | -                 | `{token: string}`|

## Data Structures

### UserProfile
Stored in state and `localStorage`.
```typescript
interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: string;       // e.g., 'admin', 'user', 'manager'
    department?: string;
}
```

## Storage Mechanism
The application uses **LocalStorage** for persistence.

- **Token**: Key `auth_token`. Stores the raw JWT access token.
- **User**: Key `auth_user`. Stores the serialized `UserProfile` object.

> **Note**: The `AuthContext` automatically syncs `localStorage` with the Zustand store on application boot.

## Error Handling
- **401 Unauthorized**: Automatically triggers a logout and clears storage (handled via `apiClient` interceptor).
- **Login Errors**: Displayed directly in the Login component.
