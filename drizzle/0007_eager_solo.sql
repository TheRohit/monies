ALTER TABLE "emis" RENAME COLUMN "interest_rates" TO "interest_rate";--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "interest_rate" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "emi_history" DROP COLUMN IF EXISTS "interest_rate";