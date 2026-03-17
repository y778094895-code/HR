# Sprint 3: Interventions & Smart Recommendations

## Purpose
Convert analytics from Sprint 1 & 2 into actionable interventions. Use AI to recommend next steps for employees at risk or with high potential.

## Backend API

### Interventions
- `GET /api/interventions`: List interventions (filters: `employeeId`, `status`)
- `POST /api/interventions`: Create new intervention
- `PATCH /api/interventions/:id`: Update intervention status or details
- `GET /api/interventions/:id/history`: Get status history
- `GET /api/interventions/analytics`: Get impact metrics

### Recommendations
- `GET /api/recommendations`: List recommendations
- `POST /api/recommendations/generate`: Trigger AI generation (calls ML service)
- `POST /api/recommendations/:id/accept/reject/apply`: Process recommendation

## ML Service integration
- `POST /recommendations/generate`: Core AI logic for suggestions.
- `POST /impact/predict`: Heuristic assessment of intervention efficacy.

## Test Commands
```bash
# Backend tests
cd server && npm test modules/interventions

# ML service tests
cd ml-service && pytest tests/test_recommendations.py
```

## Known Limits
- AI recommendations are currently rule-based mocks.
- Impact estimation uses static weights.
