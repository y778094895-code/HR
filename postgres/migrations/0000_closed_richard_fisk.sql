CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'employee' NOT NULL,
	"department" varchar(100),
	"designation" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"failed_login_attempts" integer DEFAULT 0,
	"last_login_at" timestamp,
	"password_changed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees_local" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"erpnext_id" varchar(100) NOT NULL,
	"employee_code" varchar(50) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"department" varchar(100),
	"designation" varchar(100),
	"manager_id" uuid,
	"date_of_joining" date NOT NULL,
	"date_of_birth" date,
	"gender" varchar(20),
	"marital_status" varchar(20),
	"employment_type" varchar(50),
	"employment_status" varchar(50) DEFAULT 'active',
	"salary" numeric(12, 2),
	"cost_center" varchar(100),
	"location" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_sync_at" timestamp,
	"sync_status" varchar(20) DEFAULT 'pending',
	CONSTRAINT "employees_local_erpnext_id_unique" UNIQUE("erpnext_id"),
	CONSTRAINT "employees_local_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employees_local_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "turnover_risk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"risk_score" numeric(5, 4) NOT NULL,
	"risk_level" varchar(20) NOT NULL,
	"confidence_score" numeric(5, 4),
	"contributing_factors" jsonb,
	"prediction_date" timestamp DEFAULT now(),
	"prediction_valid_until" timestamp,
	"ml_model_version" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fairness_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"subcategory" varchar(100),
	"value" numeric(10, 4) NOT NULL,
	"threshold" numeric(10, 4),
	"status" varchar(20),
	"analysis_date" date NOT NULL,
	"department" varchar(100),
	"sample_size" integer,
	"confidence_interval" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "intervention_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intervention_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"actor_id" uuid,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interventions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'planned',
	"priority" varchar(20) DEFAULT 'medium',
	"owner_id" uuid,
	"rationale" jsonb,
	"action_plan" jsonb,
	"expected_outcome" jsonb,
	"actual_outcome" jsonb,
	"due_date" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"department" varchar(100),
	"source" varchar(50) DEFAULT 'ml' NOT NULL,
	"recommendation_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"confidence" numeric(5, 2),
	"estimated_impact" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"reason_codes" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service" varchar(100) NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "turnover_risk" ADD CONSTRAINT "turnover_risk_employee_id_employees_local_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees_local"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "intervention_events" ADD CONSTRAINT "intervention_events_intervention_id_interventions_id_fk" FOREIGN KEY ("intervention_id") REFERENCES "interventions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "intervention_events" ADD CONSTRAINT "intervention_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interventions" ADD CONSTRAINT "interventions_employee_id_employees_local_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees_local"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interventions" ADD CONSTRAINT "interventions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interventions" ADD CONSTRAINT "interventions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_employee_id_employees_local_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees_local"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
