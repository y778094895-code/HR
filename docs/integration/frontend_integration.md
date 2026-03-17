# Frontend Integration

## Overview
The React Client has been adapted to communicate exclusively with the API Gateway.

## Configuration
**.env Settings:**
```env
VITE_API_GATEWAY=http://localhost:8080/api
```

## API Client
Located in `client/src/services/api/client.ts`.
- **Base URL**: Configured dynamically from `.env`.
- **Interceptors**: 
  - Adds `Authorization: Bearer <token>`
  - Adds `x-trace-id: <uuid>` for every request.

## Real-time Updates
WebSocket Service: `client/src/services/websocket.ts`
- Connects to Gateway WS endpoint.
- Subscribes to events like `intervention.created`.
- Updates UI stores/components optimistically.

## Authentication
JWT is stored in `AuthStore` (Zustand). It is attached to every request via Axios interceptors.
- **Refresh Token**: `AuthStore` includes `refreshToken` action to seamlessly update tokens (implementation in `auth.store.ts`).
- **Logout**: Automatic logout on 401 response.

## Feature Flags
Feature flags are managed via `FeatureFlagService` (`services/feature-flags.ts`).
- **Storage**: Defaults defined in code, overrides from `localStorage` or `VITE_FEATURE_FLAGS` env var.
- **Usage**: `featureFlags.isEnabled('websocket_updates')`.
- **Supported Flags**: `websocket_updates`, `new_dashboard`, `beta_features`.
