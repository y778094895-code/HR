-- ============================================================
-- Smart HR System — Database Initialization
-- ============================================================
-- This file runs BEFORE any Drizzle migrations.
-- Its only job is to enable extensions that migrations depend on.
-- All DDL (tables, indexes, triggers) is owned by the migrations.
-- All DML (seed data) is owned by seed_data.sql / seed_data_part2.sql.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
