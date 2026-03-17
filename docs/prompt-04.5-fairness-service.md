# Fairness Service Documentation

## Overview
The `FairnessService` focuses on detecting bias, comparing demographic groups, and recommending actions to ensure equity within the organization.

## Signatures

```typescript
// Get list of bias metrics (e.g., Hiring Bias, Pay Gap)
getFairnessMetrics(params?: ApiParams): Promise<BiasMetric[]>

// Compare groups (e.g., compare 'Gender' or 'Ethnicity')
getDemographicComparison(groupBy: string): Promise<DemographicComparison>

// Get actionable recommendations
getFairnessRecommendations(): Promise<FairnessRecommendation[]>

// Specific Department Analysis
analyzeDepartment(departmentId: string): Promise<BiasMetric[]>
```

## Usage Example

```typescript
import { fairnessService } from '@/services/resources';

const checkGenderPayGap = async () => {
  const comparison = await fairnessService.getDemographicComparison('gender');
  console.log('Disparity Score:', comparison.disparity_score);
  
  comparison.subgroups.forEach(group => {
    console.log(`${group.name}: $${group.avg_salary}`);
  });
};
```

## Key APIs
-   `GET /fairness/metrics`: Returns core indicators.
-   `GET /fairness/comparison?group_by=...`: Returns statistical comparisons.
-   `GET /fairness/recommendations`: Returns improvement strategies with impact scores.
