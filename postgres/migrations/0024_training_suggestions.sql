-- Migration 0024: Training Suggestions
-- AI-generated training paths derived from performance gaps in review cycles

DO $$ BEGIN
  CREATE TYPE training_status AS ENUM ('suggested', 'enrolled', 'completed', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS training_suggestions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID NOT NULL REFERENCES employees_local(id),
  cycle_id         UUID REFERENCES performance_cycles(id),
  category         VARCHAR(100) NOT NULL,
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  resource_url     VARCHAR(2048),
  gap_competency   VARCHAR(100),   -- links to review_template section key
  gap_score        NUMERIC(5,2),   -- actual score that triggered the suggestion
  status           training_status NOT NULL DEFAULT 'suggested',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_suggestions_employee ON training_suggestions (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_training_suggestions_cycle    ON training_suggestions (cycle_id);
