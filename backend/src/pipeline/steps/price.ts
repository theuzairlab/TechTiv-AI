import { PIPELINE_USE_STUBS } from "../stub.js";
import type { PipelineContext } from "../types.js";
import { logInsight, logStepStart } from "../context.js";
import { updateAnalysisStatus, writeRawSignal } from "../update-status.js";
import { calculatePricing } from "../../pricing/engine.js";
import { loadPricingInput } from "../../pricing/load-input.js";
import { persistPricingResult } from "../../pricing/persist-pricing.js";
import { calculateRoi } from "../../pricing/roi.js";
import { prisma } from "../../lib/prisma.js";

const STUB_PRICING_INPUT = {
  teamSizeEstimate: "small" as const,
  painPointTags: ["manual reporting", "slow lead follow-up"],
  toolCount: 1,
  automationCount: 1,
  highImpactAutomationCount: 1,
  mediumImpactAutomationCount: 0,
  lowImpactAutomationCount: 0,
  industryTag: "saas",
  scope: {
    workflowCount: 1,
    integrationCount: 2,
    migration: "light" as const,
    complexity: "medium" as const,
    compliance: "standard" as const,
    support: "launch" as const,
  },
};

export async function runPricingStep(ctx: PipelineContext): Promise<void> {
  await updateAnalysisStatus(ctx.analysisId, "PRICING");
  await logStepStart(
    ctx,
    "pricing",
    "Calculating deterministic investment range and implementation timeline…",
  );

  const pricingInput = PIPELINE_USE_STUBS
    ? STUB_PRICING_INPUT
    : await loadPricingInput(ctx.analysisId);
  const pricing = calculatePricing(pricingInput);
  const analysis = await prisma.analysis.findUnique({
    where: { id: ctx.analysisId },
    select: { businessIntake: true },
  });
  const intake =
    analysis?.businessIntake &&
    typeof analysis.businessIntake === "object" &&
    !Array.isArray(analysis.businessIntake)
      ? (analysis.businessIntake as Record<string, unknown>)
      : {};
  const roi = calculateRoi(intake, pricing.costEstimateUSD);

  await persistPricingResult(ctx.analysisId, ctx.runId, pricing, roi);

  await writeRawSignal(ctx.analysisId, "pricing", {
    domain: ctx.domain,
    costEstimateUSD: pricing.costEstimateUSD,
    timelineWeeks: pricing.timelineWeeks,
    tier: pricing.tier,
    breakdown: pricing.breakdown,
    range: pricing.range,
    lineItems: pricing.lineItems,
    roi,
    engine: pricing.engineVersion,
  });

  await logInsight(
    ctx,
    `Investment model ready — ${pricing.timelineWeeks} week phased rollout estimated.`,
  );
}
