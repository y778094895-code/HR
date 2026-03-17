# PR-09: Align Dashboard Widgets and Interventions

## Field Migrations

### Risk Widgets (RiskDrawer, RiskIntelligencePanel)
- **XAIDriver / RiskFactor**: Renamed `explanation` to `description` to align with `RiskFactor` from `risk.ts`.
- **Identifers**: Standardized on `employeeId || id` for case creation to ensure database compatibility.

### Interventions (InterventionsList)
- **Status**: Standardized on lowercase status literals (`planned`, `in_progress`, `completed`).
- **Priority**: Standardized on lowercase priority literals (`high`, `medium`, `low`).
- **Date Handling**: Preferentially uses `dueDate` for execution dates, falling back to `createdAt`.
- **Content**: Uses `description` for the intervention body text.

### Fairness Monitoring
- **Alert Logic**: Replaced `overallAlert` boolean with status-driven interpretation. An alert is now active if any indicator status is `warning` or `critical`.

## Interpretation Logic Changes
- **Fairness**: The UI now dynamically determines the "Overall Status" based on the severity of individual metrics rather than relying on a pre-calculated boolean from the API.
- **Interventions**: Status comparisons are now case-insensitive (via `.toLowerCase()`) to ensure resilience against legacy data.

## Remaining Assumptions
- It is assumed that the `fairness` API indicators always include a `status` field compatible with `'warning' | 'critical'`.

## Deferred Items
- Deep integration of `expectedOutcome` visualization (currently just shows a label if present).
- Migration of `TIMELINE` events in `RiskDrawer` to a more structured domain model (currently uses a local interface).
