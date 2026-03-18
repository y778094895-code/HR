-- 0027: Add showRiskToEmployee flag to employees_local
-- Controls whether the employee can view their own risk history (opt-in).
-- HR/Admin can toggle this flag; Employee role is gated on this flag in GET /risk/employees/:id/history.

ALTER TABLE "employees_local"
    ADD COLUMN IF NOT EXISTS "show_risk_to_employee" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "employees_local"."show_risk_to_employee"
    IS 'When true, the employee can view their own turnover risk history via the self-service portal.';
