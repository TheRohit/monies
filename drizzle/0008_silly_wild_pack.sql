ALTER TABLE "emi_history" ALTER COLUMN "payment_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "emis" ALTER COLUMN "end_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "emi_history" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "emis" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "emis" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;