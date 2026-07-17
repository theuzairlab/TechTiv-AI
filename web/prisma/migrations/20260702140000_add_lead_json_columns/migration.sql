-- Lead table was created before JSON columns existed; add any missing fields safely.
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "discoveryAnswers" JSONB;
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "notes" TEXT;
