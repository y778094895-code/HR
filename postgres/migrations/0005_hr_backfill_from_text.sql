-- Backfill Departments
INSERT INTO "hr_departments" ("name")
SELECT DISTINCT "department"
FROM "employees_local"
WHERE "department" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Backfill Designations
INSERT INTO "hr_designations" ("name")
SELECT DISTINCT "designation"
FROM "employees_local"
WHERE "designation" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Link Employees to Departments
UPDATE "employees_local"
SET "department_id" = "hr_departments"."id"
FROM "hr_departments"
WHERE "employees_local"."department" = "hr_departments"."name"
  AND "employees_local"."department_id" IS NULL;

-- Link Employees to Designations
UPDATE "employees_local"
SET "designation_id" = "hr_designations"."id"
FROM "hr_designations"
WHERE "employees_local"."designation" = "hr_designations"."name"
  AND "employees_local"."designation_id" IS NULL;
