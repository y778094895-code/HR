CREATE TABLE IF NOT EXISTS "ui_dashboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"layout_json" jsonb NOT NULL,
	"config_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ui_dashboards_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_dashboard_roles" (
	"dashboard_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "ui_dashboard_roles_dashboard_id_role_id_pk" PRIMARY KEY("dashboard_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dashboard_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255),
	"config_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_user_dashboard_prefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dashboard_id" uuid NOT NULL,
	"overrides_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_saved_filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"context" varchar(100) NOT NULL,
	"filter_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_dashboard_roles" ADD CONSTRAINT "ui_dashboard_roles_dashboard_id_ui_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "ui_dashboards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_dashboard_roles" ADD CONSTRAINT "ui_dashboard_roles_role_id_auth_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_widgets" ADD CONSTRAINT "ui_widgets_dashboard_id_ui_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "ui_dashboards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_user_dashboard_prefs" ADD CONSTRAINT "ui_user_dashboard_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_user_dashboard_prefs" ADD CONSTRAINT "ui_user_dashboard_prefs_dashboard_id_ui_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "ui_dashboards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ui_saved_filters" ADD CONSTRAINT "ui_saved_filters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
