DO $$ BEGIN
 ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "risk_case_id" uuid;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interventions" ADD CONSTRAINT "interventions_risk_case_id_risk_cases_id_fk" FOREIGN KEY ("risk_case_id") REFERENCES "risk_cases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
