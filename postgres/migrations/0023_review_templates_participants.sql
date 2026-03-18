-- Migration 0023: Review Templates, Participants, and 360° Workflow
-- Extends existing performance_cycles with template-driven, multi-reviewer reviews

-- Enums
DO $$ BEGIN
  CREATE TYPE cycle_type AS ENUM ('annual', 'mid_year', 'quarterly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cycle_status AS ENUM ('scheduled', 'active', 'calibration', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reviewer_type AS ENUM ('self', 'manager', 'peer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE participant_status AS ENUM ('pending', 'in_progress', 'submitted', 'overdue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('draft', 'submitted', 'calibrated', 'locked', 'acknowledged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Review templates — define competency sections and rating scale
CREATE TABLE IF NOT EXISTS review_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  rating_scale        SMALLINT NOT NULL DEFAULT 5,
  -- sections: [{ "key": "leadership", "label_en": "...", "label_ar": "...", "weight": 30 }]
  sections            JSONB NOT NULL DEFAULT '[]',
  open_text_enabled   BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add template FK and structured columns to performance_cycles
-- (extends the existing table; adds new columns where not present)
ALTER TABLE performance_cycles
  ADD COLUMN IF NOT EXISTS type          cycle_type,
  ADD COLUMN IF NOT EXISTS cycle_status  cycle_status NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS template_id   UUID REFERENCES review_templates(id),
  ADD COLUMN IF NOT EXISTS created_by    UUID REFERENCES users(id);

-- Participants — who reviews whom, and with what role
CREATE TABLE IF NOT EXISTS review_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id      UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
  reviewee_id   UUID NOT NULL REFERENCES employees_local(id),
  reviewer_id   UUID NOT NULL REFERENCES employees_local(id),
  reviewer_type reviewer_type NOT NULL,
  status        participant_status NOT NULL DEFAULT 'pending',
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_participant UNIQUE (cycle_id, reviewee_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_cycle_reviewee ON review_participants (cycle_id, reviewee_id);
CREATE INDEX IF NOT EXISTS idx_participants_reviewer_status ON review_participants (reviewer_id, status);

-- Reviews — the actual submission linked to a participant slot
CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id      UUID NOT NULL REFERENCES review_participants(id) ON DELETE CASCADE,
  -- ratings: { "leadership": 4, "technical": 3, ... } — keys match template sections
  ratings             JSONB NOT NULL DEFAULT '{}',
  -- comments: { "leadership": "...", "overall": "..." }
  comments            JSONB NOT NULL DEFAULT '{}',
  goal_attainment_pct NUMERIC(5,2),
  composite_score     NUMERIC(5,2),
  status              review_status NOT NULL DEFAULT 'draft',
  submitted_at        TIMESTAMPTZ,
  locked_at           TIMESTAMPTZ,
  locked_by           UUID REFERENCES users(id),
  acknowledged_at     TIMESTAMPTZ,
  CONSTRAINT uq_review_per_participant UNIQUE (participant_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_participant ON reviews (participant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status      ON reviews (status);
