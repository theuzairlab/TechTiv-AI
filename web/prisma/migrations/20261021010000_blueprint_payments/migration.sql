-- One-time credit for a later analysis. Off until an admin turns payments on.

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COMPED');

CREATE TABLE "billing_setting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "paymentsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_setting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "billing_setting" ("id", "paymentsEnabled", "updatedAt")
VALUES ('default', false, CURRENT_TIMESTAMP);

CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "analysisId" TEXT,
    "leadId" TEXT,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "consumedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stripe_event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_stripeCheckoutSessionId_key" ON "payment"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "payment_stripePaymentIntentId_key" ON "payment"("stripePaymentIntentId");
CREATE INDEX "payment_email_status_consumedAt_idx" ON "payment"("email", "status", "consumedAt");
CREATE INDEX "payment_analysisId_idx" ON "payment"("analysisId");
CREATE INDEX "payment_createdAt_idx" ON "payment"("createdAt");

ALTER TABLE "payment" ADD CONSTRAINT "payment_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment" ADD CONSTRAINT "payment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
