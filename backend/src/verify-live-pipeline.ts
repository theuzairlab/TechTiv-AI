/**
 * Live end-to-end pipeline verification (no PIPELINE_USE_STUBS).
 * Requires provider API keys + providers enabled in ProviderConfig.
 *
 * Usage:
 *   npm run test:live
 *   LIVE_TEST_DOMAIN=example.com npm run test:live
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

delete process.env.PIPELINE_USE_STUBS;

const DOMAIN = (process.env.LIVE_TEST_DOMAIN ?? "example.com").trim();

const REQUIRED_ENV = [
  "FIRECRAWL_API_KEY",
  "PAGESPEED_API_KEY",
  "DETECTZESTACK_API_KEY",
  "TAVILY_API_KEY",
  "SERPAPI_KEY",
  "ANTHROPIC_API_KEY",
] as const;

async function main() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }

  const { prisma, disconnectDatabase } = await import("./lib/prisma.js");
  const { runPipeline } = await import("./pipeline/index.js");

  const providers = [
    "firecrawl",
    "pagespeed",
    "detectzestack",
    "tavily",
    "serpapi",
    "claude",
    "resend",
  ];

  await prisma.providerConfig.updateMany({
    where: { provider: { in: providers } },
    data: { isEnabled: true },
  });

  const lead = await prisma.lead.create({
    data: {
      name: "Live Pipeline Tester",
      email: `live-${Date.now()}@example.com`,
      source: "discovery",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain: DOMAIN,
      status: "QUEUED",
    },
  });

  await prisma.analyzedDomain.upsert({
    where: { normalizedDomain: DOMAIN },
    create: {
      normalizedDomain: DOMAIN,
      status: "PROCESSING",
      lastAnalysisId: analysis.id,
    },
    update: {
      status: "PROCESSING",
      lastAnalysisId: analysis.id,
      completedAt: null,
    },
  });

  console.log(`[live] Running full pipeline for ${DOMAIN} (${analysis.id})`);

  try {
    await runPipeline(analysis.id);

    const done = await prisma.analysis.findUnique({
      where: { id: analysis.id },
      include: { proposal: true },
    });

    if (done?.status !== "DONE") {
      throw new Error(`Expected DONE, got ${done?.status}`);
    }

    if (!done.proposal?.strategyJson || done.proposal.costEstimateUSD == null) {
      throw new Error("Proposal incomplete after live pipeline");
    }

    if (!done.proposal.pdfUrl) {
      throw new Error("Proposal.pdfUrl missing");
    }

    const signals = await prisma.rawSignal.findMany({
      where: { analysisId: analysis.id },
      select: { source: true },
    });
    const sources = [...new Set(signals.map((s) => s.source))].sort();
    console.log(`[live] RawSignal sources: ${sources.join(", ")}`);
    console.log(
      `[live] cost=$${done.proposal.costEstimateUSD} weeks=${done.proposal.timelineWeeks}`,
    );
    console.log("[live] Full pipeline PASSED");
  } finally {
    await prisma.toolUsageLog.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.rawSignal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.proposal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.analysis.delete({ where: { id: analysis.id } }).catch(() => undefined);
    await prisma.analyzedDomain
      .deleteMany({ where: { normalizedDomain: DOMAIN } })
      .catch(() => undefined);
    await prisma.lead.delete({ where: { id: lead.id } }).catch(() => undefined);
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error("[live] FAILED:", error);
  process.exit(1);
});
