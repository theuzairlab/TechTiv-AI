/**
 * Phase 6 — verify Claude synthesis with sample signals (skips without ANTHROPIC_API_KEY).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    console.log("[phase6] SKIP — ANTHROPIC_API_KEY not set");
    return;
  }

  const { prisma } = await import("./lib/prisma.js");
  const { disconnectDatabase } = await import("./lib/prisma.js");
  const { runSynthesizeStep } = await import("./pipeline/steps/synthesize.js");
  const { writeRawSignal } = await import("./pipeline/update-status.js");

  const lead = await prisma.lead.create({
    data: {
      name: "Phase 6 Tester",
      email: `phase6-${Date.now()}@example.com`,
      source: "discovery",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain: "stripe.com",
      status: "ANALYZING",
    },
  });

  const ctx = { analysisId: analysis.id, domain: "stripe.com" };

  await writeRawSignal(analysis.id, "firecrawl", {
    markdown: "Stripe is a payments infrastructure company.",
    domain: "stripe.com",
  });
  await writeRawSignal(analysis.id, "pagespeed", {
    scores: { performance: 80, seo: 90, accessibility: 88 },
  });
  await writeRawSignal(analysis.id, "detectzestack", {
    technologies: [{ name: "React" }, { name: "Cloudflare" }],
  });
  await writeRawSignal(analysis.id, "tavily", {
    results: [{ title: "Stripe competitors", url: "https://example.com" }],
  });
  await writeRawSignal(analysis.id, "serpapi", {
    organicResults: [{ title: "Payment processors", link: "https://example.com" }],
  });

  const claudeConfig = await prisma.providerConfig.findUnique({
    where: { provider: "claude" },
  });
  const previousEnabled = claudeConfig?.isEnabled ?? false;
  await prisma.providerConfig.update({
    where: { provider: "claude" },
    data: { isEnabled: true },
  });

  try {
    await runSynthesizeStep(ctx);

    const proposal = await prisma.proposal.findUnique({
      where: { analysisId: analysis.id },
    });

    if (!proposal?.strategyJson || !proposal.techStack || !proposal.automationBlueprint) {
      throw new Error("Proposal was not populated after synthesis");
    }

    const synthesisSignal = await prisma.rawSignal.findFirst({
      where: { analysisId: analysis.id, source: "synthesis" },
      orderBy: { fetchedAt: "desc" },
    });

    if (!synthesisSignal) {
      throw new Error("Missing synthesis RawSignal");
    }

    console.log("[phase6] Proposal strategyJson:", JSON.stringify(proposal.strategyJson).slice(0, 200));
    console.log("[phase6] Synthesis OK");
  } finally {
    await prisma.providerConfig.update({
      where: { provider: "claude" },
      data: { isEnabled: previousEnabled },
    });
    await prisma.proposal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.rawSignal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.toolUsageLog.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.analysis.delete({ where: { id: analysis.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error("[phase6] Verification failed:", error);
  process.exit(1);
});
