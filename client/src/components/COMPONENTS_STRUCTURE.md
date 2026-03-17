# Client Component Structure

This document outlines the organization of the React components in the `client/src/components` directory.

## Directory Overview

- **`ui/`**: "Dumb" or pure UI components. These are generic, reusable, and have no business logic.
    - `buttons/`: Buttons, toggles, switches.
    - `forms/`: Inputs, selects, checkboxes, form wrappers.
    - `cards/`: Cards, hover cards.
    - `charts/`: Chart components.
    - `overlays/`: Modals, dialogs, popovers, tooltips, toasts.
    - `navigation/`: Menus, breadcrumbs, pagination, sidebar.
    - `feedback/`: Alerts, spinners, skeletons, progress bars.
    - `layout/`: Aspect ratio, resizable panels, separators.
    - `data-display/`: Badges, avatars, tables, calendars, carousels.


- **`features/`**: Feature-specific components. Each feature has its own directory.
    - Structure: `features/[feature]/[Component]/` containing:
        - `index.tsx` (Container/Export)
        - `[Component].tsx` (Presentational/Implementation)
    - Examples: `dashboard/DashboardHome/`, `interventions/RecommendationsList/`
    - *Note: `_legacy_restored` folders may exist containing archived versions of components.*

## Migration Notes

- Components previously in `src/components/ui` are now categorized in subfolders.
- Components previously in `src/components/[feature]` have been moved to `src/components/features/[feature]/[Component]`.
- Imports have been updated to reflect the new paths.
