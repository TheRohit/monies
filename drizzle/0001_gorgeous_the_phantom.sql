DROP TABLE "participants";--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_id_idx" ON "expenses" USING btree ("user_id");