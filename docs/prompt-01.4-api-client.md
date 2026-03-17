# API Client Unification

## 1. Discovery
- **Existing Client**: `client/src/services/api/client.ts` was an Axios wrapper but lacked centralized config and robust error handling.
- **Redundant Client**: `client/src/lib/api.ts` (Fetch-based) exists but is less capable.
- **Config**: `client/src/config/api.ts` holds the environment configuration.

## 2. Changes Implemented

### [MODIFY] [client.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/services/api/client.ts)
- **Configuration**: Now imports `API_CONFIG` for `baseURL` and `timeout`.
- **Auth Interceptor**: Automatically injects `Authorization: Bearer ${token}` from `useAuthStore`.
- **Error Interceptor**: 
    - **401**: Auto-logout.
    - **403**: Logs permission error (extensible for UI notifications).
    - **500**: Logs server errors.
- **Features**: Added `download(url, fileName)` method for handling Blob responses (reports).

## 3. How to Verify

1.  **Code Check**: Open `client.ts` and verify it uses `API_CONFIG` and has the new interceptors.
2.  **Runtime Check**: 
    - Login to the application.
    - Inspect Network tab in DevTools.
    - Verify requests go to the configured API URL.
    - Verify `Authorization` header is present.
3.  **Blob Download**: (If reports are active) Trigger a download and ensure it works via the new `download` method.
