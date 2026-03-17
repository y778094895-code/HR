# PR-05: Feature Lists API Integration

This document tracks the conversion of core feature lists from production mock-driven behavior to normalized API-backed frontend views.

## Removed Mock Production Sources
- `RiskList.tsx`: Removed internal `apiGet` mapping logic and assumed snake_case keys.
- `DemographicAnalysis.tsx`: Removed inline `Math.random` for salary and manual disparity calculations where possible.
- `FairnessRecommendations.tsx`: Removed legacy mapping of `impact` and `type` fields within the component.
- `EmployeePerformanceList.tsx`: Removed local mapping of `performance_score` and `employeeId` from `apiGet` results.
- `TrainingProgramList.tsx`: Removed manual rounding of `total_enrolled` and fallback mapping for program titles.

## Mapping Summary

| Component | Service Method | Domain Type | Key Transformations |
|-----------|----------------|-------------|---------------------|
| `RiskList` | `turnoverService.getRiskList` | `TurnoverRisk` | `riskScore` (0.1 -> 10%), `employeeName` -> `name` |
| `DemographicAnalysis` | `fairnessService.getDemographicComparison` | `DemographicComparison` | `subgroups` -> `GroupMetric[]`, `score` -> `avgPerformance` |
| `FairnessRecommendations`| `fairnessService.getFairnessRecommendations` | `FairnessRecommendation` | `type` -> `category`, `impact` (string case) |
| `EmployeePerformanceList`| `performanceService.getEmployeesPerformance` | `Employee` | `performanceScore` -> `score`, `fullName` -> `name` |
| `TrainingProgramList` | `trainingService.getTrainingEffectiveness` | `TrainingEffectiveness` | `programTitle` -> `courseName`, `completionRate` mapping |

## Shape Mismatches & Guards
- **Salary Data**: `DemographicAnalysis` still uses a fallback calculation for salary as the core Salary module is not yet fully normalized in the backend.
- **Training Duration**: `TrainingProgramList` uses "Varies" as a default duration as this field is not currently provided by the effectiveness API.
- **Risk Calculation**: `RiskList` continues to show the primary driver based on the first key of `contributingFactors` if the structured explanation is missing.

## Deferred Items
- Full server-side pagination for all lists (currently handled via `PaginatedResponse` interface but components may still do some local filtering).
- Deep-linking to specific intervention cases from every list (partial implementation in Performance).

---
*Generated as part of PR-05 implementation.*
