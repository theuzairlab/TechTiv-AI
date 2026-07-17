import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import type { PipelineContext } from "../pipeline/types.js";
import type { CoverageSummary } from "./coverage.js";
import type { SynthesisResult } from "./schema.js";

export async function persistSynthesisProposal(
  ctx: PipelineContext,
  synthesis: SynthesisResult,
  coverage: CoverageSummary,
): Promise<void> {
  const maturityScore =
    synthesis.scorecard.reduce((sum, item) => sum + item.score, 0) /
    synthesis.scorecard.length;
  const strategyJson = {
    businessSummary: synthesis.executiveSummary,
    painPoints: synthesis.findings.map((item) => item.title),
    competitorGaps: synthesis.findings
      .filter((item) => item.category === "marketing")
      .map((item) => item.summary),
    industryTag: synthesis.businessProfile.industry,
    teamSizeEstimate:
      synthesis.businessProfile.teamSize === "unknown"
        ? "small"
        : synthesis.businessProfile.teamSize,
    digitalMaturity:
      maturityScore >= 70 ? "high" : maturityScore >= 40 ? "medium" : "low",
    quickWins: synthesis.opportunities
      .filter((item) => item.effort === "low")
      .map((item) => ({
        title: item.title,
        description: item.outcome,
        effort: item.effort,
      })),
    revenueOpportunities: synthesis.opportunities.map((item) => item.outcome),
    implementationPhases: synthesis.roadmap.map((item) => ({
      name: item.phase,
      focus: item.objective,
    })),
    leadershipNotes: synthesis.unknowns,
  } satisfies Prisma.InputJsonValue;

  const reportJson = {
    version: "2.0",
    generatedAt: new Date().toISOString(),
    coverage,
    ...synthesis,
  } satisfies Prisma.InputJsonValue;
  const automationBlueprint = synthesis.opportunities.map((item) => ({
    area: item.workflow,
    description: item.outcome,
    impact: item.impact,
    effort: item.effort,
    integrations: item.integrations,
    evidenceRefs: item.evidenceRefs,
  })) satisfies Prisma.InputJsonValue;
  const techStack = synthesis.stackArchitecture.map((item) => ({
    category: item.layer,
    tool: item.recommendation,
    reason: item.reason,
    evidenceRefs: item.evidenceRefs,
  })) satisfies Prisma.InputJsonValue;

  await prisma.$transaction([
    prisma.proposal.upsert({
      where: { analysisId: ctx.analysisId },
      create: {
        analysisId: ctx.analysisId,
        reportVersion: "2.0",
        reportJson,
        strategyJson,
        techStack,
        automationBlueprint,
        status: "DRAFT",
      },
      update: {
        reportVersion: "2.0",
        reportJson,
        strategyJson,
        techStack,
        automationBlueprint,
        pricingJson: Prisma.DbNull,
        roiJson: Prisma.DbNull,
        costEstimateUSD: null,
        timelineWeeks: null,
        narrativeText: null,
        pdfUrl: null,
      },
    }),
    prisma.analysisRun.update({
      where: { id: ctx.runId },
      data: { coverageJson: coverage, reportJson },
    }),
  ]);
}
