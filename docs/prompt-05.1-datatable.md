# DataTable Component Documentation

## Overview
The `DataTable` is a reusable, data-agnostic component for displaying tabular data. It supports sorting, pagination, loading states, and row interactivity.

## Features
-   **Generic Typing**: Fully typed for any data model `T`.
-   **Sortable Columns**: Built-in header clicks for sorting.
-   **Pagination Controls**: Next/Previous buttons and page indicators.
-   **Loading State**: Skeleton/Spinner overlay.
-   **Empty State**: Custom message when data is empty.
-   **Row Click**: Interactive rows.

## Usage Example

```tsx
import { DataTable } from '@/components/ui/data-display/DataTable';

interface User {
  id: string;
  name: string;
  role: string;
}

const columns = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Role', accessorKey: 'role' },
  { 
    header: 'Actions', 
    accessorKey: 'id', 
    cell: (user) => <Button onClick={() => edit(user.id)}>Edit</Button> 
  }
];

export function UserTable({ users, isLoading }) {
  return (
    <DataTable 
      data={users}
      columns={columns}
      isLoading={isLoading}
      pagination={{
        currentPage: 1,
        totalPages: 5,
        onPageChange: (page) => console.log(page)
      }}
    />
  );
}
```

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `data` | `T[]` | Array of data items. |
| `columns` | `ColumnDef<T>[]` | Config for headers and cells. |
| `isLoading` | `boolean` | Shows spinner if true. |
| `onRowClick` | `(item) => void` | Callback for row clicks. |
| `pagination` | `PaginationState` | Controls for paging. |
