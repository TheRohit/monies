DROP INDEX IF EXISTS "unique_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "user_id_idx";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "date" SET DATA TYPE timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_user_id_idx" ON "expenses" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN IF EXISTS "createdAt";