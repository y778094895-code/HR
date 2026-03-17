# App Shell Refactoring

## 1. Discovery
- **Existing Layout**: `client/src/components/layout/DashboardLayout.tsx` was a static Sidebar layout.
- **Constraints**: 
    - No new libraries.
    - Minimal diff.
    - RTL support required.
    - Responsive mobile drawer required.
- **Tools Available**: `lucide-react` (Icons), `Sheet` (Radix UI wrapper), Tailwind CSS v3.4 (Logical properties support).

## 2. Changes Implemented

### Files
- **[NEW]** `client/src/components/layout/_nav.ts`: Centralized navigation configuration with role-based filtering.
- **[MODIFIED]** `client/src/components/layout/DashboardLayout.tsx`:
    - Added `dir="rtl"` to root container.
    - Replaced hardcoded links with `_nav.ts` mapping.
    - Added `Sheet` component for Mobile Sidebar (Hamburger menu).
    - Updated sizing and spacing to use Tailwind Logical Properties (`border-e`, `ps-`, `pe-`).

### Key Features
- **RTL Support**: Utilizes `dir="rtl"` and logical classes to ensure correct mirroring of layout and icons.
- **Responsiveness**: Sidebar is hidden on mobile (`md:hidden`) and replaced by a Header trigger that opens a Side Sheet.
- **Role Awareness**: Nav items check `user.role` against defined allowed roles in `_nav.ts`.

## 3. How to Verify

### Manual Testing
1.  **RTL Alignment**:
    - Open the dashboard.
    - Verify Sidebar is on the **Right** (Start).
    - Verify Text direction is Right-to-Left.
    - Verify Icons in sidebar have correct spacing (`ps-` / `gap`).

2.  **Responsiveness (Mobile)**:
    - Resize browser window to mobile width (< 768px).
    - Verify Sidebar disappears.
    - Verify Hamburger Menu icon appears in top-right header.
    - Click Hamburger -> Verify Drawer slides in from the **Right**.

3.  **Navigation**:
    - Click links in Desktop Sidebar -> Verify navigation.
    - Click links in Mobile Drawer -> Verify navigation and Drawer closes automatically.

4.  **Logout**:
    - Verify Logout button works in Header.
