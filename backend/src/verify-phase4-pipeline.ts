/**
 * Phase 4 pipeline verification — runs stub pipeline directly and checks DB state.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

process.env.PIPELINE_STUB_DELAY_MS = "0";
process.env.PIPELINE_USE_STUBS = "true";

const TEST_EMAIL = `phase4-test-${Date.now()}@example.com`;
const TEST_DOMAIN = `phase4-${Date.now()}.example.com`;

async function main() {
  const { runPipeline } = await import("./pipeline/index.js");
  const { prisma } = await import("./lib/prisma.js");
  const { disconnectDatabase } = await import("./lib/prisma.js");

  const lead = await prisma.lead.create({
    data: {
      name: "Phase 4 Tester",
      email: TEST_EMAIL,
      source: "discovery",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain: TEST_DOMAIN,
      status: "QUEUED",
    },
  });

  await prisma.analyzedDomain.create({
    data: {
      normalizedDomain: TEST_DOMAIN,
      status: "PROCESSING",
      lastAnalysisId: analysis.id,
    },
  });

  console.log("[phase4] Running pipeline for", analysis.id);
  await runPipeline(analysis.id);

  const result = await prisma.analysis.findUnique({
    where: { id: analysis.id },
    include: {
      rawSignals: { select: { source: true } },
    },
  });

  if (!result || result.status !== "DONE") {
    throw new Error(`Expected DONE, got ${result?.status}`);
  }

  const domain = await prisma.analyzedDomain.findUnique({
    where: { normalizedDomain: TEST_DOMAIN },
  });

  if (!domain || domain.status !== "COMPLETED" || domain.lastAnalysisId !== analysis.id) {
    throw new Error(`AnalyzedDomain not completed: ${JSON.stringify(domain)}`);
  }

  const sources = result.rawSignals.map((s) => s.source).sort();
  const expected = [
    "firecrawl",
    "narrative",
    "notify",
    "pagespeed",
    "pdf",
    "pricing",
    "serpapi",
    "synthesis",
    "tavily",
    "detectzestack",
  ];

  if (sources.length !== expected.length) {
    throw new Error(`Expected ${expected.length} signals, got ${sources.length}: ${sources.join(", ")}`);
  }

  for (const source of expected) {
    if (!sources.includes(source)) {
      throw new Error(`Missing raw signal source: ${source}`);
    }
  }

  console.log("[phase4] Success path OK");

  // Failure path — domain lock should be released
  const failAnalysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain: `fail-${TEST_DOMAIN}`,
      status: "QUEUED",
    },
  });

  await prisma.analyzedDomain.create({
    data: {
      normalizedDomain: `fail-${TEST_DOMAIN}`,
      status: "PROCESSING",
      lastAnalysisId: failAnalysis.id,
    },
  });

  const { runCrawlStep } = await import("./pipeline/steps/crawl.js");

  try {
    await runCrawlStep({ analysisId: failAnalysis.id, domain: `fail-${TEST_DOMAIN}` });
    await prisma.analysis.update({
      where: { id: failAnalysis.id },
      data: { status: "CRAWLING" },
    });
    throw new Error("Simulated pipeline failure");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const { markAnalysisFailed } = await import("./pipeline/update-status.js");
    await markAnalysisFailed(failAnalysis.id, `fail-${TEST_DOMAIN}`, message);
  }

  const failed = await prisma.analysis.findUnique({ where: { id: failAnalysis.id } });
  const releasedDomain = await prisma.analyzedDomain.findUnique({
    where: { normalizedDomain: `fail-${TEST_DOMAIN}` },
  });

  if (!failed || failed.status !== "FAILED" || !failed.errorMsg) {
    throw new Error(`Expected FAILED with errorMsg, got ${JSON.stringify(failed)}`);
  }

  if (releasedDomain) {
    throw new Error("Expected AnalyzedDomain to be released on failure");
  }

  console.log("[phase4] Failure path OK");

  await prisma.rawSignal.deleteMany({
    where: { analysisId: { in: [analysis.id, failAnalysis.id] } },
  });
  await prisma.analysis.deleteMany({
    where: { id: { in: [analysis.id, failAnalysis.id] } },
  });
  await prisma.analyzedDomain.deleteMany({
    where: { normalizedDomain: { in: [TEST_DOMAIN, `fail-${TEST_DOMAIN}`] } },
  });
  await prisma.lead.delete({ where: { id: lead.id } });

  await disconnectDatabase();
  console.log("[phase4] All checks passed");
}

main().catch((error) => {
  console.error("[phase4] Verification failed:", error);
  process.exit(1);
});
