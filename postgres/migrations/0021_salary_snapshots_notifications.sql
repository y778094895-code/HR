-- 0021: Create salary_snapshots and notifications tables
-- These schemas existed in code but had no migration file.

CREATE TABLE IF NOT EXISTS "salary_snapshots" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL REFERENCES "employees_local"("id"),
    "salary_month" date NOT NULL,
    "salary_structure" varchar(100),
    "basic_salary" numeric(12,2) NOT NULL,
    "house_rent_allowance" numeric(12,2) DEFAULT '0',
    "conveyance_allowance" numeric(12,2) DEFAULT '0',
    "medical_allowance" numeric(12,2) DEFAULT '0',
    "special_allowance" numeric(12,2) DEFAULT '0',
    "other_allowances" numeric(12,2) DEFAULT '0',
    "professional_tax" numeric(12,2) DEFAULT '0',
    "provident_fund" numeric(12,2) DEFAULT '0',
    "income_tax" numeric(12,2) DEFAULT '0',
    "other_deductions" numeric(12,2) DEFAULT '0',
    "bonus" numeric(12,2) DEFAULT '0',
    "overtime_pay" numeric(12,2) DEFAULT '0',
    "incentives" numeric(12,2) DEFAULT '0',
    "payment_date" date,
    "payment_status" varchar(50) DEFAULT 'pending',
    "payment_reference" varchar(100),
    "remarks" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "salary_employee_month_idx"
    ON "salary_snapshots" ("employee_id", "salary_month");

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "type" varchar(50) NOT NULL,
    "category" varchar(50) DEFAULT 'general',
    "title" varchar(255) NOT NULL,
    "message" text NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp,
    "priority" varchar(20) DEFAULT 'normal',
    "channel" varchar(20) DEFAULT 'in_app',
    "metadata" jsonb DEFAULT '{}',
    "related_entity_type" varchar(50),
    "related_entity_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx" ON "notifications" ("user_id") WHERE "is_read" = false;
