# Reports Engine - SRD Delivery Document

## Overview
This document describes the implementation of the Reports Engine in the HR Platform frontend, aligned with the SRD (Software Requirements Document) expectations.

## Implemented Report Flow

### 1. Reports Page Structure
The ReportsPage has been transformed from placeholder tabs to a fully functional reporting interface with three main views:

- **Library View** (`view=library`): Access to pre-defined report templates from backend
- **Builder View** (`view=builder`): Custom report generation form
- **Downloads View** (`view=exports`): Job status tracking and download management

### 2. Template-Based Reports (ReportTemplatesGrid)

**API-Backend Features:**
- Loads templates from `reportsService.getTemplates()` 
- Displays template cards with icons, descriptions
- Supports "Run Now" action to initiate report generation

**Empty State:**
- When backend `/reports/templates` returns empty array, displays professional empty state
- No synthetic/fallback templates are rendered as substitutes

**States:**
- Loading state with spinner
- Error state with retry button
- Empty state when no templates available from server

### 3. Custom Report Builder (ReportBuilder)

**Features:**
- Data source selection (Performance, Attrition, Training, Fairness)
- Date range presets (Last 30 Days, Last Quarter, Year to Date)
- Export format selection (PDF, Excel/CSV)
- Async generation info notice

**Request Payload:**
```typescript
{
  templateId: string;
  format: 'pdf' | 'csv' | 'xlsx';
  parameters: {
    periodStart: string;
    periodEnd: string;
  };
}
```

### 4. Job Status Tracking & Downloads (ReportDownloadCenter)

**API-Backend Features:**
- Fetches job status from `reportsService.getReportStatus(jobId)`
- Downloads completed reports via `reportsService.downloadReport(jobId, filename)`
- Real-time polling every 3 seconds for job status updates

**Frontend-Persisted Job Continuity:**
- Jobs are stored in localStorage under `hr_report_jobs` key
- Stores: jobId, templateId, templateName, format, parameters, requestedAt
- Maximum 20 jobs retained in storage
- On page load, stored jobs are hydrated with fresh status from backend

**Status Display:**
- `pending` / `processing`: Shows "Processing" with spinner
- `completed`: Shows "Ready" with download enabled
- `failed`: Shows "Failed" with error message

**Polling Behavior:**
- Automatically starts polling when a new job is submitted
- Polls every 3 seconds until completed or failed
- Stops polling on success/failure
- Manual refresh available per job

### 5. No Fake/Demo Behavior

**Removed:**
- Fallback synthetic template arrays
- Mock job arrays in ReportDownloadCenter
- Simulated random completion timers
- Fake blob downloads for demo purposes

**Implemented:**
- Real API calls to backend services
- Actual job persistence in localStorage
- Genuine polling mechanism
- Real download through service layer

## What is API-Backed

| Feature | Backend Endpoint | Frontend Service |
|---------|-----------------|------------------|
| List templates | `GET /reports/templates` | `reportsService.getTemplates()` |
| Request report | `POST /reports/jobs` | `reportsService.requestReport()` |
| Check job status | `GET /reports/jobs/:jobId` | `reportsService.getReportStatus()` |
| Download report | `GET /reports/jobs/:jobId/download` | `reportsService.downloadReport()` |

## What is Frontend-Persisted Only

For job continuity when backend doesn't expose list-jobs:
- **localStorage**: `hr_report_jobs` key stores job metadata
- **Hydration**: On load, iterates stored jobs and fetches fresh status
- **Persistence**: Jobs survive page refresh, limited to 20 most recent

## Visible Implemented Features

The delivery-ready core reports experience includes:

1. **Templates Tab**: View and run available report templates from backend
2. **Request Report Tab**: Build custom reports with data source, date range, format
3. **Report Jobs Tab**: Track job status, poll for completion, download results

## Deferred/Hidden Capabilities

These features are NOT visible in the core reports flow (not implemented):

1. **Scheduled Reports** - Backend support needed
2. **Export History Archive** - Backend support needed
3. **Report Sharing** - Backend support needed
4. **Custom Visualization Builder** - Backend support needed
5. **Custom Formula Injection** - Backend support needed
6. **Strategic Reports** - Backend aggregation needed
7. **Regulatory Reports** - Backend compliance support needed

