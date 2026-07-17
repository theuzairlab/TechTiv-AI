/**
 * Phase 5 — run each provider in isolation when API keys are configured.
 * Enables the provider in ProviderConfig for the test, then restores prior state.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

type ProviderTest = {
  name: string;
  envVar: string;
  run: (ctx: { analysisId: string; domain: string }) => Promise<unknown>;
};

const TEST_DOMAIN = process.env.PHASE5_TEST_DOMAIN ?? "stripe.com";

async function main() {
  const { prisma } = await import("./lib/prisma.js");
  const { disconnectDatabase } = await import("./lib/prisma.js");
  const { getProviderApiKey } = await import("./providers/env.js");
  const { scrapeDomain } = await import("./providers/firecrawl.js");
  const { auditPageSpeed } = await import("./providers/pagespeed.js");
  const { detectTechStack } = await import("./providers/detectzestack.js");
  const { searchCompetitorSignals } = await import("./providers/tavily.js");
  const { fetchSerpSignals } = await import("./providers/serpapi.js");

  const tests: ProviderTest[] = [
    { name: "firecrawl", envVar: "FIRECRAWL_API_KEY", run: scrapeDomain },
    { name: "pagespeed", envVar: "PAGESPEED_API_KEY", run: auditPageSpeed },
    { name: "detectzestack", envVar: "DETECTZESTACK_API_KEY", run: detectTechStack },
    { name: "tavily", envVar: "TAVILY_API_KEY", run: searchCompetitorSignals },
    { name: "serpapi", envVar: "SERPAPI_KEY", run: fetchSerpSignals },
  ];

  const lead = await prisma.lead.create({
    data: {
      name: "Phase 5 Provider Test",
      email: `phase5-${Date.now()}@example.com`,
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

  const ctx = { analysisId: analysis.id, domain: TEST_DOMAIN };
  let ran = 0;
  let skipped = 0;
  let failed = 0;

  for (const test of tests) {
    if (!getProviderApiKey(test.envVar)) {
      console.log(`[phase5] SKIP ${test.name} — ${test.envVar} not set`);
      skipped += 1;
      continue;
    }

    const existing = await prisma.providerConfig.findUnique({
      where: { provider: test.name },
    });

    if (!existing) {
      console.log(`[phase5] SKIP ${test.name} — not in ProviderConfig`);
      skipped += 1;
      continue;
    }

    const previousEnabled = existing.isEnabled;
    await prisma.providerConfig.update({
      where: { provider: test.name },
      data: { isEnabled: true },
    });

    try {
      console.log(`[phase5] Testing ${test.name} on ${TEST_DOMAIN}...`);
      const result = await test.run(ctx);
      console.log(`[phase5] OK ${test.name}:`, JSON.stringify(result).slice(0, 200));

      const usage = await prisma.toolUsageLog.findFirst({
        where: { analysisId: analysis.id, provider: test.name, status: "success" },
        orderBy: { createdAt: "desc" },
      });

      if (!usage) {
        throw new Error(`No successful ToolUsageLog for ${test.name}`);
      }

      ran += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[phase5] FAIL ${test.name}:`, message);
    } finally {
      await prisma.providerConfig.update({
        where: { provider: test.name },
        data: { isEnabled: previousEnabled },
      });
    }
  }

  await prisma.toolUsageLog.deleteMany({ where: { analysisId: analysis.id } });
  await prisma.analysis.delete({ where: { id: analysis.id } });
  await prisma.lead.delete({ where: { id: lead.id } });
  await disconnectDatabase();

  console.log(`[phase5] Done — ran: ${ran}, skipped: ${skipped}, failed: ${failed}`);

  if (ran === 0 && failed === 0) {
    console.log(
      "[phase5] No providers tested. Add API keys to backend/.env and enable providers in ProviderConfig.",
    );
    return;
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[phase5] Provider isolation failed:", error);
  process.exit(1);
});
