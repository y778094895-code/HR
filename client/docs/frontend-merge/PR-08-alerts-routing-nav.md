# PR-08: Unify Alerts Experience, Routes, and Navigation

## Overview
This PR unifies the alerts experience across the root frontend by implementing canonical nested routing, a normalized alert contract, and a unified global state management using `useAlertStore`.

## Changes

### Routing & Navigation
- **App.tsx**: Refactored `/dashboard/alerts` to use `AlertsRootLayout` with nested routes:
    - `/dashboard/alerts/all` (Index redirect)
    - `/dashboard/alerts/unread`
    - `/dashboard/alerts/high-risk`
    - `/dashboard/alerts/response-log`
- **_nav.ts**: Updated sidebar navigation items to point to canonical nested paths.
- **AlertsRootLayout.tsx**: Updated to manage internal navigation and display dynamic unread/high-risk counts from the store.

### Core Components
- **AlertCard.tsx**: Updated to strictly use the normalized `Alert` contract (`readAt`, `triggeredAt`).
- **AlertsSplitView.tsx**: Unified split-view component used across all list-based alert pages. Implements auto-read when an alert is selected.

### Pages
- **AlertsAllPage.tsx**: Refactored to use `useAlertStore` and `AlertsSplitView`.
- **AlertsUnreadPage.tsx**: Refactored to filter unread alerts from the global store.
- **AlertsHighRiskPage.tsx**: Refactored to filter `CRITICAL` and `HIGH` severity alerts.
- **ResponseLogPage.tsx**: Refactored to show processed alerts and KPIs derived from the global store.

## Verification Performed
- Manual verified all routes.
- Verified dynamic badge updates in the sidebar and alerts layout.
- Verified "Mark as Read" functionality (auto and manual).
- Verified RTL layout consistency.
