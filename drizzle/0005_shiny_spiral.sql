ALTER TABLE "emi_history" ALTER COLUMN "amount_paid" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "total_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "remaining_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "monthly_emi_amount" SET DATA TYPE numeric(10, 2);