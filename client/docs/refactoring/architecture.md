# Client Architecture: Layered Structure

The application has been refactored from a flat structure to a clean, layered architecture to improve maintainability, scalability, and testability.

## 1. Directory Structure

```text
src/
├── services/               # Data Access Layer
│   ├── api/                # Core API configuration (Axios client, interceptors)
│   ├── resources/          # Resource-specific API services (Dashboard, Employee, etc.)
│   └── cache/              # Caching mechanisms
├── stores/                 # State Management Layer (Zustand)
│   ├── base/               # Base store utilities and middleware
│   ├── business/           # Domain-specific state (Auth, Dashboard)
│   └── ui/                 # UI-specific state (Theme, Sidebar)
├── components/             # Presentation Layer
│   ├── ui/                 # Shared base UI components (Atomic components like Buttons, Inputs)
│   ├── features/           # Feature-based organizational unit
│   │   └── [feature_name]/
│   │       ├── hooks/      # Custom hooks for complex feature logic
│   │       ├── components/ # Feature-specific presentational components
│   │       └── [ViewName]/ # Feature views (Containers + Layouts)
│   │           ├── index.tsx           # Container component (Data management)
│   │           └── [ViewName].tsx      # Presentational layout (UI structure)
└── lib/                    # Shared utilities and helper functions
```

## 2. Key Principles

### Separation of Concerns
- **Container vs. Presentational**: Logic for data fetching and state interaction is strictly isolated in Container components or Custom Hooks. Presentational components only receive data via props and emit events via callbacks.
- **Independent Services**: All HTTP communication is handled by service classes in `src/services/`. Components NEVER call `axios` or `fetch` directly.

### Centralized State Management
- Global state is managed by **Zustand**.
- Context API is discouraged for large business state to avoid unnecessary re-renders.

### Custom Hooks
- Business logic that is reusable or complex is abstracted into custom hooks (e.g., `useEmployees`, `useDashboard`).
- This makes the UI components cleaner and the logic easier to test.

## 3. Communication Flow

1. **User Action** in a presentational component (e.g., button click).
2. **Container** receives the callback.
3. **Container** calls a **Custom Hook** or **Service**.
4. **Service** interacts with the **API Client**.
5. **State Store** (Zustand) is updated with the result.
6. **UI** re-renders with the new state from the store or hook.
