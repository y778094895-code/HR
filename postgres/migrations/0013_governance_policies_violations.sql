CREATE TABLE IF NOT EXISTS "data_governance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"src_name" varchar(100) NOT NULL,
	"retention_days" integer DEFAULT 365,
	"rules" jsonb,
	"cleanup_logs" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"admin" varchar(100),
	"security_controls" jsonb,
	"integration_interfaces" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "data_governance_src_name_unique" UNIQUE("src_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_name" varchar(100) NOT NULL,
	"rule_json" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "policies_policy_name_unique" UNIQUE("policy_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid NOT NULL,
	"severity" varchar(20) NOT NULL,
	"description" text,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "violations" ADD CONSTRAINT "violations_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
