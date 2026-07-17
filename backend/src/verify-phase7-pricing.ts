/**
 * Phase 7 — verify deterministic pricing engine (no API keys required).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const { prisma } = await import("./lib/prisma.js");
  const { disconnectDatabase } = await import("./lib/prisma.js");
  const { runPricingStep } = await import("./pipeline/steps/price.js");

  const lead = await prisma.lead.create({
    data: {
      name: "Phase 7 Tester",
      email: `phase7-${Date.now()}@example.com`,
      source: "discovery",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain: "example.com",
      status: "PRICING",
    },
  });

  await prisma.proposal.create({
    data: {
      analysisId: analysis.id,
      status: "DRAFT",
      strategyJson: {
        businessSummary: "A small SaaS business",
        painPoints: ["manual reporting", "slow follow-up", "tool sprawl"],
        competitorGaps: ["no automation"],
        industryTag: "saas",
        teamSizeEstimate: "medium",
      },
      techStack: [
        { name: "HubSpot", category: "crm" },
        { name: "Zapier", category: "automation" },
        { name: "Slack", category: "communication" },
        { name: "Notion", category: "docs" },
      ],
      automationBlueprint: [
        {
          title: "Lead routing",
          description: "Auto-assign inbound leads",
          impact: "high",
        },
        {
          title: "Weekly report",
          description: "Generate KPI digest",
          impact: "high",
        },
        {
          title: "Invoice reminders",
          description: "Nudge overdue accounts",
          impact: "medium",
        },
      ],
    },
  });

  const ctx = { analysisId: analysis.id, domain: "example.com" };

  try {
    await runPricingStep(ctx);

    const proposal = await prisma.proposal.findUnique({
      where: { analysisId: analysis.id },
    });

    if (
      proposal?.costEstimateUSD == null ||
      proposal.timelineWeeks == null ||
      proposal.costEstimateUSD <= 0 ||
      proposal.timelineWeeks <= 0
    ) {
      throw new Error("Proposal cost/timeline were not persisted");
    }

    const pricingSignal = await prisma.rawSignal.findFirst({
      where: { analysisId: analysis.id, source: "pricing" },
      orderBy: { fetchedAt: "desc" },
    });

    if (!pricingSignal) {
      throw new Error("Missing pricing RawSignal");
    }

    console.log(
      "[phase7] costEstimateUSD:",
      proposal.costEstimateUSD,
      "timelineWeeks:",
      proposal.timelineWeeks,
    );
    console.log("[phase7] Pricing OK");
  } finally {
    await prisma.rawSignal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.proposal.delete({ where: { analysisId: analysis.id } });
    await prisma.analysis.delete({ where: { id: analysis.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error("[phase7] Verification failed:", error);
  process.exit(1);
});
