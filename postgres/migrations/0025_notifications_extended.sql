-- Migration 0025: Extend notifications with bilingual title/body columns
-- Adds Arabic variants; existing title/message columns become the English defaults

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS title_ar  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS body_ar   TEXT;

-- Back-fill: set title_ar = title and body_ar = message for existing rows
-- (human translators / the notification service will overwrite these later)
UPDATE notifications SET title_ar = title WHERE title_ar IS NULL;
UPDATE notifications SET body_ar  = message WHERE body_ar IS NULL;
