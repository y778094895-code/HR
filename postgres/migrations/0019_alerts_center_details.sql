CREATE TABLE IF NOT EXISTS "alert_drivers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "alert_id" uuid NOT NULL,
    "factor" text NOT NULL,
    "impact" numeric(5, 2),
    "type" varchar(50),
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alert_recommendations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "alert_id" uuid NOT NULL,
    "intervention" text NOT NULL,
    "estimated_impact" text,
    "risk_reduction" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alert_audit_trail" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "alert_id" uuid NOT NULL,
    "actor_user_id" uuid,
    "action" varchar(50) NOT NULL,
    "from_status" varchar(50),
    "to_status" varchar(50),
    "note" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alert_linked_cases" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "alert_id" uuid NOT NULL,
    "case_id" varchar(100) NOT NULL,
    "ref_type" varchar(50),
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alert_drivers" ADD CONSTRAINT "alert_drivers_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alert_recommendations" ADD CONSTRAINT "alert_recommendations_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alert_audit_trail" ADD CONSTRAINT "alert_audit_trail_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alert_audit_trail" ADD CONSTRAINT "alert_audit_trail_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alert_linked_cases" ADD CONSTRAINT "alert_linked_cases_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alert_drivers_alert_id" ON "alert_drivers" ("alert_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alert_recommendations_alert_id" ON "alert_recommendations" ("alert_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alert_audit_trail_alert_id" ON "alert_audit_trail" ("alert_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alert_linked_cases_alert_id" ON "alert_linked_cases" ("alert_id");
