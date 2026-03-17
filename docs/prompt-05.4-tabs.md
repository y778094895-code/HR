# Tabs Component Documentation

## Overview
The `TabsContainer` is a high-level wrapper around the standardized `Tabs` primitive. It simplifies the definition of tabs and offers built-in URL synchronization for deep linking.

## Features
-   **Config-Driven**: Define tabs via a simple array.
-   **URL Sync**: Optionally bind the active tab to a URL query parameter (e.g., `?view=details`).
-   **Responsive**: Horizontal scrolling for many tabs.

## Usage Example

```tsx
import { TabsContainer } from '@/components/ui/navigation/TabsContainer';

export function Dashboard() {
  const tabs = [
    { value: 'overview', label: 'Overview', content: <Overview /> },
    { value: 'activity', label: 'Activity', content: <ActivityLog /> },
    { value: 'settings', label: 'Settings', content: <Settings /> },
  ];

  return (
    <TabsContainer 
      tabs={tabs} 
      defaultValue="overview" 
      syncWithUrl="view" 
    />
  );
}
```

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `tabs` | `TabItem[]` | Array of `{ value, label, content }`. |
| `defaultValue` | `string` | Initial active tab. |
| `syncWithUrl` | `string` | URL param key to sync with (optional). |
| `onValueChange` | `(val) => void` | Callback on tab switch. |
