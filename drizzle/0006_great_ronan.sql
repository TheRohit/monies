ALTER TABLE "emis" RENAME COLUMN "interest_rate" TO "interest_rates";--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "interest_rates" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "emi_history" ADD COLUMN "interest_rate" numeric(5, 2) NOT NULL;