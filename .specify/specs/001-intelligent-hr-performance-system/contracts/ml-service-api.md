# API Contract: FastAPI ML Service (v1)

**Base URL**: `http://ml-service:8000` (internal; routed via Nginx `/ml/*` in production)
**Auth**: Service-to-service shared secret header `X-Service-Token: <token>` (env var; never client-facing)
**Content-Type**: `application/json`

> This API is **internal only** — never exposed directly to the frontend.
> The NestJS backend is the sole consumer.

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | `{ "status": "ok", "model_version": "rf-v2.1.0" }` |
| GET | `/health` | Extended health — DB connectivity, model load status |

---

## Turnover Risk Prediction

### `POST /predict/turnover`

Compute attrition risk score for a single employee.

**Request body**:
```json
{
  "employee_id": "uuid",
  "features": {
    "tenure_months": 28,
    "salary_percentile": 38.5,
    "days_since_last_review": 180,
    "goal_completion_pct": 62.0,
    "attendance_rate": 0.91,
    "manager_tenure_months": 6,
    "department_turnover_rate_12m": 0.18,
    "performance_trend": -0.4,
    "engagement_score": 52.0,
    "promotion_months_overdue": 14
  }
}
```

**Response 200**:
```json
{
  "employee_id": "uuid",
  "score": 72.4,
  "band": "high",
  "model_version": "rf-v2.1.0",
  "predicted_at": "2026-03-18T09:00:00Z",
  "shap_values": [
    {
      "feature": "salary_percentile",
      "value": 38.5,
      "shap": 0.182,
      "direction": "positive",
      "label_en": "Salary below market median",
      "label_ar": "الراتب أقل من متوسط السوق"
    },
    {
      "feature": "performance_trend",
      "value": -0.4,
      "shap": 0.134,
      "direction": "positive",
      "label_en": "Declining performance trend",
      "label_ar": "اتجاه أداء متراجع"
    }
  ],
  "latency_ms": 210
}
```

**Response 422** — missing required features:
```json
{ "detail": "Required feature 'tenure_months' is missing" }
```

**Response 503** — model not loaded:
```json
{ "detail": "Model unavailable; retry after 30s" }
```

**Latency contract**: p95 ≤ 500 ms. If the ML service cannot respond within this budget, the NestJS backend falls back to the async queue pattern (publishes `prediction.requested` to RabbitMQ).

---

### `POST /predict/turnover/batch`

Batch prediction for up to 500 employees (used by scheduled re-scoring).

**Request body**:
```json
{
  "employees": [
    { "employee_id": "uuid", "features": { … } }
  ]
}
```

**Response 202 Accepted** — queued:
```json
{ "batch_id": "uuid", "count": 342, "estimated_completion_seconds": 45 }
```

Results published to RabbitMQ exchange `ml.events`, routing key `prediction.batch.completed`.

---

## Recommendations

### `POST /recommendations`

Generate intervention recommendations for an at-risk employee.

**Request body**:
```json
{
  "employee_id": "uuid",
  "risk_score": 72.4,
  "risk_band": "high",
  "shap_values": [ … ],
  "performance_gaps": [
    { "competency": "leadership", "score": 2.5, "benchmark": 3.5 }
  ],
  "context": {
    "salary_percentile": 38.5,
    "tenure_months": 28,
    "department_turnover_rate_12m": 0.18
  }
}
```

**Response 200**:
```json
{
  "employee_id": "uuid",
  "recommendations": [
    {
      "type": "compensation",
      "title_en": "Schedule a salary review",
      "title_ar": "جدولة مراجعة الراتب",
      "rationale_en": "Employee's salary is in the 38th percentile; bringing it to the 50th could reduce risk by ~15 points.",
      "rationale_ar": "راتب الموظف في المئين 38؛ رفعه إلى المئين 50 قد يقلل الخطر بنحو 15 نقطة.",
      "expected_risk_reduction": 15.2,
      "effort_level": "medium",
      "owner_role": "hr",
      "source": "ml"
    }
  ],
  "training_suggestions": [
    {
      "category": "Leadership",
      "title_en": "Leadership Fundamentals",
      "title_ar": "أساسيات القيادة",
      "gap_competency": "leadership",
      "gap_score": 2.5,
      "resource_url": null
    }
  ]
}
```

**Fallback**: If the ML engine cannot generate recommendations, NestJS applies rule-based logic (salary percentile check, tenure milestones). This fallback runs entirely in the backend — the ML service is not called.

---

## Fairness Analysis

### `POST /fairness/report`

Compute Adverse Impact Ratio and demographic fairness metrics for a review cycle.

**Request body**:
```json
{
  "cycle_id": "uuid",
  "protected_attribute": "gender",
  "ratings": [
    { "employee_id": "uuid", "group_value": "female", "composite_score": 3.7 }
  ]
}
```

**Response 200**:
```json
{
  "cycle_id": "uuid",
  "protected_attribute": "gender",
  "groups": [
    {
      "group": "female",
      "n": 42,
      "avg_rating": 3.7,
      "selection_rate": 0.62,
      "air": 0.89,
      "p_value": 0.12,
      "flagged": false
    },
    {
      "group": "male",
      "n": 91,
      "avg_rating": 3.85,
      "selection_rate": 0.70,
      "air": 1.0,
      "p_value": null,
      "flagged": false
    }
  ],
  "has_flag": false,
  "suppressed_groups": []
}
```

*Groups with n < 5 appear in `suppressed_groups: ["group_value"]` and are omitted from `groups`.*

---

## Model Registry

### `GET /models`
```json
{
  "models": [
    { "name": "turnover_predictor", "version": "rf-v2.1.0", "trained_at": "2026-02-01", "is_active": true }
  ]
}
```

### `POST /models/reload`
Reload model artefacts from storage without service restart. Used after a new model is deployed.
```json
{ "status": "reloaded", "version": "rf-v2.2.0" }
```

---

## RabbitMQ Event Schema

### Published by NestJS → consumed by ML service

**Exchange**: `ml.events` (direct)

| Routing Key | Payload |
|-------------|---------|
| `prediction.requested` | `{ employee_id, features, correlation_id }` |
| `prediction.batch.requested` | `{ employees: [{employee_id, features}], batch_id }` |

### Published by ML service → consumed by NestJS

| Routing Key | Payload |
|-------------|---------|
| `prediction.completed` | `{ employee_id, score, band, shap_values, model_version, correlation_id }` |
| `prediction.failed` | `{ employee_id, error, correlation_id }` |
| `prediction.batch.completed` | `{ batch_id, results: [{employee_id, score, band}] }` |
