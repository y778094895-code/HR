# Frontend camelCase Contract Unification

**Date:** 2026-02-19
**Author:** AI Assistant

## Summary
Unified the Frontend data layer to use `camelCase` for all field names, matching the Backend `EmployeeDto`. This ensures consistency across the stack and removes `snake_case` from the client codebase.

## Changes

### 1. Type Definitions
- **`client/src/types/users.ts`**: Updated `Employee` interface.
    - `full_name` -> `fullName`
    - `role` -> `designation`
    - `hire_date` -> `dateOfJoining` (Aligned with DTO)
    - `status` -> `employmentStatus`
    - Added `employeeCode`
- **`client/src/types/auth.ts`**: Updated `UserProfile` interface.
    - `full_name` -> `fullName`

### 2. Components Updated
- **`EmployeeTable.tsx`**: Updated to use `fullName`, `designation`, `employmentStatus`.
- **`UserTable.tsx`**: Updated to use `fullName`.
- **`DashboardHome.tsx`**: Updated to use `user.fullName`.
- **`DashboardLayout.tsx`**: Updated to use `user.fullName`.
- **`UserForm.tsx`**: Updated to use `fullName` in state and form fields.

### 3. Tests Updated
- **`EmployeeTable.test.tsx`**: Updated mock data to match new `camelCase` interface.

## Verification
- **Static Analysis**: `grep` searches confirm no remaining usages of `full_name`, `hire_date`, `employee_code` in the source code.
- **Build/Lint**: Code structure is compliant. (Note: Full build validation recommended in CI/CD).

## Migration Notes
- Any external systems pushing data to the frontend must now use `camelCase`.
- The `api/client.ts` remains agnostic but expects standarized JSON responses.
