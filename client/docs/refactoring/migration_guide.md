# Migration Guide: Moving to Layered Architecture

This guide explains how to migrate existing components and logic to the new layered architecture.

## Overview

The new architecture separates concerns into:
1.  **Features** (`src/components/features/`): Self-contained feature modules.
2.  **Services** (`src/services/resources/`): API communication.
3.  **Stores** (`src/stores/business/`): Global state management.
4.  **Hooks** (`src/components/features/[feature]/hooks/`): Feature-specific logic.

## Step-by-Step Migration

### 1. Identify the Feature
Determine which feature domain your component belongs to (e.g., `Employees`, `Dashboard`, `MyProfile`). Create a folder in `src/components/features/[feature-name]` if it doesn't exist.

### 2. Extract API Calls
Move any `axios` or `fetch` calls from components/contexts to a Service file.
*   **Target:** `src/services/resources/[feature].service.ts`
*   **Pattern:**
    ```typescript
    import { apiClient } from '@/services/api/client';
    
    export const myFeatureService = {
      getData: async () => {
        return await apiClient.get('/endpoint');
      }
    };
    ```

### 3. Move State to Store (If Global)
If the state needs to be accessed by multiple features or persisted, move it to a Zustand store.
*   **Target:** `src/stores/business/[feature].store.ts`
*   **Use:** `createStore` utility from `src/stores/base/base.store.ts`.

### 4. Create a Custom Hook
Encapsulate logic (fetching, loading states, error handling) in a custom hook.
*   **Target:** `src/components/features/[feature]/hooks/use[Feature].ts`
*   **Pattern:**
    ```typescript
    export const useMyFeature = () => {
      const [data, setData] = useState([]);
      const { fetch } = myFeatureService;
      
      // ... useEffect to fetch data
      
      return { data, loading, error };
    };
    ```

### 5. Refactor Components
Split your component into **Container** and **Presentational** parts.

*   **Presentational Component** (`components/MyComponent.tsx`):
    *   Receives data via props.
    *   No side effects (useEffect).
    *   Pure UI rendering.

*   **Container Component** (`MyFeature/index.tsx`):
    *   Uses the custom hook.
    *   Passes data/callbacks to the presentational component.

### 6. Update Routes
Update `src/pages/dashboard/Dashboard.tsx` or `src/App.tsx` to point to your new Container component.

## Checklist
- [ ] API calls removed from UI?
- [ ] Context replaced with Store/Props?
- [ ] Types defined in `src/services/api/types.ts`?
- [ ] Component is pure (no data fetching inside)?
