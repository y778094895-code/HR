-- A) عدد الدورات
SELECT COUNT(*) AS cycles_count FROM performance_cycles;

-- B) عدد تقييمات الأداء لكل دورة
SELECT cycle_id, COUNT(*) AS n_evals
FROM performance_evaluations
GROUP BY cycle_id
ORDER BY cycle_id;

-- C) عدد القياسات KPI / Metrics
SELECT COUNT(*) AS metrics_count FROM performance_metrics;

-- D) حجم employee_metric_values
SELECT COUNT(*) AS metric_values_rows FROM employee_metric_values;

-- E) توزيع القياسات حسب metric_name (أكبرها)
SELECT pm.metric_name, COUNT(*) AS n
FROM employee_metric_values emv
JOIN performance_metrics pm ON pm.metric_id = emv.metric_id
GROUP BY pm.metric_name
ORDER BY n DESC;

-----


DROP TABLE IF EXISTS sim_performance_panel_dataset;

CREATE TABLE sim_performance_panel_dataset AS
WITH cycles AS (
    SELECT cycle_id, start_date, end_date
    FROM performance_cycles
),
-- نجهز "next cycle" لكل موظف
evals AS (
    SELECT
        pe.employee_id,
        pe.cycle_id,
        pc.start_date,
        pc.end_date,
        pe.overall_score,
        LEAD(pe.overall_score) OVER (PARTITION BY pe.employee_id ORDER BY pc.start_date) AS next_overall_score,
        LEAD(pc.end_date)      OVER (PARTITION BY pe.employee_id ORDER BY pc.start_date) AS next_cycle_end
    FROM performance_evaluations pe
    JOIN cycles pc ON pc.cycle_id = pe.cycle_id
),
-- Pivot metrics داخل نفس الدورة إلى Features
metrics_in_cycle AS (
    SELECT
        emv.employee_id,
        pc.cycle_id,
        pm.metric_name,
        AVG(emv.metric_value) AS metric_mean,
        MAX(emv.metric_value) AS metric_max,
        MIN(emv.metric_value) AS metric_min
    FROM employee_metric_values emv
    JOIN performance_metrics pm ON pm.metric_id = emv.metric_id
    JOIN cycles pc
      ON emv.recorded_at::date >= pc.start_date
     AND emv.recorded_at::date <= pc.end_date
    GROUP BY emv.employee_id, pc.cycle_id, pm.metric_name
),
pivot AS (
    SELECT
        employee_id,
        cycle_id,

        -- أهم 6 metrics التي ظهرت عندك (حسب لقطاتك)
        MAX(CASE WHEN metric_name = 'fair_score_logit' THEN metric_mean END) AS fair_score_logit_mean,
        MAX(CASE WHEN metric_name = 'rater_severity_logit' THEN metric_mean END) AS rater_severity_logit_mean,
        MAX(CASE WHEN metric_name = 'rater_confidence_weight' THEN metric_mean END) AS rater_confidence_weight_mean,
        MAX(CASE WHEN metric_name = 'PerformanceRating' THEN metric_mean END) AS performance_rating_mean,
        MAX(CASE WHEN metric_name = 'EnvironmentSatisfaction' THEN metric_mean END) AS environment_satisfaction_mean,
        MAX(CASE WHEN metric_name = 'DistanceFromHome' THEN metric_mean END) AS distance_from_home_mean
    FROM metrics_in_cycle
    GROUP BY employee_id, cycle_id
)
SELECT
    e.employee_id,
    e.end_date::date AS record_date,              -- تاريخ الملاحظة (نهاية الدورة الحالية)

    -- Features
    p.fair_score_logit_mean,
    p.rater_severity_logit_mean,
    p.rater_confidence_weight_mean,
    p.performance_rating_mean,
    p.environment_satisfaction_mean,
    p.distance_from_home_mean,

    -- Targets (الدورة القادمة)
    e.next_overall_score,
    CASE WHEN e.next_overall_score >= 4.0 THEN 1 ELSE 0 END AS next_high_flag

FROM evals e
LEFT JOIN pivot p
  ON p.employee_id = e.employee_id
 AND p.cycle_id = e.cycle_id

-- مهم: لا ندرّب على صفوف ليس لها “دورة قادمة”
WHERE e.next_overall_score IS NOT NULL;

-----


