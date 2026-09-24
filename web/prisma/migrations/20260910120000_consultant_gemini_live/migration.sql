-- Phase 5: dashboard AI consultant (Gemini chat + Live voice) + research usage.

CREATE TABLE "consultant_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "consultant_message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "modality" TEXT NOT NULL DEFAULT 'text',
    "toolName" TEXT,
    "toolPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "voice_session" (
    "id" TEXT NOT NULL,
    "consultantSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "errorMsg" TEXT,

    CONSTRAINT "voice_session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consultant_session_userId_analysisId_key" ON "consultant_session"("userId", "analysisId");
CREATE INDEX "consultant_session_userId_lastMessageAt_idx" ON "consultant_session"("userId", "lastMessageAt");
CREATE INDEX "consultant_session_analysisId_idx" ON "consultant_session"("analysisId");
CREATE INDEX "consultant_message_sessionId_createdAt_idx" ON "consultant_message"("sessionId", "createdAt");
CREATE INDEX "voice_session_userId_startedAt_idx" ON "voice_session"("userId", "startedAt");
CREATE INDEX "voice_session_analysisId_idx" ON "voice_session"("analysisId");

ALTER TABLE "consultant_session" ADD CONSTRAINT "consultant_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consultant_session" ADD CONSTRAINT "consultant_session_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consultant_message" ADD CONSTRAINT "consultant_message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "consultant_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "voice_session" ADD CONSTRAINT "voice_session_consultantSessionId_fkey" FOREIGN KEY ("consultantSessionId") REFERENCES "consultant_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "voice_session" ADD CONSTRAINT "voice_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "voice_session" ADD CONSTRAINT "voice_session_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "provider_config" ("id", "provider", "monthlyBudgetUSD", "currentSpendUSD", "rateLimitPerMinute", "isEnabled")
VALUES ('clgemini000000000000000001', 'gemini', 100, 0, 30, false)
ON CONFLICT ("provider") DO NOTHING;
