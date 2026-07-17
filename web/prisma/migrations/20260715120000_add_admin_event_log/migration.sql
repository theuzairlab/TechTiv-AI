-- CreateTable
CREATE TABLE "admin_event_log" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_event_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_event_log_adminUserId_idx" ON "admin_event_log"("adminUserId");

-- CreateIndex
CREATE INDEX "admin_event_log_action_idx" ON "admin_event_log"("action");

-- CreateIndex
CREATE INDEX "admin_event_log_createdAt_idx" ON "admin_event_log"("createdAt");
