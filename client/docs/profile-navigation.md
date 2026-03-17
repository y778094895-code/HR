# Profile Navigation Update

## Overview
Added the ability to navigate to the current user's profile from the topbar "الملف الشخصي" dropdown menu using client-side routing only. This ensures there are no new backend endpoints required and RBAC remains intact.

## Modified Files
- `client/src/components/layout/DashboardLayout.tsx`:
  - Updated the `DropdownMenuItem` for "الملف الشخصي" to use `navigate('/dashboard/profile')` instead of settings.
- `client/src/App.tsx`:
  - Imported `ProfilePage` and added `<Route path="profile" element={<ProfilePage />} />` under the protected `/dashboard` layout group.

## New Files
- `client/src/pages/dashboard/ProfilePage.tsx`:
  - Implemented the client-only profile view leveraging `useAuthStore` to fetch the cached user data without extra API requests.
  - Displays user Full Name, Email, Role, Department, and generic Account Status in a responsive card layout.

## Final Route Path
- `/dashboard/profile`

## Testing Guidelines
- **AT-ProfileNav-01**: Click "الملف الشخصي" -> verifies `/dashboard/profile` renders.
- **AT-ProfileNav-02**: Dropdown natively closes post-navigation using shadcn UI default behavior.
- **AT-ProfileNav-03**: Page accurately displays `user` state from `AuthContext` with layout mirroring standard setting pages.
- **AT-Back-01**: Using the browser back capability will transition safely to the preceding page.
- **AT-NoAPI-01**: Exclusively reads the initialized system context. No network transactions triggered directly by visiting the route.
