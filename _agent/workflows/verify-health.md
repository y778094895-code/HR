---
description: How to verify the health of all Smart Performance System services.
---

# System Health Verification Workflow

This workflow describes the steps to perform a full system health check.

## Steps

1. **Verify Backend Connection**
   - Attempt to reach the NestJS API health endpoint.
   ```powershell
   # PowerShell
   Invoke-RestMethod -Uri "http://localhost:3000/api"
   ```

2. **Verify ML Service Connectivity**
   - Check if the FastAPI service is responding.
   ```powershell
   # PowerShell
   Invoke-RestMethod -Uri "http://localhost:8000"
   ```

3. **Check Database Migrations**
   - Ensure the database is up to date.
   ```powershell
   # PowerShell
   npm run drizzle:status
   ```

// turbo
4. **Run Smoke Tests**
   - Execute the basic smoke test suite to verify critical paths.
   ```powershell
   node smoke-test.js
   ```

5. **Review Logs for Errors**
   - Check `error.log` for any critical failures in the last 10 minutes.
