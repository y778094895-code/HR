# API Path Standardization

## Overview
This document explains the change to the client-side API configuration to match the current backend routing structure.

## Changes Applied

### 1. Removal of Version Prefix
**File:** `client/src/config/api.ts`

**Change:**
Updated `GATEWAY_URL` default value from `http://localhost:8080/api/v1` to `http://localhost:8080/api`.

**Reasoning:**
The API Gateway and backend services are currently exposing endpoints directly under `/api` without a `/v1` prefix. Including `/v1` in the client configuration resulted in `404 Not Found` errors for all API requests. Removing this prefix aligns the client with the actual server implementation.

## Impact
- **Request Routing:** Client API requests will now correctly match the backend routes (e.g., `http://localhost:8080/api/auth/login` instead of `http://localhost:8080/api/v1/auth/login`).
- **Error Resolution:** Eliminates `404` errors caused by the incorrect path prefix.
