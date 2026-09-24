-- CreateEnum
CREATE TYPE "ImplementationStatus" AS ENUM ('REQUESTED', 'REVIEWING', 'SCOPING', 'IN_PROGRESS', 'DELIVERED', 'CLOSED');

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "industry" TEXT,
    "assignedAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "user" ADD COLUMN "companyId" TEXT;

-- AlterTable
ALTER TABLE "lead"
    ADD COLUMN "implementationStatus" "ImplementationStatus",
    ADD COLUMN "companyId" TEXT,
    ADD COLUMN "assignedAdminId" TEXT;

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    "relatedLeadId" TEXT,
    "relatedAnalysisId" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- Backfill companies from distinct lead emails
INSERT INTO "company" ("id", "name", "domain", "industry", "createdAt", "updatedAt")
SELECT
    'c' || substr(md5(lower(l.email)), 1, 24),
    COALESCE(
        NULLIF(max(l.company), ''),
        NULLIF(max(l.name), ''),
        split_part(max(l.email), '@', 2),
        'Unknown company'
    ),
    NULL,
    NULLIF(max(l.industry), ''),
    NOW(),
    NOW()
FROM "lead" l
GROUP BY lower(l.email);

UPDATE "lead" AS l
SET "companyId" = 'c' || substr(md5(lower(l.email)), 1, 24)
WHERE l."companyId" IS NULL;

UPDATE "lead"
SET "implementationStatus" = 'REQUESTED'
WHERE "source" = 'service_request' AND "implementationStatus" IS NULL;

UPDATE "user" AS u
SET "companyId" = 'c' || substr(md5(lower(u.email)), 1, 24)
WHERE u."companyId" IS NULL
  AND EXISTS (
    SELECT 1 FROM "company" c
    WHERE c."id" = 'c' || substr(md5(lower(u.email)), 1, 24)
  );

-- CreateIndex
CREATE INDEX "company_domain_idx" ON "company"("domain");
CREATE INDEX "company_assignedAdminId_idx" ON "company"("assignedAdminId");
CREATE INDEX "company_createdAt_idx" ON "company"("createdAt");
CREATE INDEX "user_companyId_idx" ON "user"("companyId");
CREATE INDEX "lead_companyId_idx" ON "lead"("companyId");
CREATE INDEX "lead_assignedAdminId_idx" ON "lead"("assignedAdminId");
CREATE INDEX "lead_implementationStatus_idx" ON "lead"("implementationStatus");
CREATE INDEX "conversation_userId_lastMessageAt_idx" ON "conversation"("userId", "lastMessageAt");
CREATE INDEX "conversation_companyId_idx" ON "conversation"("companyId");
CREATE INDEX "conversation_relatedLeadId_idx" ON "conversation"("relatedLeadId");
CREATE INDEX "conversation_relatedAnalysisId_idx" ON "conversation"("relatedAnalysisId");
CREATE INDEX "conversation_lastMessageAt_idx" ON "conversation"("lastMessageAt");
CREATE INDEX "message_conversationId_createdAt_idx" ON "message"("conversationId", "createdAt");
CREATE INDEX "message_senderUserId_idx" ON "message"("senderUserId");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead" ADD CONSTRAINT "lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead" ADD CONSTRAINT "lead_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_relatedLeadId_fkey" FOREIGN KEY ("relatedLeadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_relatedAnalysisId_fkey" FOREIGN KEY ("relatedAnalysisId") REFERENCES "analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
