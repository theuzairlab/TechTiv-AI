-- AlterTable
ALTER TABLE "analysis" ADD COLUMN "businessIntake" JSONB,
ADD COLUMN "guestAccessToken" TEXT,
ADD COLUMN "emailCapturedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "analysis_guestAccessToken_key" ON "analysis"("guestAccessToken");

-- CreateIndex
CREATE INDEX "analysis_guestAccessToken_idx" ON "analysis"("guestAccessToken");

-- CreateTable
CREATE TABLE "analysis_activity" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_activity_analysisId_createdAt_idx" ON "analysis_activity"("analysisId", "createdAt");

-- AddForeignKey
ALTER TABLE "analysis_activity" ADD CONSTRAINT "analysis_activity_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
