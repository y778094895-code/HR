# Field Name Harmonization Mapping

## 1. Employees
**Backend Schema (`employees-local.schema.ts`) | Type**
- `id` (uuid)
- `erpnextId`
- `employeeCode`
- `fullName`
- `email`
- `department`
- `designation`
- `dateOfJoining`
- `employmentStatus`
- `salary`

**Frontend Type (`employee.service.ts` / Adapter)**
- Currently uses: `employeeCode`, `fullName`, `email`, `department`, `designation`, `dateOfJoining`, `employmentStatus`. 
- **Action**: Ensure alignment. Minimal changes needed here, just verify case (camelCase vs snake_case returning from the API).

---

## 2. Turnover Risk
**Backend Schema (`turnover-risk.schema.ts`)**
- `id`
- `employeeId`
- `riskScore` (decimal) -> Returns as `risk_score` if raw DB, mapping needed in service
- `riskLevel` (varchar) -> Returns as `risk_level`
- `contributingFactors` (jsonb)

**Frontend Type (`dashboard.types.ts` -> `RiskEmployee`)**
- `id` (usually refers to employee id, but backend has a separate row ID)
- `name` (needs to be mapped from `fullName`)
- `department`
- `riskPercent` -> Maps to `riskScore`
- `primaryDriver` -> Extracted from `contributingFactors`
- `drivers` -> Maps to `contributingFactors`
- `suggestedIntervention` -> Maps from `interventions` if joined
- `timeline` -> Separate table/logic

**Action**: Change Frontend `RiskEmployee` to use `riskScore`, `riskLevel` instead of `riskPercent`. Sync `drivers` to `contributingFactors` array structure.

---

## 3. Performance
**Backend Schema (`performance.schema.ts` - `perf_assessments`)**
- `id`
- `employeeId`
- `score` (decimal)
- `measurementType`

**Frontend Type (`dashboard.types.ts` -> `PerformanceData` etc.)**
- Uses `score` and `trend`.

**Action**: Ensure API returning performance data maps `score` directly to the `score` field in `DepartmentPerformance` or `PerformanceTrendPoint`.

---

## 4. Alerts
**Backend Schema (`alerts-reports.schema.ts`)**
- `id`
- `type`
- `severity`
- `status`
- `title`
- `description`
- `riskScore` (decimal)
- `isRead` -> Note: DB uses `isRead`, Frontend uses `unread`
- `triggeredAt`

**Frontend Type (`alerts.types.ts`)**
- `id`, `type`, `severity`, `status`, `title`, `description`, `riskScore`, `triggeredAt`
- `unread` (boolean)

**Action**: Standardize to `isRead` across the stack to match DB, or ensure the Backend Service maps `isRead: boolean` to `unread: !alert.isRead`. It is better to use `isRead` on Frontend to match DB. Modify `Alert` interface in frontend.

---

## 5. Fairness
**Backend Schema (`fairness.schema.ts` / `fairness-runs...`)**
- `id`, `runId`, `demographicGroup`, `metricType`, `metricValue`, `disparityScore`, `isFlagged`

**Frontend Type (`dashboard.types.ts` -> `FairnessData`)**
- `salaryGap: { value, breached }`
- `evaluationBias: { value, breached }`
- `promotionEquity: { value, breached }`

**Action**: The frontend expects a strict summarized object. The backend FairnessService must map the `fairness_metrics` list into this `FairnessData` object holding `breached` (which maps to `isFlagged`) and `value` (which maps to `disparityScore` or `metricValue`).

## Summary of Execution Plan
1. Update `Alert` type in `alerts.types.ts` to use `isRead` instead of `unread`. Fix all UI components referencing `unread`.
2. Update `DashboardResponse.risk.topEmployees` keys in `client/src/types/dashboard.types.ts` from `riskPercent` to `riskScore`, `level` to `riskLevel` to mirror Drizzle schema exactly.
3. Fix up adapters and generic API response formatters to avoid manual remaps where possible.
