-- Migration 0022: Goals, KPIs, and Organisational Objectives
-- Adds richer goal tracking with weights, KPIs, and cascaded org objectives

-- Enums
DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('draft', 'in_progress', 'overdue', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kpi_frequency AS ENUM ('daily', 'weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE objective_status AS ENUM ('active', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Organisational objectives (HR sets, cascades to departments)
CREATE TABLE IF NOT EXISTS org_objectives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  owner_id    UUID REFERENCES users(id),
  target_date DATE,
  status      objective_status NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Many-to-many: objectives → departments
CREATE TABLE IF NOT EXISTS objective_departments (
  objective_id  UUID NOT NULL REFERENCES org_objectives(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (objective_id, department_id)
);

-- Goals (employee-level, optionally linked to a cycle and/or an org objective)
CREATE TABLE IF NOT EXISTS goals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id           UUID NOT NULL REFERENCES employees_local(id),
  cycle_id              UUID REFERENCES performance_cycles(id),
  parent_objective_id   UUID REFERENCES org_objectives(id),
  title                 VARCHAR(500) NOT NULL,
  description           TEXT,
  category              VARCHAR(100) NOT NULL DEFAULT 'performance',
  target_value          NUMERIC(14,4),
  current_value         NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit                  VARCHAR(50),
  weight                NUMERIC(5,2) NOT NULL DEFAULT 0
                          CONSTRAINT goals_weight_range CHECK (weight >= 0 AND weight <= 100),
  due_date              DATE,
  status                goal_status NOT NULL DEFAULT 'draft',
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_employee_status   ON goals (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_cycle             ON goals (cycle_id);
CREATE INDEX IF NOT EXISTS idx_goals_due_date          ON goals (due_date);

-- KPIs — child metrics per goal
CREATE TABLE IF NOT EXISTS kpis (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id               UUID NOT NULL REFERENCES goals(id) ON DELETE RESTRICT,
  name                  VARCHAR(255) NOT NULL,
  target_value          NUMERIC(14,4) NOT NULL,
  current_value         NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit                  VARCHAR(50),
  measurement_frequency kpi_frequency NOT NULL DEFAULT 'monthly',
  last_updated_at       TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kpis_goal ON kpis (goal_id);
