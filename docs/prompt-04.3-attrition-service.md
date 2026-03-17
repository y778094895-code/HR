# Attrition & Intervention Service Documentation

## Overview
This document covers the `TurnoverService` and `InterventionService`, which manage the employee lifecycle risk assessment and corrective actions.

## Turnover Service
Location: [`turnover.service.ts`](file:///client/src/services/resources/turnover.service.ts)

### Features
-   **Dashboard Metrics**: KPI cards for risk rates.
-   **Risk List**: Paginated list of employees with risk scores.
-   **Risk Detail (XAI)**: Detailed view including Explainable AI (XAI) feature importance factors.

### API Signatures
```typescript
getDashboardMetrics(): Promise<TurnoverDashboardMetrics>
getRiskList(params?: ApiParams): Promise<PaginatedResponse<TurnoverRisk>>
getRiskDetail(employeeId: string): Promise<RiskDetail> // Includes XAI
predictRisk(employeeId: string): Promise<TurnoverRisk>
```

## Intervention Service
Location: [`intervention.service.ts`](file:///client/src/services/resources/intervention.service.ts)

### Features
-   **Lifecycle Management**: `Draft` -> `Active` -> `Completed` -> `Closed`.
-   **Monitoring**: Detailed logs and analytics.

### API Signatures
```typescript
getInterventions(params?): Promise<PaginatedResponse<Intervention>>
getInterventionDetail(id: string): Promise<Intervention>
createIntervention(data): Promise<Intervention>
updateStatus(id, status): Promise<void>
logAction(id, action, notes?): Promise<void>
```

### Usage Example (Workflow)
```typescript
// 1. Identify High Risk Employee
const { xai_explanation } = await turnoverService.getRiskDetail(employeeId);

// 2. Create Intervention based on XAI factors
await interventionService.createIntervention({
  employee_id: employeeId,
  type: 'Retention Bonus',
  notes: `Based on high impact factor: ${xai_explanation.top_factor}`
});
```
