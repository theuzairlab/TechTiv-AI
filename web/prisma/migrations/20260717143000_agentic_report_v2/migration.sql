-- Analysis run isolation and Report V2 storage
ALTER TABLE "analysis" ADD COLUMN "currentRunId" TEXT;

ALTER TABLE "analysis_activity" ADD COLUMN "runId" TEXT;
ALTER TABLE "raw_signal" ADD COLUMN "runId" TEXT;
ALTER TABLE "tool_usage_log" ADD COLUMN "runId" TEXT;

ALTER TABLE "proposal"
  ADD COLUMN "reportVersion" TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN "reportJson" JSONB,
  ADD COLUMN "pricingJson" JSONB,
  ADD COLUMN "roiJson" JSONB;

CREATE TABLE "analysis_run" (
  "id" TEXT NOT NULL,
  "analysisId" TEXT NOT NULL,
  "attempt" INTEGER NOT NULL,
  "status" "AnalysisStatus" NOT NULL DEFAULT 'QUEUED',
  "coverageJson" JSONB,
  "reportJson" JSONB,
  "pricingJson" JSONB,
  "roiJson" JSONB,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "errorMsg" TEXT,
  CONSTRAINT "analysis_run_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "consultation_message" (
  "id" TEXT NOT NULL,
  "analysisId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "inputJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "consultation_message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analysis_evidence" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "evidenceKey" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "title" TEXT,
  "url" TEXT,
  "query" TEXT,
  "excerpt" TEXT,
  "metricPath" TEXT,
  "valueJson" JSONB,
  "entityConfidence" DOUBLE PRECISION,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analysis_evidence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "analysis_run_analysisId_attempt_key"
  ON "analysis_run"("analysisId", "attempt");
CREATE INDEX "analysis_run_analysisId_startedAt_idx"
  ON "analysis_run"("analysisId", "startedAt");
CREATE INDEX "consultation_message_analysisId_createdAt_idx"
  ON "consultation_message"("analysisId", "createdAt");
CREATE UNIQUE INDEX "analysis_evidence_runId_evidenceKey_key"
  ON "analysis_evidence"("runId", "evidenceKey");
CREATE INDEX "analysis_evidence_runId_provider_idx"
  ON "analysis_evidence"("runId", "provider");
CREATE INDEX "analysis_activity_runId_createdAt_idx"
  ON "analysis_activity"("runId", "createdAt");
CREATE INDEX "raw_signal_runId_idx" ON "raw_signal"("runId");
CREATE INDEX "tool_usage_log_runId_idx" ON "tool_usage_log"("runId");

ALTER TABLE "analysis_run"
  ADD CONSTRAINT "analysis_run_analysisId_fkey"
  FOREIGN KEY ("analysisId") REFERENCES "analysis"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consultation_message"
  ADD CONSTRAINT "consultation_message_analysisId_fkey"
  FOREIGN KEY ("analysisId") REFERENCES "analysis"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_evidence"
  ADD CONSTRAINT "analysis_evidence_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "analysis_run"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_activity"
  ADD CONSTRAINT "analysis_activity_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "analysis_run"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "raw_signal"
  ADD CONSTRAINT "raw_signal_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "analysis_run"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tool_usage_log"
  ADD CONSTRAINT "tool_usage_log_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "analysis_run"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
