CREATE TABLE IF NOT EXISTS "hr_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"erpnext_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hr_designations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"erpnext_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_designations_name_unique" UNIQUE("name")
);
