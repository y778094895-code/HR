# Sidebar Accordion and Module Hubs Pattern

This document outlines the architectural patterns implemented for the **Smart HR System** application to support a robust, scalable navigation structure.

## Overview

We have transitioned from a deeply nested sidebar navigation and complex routing pattern to a simplified **Single-Open Sidebar Accordion** coupled with **Module Hubs**. This new architecture improves user experience by reducing sidebar clutter and centralizes related features into single, cohesive pages.

---

## 1. Single-Open Sidebar Accordion Pattern

The sidebar `DashboardLayout` has been updated to use a single persistent string state (`activeSectionKey`) instead of an array of string keys.

### Key Logic and Implementation
1. **State Persistence**: The active group ID is stored in `localStorage` under `sidebar_active_section`, ensuring the user's focus remains intact across page reloads.
2. **Single-Open Behavior**: When a top-level parent map is clicked, its `id` becomes the new active section. Any previously expanded group is immediately collapsed.

```tsx
// Example of the Layout logic
const [activeSectionKey, setActiveSectionKey] = useState<string | null>(() => {
    return localStorage.getItem('sidebar_active_section');
});

const toggleSection = (id: string) => {
    const newKey = activeSectionKey === id ? null : id;
    setActiveSectionKey(newKey);
    
    if (newKey) {
        localStorage.setItem('sidebar_active_section', newKey);
    } else {
        localStorage.removeItem('sidebar_active_section');
    }
};
```

This single-control value prevents the user interface from stretching beyond the viewport, enhancing focus and clean design.

---

## 2. Module Hub Architectural Pattern

The **Module Hub** architecture dictates that related features inside a primary category (such as Employees, Attrition, Training) live in a single route (`/dashboard/employees`, `/dashboard/attrition`). Instead of mounting separate components on multiple child routes, the Hub acts as a tab-switching container.

### Core Features

1. **`?view=` Query Parameter**: The state of which sub-feature is active is bound permanently to the URL's query parameter. This allows users to deep-link straight to a particular tool (e.g., `/dashboard/attrition?view=drivers`).
2. **`TabsContainer` Component**: This UI component sits at the heart of Module Hubs. Setting `syncWithUrl="view"` auto-syncs the tabs with the React Router URL hooks.

### Implementation Blueprint

```tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { NeedsAnalysis } from './NeedsAnalysis';
import { ProgramsList } from './ProgramsList';

export default function TrainingHub() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'needs';

    const getTitle = () => {
        switch (view) {
            case 'needs': return t('nav.needsAnalysis', 'Needs Analysis');
            case 'programs': return t('nav.programs', 'Training Programs');
            default: return t('training.title', 'Training Hub');
        }
    };

    const tabs: TabItem[] = [
        {
            value: 'needs',
            label: t('nav.needsAnalysis', 'Needs Analysis'),
            content: <NeedsAnalysis />
        },
        {
            value: 'programs',
            label: t('nav.programs', 'Training Programs'),
            content: <ProgramsList />
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{getTitle()}</h1>
                <p className="text-muted-foreground">Manage and assign training resources.</p>
            </div>
            
            <TabsContainer
                tabs={tabs}
                defaultValue="needs"
                syncWithUrl="view"
            />
        </div>
    );
}
```

### Navigation Schema Integration

For compatibility with Module Hubs, the navigation configuration (`_nav.ts`) avoids nested physical `path` entries for sub-features, opting instead to enforce the query path linking directly to the Module Hub:

```typescript
export const NAV_ITEMS: NavItem[] = [
    {
        id: 'training',
        labelKey: 'nav.training',
        icon: GraduationCap,
        children: [
            { id: 'train-needs', labelKey: 'nav.needsAnalysis', path: '/dashboard/training?view=needs', icon: Target },
            { id: 'train-programs', labelKey: 'nav.programs', path: '/dashboard/training?view=programs', icon: GraduationCap }
        ]
    }
];
```

## Advantages
- **Routing Simplicity**: Reduces nested `<Route>` definitions. Single point of entry for component rendering.
- **Deep Linking**: All active states (views) are persistent through standard browser APIs, allowing users to bookmark exact states.
- **Performance**: Prevents full page unmounts when traversing between sub-feature tabs.
