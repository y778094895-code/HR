# Data Contract (v1) - Attrition Survival Model

## Required tables (minimum)
- employees
- employee_exit_events (must include exit_date + voluntary flag)
- attendance_records (optional v1)
- leave_records (optional v1)
- performance_evaluations (optional v1)
- employee_compensation (optional v1)

## Labels
- duration_days: integer >= 0
- event: 1 if exit occurred, else 0 (censored)

## Output
- predictions: probability/risk_level + predicted_at
- prediction_explanations: factor + impact_score

## Lineage
- Every training run must record:
  - dataset snapshot hash
  - feature list
  - code version (git commit)
