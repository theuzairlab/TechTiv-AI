/**
 * Phase 3 integration checks for analysis submission flow.
 * Uses direct service calls (no HTTP server required).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const TEST_EMAIL = `phase3-test-${Date.now()}@example.com`;
const TEST_DOMAIN = `phase3-${Date.now()}.example.com`;

async function main() {
  const { submitAnalysis } = await import("@/lib/analysis/submit");
  const { prisma } = await import("@/lib/prisma");

  async function cleanup(analysisId: string, normalizedDomain: string) {
    await prisma.toolUsageLog.deleteMany({ where: { analysisId } });
    await prisma.rawSignal.deleteMany({ where: { analysisId } });
    await prisma.proposal.deleteMany({ where: { analysisId } });
    await prisma.analysis.delete({ where: { id: analysisId } });
    await prisma.analyzedDomain.deleteMany({ where: { normalizedDomain } });
    await prisma.lead.deleteMany({ where: { email: TEST_EMAIL } });
  }

  console.log("[phase3] Starting analysis submission verification...");

  const queued = await submitAnalysis({
    domain: TEST_DOMAIN,
    email: TEST_EMAIL,
    name: "Phase 3 Tester",
  });

  if (queued.status !== "queued" || !queued.analysisId || !queued.jobId) {
    throw new Error(`Expected queued result, got ${JSON.stringify(queued)}`);
  }

  console.log("[phase3] Queued:", queued.analysisId, "jobId:", queued.jobId);

  const inProgress = await submitAnalysis({
    domain: TEST_DOMAIN,
    email: TEST_EMAIL,
    notifyIfInProgress: true,
  });

  if (inProgress.status !== "in_progress") {
    throw new Error(`Expected in_progress, got ${JSON.stringify(inProgress)}`);
  }

  console.log("[phase3] In-progress dedup OK");

  const rateLimited = await submitAnalysis({
    domain: `other-${Date.now()}.example.com`,
    email: TEST_EMAIL,
  });

  if (rateLimited.status !== "rate_limited") {
    throw new Error(`Expected rate_limited, got ${JSON.stringify(rateLimited)}`);
  }

  console.log("[phase3] Rate limit OK");

  const status = await prisma.analysis.findUnique({
    where: { id: queued.analysisId },
    select: { status: true, domain: true },
  });

  if (!status || status.status !== "QUEUED" || status.domain !== TEST_DOMAIN) {
    throw new Error(`Unexpected analysis row: ${JSON.stringify(status)}`);
  }

  console.log("[phase3] DB row OK");

  await cleanup(queued.analysisId, TEST_DOMAIN);
  await prisma.$disconnect();

  console.log("[phase3] All checks passed");
}

main().catch((error) => {
  console.error("[phase3] Verification failed:", error);
  process.exit(1);
});
