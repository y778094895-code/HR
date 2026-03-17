# Performance Service Documentation

## Overview
The `PerformanceService` provides endpoints for accessing performance evaluations, metrics, and AI-driven recommendations. It centralizes all logic related to the "Smart Performance" aspect of the system.

## Signatures

```typescript
// Get system-wide performance overview (KPIs, Trends)
getPerformanceOverview(params?: ApiParams): Promise<PerformanceOverview>

// Get paginated list of employees with their performance scores
getEmployeesPerformance(params?: ApiParams): Promise<PaginatedResponse<Employee>>

// Get aggregated performance stats per department
getDepartmentsPerformance(): Promise<DepartmentPerformance[]>

// Get AI recommendations (Training, Interventions, etc.)
getPerformanceRecommendations(employeeId?: string): Promise<PerformanceRecommendation[]>

// Get full 360-view of a specific employee's performance
getEmployeePerformanceDetail(employeeId: string): Promise<EmployeePerformanceDetail>
```

## Usage Example

```typescript
import { performanceService } from '@/services/resources';

// in a component
useEffect(() => {
  const loadData = async () => {
    const overview = await performanceService.getPerformanceOverview({ dateRange: 'this_month' });
    const depts = await performanceService.getDepartmentsPerformance();
    console.log(overview.overall_score);
  };
  loadData();
}, []);
```

## Filters
Common filters used in `params`:
- `department_id`: Filter by specific department.
- `date_range`: 'this_month', 'last_quarter', 'this_year'.
- `min_score` / `max_score`: Filter employees by score range.
