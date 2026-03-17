# Real-Time Alerts / WebSocket Delivery Document

**Module:** Real-Time Alerts / WebSocket  
**Phase:** Phase 1 - High-Value Items  
**Date:** 2026-02-13  
**Status:** ✅ DELIVERY-READY (Frontend)

---

## 1. Implemented Real-Time Alert Flow

### 1.1 WebSocket Service (`client/src/services/websocket.ts`)

The WebSocket service has been enhanced with the following capabilities:

- **Connection Management**: Automatic connection to WebSocket endpoint derived from API Gateway URL
- **Reconnection Logic**: Exponential backoff with max 10 reconnect attempts
- **Heartbeat**: Periodic ping/pong to maintain connection
- **Event Routing**: Supports `alert:new`, `alert:updated`, `alert:deleted` events
- **Payload Normalization**: Defensively handles various payload formats:
  - `{ alert: {...} }` wrapper
  - `{ data: {...} }` wrapper
  - Direct alert object
  - Array of alerts
- **Status Callbacks**: Connection status change handlers for UI feedback
- **Graceful Disconnect**: Proper cleanup on logout/page unload

### 1.2 Alert Store Integration (`client/src/stores/business/alert.store.ts`)

The alert store now includes:

- **WebSocket State**: Track connection status (`connecting`, `connected`, `disconnected`, `error`)
- **Event Handlers**:
  - `handleNewAlert()`: Adds new alerts to the top of the list, updates unread count
  - `handleAlertUpdate()`: Updates existing alerts, adjusts unread count if status changes
  - `handleAlertDelete()`: Removes alerts and decrements unread count
- **Initialization**: `initializeWebSocket()` and `disconnectWebSocket()` actions
- **Duplicate Prevention**: Avoids adding the same alert twice

### 1.3 Hook Integration (`client/src/hooks/useAlertWebSocket.tsx`)

React hook that:

- Initializes WebSocket connection on component mount
- Cleans up on unmount
- Watches for new alerts and triggers toast notifications
- Prevents duplicate toasts for the same alert

---

## 2. UI Areas That Update Live

### 2.1 Navigation Badge (Header Bell Icon)
- **File**: `client/src/components/layout/DashboardLayout.tsx`
- **Behavior**: Unread count badge updates immediately when new alerts arrive
- **Display**: Shows count (or "9+" if > 9) in red badge

### 2.2 Alert List Views
- **Files**:
  - `client/src/pages/dashboard/AlertsPage.tsx`
  - `client/src/pages/dashboard/alerts/AlertsAllPage.tsx`
  - `client/src/pages/dashboard/alerts/AlertsUnreadPage.tsx`
  - `client/src/pages/dashboard/alerts/AlertsHighRiskPage.tsx`
- **Behavior**: All alert lists automatically refresh when WebSocket events are received
- **Filters**: "All", "Unread", "High Risk" tabs update reactively

### 2.3 Alert Details Panel
- **File**: `client/src/components/features/alerts/AlertDetailsPanel.tsx`
- **Behavior**: Updates in real-time if the selected alert is modified

### 2.4 Toast Notifications
- **Trigger**: New HIGH or CRITICAL severity alerts
- **Display**: Sonner toast with alert title, description, severity badge
- **Action**: "View" button navigates to alerts page
- **Deduplication**: Prevents showing duplicate toasts for same alert

---

## 3. WebSocket Fallback Behavior

### 3.1 Connection Failures
- **Retry**: Automatic reconnection with exponential backoff (3s, 4.5s, 6.75s... up to 30s)
- **Max Attempts**: 10 retries before stopping
- **Status Display**: Can be extended to show connection status in UI

### 3.2 API Fallback
- **Fetch on Load**: `fetchAlerts()` still works independently
- **No Dependency**: UI works normally if WebSocket fails
- **Error Handling**: All WebSocket errors are caught and logged, never crash the app

### 3.3 Malformed Payloads
- **Normalization**: The service normalizes various payload shapes
- **Null Safety**: All handlers check for null/undefined data
- **Fallback**: If normalization fails, event is silently ignored (no crash)

---

## 4. Backend-Dependent Limitations

The following features require backend support and are frontend-ready but depend on backend implementation:

### 4.1 WebSocket Server
- **Required**: Backend must run a WebSocket server at the gateway URL
- **Expected URL**: `ws://localhost:8080/` (or configured via `VITE_API_GATEWAY`)
- **Events Expected**:
  - `alert:new` / `alert:created` - New alert created
  - `alert:updated` - Alert status/assignment changed
  - `alert:deleted` - Alert removed

### 4.2 Alert Payload Schema
Backend should send JSON in one of these formats:

```json
// Option 1: { alert: {...} }
{ "eventType": "alert:new", "alert": { "id": "...", "title": "...", ... } }

// Option 2: { data: {...} }
{ "eventType": "alert:new", "data": { "id": "...", "title": "...", ... } }

// Option 3: Direct
{ "eventType": "alert:new", "id": "...", "title": "...", ... }
```

### 4.3 Authentication
- WebSocket does not include auth tokens by default
- May need backend support for token-based authentication if required

---

## 5. Final Frontend Delivery Status

### ✅ Completed Features

| Feature | Status | Notes |
|---------|--------|-------|
| WebSocket client | ✅ | Enhanced with reconnection, heartbeat, normalization |
| Alert store integration | ✅ | Event handlers for new/update/delete |
| Navigation badge updates | ✅ | Unread count updates live |
| Alert list reactivity | ✅ | All views update without refresh |
| Toast notifications | ✅ | For HIGH/CRITICAL alerts only |
| Graceful fallback | ✅ | Works without WebSocket |
| Data-shape hardening | ✅ | Defensive payload handling |
| TypeScript validation | ✅ | Passes `npm run typecheck` |
| Production build | ✅ | Passes `npm run build` |

### 📋 Files Modified/Created

1. **Created**: `client/src/services/websocket.ts` - Enhanced WebSocket service
2. **Created**: `client/src/hooks/useAlertWebSocket.tsx` - React hook for WebSocket management
3. **Modified**: `client/src/stores/business/alert.store.ts` - Added WebSocket event handlers
4. **Modified**: `client/src/components/layout/DashboardLayout.tsx` - Added WebSocket initialization

### 🔄 No Changes Required

- `client/src/components/features/alerts/*` - Already reactive via store
- `client/src/pages/dashboard/AlertsPage.tsx` - Already uses store
- `client/src/App.tsx` - Routing unchanged

---

## 6. Testing Recommendations

To verify real-time functionality:

1. Start the backend WebSocket server
2. Open the application in two browser tabs
3. Create/modify an alert via API in one tab
4. Observe the other tab updates without refresh

---

## 7. Conclusion

**Status: ✅ DELIVERY-READY**

The Real-time Alerts / WebSocket module is complete from a frontend perspective:

- ✅ TypeScript typecheck passes
- ✅ Production build succeeds  
- ✅ All UI components update reactively
- ✅ Graceful fallback when WebSocket unavailable
- ✅ No runtime crashes from malformed data
- ✅ No fake alert generation
- ✅ No backend edits required (frontend-only)

The module is ready for integration with a backend WebSocket server to enable true real-time functionality.
