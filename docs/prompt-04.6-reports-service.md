# Reports Service Documentation

## Overview
The `ReportsService` handles the generation and export of system data. It supports asynchronous report generation with status polling and file downloading.

## Signatures

```typescript
// Get available report types
getTemplates(): Promise<ReportTemplate[]>

// Start generation job
requestReport(config: ReportConfig): Promise<ReportJob>

// Check status
getReportStatus(jobId: string): Promise<ReportJob>

// Download file (PDF/Excel)
downloadReport(jobId: string, filename?: string): Promise<void>

// Utility: Poll until complete
pollReport(jobId: string, intervalMs?: number, maxAttempts?: number): Promise<ReportJob>
```

## Usage Example

```typescript
import { reportsService } from '@/services/resources';

const generateAndDownload = async () => {
  try {
    // 1. Request Report
    const job = await reportsService.requestReport({ 
      id: 'perf_q1', 
      type: 'performance', 
      date_range: ['2023-01-01', '2023-03-31'] 
    });

    // 2. Wait for completion
    const completedJob = await reportsService.pollReport(job.jobId);
    
    // 3. Download
    await reportsService.downloadReport(completedJob.jobId, 'Q1_Performance.pdf');
    
  } catch (err) {
    console.error('Report failed', err);
  }
};
```

## Polling Logic
The `pollReport` method automatically checks the status every `intervalMs` (default 2000ms) until the status is 'completed' or 'failed', or until `maxAttempts` (default 30) is reached.
