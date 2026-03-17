CREATE TABLE IF NOT EXISTS "hr_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"date" date NOT NULL,
	"check_in" time,
	"check_out" time,
	"work_minutes" integer,
	"absence_type" varchar(50),
	"reason" varchar(255),
	"source" varchar(50) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hr_attendance_employee_date_idx" ON "hr_attendance" ("employee_id","date");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hr_attendance" ADD CONSTRAINT "hr_attendance_employee_id_employees_local_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees_local"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
