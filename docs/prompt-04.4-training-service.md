# Training Service Documentation

## Overview
The `TrainingService` manages the Learning & Development module, focusing on skill gap analysis, AI-driven training recommendations, and program effectiveness tracking.

## Signatures

```typescript
// Analyze skill gaps for a specific employee
getSkillGaps(employeeId: string): Promise<SkillGap[]>

// Get training recommendations (optionally filtered by employee)
getRecommendations(params?: { employee_id?: string }): Promise<TrainingRecommendation[]>

// Manager Actions
approveRecommendation(id: string): Promise<void>
rejectRecommendation(id: string, reason?: string): Promise<void>

// ROI & Impact Analysis
getTrainingEffectiveness(programId?: string): Promise<TrainingEffectiveness[]>
```

## Usage Example

```typescript
import { trainingService } from '@/services/resources';

const handleApproval = async (recId: string) => {
  try {
    await trainingService.approveRecommendation(recId);
    console.log('Training Approved');
  } catch (err) {
    console.error('Approval failed', err);
  }
};
```

## Key Types
-   **SkillGap**: Difference between required and actual skill levels.
-   **TrainingRecommendation**: AI-suggested module with a matching score.
-   **TrainingEffectiveness**: ROI metrics (Completion Rate, Score Improvement).
