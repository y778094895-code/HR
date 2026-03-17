-- Add key to auth_roles
ALTER TABLE "auth_roles" ADD COLUMN IF NOT EXISTS "key" varchar(50);
--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_roles_key_unique') THEN
  ALTER TABLE "auth_roles" ADD CONSTRAINT "auth_roles_key_unique" UNIQUE("key");
 END IF;
END $$;

-- DROP tables from 0016 (cleanup)
DROP TABLE IF EXISTS "ui_saved_filters";
DROP TABLE IF EXISTS "ui_user_dashboard_prefs";
DROP TABLE IF EXISTS "ui_widgets";
DROP TABLE IF EXISTS "ui_dashboard_roles";
DROP TABLE IF EXISTS "ui_dashboards" CASCADE;

-- Re-create tables with new schema
CREATE TABLE IF NOT EXISTS "ui_dashboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(20) NOT NULL,
	"key" varchar(100),
	"name" varchar(255) NOT NULL,
	"description" text,
	"template_id" uuid,
	"role_id" uuid,
	"is_default" boolean DEFAULT false,
	"layout_json" jsonb,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dashboard_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255),
	"data_source_type" varchar(50),
	"data_source_key" varchar(100),
	"config_json" jsonb,
	"layout_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_user_dashboard_prefs" (
	"user_id" uuid NOT NULL,
	"dashboard_id" uuid NOT NULL,
	"pinned" boolean DEFAULT false,
	"layout_overrides_json" jsonb,
	"filters_overrides_json" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ui_user_dashboard_prefs_user_id_dashboard_id_pk" PRIMARY KEY("user_id","dashboard_id")
);

-- Indexes and Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "ui_dashboards_key_unique" ON "ui_dashboards" ("key") WHERE "key" IS NOT NULL AND "kind" = 'TEMPLATE';
CREATE UNIQUE INDEX IF NOT EXISTS "ui_dashboards_role_template_unique" ON "ui_dashboards" ("role_id", "template_id") WHERE "kind" = 'INSTANCE';
CREATE INDEX IF NOT EXISTS "ui_widgets_dashboard_id_index" ON "ui_widgets" ("dashboard_id");

-- FKs
DO $$ BEGIN
 ALTER TABLE "ui_dashboards" ADD CONSTRAINT "ui_dashboards_template_id_ui_dashboards_id_fk" FOREIGN KEY ("template_id") REFERENCES "ui_dashboards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_dashboards" ADD CONSTRAINT "ui_dashboards_role_id_auth_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_dashboards" ADD CONSTRAINT "ui_dashboards_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_widgets" ADD CONSTRAINT "ui_widgets_dashboard_id_ui_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "ui_dashboards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_user_dashboard_prefs" ADD CONSTRAINT "ui_user_dashboard_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_user_dashboard_prefs" ADD CONSTRAINT "ui_user_dashboard_prefs_dashboard_id_ui_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "ui_dashboards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Validation Checks
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ui_dashboards_kind_check') THEN
  ALTER TABLE "ui_dashboards" ADD CONSTRAINT "ui_dashboards_kind_check" CHECK (kind IN ('TEMPLATE', 'INSTANCE'));
 END IF;
END $$;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ui_dashboards_template_rules_check') THEN
  ALTER TABLE "ui_dashboards" ADD CONSTRAINT "ui_dashboards_template_rules_check" CHECK (
   (kind = 'TEMPLATE' AND template_id IS NULL AND role_id IS NULL) OR
   (kind = 'INSTANCE' AND template_id IS NOT NULL AND role_id IS NOT NULL)
  );
 END IF;
END $$;
