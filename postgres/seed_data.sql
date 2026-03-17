-- ============================================================
-- Smart HR System — Comprehensive Seed Data
-- Run: docker compose exec postgres psql -U hr -d hr_system -f /seed_data.sql
-- Or paste into running psql session
-- ============================================================

BEGIN;

-- ============================================================
-- 1. AUTH ROLES
-- ============================================================
INSERT INTO auth_roles (id, name, key, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'admin', 'مدير النظام - صلاحيات كاملة'),
  ('a0000000-0000-0000-0000-000000000002', 'manager', 'manager', 'مدير قسم'),
  ('a0000000-0000-0000-0000-000000000003', 'employee', 'employee', 'موظف عادي'),
  ('a0000000-0000-0000-0000-000000000004', 'super_admin', 'super_admin', 'مدير عام النظام')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. AUTH PERMISSIONS
-- ============================================================
INSERT INTO auth_permissions (id, action, resource, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'read', 'employees', 'عرض الموظفين'),
  ('b0000000-0000-0000-0000-000000000002', 'write', 'employees', 'تعديل الموظفين'),
  ('b0000000-0000-0000-0000-000000000003', 'read', 'performance', 'عرض الأداء'),
  ('b0000000-0000-0000-0000-000000000004', 'write', 'performance', 'تعديل الأداء'),
  ('b0000000-0000-0000-0000-000000000005', 'read', 'training', 'عرض التدريب'),
  ('b0000000-0000-0000-0000-000000000006', 'write', 'training', 'تعديل التدريب'),
  ('b0000000-0000-0000-0000-000000000007', 'read', 'fairness', 'عرض العدالة'),
  ('b0000000-0000-0000-0000-000000000008', 'read', 'reports', 'عرض التقارير'),
  ('b0000000-0000-0000-0000-000000000009', 'write', 'reports', 'إنشاء التقارير'),
  ('b0000000-0000-0000-0000-000000000010', 'read', 'alerts', 'عرض التنبيهات'),
  ('b0000000-0000-0000-0000-000000000011', 'write', 'alerts', 'إدارة التنبيهات'),
  ('b0000000-0000-0000-0000-000000000012', 'admin', 'system', 'إدارة النظام'),
  ('b0000000-0000-0000-0000-000000000013', 'read', 'cases', 'عرض الحالات'),
  ('b0000000-0000-0000-0000-000000000014', 'write', 'cases', 'إدارة الحالات'),
  ('b0000000-0000-0000-0000-000000000015', 'read', 'attrition', 'عرض الاستقالات'),
  ('b0000000-0000-0000-0000-000000000016', 'read', 'dashboards', 'عرض لوحات التحكم')
ON CONFLICT DO NOTHING;

-- admin gets all permissions
INSERT INTO auth_role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM auth_permissions
ON CONFLICT DO NOTHING;

-- manager gets read + some write
INSERT INTO auth_role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000002', id FROM auth_permissions WHERE action = 'read'
ON CONFLICT DO NOTHING;
INSERT INTO auth_role_permissions (role_id, permission_id) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004'),
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000014')
ON CONFLICT DO NOTHING;

-- employee gets read only
INSERT INTO auth_role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000003', id FROM auth_permissions WHERE action = 'read' AND resource IN ('employees','performance','training')
ON CONFLICT DO NOTHING;

-- super_admin gets all
INSERT INTO auth_role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000004', id FROM auth_permissions
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. USERS (password = 'Admin@123' bcrypt hash)
-- ============================================================
INSERT INTO users (id, email, username, password_hash, full_name, role, department, designation, is_active) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'admin@smart-hr.com', 'admin', '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km', 'سعيد المشرف', 'admin', 'تقنية المعلومات', 'مدير النظام', true),
  ('c0000000-0000-0000-0000-000000000002', 'manager@smart-hr.com', 'manager1', '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km', 'خالد العمري', 'manager', 'المبيعات', 'مدير المبيعات', true),
  ('c0000000-0000-0000-0000-000000000003', 'hr@smart-hr.com', 'hr_mgr', '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km', 'نورة الحربي', 'admin', 'الموارد البشرية', 'مدير الموارد البشرية', true),
  ('c0000000-0000-0000-0000-000000000004', 'emp1@smart-hr.com', 'employee1', '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km', 'أحمد مصطفى', 'employee', 'تقنية المعلومات', 'مطور برمجيات', true),
  ('c0000000-0000-0000-0000-000000000005', 'emp2@smart-hr.com', 'employee2', '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km', 'سارة القحطاني', 'employee', 'التسويق', 'أخصائية تسويق', true),
  ('c0000000-0000-0000-0000-000000000006', 'superadmin@smart-hr.com', 'superadmin', '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km', 'فهد السعد', 'super_admin', 'تقنية المعلومات', 'مدير عام النظام', true)