SELECT COUNT(*) AS rows, COUNT(DISTINCT employee_id) AS employees
FROM sim_performance_panel_dataset;

SELECT
  AVG(next_high_flag) AS positive_rate,
  MIN(record_date) AS min_date,
  MAX(record_date) AS max_date
FROM sim_performance_panel_dataset;

SELECT * FROM sim_performance_panel_dataset LIMIT 5;

-----


BEGIN;

DROP TABLE IF EXISTS sim_performance_panel_dataset;

CREATE TABLE sim_performance_panel_dataset AS
WITH metric_rows AS (
    SELECT
        emv.employee_id,
        emv.recorded_at::date AS record_date,
        lower(pm.metric_name) AS metric_name,
        emv.metric_value::numeric AS metric_value
    FROM employee_metric_values emv
    JOIN performance_metrics pm
      ON pm.metric_id = emv.metric_id
),
pivot AS (
    SELECT
        employee_id,
        record_date,

        AVG(metric_value) FILTER (WHERE metric_name = 'fair_score_logit')            AS fair_score_logit_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'rater_severity_logit')        AS rater_severity_logit_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'rater_confidence_weight')    AS rater_confidence_weight_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'performancerating')          AS performance_rating_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'distancefromhome')           AS distance_from_home_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'environmentsatisfaction')    AS environment_satisfaction_mean,

        AVG(metric_value) FILTER (WHERE metric_name = 'kpi_productivity')           AS kpi_productivity_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'kpi_quality')                AS kpi_quality_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'leavedays')                  AS leave_days_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'overtimehours')              AS overtime_hours_mean,

        AVG(metric_value) FILTER (WHERE metric_name = 'performancemomentum')        AS performance_momentum_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'skill_gap_euclidean')        AS skill_gap_euclidean_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'skill_match_cosine')         AS skill_match_cosine_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'trainingroi')                AS training_roi_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'acceleration_index')         AS acceleration_index_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'workload_volatility')        AS workload_volatility_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'burnout_index')              AS burnout_index_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'certification_count')        AS certification_count_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'critical_skill_gap')         AS critical_skill_gap_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'hoursworked')                AS hours_worked_mean,
        AVG(metric_value) FILTER (WHERE metric_name = 'improvement_rate')           AS improvement_rate_mean

    FROM metric_rows
    GROUP BY employee_id, record_date
),
evals AS (
    SELECT
        e.employee_id,
        pc.end_date::date AS record_date,
        e.overall_score,
        LEAD(e.overall_score) OVER (PARTITION BY e.employee_id ORDER BY pc.end_date) AS next_overall_score
    FROM performance_evaluations e
    JOIN performance_cycles pc
      ON pc.cycle_id = e.cycle_id
),
targets AS (
    SELECT
        employee_id,
        record_date,
        overall_score,
        next_overall_score,
        CASE WHEN next_overall_score >= 4.0 THEN 1 ELSE 0 END AS next_high_flag
    FROM evals
    WHERE next_overall_score IS NOT NULL
)
SELECT
    t.employee_id,
    t.record_date,

    p.fair_score_logit_mean,
    p.rater_severity_logit_mean,
    p.rater_confidence_weight_mean,
    p.performance_rating_mean,
    p.distance_from_home_mean,
    p.environment_satisfaction_mean,

    p.kpi_productivity_mean,
    p.kpi_quality_mean,
    p.leave_days_mean,
    p.overtime_hours_mean,
    p.performance_momentum_mean,
    p.skill_gap_euclidean_mean,
    p.skill_match_cosine_mean,
    p.training_roi_mean,
    p.acceleration_index_mean,
    p.workload_volatility_mean,
    p.burnout_index_mean,
    p.certification_count_mean,
    p.critical_skill_gap_mean,
    p.hours_worked_mean,
    p.improvement_rate_mean,

    t.overall_score,
    t.next_overall_score,
    t.next_high_flag
FROM targets t
LEFT JOIN pivot p
  ON p.employee_id = t.employee_id
 AND p.record_date = t.record_date;

CREATE INDEX IF NOT EXISTS idx_perf_panel_emp_date
ON sim_performance_panel_dataset (employee_id, record_date);

CREATE INDEX IF NOT EXISTS idx_perf_panel_date
ON sim_performance_panel_dataset (record_date);

COMMIT;