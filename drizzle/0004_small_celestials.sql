CREATE TABLE IF NOT EXISTS "emi_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"emi_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"payment_date" timestamp (3) with time zone NOT NULL,
	"amount_paid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emis" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"emi_name" text NOT NULL,
	"total_amount" integer NOT NULL,
	"remaining_amount" integer NOT NULL,
	"monthly_emi_amount" integer NOT NULL,
	"monthly_due_date" integer NOT NULL,
	"start_date" timestamp (3) with time zone NOT NULL,
	"end_date" timestamp (3) with time zone NOT NULL,
	"interest_rate" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emi_history" ADD CONSTRAINT "emi_history_emi_id_emis_id_fk" FOREIGN KEY ("emi_id") REFERENCES "public"."emis"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emi_history_user_id_idx" ON "emi_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emi_history_emi_id_idx" ON "emi_history" USING btree ("emi_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emis_user_id_idx" ON "emis" USING btree ("user_id");