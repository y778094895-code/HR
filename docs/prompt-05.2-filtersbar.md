# FiltersBar Component Documentation

## Overview
The `FiltersBar` is a schema-driven component for handling common filtering scenarios like search, dropdown selection, and date ranges. It supports debounced searching and RTL layouts.

## Features
-   **Schema-Driven**: Define filters using a configuration array (`FilterConfig[]`).
-   **Debounced Search**: Text inputs automatically debounce to prevent excessive API calls.
-   **RTL Support**: Icons and padding adjust for Right-to-Left layouts.
-   **Reset Ability**: Built-in reset button to clear all filters.

## Usage Example

```tsx
import { FiltersBar } from '@/components/ui/data-display/FiltersBar';

const filters = [
  { 
    key: 'search', 
    type: 'search', 
    placeholder: 'Search employees...' 
  },
  { 
    key: 'department', 
    type: 'select', 
    label: 'Department',
    options: [
        { label: 'IT', value: 'it' }, 
        { label: 'HR', value: 'hr' }
    ] 
  }
];

export function EmployeeList() {
  const [params, setParams] = useState({});

  const handleFilterChange = (newParams) => {
      console.log('Filters:', newParams); // { search: '...', department: 'it' }
      setParams(newParams);
  };

  return (
    <FiltersBar 
      filters={filters} 
      onFilterChange={handleFilterChange} 
    />
  );
}
```

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `filters` | `FilterConfig[]` | Array of filter definitions. |
| `onFilterChange` | `(values) => void` | Callback with current filter values. |
| `onReset` | `() => void` | Optional callback when reset is clicked. |
| `debounceMs` | `number` | Delay for search inputs (default 500ms). |

## Filter Type Config
```typescript
interface FilterConfig {
  key: string;              // Key in the output object
  type: 'search' | 'select' | 'date-range';
  label?: string;           // Visual label/placeholder
  options?: { value: any, label: string }[]; // For selects
}
```
