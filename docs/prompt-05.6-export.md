# Export Components Documentation

## Overview
The Export system consists of a utility function `downloadBlob` for handling file downloads in the browser, and a UI component `ExportButtons` for triggering these exports.

## Features
-   **Generic Download**: `downloadBlob` works with any Blob type (PDF, CSV, Excel).
-   **Loading States**: `ExportButtons` manages individual loading states for PDF and Excel actions.
-   **Iconography**: Uses distinct icons/colors for different formats.

## Usage Example

```tsx
import { ExportButtons } from '@/components/features/exports/ExportButtons';
import { downloadBlob } from '@/lib/download';
import { apiClient } from '@/services/api/client';

export function ReportsPage() {
  const handleExport = async (type: 'pdf' | 'excel') => {
    // 1. Fetch Blob from API
    const response = await apiClient.get<Blob>(`/reports/export?format=${type}`, {
        responseType: 'blob'
    });

    // 2. Trigger Download
    downloadBlob(response, `report.${type === 'excel' ? 'xlsx' : 'pdf'}`);
  };

  return (
    <div className="flex justify-end">
      <ExportButtons onExport={handleExport} />
    </div>
  );
}
```

## Props (ExportButtons)

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onExport` | `(type) => Promise<void>` | Async handler for export action. |
| `isLoading` | `boolean` | Global loading state. |
| `showPdf` | `boolean` | Toggle PDF button (default true). |
| `showExcel` | `boolean` | Toggle Excel button (default true). |
