import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { RoiResult } from "./roi.js";
import type { PricingResult } from "./types.js";

export async function persistPricingResult(
  analysisId: string,
  runId: string,
  pricing: PricingResult,
  roi: RoiResult,
): Promise<void> {
  const proposal = await prisma.proposal.findUnique({
    where: { analysisId },
    select: { reportJson: true },
  });
  const report =
    proposal?.reportJson &&
    typeof proposal.reportJson === "object" &&
    !Array.isArray(proposal.reportJson)
      ? (proposal.reportJson as Record<string, unknown>)
      : {};
  const pricingJson = pricing as unknown as Prisma.InputJsonValue;
  const roiJson = roi as unknown as Prisma.InputJsonValue;
  const reportJson = { ...report, pricing, roi } as Prisma.InputJsonValue;

  await prisma.$transaction([
    prisma.proposal.update({
      where: { analysisId },
      data: {
        costEstimateUSD: pricing.costEstimateUSD,
        timelineWeeks: pricing.timelineWeeks,
        pricingJson,
        roiJson,
        reportJson,
      },
    }),
    prisma.analysisRun.update({
      where: { id: runId },
      data: { pricingJson, roiJson, reportJson },
    }),
  ]);
}
