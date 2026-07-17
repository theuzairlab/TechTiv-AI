import { prisma } from "../../lib/prisma.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import type { PipelineContext } from "../types.js";
import { logStepStart } from "../context.js";
import { writeRawSignal } from "../update-status.js";
import { companyLabel, parseBusinessIntake } from "../intake.js";

type StrategyJson = {
  businessSummary?: string;
  painPoints?: string[];
  competitorGaps?: string[];
  digitalMaturity?: string;
  quickWins?: Array<{ title?: string; description?: string; effort?: string }>;
  revenueOpportunities?: string[];
  implementationPhases?: Array<{ name?: string; weeks?: number; focus?: string }>;
  seoAudit?: { gaps?: string[]; opportunities?: string[] };
  geoAeoAudit?: {
    localPresence?: string[];
    aiAnswerReadiness?: string[];
    gaps?: string[];
  };
  socialPresence?: {
    platformsFound?: string[];
    gaps?: string[];
  };
  leadershipNotes?: string[];
};

type ReportV2 = {
  executiveSummary?: string;
  findings?: Array<{ title?: string; summary?: string }>;
  opportunities?: Array<{ title?: string; outcome?: string }>;
  risks?: string[];
  unknowns?: string[];
};

function bullet(label: string, items: string[] | undefined, limit = 4): string[] {
  if (!items || items.length === 0) return [];
  return [
    `${label}:`,
    ...items.slice(0, limit).map((item) => `• ${item}`),
    "",
  ];
}

function buildNarrative(input: {
  company: string;
  domain: string;
  costEstimateUSD?: number | null;
  timelineWeeks?: number | null;
  strategy: StrategyJson;
}): string {
  const cost =
    input.costEstimateUSD != null
      ? `$${input.costEstimateUSD.toLocaleString()}`
      : "a tailored investment range";
  const weeks =
    input.timelineWeeks != null
      ? `${input.timelineWeeks} weeks`
      : "a phased timeline";

  const summary =
    input.strategy.businessSummary?.trim() ||
    `${input.company} is ready for a focused AI transformation engagement.`;

  const phases = (input.strategy.implementationPhases ?? [])
    .slice(0, 4)
    .map(
      (phase) =>
        `• ${phase.name ?? "Phase"} (${phase.weeks ?? "?"} wks): ${phase.focus ?? ""}`,
    );

  const quickWins = (input.strategy.quickWins ?? [])
    .slice(0, 3)
    .map(
      (win) =>
        `• ${win.title ?? "Quick win"}${win.effort ? ` [${win.effort} effort]` : ""} — ${win.description ?? ""}`,
    );

  return [
    `TechTivAI intelligence report for ${input.company} (${input.domain}).`,
    "",
    summary,
    "",
    input.strategy.digitalMaturity
      ? `Digital maturity assessment: ${input.strategy.digitalMaturity}.`
      : "",
    "",
    ...bullet("Priority friction points", input.strategy.painPoints, 5),
    ...bullet("Competitor gaps", input.strategy.competitorGaps, 4),
    ...bullet("SEO opportunities", input.strategy.seoAudit?.opportunities, 3),
    ...bullet("GEO / local presence", input.strategy.geoAeoAudit?.localPresence, 3),
    ...bullet(
      "AEO / AI-answer readiness",
      input.strategy.geoAeoAudit?.aiAnswerReadiness,
      3,
    ),
    ...bullet(
      "Social presence gaps",
      input.strategy.socialPresence?.gaps,
      3,
    ),
    ...bullet("Revenue opportunities", input.strategy.revenueOpportunities, 4),
    quickWins.length > 0 ? "Quick wins:" : "",
    ...quickWins,
    quickWins.length > 0 ? "" : "",
    phases.length > 0 ? "Recommended implementation phases:" : "",
    ...phases,
    phases.length > 0 ? "" : "",
    `Based on the deterministic pricing engine, we recommend an engagement around ${cost} over approximately ${weeks}. This estimate reflects team size, tool complexity, automation scope, and industry context — not an LLM guess.`,
    "",
    "Your blueprint includes prioritized automation opportunities, SEO/GEO/AEO findings, and a recommended technology stack. Unlock the full report in your dashboard to download the PDF and share with stakeholders.",
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export async function runNarrativeStep(ctx: PipelineContext): Promise<void> {
  const intake = parseBusinessIntake(ctx.businessIntake);
  const company = companyLabel(intake, ctx.domain);

  await logStepStart(
    ctx,
    "narrative",
    `Drafting executive intelligence narrative for ${company}…`,
  );

  const proposal = await prisma.proposal.findUnique({
    where: { analysisId: ctx.analysisId },
    select: {
      strategyJson: true,
      reportJson: true,
      costEstimateUSD: true,
      timelineWeeks: true,
    },
  });

  if (!proposal && !PIPELINE_USE_STUBS) {
    throw new Error(
      `Proposal missing for analysis ${ctx.analysisId} — run synthesis/pricing first`,
    );
  }

  const strategy =
    proposal?.strategyJson &&
    typeof proposal.strategyJson === "object" &&
    !Array.isArray(proposal.strategyJson)
      ? (proposal.strategyJson as StrategyJson)
      : {};

  const report =
    proposal?.reportJson &&
    typeof proposal.reportJson === "object" &&
    !Array.isArray(proposal.reportJson)
      ? (proposal.reportJson as ReportV2)
      : null;
  const narrativeText = report?.executiveSummary
    ? [
        `TechTivAI decision report for ${company}.`,
        "",
        report.executiveSummary,
        "",
        ...bullet(
          "Priority findings",
          report.findings?.map(
            (item) => `${item.title ?? "Finding"}: ${item.summary ?? ""}`,
          ),
        ),
        ...bullet(
          "Recommended opportunities",
          report.opportunities?.map(
            (item) => `${item.title ?? "Opportunity"}: ${item.outcome ?? ""}`,
          ),
        ),
        ...bullet("Risks", report.risks),
        ...bullet("Open questions", report.unknowns),
      ].join("\n")
    : buildNarrative({
        company,
        domain: ctx.domain,
        strategy,
        costEstimateUSD: proposal?.costEstimateUSD,
        timelineWeeks: proposal?.timelineWeeks,
      });

  if (proposal) {
    await prisma.proposal.update({
      where: { analysisId: ctx.analysisId },
      data: { narrativeText },
    });
  }

  await writeRawSignal(ctx.analysisId, "narrative", {
    domain: ctx.domain,
    company,
    narrativeText,
    stub: PIPELINE_USE_STUBS,
  });
}
