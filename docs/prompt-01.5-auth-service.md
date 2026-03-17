# Auth Service Refactoring

## 1. Discovery
- **Context**: `AuthContext.tsx` was handling low-level fetch logic, creating duplication and inconsistency.
- **Service**: `auth.service.ts` existed but wasn't fully utilized or standardized.
- **Stores**: `auth.store.ts` needed alignment with unified types.

## 2. Changes Implemented

### [NEW] [types/auth.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/auth.ts)
- Defined `UserProfile`, `LoginRequest`, `LoginResponse`, `RegisterRequest` for type safety across the auth flow.

### [MODIFY] [auth.service.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/services/resources/auth.service.ts)
- Integrated `apiClient`.
- Implemented response normalization aka "The Adapter Pattern" to handle variations in backend token keys (`access_token`, `token`, `jwt`).
- Returns standardized `LoginResponse`.

### [MODIFY] [AuthContext.tsx](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/contexts/AuthContext.tsx)
- Replaced manual `fetch` with `authService.login`.
- Reduced complexity by delegating logic.

## 3. How to Verify

1.  **Login**:
    - Build/Run app.
    - Attempt login.
    - **Success**: Should redirect to dashboard. `localStorage` should contain `auth_token`.
    - **Failure**: Invalid credentials should show error (logged to console/UI).
2.  **Types**:
    - Check typical user object `id`, `email`, `role`.
3.  **Logout**:
    - Clicking logout should clear `localStorage` and redirect to login.