These are intentionally hidden from the UI - they do not appear as "Coming Soon" tabs or placeholders.

## Supported Report Categories

Based on available frontend services and types:

1. **Performance Reporting**
   - Template: `performance-summary`
   - Type: `performance`
   - Data Source: `performanceService`

2. **Attrition/Turnover Reporting**
   - Template: `attrition-analysis`
   - Type: `turnover` / `attrition`
   - Data Source: `turnoverService`

3. **Fairness/Diversity Reporting**
   - Template: `fairness-audit`
   - Type: `fairness`
   - Data Source: `fairnessService`

4. **Training Effectiveness Reporting**
   - Template: `training-effectiveness`
   - Type: `training`
   - Data Source: `trainingService`

## SRD Alignment

### Performance Reporting ✅
- Available via performance service
- Template-based generation supported
- Date range filtering works

### Attrition/Turnover Reporting ✅
- Available via turnover service
- Risk analysis templates supported
- Historical comparison via date ranges

### Fairness Reporting ✅
- Available via fairness service
- Demographic analysis templates
- Gap analysis support

### Temporal Comparison Reporting ✅
- Date range presets (last30, last90, ytd) enable period comparison
- Parameters passed to backend for time-filtered queries

## Validation Results

- ✅ `npm run typecheck` - PASSED
- ✅ `npm run build` - PASSED

## Runtime Stability Improvements (2026-02-13)

The following defensive runtime fixes have been implemented to ensure the Reports page never renders a blank screen:

### 1. ReportsPage.tsx
- Added explicit `view` query parameter validation
- Only allows: `library`, `builder`, `exports`
- Invalid/missing values fallback to `library` safely
- Prevents undefined view state from causing render crashes

### 2. reports.service.ts
- `getTemplates()` now defensively returns an empty array if `normalizeKeys` returns null/undefined
- Guards against malformed API responses that could cause `.length` access to throw

### 3. ReportTemplatesGrid.tsx
- Added null/undefined check before `templates.length` check
- Template mapping now handles missing `type` field gracefully (defaults to 'performance')
- Skips templates with missing `id` or `name` fields during render

### 4. ReportDownloadCenter.tsx
- Added defensive checks when mapping jobs to ensure required fields exist
- Filters out malformed job entries before passing to DataTable
- Provides safe defaults for `templateName`, `format`, `status`, `requestedAt`, `displayName`

### 5. useReportJobs.ts
- `getStoredJobs()` now validates localStorage data structure before returning
- Filters out malformed entries that lack required fields
- Backend status hydration now validates status is one of: pending, processing, completed, failed
- `refreshJob()` also validates status from backend before using

### Graceful Degradation States
The Reports page now guarantees one of these states is always rendered:
- Loading state (spinner)
- Error state (with retry button)
- Empty state (when no data available)
- Valid data grid/content

**Never a blank screen.**

## Delivery Readiness

The Reports Engine is **delivery-ready** from a frontend perspective:

1. ✅ Real API integration using existing services
2. ✅ Proper loading, error, and empty states
3. ✅ No synthetic/fallback template arrays rendered
4. ✅ No "Coming Soon" placeholder tabs visible
5. ✅ Job persistence across page refreshes
6. ✅ Polling mechanism for async jobs
7. ✅ Download flow for completed reports
8. ✅ No fake/demo behavior
9. ✅ Honest empty states for missing backend features
10. ✅ Type-safe with full TypeScript coverage
11. ✅ Build passes without errors

## Files Modified

- `client/src/pages/dashboard/ReportsPage.tsx` - Simplified to 3 core tabs only
- `client/src/components/features/reports/ReportTemplatesGrid.tsx` - No fallback templates

## Files Added (Previously)

- `client/src/hooks/useReports.ts` - Template fetching hook
- `client/src/hooks/useReportJobs.ts` - Job management with polling
- `client/src/lib/reports/index.ts` - Report utilities and helpers

## Prompt 2 Status: CLOSED ✅

The Reports Engine cleanup patch is complete:
- Fallback synthetic templates removed - now shows honest empty state
- All "Coming Soon" placeholder tabs removed from visible flow
- Only delivery-ready core features remain visible (Templates, Builder, Downloads)
- Documentation updated to reflect actual visible state