ON CONFLICT (email) DO NOTHING;

-- Link users to auth_roles
INSERT INTO auth_user_roles (user_id, role_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. HR DEPARTMENTS
-- ============================================================
INSERT INTO hr_departments (id, name) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'تقنية المعلومات'),
  ('d0000000-0000-0000-0000-000000000002', 'الموارد البشرية'),
  ('d0000000-0000-0000-0000-000000000003', 'المبيعات'),
  ('d0000000-0000-0000-0000-000000000004', 'التسويق'),
  ('d0000000-0000-0000-0000-000000000005', 'المالية'),
  ('d0000000-0000-0000-0000-000000000006', 'العمليات'),
  ('d0000000-0000-0000-0000-000000000007', 'خدمة العملاء'),
  ('d0000000-0000-0000-0000-000000000008', 'التدريب والتطوير')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 5. HR DESIGNATIONS
-- ============================================================
INSERT INTO hr_designations (id, name) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'مدير النظام'),
  ('e0000000-0000-0000-0000-000000000002', 'مدير قسم'),
  ('e0000000-0000-0000-0000-000000000003', 'مطور برمجيات'),
  ('e0000000-0000-0000-0000-000000000004', 'أخصائي موارد بشرية'),
  ('e0000000-0000-0000-0000-000000000005', 'محاسب'),
  ('e0000000-0000-0000-0000-000000000006', 'أخصائي تسويق'),
  ('e0000000-0000-0000-0000-000000000007', 'مندوب مبيعات'),
  ('e0000000-0000-0000-0000-000000000008', 'مدير المبيعات'),
  ('e0000000-0000-0000-0000-000000000009', 'مدير الموارد البشرية'),
  ('e0000000-0000-0000-0000-000000000010', 'مدرب'),
  ('e0000000-0000-0000-0000-000000000011', 'محلل بيانات'),
  ('e0000000-0000-0000-0000-000000000012', 'ممثل خدمة عملاء')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 6. EMPLOYEES (20 employees) — insert WITHOUT department_id/designation_id
