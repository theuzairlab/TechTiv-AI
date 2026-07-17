-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('QUEUED', 'CRAWLING', 'AUDITING', 'ANALYZING', 'SYNTHESIZING', 'PRICING', 'GENERATING_PDF', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED');

-- CreateTable
CREATE TABLE "analyzed_domain" (
    "id" TEXT NOT NULL,
    "normalizedDomain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL,
    "lastAnalysisId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyzed_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "socialLinks" JSONB,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_signal" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "strategyJson" JSONB,
    "techStack" JSONB,
    "automationBlueprint" JSONB,
    "narrativeText" TEXT,
    "costEstimateUSD" INTEGER,
    "timelineWeeks" INTEGER,
    "pdfUrl" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_config" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "monthlyBudgetUSD" INTEGER NOT NULL,
    "currentSpendUSD" INTEGER NOT NULL DEFAULT 0,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "provider_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_usage_log" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "creditsOrTokens" INTEGER NOT NULL DEFAULT 0,
    "costEstimateUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analyzed_domain_normalizedDomain_key" ON "analyzed_domain"("normalizedDomain");

-- CreateIndex
CREATE INDEX "analyzed_domain_status_idx" ON "analyzed_domain"("status");

-- CreateIndex
CREATE INDEX "analysis_leadId_idx" ON "analysis"("leadId");

-- CreateIndex
CREATE INDEX "analysis_status_idx" ON "analysis"("status");

-- CreateIndex
CREATE INDEX "analysis_createdAt_idx" ON "analysis"("createdAt");

-- CreateIndex
CREATE INDEX "raw_signal_analysisId_idx" ON "raw_signal"("analysisId");

-- CreateIndex
CREATE INDEX "raw_signal_source_idx" ON "raw_signal"("source");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_analysisId_key" ON "proposal"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_config_provider_key" ON "provider_config"("provider");

-- CreateIndex
CREATE INDEX "tool_usage_log_analysisId_idx" ON "tool_usage_log"("analysisId");

-- CreateIndex
CREATE INDEX "tool_usage_log_provider_idx" ON "tool_usage_log"("provider");

-- CreateIndex
CREATE INDEX "tool_usage_log_createdAt_idx" ON "tool_usage_log"("createdAt");

-- AddForeignKey
ALTER TABLE "analysis" ADD CONSTRAINT "analysis_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_signal" ADD CONSTRAINT "raw_signal_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_usage_log" ADD CONSTRAINT "tool_usage_log_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
