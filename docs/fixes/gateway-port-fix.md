# API Gateway Port Fix & CORS Update

## Overview
This document details the configuration changes made to the API Gateway to resolve connectivity issues between the frontend, backend services, and the gateway itself.

## Changes Applied

### 1. Employee Service Port Correction
**File:** `infrastructure/api-gateway/src/config/index.js`

**Change:**
Updated the default port for the `employee-service` from `3001` to `3000`.

**Reasoning:**
The backend `employee-service` is configured to run on port `3000`. The API Gateway was incorrectly pointing to port `3001`, which caused `ECONNREFUSED` errors when the gateway attempted to forward requests to the employee service. Port `3001` is reserved for the frontend application.

### 2. CORS Origin Update
**File:** `infrastructure/api-gateway/src/config/index.js`

**Change:**
Added `http://localhost:3001` to the `cors.origin` array.

**Reasoning:**
The frontend application runs on port `3001`. For the browser to allow requests from the frontend to the API Gateway (running on port `8080`), the gateway must explicitly allow `http://localhost:3001` in its Access-Control-Allow-Origin header.

## Impact
- **Service Connectivity:** The API Gateway can now successfully route requests to the Employee Service.
- **Frontend Integration:** The React frontend (on port 3001) can now make authenticated requests to the API Gateway without encountering CORS errors.
