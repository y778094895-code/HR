CREATE SCHEMA IF NOT EXISTS ai_layer;

CREATE MATERIALIZED VIEW ai_layer.sim_performance_panel_dataset_v4 AS
SELECT 
    pa.employee_id::varchar,
    pa.created_at::date AS record_date,
    0.0 AS fair_score_logit_mean,
    0.0 AS rater_severity_logit_mean,
    0.0 AS rater_confidence_weight_mean,
    MAX(pa.score) AS performance_rating_mean,
    0.0 AS distance_from_home_mean,
    0.0 AS environment_satisfaction_mean,
    MAX(pa.score) AS kpi_productivity_mean,
    MAX(pa.score) AS kpi_quality_mean,
    0.0 AS leave_days_mean,
    0.0 AS overtime_hours_mean,
    0.0 AS performance_momentum_mean,
    0.0 AS skill_gap_euclidean_mean,
    0.0 AS skill_match_cosine_mean,
    0.0 AS training_roi_mean,
    0.0 AS acceleration_index_mean,
    0.0 AS workload_volatility_mean,
    0.0 AS burnout_index_mean,
    0.0 AS certification_count_mean,
    0.0 AS critical_skill_gap_mean,
    0.0 AS hours_worked_mean,
    0.0 AS improvement_rate_mean,
    MAX(pa.score) AS overall_score,
    MAX(pa.score) AS next_overall_score,
    CASE WHEN MAX(pa.score) >= 4.0 THEN 1 ELSE 0 END AS next_high_flag
FROM perf_assessments pa
GROUP BY pa.employee_id, pa.created_at::date;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_perf_panel_v4_emp_date ON ai_layer.sim_performance_panel_dataset_v4 (employee_id, record_date);
CREATE INDEX IF NOT EXISTS idx_ai_perf_panel_v4_date ON ai_layer.sim_performance_panel_dataset_v4 (record_date);

CREATE MATERIALIZED VIEW ai_layer.sim_survival_horizon_dataset_v1 AS
SELECT 
    e.id::varchar AS employee_id,
    COALESCE(MAX(re.exit_date), CURRENT_DATE) AS record_date,
    0.0 AS overtime_risk_index,
    3.0 AS performance_rating,
    0.0 AS financial_stress_index,
    1000.0 AS salary,
    MAX(re.exit_date) AS exit_date,
    CASE WHEN MAX(re.exit_date) IS NOT NULL THEN 1 ELSE 0 END AS event,
    CASE WHEN MAX(re.exit_date) IS NOT NULL AND MAX(re.exit_date) <= (CURRENT_DATE + INTERVAL '6 months') THEN 1 ELSE 0 END AS event_6m
FROM employees_local e
LEFT JOIN resignation_events re ON e.id = re.employee_id
GROUP BY e.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_survival_hz_v1_emp_date ON ai_layer.sim_survival_horizon_dataset_v1 (employee_id, record_date);
CREATE INDEX IF NOT EXISTS idx_ai_survival_hz_v1_date ON ai_layer.sim_survival_horizon_dataset_v1 (record_date);
