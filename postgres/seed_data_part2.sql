-- ============================================================
-- Smart HR System — Seed Data Part 2
-- Business Tables: Performance, Training, Risk, Fairness,
-- Alerts, Reports, Governance, Forms, Integrations, Dashboards
-- NOTE: No single transaction — each section commits independently
-- ============================================================

-- ============================================================
-- 7. PERFORMANCE CYCLES & ASSESSMENTS
-- ============================================================
INSERT INTO perf_cycles (id, name, period_start, period_end, status) VALUES
  ('10000000-0000-0000-0000-000000000001', 'دورة الأداء Q4-2025', '2025-10-01', '2025-12-31', 'completed'),
  ('10000000-0000-0000-0000-000000000002', 'دورة الأداء Q1-2026', '2026-01-01', '2026-03-31', 'active'),
  ('10000000-0000-0000-0000-000000000003', 'دورة الأداء Q2-2026', '2026-04-01', '2026-06-30', 'draft')
ON CONFLICT DO NOTHING;

INSERT INTO performance_cycles (id, name, start_date, end_date, status) VALUES
  ('10100000-0000-0000-0000-000000000001', 'السنوي 2025', '2025-01-01', '2025-12-31', 'completed'),
  ('10100000-0000-0000-0000-000000000002', 'السنوي 2026', '2026-01-01', '2026-12-31', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO perf_assessments (id, employee_id, cycle_id, score, measurement_type, submitted_by, submitted_at) VALUES
  ('11000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',87.50,'quarterly','c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '60 days'),
  ('11000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',72.00,'quarterly','c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '60 days'),
  ('11000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',65.30,'quarterly','c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '60 days'),
  ('11000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001',91.00,'quarterly','c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '60 days'),
  ('11000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001',78.50,'quarterly','c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '60 days'),
  ('11000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',85.00,'quarterly','c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '10 days'),
  ('11000000-0000-0000-0000-000000000007','f0000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000002',60.00,'quarterly','c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '10 days'),
  ('11000000-0000-0000-0000-000000000008','f0000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000002',88.75,'quarterly','c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '10 days')
ON CONFLICT DO NOTHING;

INSERT INTO perf_kpi_scores (id, assessment_id, kpi_code, value, weight) VALUES
  ('12000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','PRODUCTIVITY',90.00,0.30),
  ('12000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','QUALITY',85.00,0.25),
  ('12000000-0000-0000-0000-000000000003','11000000-0000-0000-0000-000000000001','TEAMWORK',88.00,0.20),
  ('12000000-0000-0000-0000-000000000004','11000000-0000-0000-0000-000000000002','SALES_TARGET',68.00,0.40),
  ('12000000-0000-0000-0000-000000000005','11000000-0000-0000-0000-000000000002','CUSTOMER_SAT',80.00,0.30),
  ('12000000-0000-0000-0000-000000000006','11000000-0000-0000-0000-000000000003','SALES_TARGET',55.00,0.40),
  ('12000000-0000-0000-0000-000000000007','11000000-0000-0000-0000-000000000003','CUSTOMER_SAT',72.00,0.30)
ON CONFLICT DO NOTHING;

INSERT INTO employee_goals (id, employee_id, cycle_id, title, description, status, progress, due_date) VALUES
  ('13000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','10100000-0000-0000-0000-000000000002','إتقان React Native','تعلم تطوير تطبيقات الجوال','in_progress',45.00,'2026-06-30'),
  ('13000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000003','10100000-0000-0000-0000-000000000002','تحقيق هدف مبيعات Q1','الوصول لهدف 500K ريال','in_progress',30.00,'2026-03-31'),
  ('13000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000005','10100000-0000-0000-0000-000000000002','الحصول على شهادة AWS','تقدم لامتحان Solutions Architect','pending',10.00,'2026-09-30'),
  ('13000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000011','10100000-0000-0000-0000-000000000002','بناء Data Pipeline','إعداد خط أنابيب بيانات تلقائي','in_progress',60.00,'2026-04-30')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. SKILLS & TRAINING
-- ============================================================
INSERT INTO skill_catalog (id, name, category) VALUES
  ('20000000-0000-0000-0000-000000000001','Python','تقنية'),
  ('20000000-0000-0000-0000-000000000002','JavaScript','تقنية'),
  ('20000000-0000-0000-0000-000000000003','SQL','تقنية'),
  ('20000000-0000-0000-0000-000000000004','إدارة المشاريع','إدارية'),
  ('20000000-0000-0000-0000-000000000005','التسويق الرقمي','تسويق'),
  ('20000000-0000-0000-0000-000000000006','إدارة الموارد البشرية','إدارية'),
  ('20000000-0000-0000-0000-000000000007','التحليل المالي','مالية'),
  ('20000000-0000-0000-0000-000000000008','خدمة العملاء','مهارات ناعمة'),
  ('20000000-0000-0000-0000-000000000009','القيادة','مهارات ناعمة'),
  ('20000000-0000-0000-0000-000000000010','تحليل البيانات','تقنية')
ON CONFLICT (name) DO NOTHING;

-- employee_skills: use subqueries to look up skill_id by name (avoids UUID mismatch)
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000001', id, 4 FROM skill_catalog WHERE name='JavaScript'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000001', id, 3 FROM skill_catalog WHERE name='SQL'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000005', id, 5 FROM skill_catalog WHERE name='Python'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000005', id, 4 FROM skill_catalog WHERE name='JavaScript'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000011', id, 4 FROM skill_catalog WHERE name='Python'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000011', id, 5 FROM skill_catalog WHERE name='تحليل البيانات'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000002', id, 4 FROM skill_catalog WHERE name='التسويق الرقمي'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000007', id, 4 FROM skill_catalog WHERE name='إدارة المشاريع'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000007', id, 3 FROM skill_catalog WHERE name='القيادة'
ON CONFLICT DO NOTHING;
INSERT INTO employee_skills (employee_id, skill_id, level)
SELECT 'f0000000-0000-0000-0000-000000000008', id, 3 FROM skill_catalog WHERE name='التحليل المالي'
ON CONFLICT DO NOTHING;

INSERT INTO training_programs (id, title, description, provider, duration_hours) VALUES
  ('21000000-0000-0000-0000-000000000001','أساسيات الذكاء الاصطناعي','دورة تمهيدية في AI/ML','أكاديمية التقنية',40),
  ('21000000-0000-0000-0000-000000000002','القيادة الفعالة','تطوير المهارات القيادية','معهد الإدارة',24),
  ('21000000-0000-0000-0000-000000000003','التسويق الرقمي المتقدم','استراتيجيات التسويق الحديثة','Google Academy',30),
  ('21000000-0000-0000-0000-000000000004','إدارة المشاريع الاحترافية PMP','التحضير لشهادة PMP','PMI',60),
  ('21000000-0000-0000-0000-000000000005','تحليل البيانات مع Python','تحليل البيانات المتقدم','Coursera',35),
  ('21000000-0000-0000-0000-000000000006','خدمة العملاء المتميزة','مهارات التعامل مع العملاء','معهد الخدمة',16)
ON CONFLICT DO NOTHING;

INSERT INTO training_enrollments (id, employee_id, program_id, status, enrolled_at, completed_at) VALUES
  ('22000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','completed',NOW()-INTERVAL '90 days',NOW()-INTERVAL '30 days'),
  ('22000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002','21000000-0000-0000-0000-000000000003','enrolled',NOW()-INTERVAL '15 days',NULL),
  ('22000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000007','21000000-0000-0000-0000-000000000002','completed',NOW()-INTERVAL '120 days',NOW()-INTERVAL '60 days'),
  ('22000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000011','21000000-0000-0000-0000-000000000005','enrolled',NOW()-INTERVAL '20 days',NULL),
  ('22000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000010','21000000-0000-0000-0000-000000000006','completed',NOW()-INTERVAL '45 days',NOW()-INTERVAL '10 days'),
  ('22000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000005','21000000-0000-0000-0000-000000000004','enrolled',NOW()-INTERVAL '5 days',NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. TURNOVER RISK
-- ============================================================
INSERT INTO turnover_risk (id, employee_id, risk_score, risk_level, confidence_score, contributing_factors, prediction_date, ml_model_version) VALUES
  ('30000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',0.8800,'high',0.9200,'[{"factor":"no_promotion_24m","weight":0.35},{"factor":"low_satisfaction","weight":0.28}]',NOW()-INTERVAL '2 days','attrition_v2.1'),
  ('30000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002',0.7400,'high',0.8500,'[{"factor":"transfer_denied","weight":0.40},{"factor":"market_gap","weight":0.20}]',NOW()-INTERVAL '3 days','attrition_v2.1'),
  ('30000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000003',0.5500,'medium',0.7800,'[{"factor":"low_commission","weight":0.30},{"factor":"team_changes","weight":0.15}]',NOW()-INTERVAL '5 days','attrition_v2.1'),
  ('30000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000005',0.1500,'low',0.9500,'[{"factor":"recent_promotion","weight":-0.40}]',NOW()-INTERVAL '30 days','attrition_v2.1'),
  ('30000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000010',0.6200,'medium',0.8000,'[{"factor":"workload","weight":0.25},{"factor":"low_pay","weight":0.30}]',NOW()-INTERVAL '1 day','attrition_v2.1'),
  ('30000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000016',0.7100,'high',0.8200,'[{"factor":"burnout","weight":0.35},{"factor":"no_growth","weight":0.20}]',NOW()-INTERVAL '2 days','attrition_v2.1')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. RISK CASES
-- ============================================================
INSERT INTO risk_cases (id, employee_id, risk_ratio, threshold_classification, status, owner_user_id, top_risk_factors, opened_at) VALUES
  ('31000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',88.00,'critical','open','c0000000-0000-0000-0000-000000000003','{"factors":["no_promotion","low_satisfaction"]}',NOW()-INTERVAL '2 days'),
  ('31000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002',74.00,'high','open','c0000000-0000-0000-0000-000000000003','{"factors":["transfer_denied"]}',NOW()-INTERVAL '3 days'),
  ('31000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000016',71.00,'high','open','c0000000-0000-0000-0000-000000000002','{"factors":["burnout","low_growth"]}',NOW()-INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. INTERVENTIONS & RECOMMENDATIONS
-- ============================================================
INSERT INTO interventions (id, employee_id, type, title, description, status, priority, owner_id, created_by, due_date, risk_case_id) VALUES
  ('32000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','retention_interview','مقابلة بقاء مع أحمد مصطفى','مقابلة لفهم أسباب عدم الرضا ومناقشة فرص الترقية','in_progress','high','c0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',NOW()+INTERVAL '7 days','31000000-0000-0000-0000-000000000001'),
  ('32000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000003','performance_plan','خطة تحسين أداء محمد العتيبي','خطة لتحسين أداء مبيعات الربع القادم','planned','medium','c0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',NOW()+INTERVAL '30 days',NULL),
  ('32000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000010','training','تسجيل هند في دورة خدمة العملاء المتقدمة','تطوير مهارات خدمة العملاء','completed','low','c0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '5 days',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO recommendations (id, employee_id, department, source, recommendation_type, title, description, confidence, status) VALUES
  ('33000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',NULL,'ml','retention','ترقية وتعديل راتب','يُوصى بترقية الموظف مع تعديل الراتب لتخفيض خطر الاستقالة',85.50,'active'),
  ('33000000-0000-0000-0000-000000000002',NULL,'المبيعات','ml','team_restructure','إعادة هيكلة فريق المبيعات','تشير البيانات إلى حاجة لإعادة توزيع المناطق وتحسين الحوافز',72.00,'active'),
  ('33000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000011',NULL,'ml','career_development','مسار تطور وظيفي - ياسر','يمتلك مهارات تحليل بيانات متقدمة ويُوصى بتأهيله لدور قيادي',90.00,'active'),
  ('33000000-0000-0000-0000-000000000004',NULL,'خدمة العملاء','ml','training','تدريب شامل على إدارة الشكاوى','ارتفاع معدل التذمر يتطلب تدريب الفريق على تقنيات حديثة',68.00,'active')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. FAIRNESS
-- ============================================================
INSERT INTO fairness_metrics (id, metric_name, category, value, threshold, status, analysis_date, department, sample_size) VALUES
  ('34000000-0000-0000-0000-000000000001','gender_pay_gap','compensation',0.0820,0.0500,'warning','2026-02-01','تقنية المعلومات',45),
  ('34000000-0000-0000-0000-000000000002','promotion_rate_parity','career',0.1500,0.1000,'alert','2026-02-01','المبيعات',30),
  ('34000000-0000-0000-0000-000000000003','training_access_equity','development',0.0300,0.0500,'normal','2026-02-01','الموارد البشرية',20),
  ('34000000-0000-0000-0000-000000000004','performance_eval_bias','evaluation',0.0700,0.0500,'warning','2026-02-01',NULL,150)
ON CONFLICT DO NOTHING;

INSERT INTO fairness_runs (id, dataset_ref, notes, created_by) VALUES
  ('35000000-0000-0000-0000-000000000001','dataset_q4_2025','تحليل عدالة الربع الرابع 2025','c0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO fairness_metric_values (id, run_id, metric, "group", value) VALUES
  ('36000000-0000-0000-0000-000000000001','35000000-0000-0000-0000-000000000001','pay_equity','male',0.9500),
  ('36000000-0000-0000-0000-000000000002','35000000-0000-0000-0000-000000000001','pay_equity','female',0.8700),
  ('36000000-0000-0000-0000-000000000003','35000000-0000-0000-0000-000000000001','promotion_rate','male',0.1800),
  ('36000000-0000-0000-0000-000000000004','35000000-0000-0000-0000-000000000001','promotion_rate','female',0.1200)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 13. ALERTS & REPORTS
-- ============================================================
INSERT INTO alerts (id, type, channel, status, escalation_level, recipient_user_id, related_entity_type, related_entity_id, sent_at, read_at) VALUES
  ('37000000-0000-0000-0000-000000000001','attrition_risk','in_app','sent','high','c0000000-0000-0000-0000-000000000003','employee','f0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '2 days',NULL),
  ('37000000-0000-0000-0000-000000000002','performance_drop','in_app','read','none','c0000000-0000-0000-0000-000000000002','employee','f0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '5 days',NOW()-INTERVAL '4 days'),
  ('37000000-0000-0000-0000-000000000003','fairness_alert','email','sent','medium','c0000000-0000-0000-0000-000000000003','department','d0000000-0000-0000-0000-000000000004',NOW()-INTERVAL '1 day',NULL),
  ('37000000-0000-0000-0000-000000000004','threshold_breach','in_app','sent','critical','c0000000-0000-0000-0000-000000000001','department','d0000000-0000-0000-0000-000000000007',NOW()-INTERVAL '1 day',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO report_definitions (id, name, description, template_json) VALUES
  ('38000000-0000-0000-0000-000000000001','تقرير الأداء الشهري','ملخص أداء الأقسام والموظفين','{"sections":["kpis","trends","recommendations"]}'),
  ('38000000-0000-0000-0000-000000000002','تقرير مخاطر الاستقالة','تحليل مخاطر التسرب الوظيفي','{"sections":["risk_distribution","top_risks","cost_analysis"]}'),
  ('38000000-0000-0000-0000-000000000003','تقرير العدالة','تقرير تدقيق العدالة والمساواة','{"sections":["pay_equity","promotion_parity","recommendations"]}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 14. GOVERNANCE & POLICIES
-- ============================================================
INSERT INTO policies (id, policy_name, rule_json, status) VALUES
  ('39000000-0000-0000-0000-000000000001','حد أقصى للاستقالات الشهرية','{"max_monthly_resignations":5,"scope":"department"}','active'),
  ('39000000-0000-0000-0000-000000000002','فجوة رواتب مقبولة','{"max_pay_gap_percent":5,"group_by":"gender"}','active'),
  ('39000000-0000-0000-0000-000000000003','حد أدنى ساعات تدريب','{"min_annual_training_hours":20,"scope":"employee"}','active')
ON CONFLICT (policy_name) DO NOTHING;

INSERT INTO data_governance (id, src_name, retention_days, status, admin) VALUES
  ('40000000-0000-0000-0000-000000000001','employees_local',730,'active','سعيد المشرف'),
  ('40000000-0000-0000-0000-000000000002','perf_assessments',1095,'active','سعيد المشرف'),
  ('40000000-0000-0000-0000-000000000003','turnover_risk',365,'active','سعيد المشرف')
ON CONFLICT (src_name) DO NOTHING;

-- ============================================================
-- 15. FORM TEMPLATES
-- ============================================================
INSERT INTO form_templates (id, key, name, description, status) VALUES
  ('41000000-0000-0000-0000-000000000001','exit_interview','مقابلة نهاية الخدمة','نموذج مقابلة نهاية الخدمة','active'),
  ('41000000-0000-0000-0000-000000000002','satisfaction_survey','استبيان رضا الموظفين','استبيان دوري لقياس رضا الموظفين','active'),
  ('41000000-0000-0000-0000-000000000003','training_feedback','تقييم التدريب','تقييم البرنامج التدريبي من قبل المتدرب','active')
ON CONFLICT (key) DO NOTHING;

INSERT INTO form_versions (id, template_id, version, schema_json) VALUES
  ('42000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000001',1,'{"fields":[{"name":"exit_reason","type":"select"},{"name":"satisfaction","type":"rating"},{"name":"comments","type":"textarea"}]}'),
  ('42000000-0000-0000-0000-000000000002','41000000-0000-0000-0000-000000000002',1,'{"fields":[{"name":"overall_satisfaction","type":"rating"},{"name":"management","type":"rating"},{"name":"suggestions","type":"textarea"}]}'),
  ('42000000-0000-0000-0000-000000000003','41000000-0000-0000-0000-000000000003',1,'{"fields":[{"name":"program_rating","type":"rating"},{"name":"instructor","type":"rating"},{"name":"applied_learning","type":"boolean"}]}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. EXTERNAL SYSTEMS & INTEGRATIONS
-- ============================================================
INSERT INTO external_systems (id, name, type, status) VALUES
  ('43000000-0000-0000-0000-000000000001','ERPNext','erp','active'),
  ('43000000-0000-0000-0000-000000000002','SAP SuccessFactors','hris','inactive'),
  ('43000000-0000-0000-0000-000000000003','Microsoft Teams','communication','active')
ON CONFLICT (name) DO NOTHING;

INSERT INTO integration_connections (id, system_id, base_url, auth_type, status) VALUES
  ('44000000-0000-0000-0000-000000000001','43000000-0000-0000-0000-000000000001','https://erp.company.sa/api','api_key','active'),
  ('44000000-0000-0000-0000-000000000002','43000000-0000-0000-0000-000000000003','https://graph.microsoft.com/v1.0','oauth2','active')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 17. ATTENDANCE (sample week)
-- ============================================================
INSERT INTO hr_attendance (id, employee_id, date, check_in, check_out, work_minutes, source) VALUES
  ('45000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','2026-02-23','08:00','17:00',540,'biometric'),
  ('45000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000001','2026-02-24','08:15','17:30',555,'biometric'),
  ('45000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000001','2026-02-25','08:00','17:00',540,'biometric'),
  ('45000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000002','2026-02-23','09:00','18:00',540,'biometric'),
  ('45000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000002','2026-02-24','08:45','17:30',525,'biometric'),
  ('45000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000003','2026-02-23','08:30','16:00',450,'manual'),
  ('45000000-0000-0000-0000-000000000007','f0000000-0000-0000-0000-000000000010','2026-02-23',NULL,NULL,0,'manual'),
  ('45000000-0000-0000-0000-000000000008','f0000000-0000-0000-0000-000000000010','2026-02-24','10:00','17:00',420,'biometric')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 18. XAI EXPLANATIONS
-- ============================================================
INSERT INTO xai_explanations (id, entity_type, entity_id, explanation_json) VALUES
  ('46000000-0000-0000-0000-000000000001','turnover_risk','30000000-0000-0000-0000-000000000001','{"method":"SHAP","features":[{"name":"months_since_promotion","value":24,"shap":0.35},{"name":"satisfaction_score","value":2.1,"shap":0.28},{"name":"absence_days","value":12,"shap":0.15}]}'),
  ('46000000-0000-0000-0000-000000000002','turnover_risk','30000000-0000-0000-0000-000000000002','{"method":"SHAP","features":[{"name":"transfer_denied","value":1,"shap":0.40},{"name":"market_salary_gap","value":0.18,"shap":0.20}]}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 19. UI DASHBOARDS
-- ============================================================
INSERT INTO ui_dashboards (id, kind, key, name, description, is_default, layout_json) VALUES
  ('47000000-0000-0000-0000-000000000001','TEMPLATE','main_dashboard','لوحة التحكم الرئيسية','لوحة شاملة للمؤشرات الرئيسية',true,'{"columns":2,"rows":3}')
ON CONFLICT DO NOTHING;

INSERT INTO ui_dashboards (id, kind, name, template_id, role_id, is_default) VALUES
  ('47000000-0000-0000-0000-000000000002','INSTANCE','لوحة تحكم المدير','47000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',true),
  ('47000000-0000-0000-0000-000000000003','INSTANCE','لوحة تحكم الموظف','47000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003',true)
ON CONFLICT DO NOTHING;

INSERT INTO ui_widgets (id, dashboard_id, type, title, data_source_type, data_source_key) VALUES
  ('48000000-0000-0000-0000-000000000001','47000000-0000-0000-0000-000000000001','kpi_card','إجمالي الموظفين','api','employees/count'),
  ('48000000-0000-0000-0000-000000000002','47000000-0000-0000-0000-000000000001','kpi_card','مخاطر الاستقالة العالية','api','risks/high_count'),
  ('48000000-0000-0000-0000-000000000003','47000000-0000-0000-0000-000000000001','chart','اتجاهات الأداء','api','performance/trends'),
  ('48000000-0000-0000-0000-000000000004','47000000-0000-0000-0000-000000000001','table','أحدث التنبيهات','api','alerts/recent')
ON CONFLICT DO NOTHING;