--    then link by name via UPDATE (avoids FK conflicts with existing UUIDs)
-- ============================================================
INSERT INTO employees_local (id, erpnext_id, employee_code, full_name, email, phone, department, designation, date_of_joining, date_of_birth, gender, marital_status, employment_type, employment_status, salary, location, sync_status) VALUES
  ('f0000000-0000-0000-0000-000000000001','ERP-001','EMP-001','أحمد مصطفى','ahmed@company.sa','0501234567','تقنية المعلومات','مطور برمجيات','2022-03-15','1990-05-20','male','married','full_time','active',15000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000002','ERP-002','EMP-002','سارة الحربي','sara@company.sa','0502345678','التسويق','أخصائي تسويق','2021-06-01','1992-08-14','female','single','full_time','active',12000,'جدة','synced'),
  ('f0000000-0000-0000-0000-000000000003','ERP-003','EMP-003','محمد العتيبي','mohammed@company.sa','0503456789','المبيعات','مندوب مبيعات','2020-01-10','1988-12-03','male','married','full_time','active',13000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000004','ERP-004','EMP-004','فاطمة الزهراني','fatima@company.sa','0504567890','الموارد البشرية','أخصائي موارد بشرية','2023-02-20','1995-03-25','female','single','full_time','active',11000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000005','ERP-005','EMP-005','عبدالله السعد','abdullah@company.sa','0505678901','تقنية المعلومات','مطور برمجيات','2019-09-01','1991-07-10','male','married','full_time','active',18000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000006','ERP-006','EMP-006','نورة القحطاني','noura@company.sa','0506789012','الموارد البشرية','أخصائي موارد بشرية','2021-11-15','1993-01-18','female','married','full_time','active',12500,'جدة','synced'),
  ('f0000000-0000-0000-0000-000000000007','ERP-007','EMP-007','فهد العتيبي','fahd@company.sa','0507890123','العمليات','مدير قسم','2018-04-01','1985-11-22','male','married','full_time','active',20000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000008','ERP-008','EMP-008','ريم الشمري','reem@company.sa','0508901234','المالية','محاسب','2022-07-01','1994-06-30','female','single','full_time','active',14000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000009','ERP-009','EMP-009','خالد المالكي','khalid.m@company.sa','0509012345','المبيعات','مندوب مبيعات','2023-01-15','1996-09-05','male','single','full_time','active',11000,'الدمام','synced'),
  ('f0000000-0000-0000-0000-000000000010','ERP-010','EMP-010','هند الدوسري','hind@company.sa','0510123456','خدمة العملاء','ممثل خدمة عملاء','2021-08-20','1997-02-14','female','single','full_time','active',9000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000011','ERP-011','EMP-011','ياسر الغامدي','yaser@company.sa','0511234567','تقنية المعلومات','محلل بيانات','2020-05-10','1989-04-08','male','married','full_time','active',16000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000012','ERP-012','EMP-012','لمياء العنزي','lamya@company.sa','0512345678','التدريب والتطوير','مدرب','2022-01-01','1991-10-15','female','married','full_time','active',13500,'جدة','synced'),
  ('f0000000-0000-0000-0000-000000000013','ERP-013','EMP-013','عمر الحارثي','omar@company.sa','0513456789','المبيعات','مندوب مبيعات','2023-06-01','1998-03-20','male','single','full_time','active',10000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000014','ERP-014','EMP-014','منال السبيعي','manal@company.sa','0514567890','المالية','محاسب','2019-03-01','1990-12-28','female','married','full_time','active',15000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000015','ERP-015','EMP-015','تركي الشهراني','turki@company.sa','0515678901','العمليات','مطور برمجيات','2021-04-15','1993-07-07','male','single','full_time','active',14500,'الدمام','synced'),
  ('f0000000-0000-0000-0000-000000000016','ERP-016','EMP-016','عائشة المطيري','aysha@company.sa','0516789012','خدمة العملاء','ممثل خدمة عملاء','2022-09-01','1999-05-11','female','single','full_time','active',9500,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000017','ERP-017','EMP-017','بدر الرشيدي','badr@company.sa','0517890123','تقنية المعلومات','مطور برمجيات','2020-11-01','1992-02-19','male','married','full_time','active',17000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000018','ERP-018','EMP-018','دلال الخالدي','dalal@company.sa','0518901234','التسويق','أخصائي تسويق','2023-03-15','1996-08-23','female','single','full_time','active',11500,'جدة','synced'),
  ('f0000000-0000-0000-0000-000000000019','ERP-019','EMP-019','سلطان الدوسري','sultan@company.sa','0519012345','المبيعات','مدير المبيعات','2017-01-10','1984-06-15','male','married','full_time','active',22000,'الرياض','synced'),
  ('f0000000-0000-0000-0000-000000000020','ERP-020','EMP-020','غادة العسيري','ghada@company.sa','0520123456','التدريب والتطوير','مدرب','2021-02-01','1994-11-30','female','married','full_time','active',13000,'الرياض','synced')
ON CONFLICT (employee_code) DO NOTHING;

-- Link employees to departments/designations by name
UPDATE employees_local SET department_id = d.id
FROM hr_departments d WHERE employees_local.department = d.name AND employees_local.department_id IS NULL;

UPDATE employees_local SET designation_id = dg.id
FROM hr_designations dg WHERE employees_local.designation = dg.name AND employees_local.designation_id IS NULL;

COMMIT;

