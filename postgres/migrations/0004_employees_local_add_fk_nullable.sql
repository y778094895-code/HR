DO $$ BEGIN
 ALTER TABLE "employees_local" ADD COLUMN IF NOT EXISTS "department_id" uuid;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees_local" ADD COLUMN IF NOT EXISTS "designation_id" uuid;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees_local" ADD CONSTRAINT "employees_local_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "hr_departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees_local" ADD CONSTRAINT "employees_local_designation_id_hr_designations_id_fk" FOREIGN KEY ("designation_id") REFERENCES "hr_designations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
