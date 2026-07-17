import { prisma } from "../lib/prisma.js";
import type { PricingInput, TeamSizeEstimate } from "./types.js";

type ReportV2 = {
  businessProfile?: {
    industry?: string;
    teamSize?: TeamSizeEstimate | "unknown";
  };
  findings?: Array<{ title?: string }>;
  opportunities?: Array<{
    workflow?: string;
    impact?: "high" | "medium" | "low";
    effort?: "high" | "medium" | "low";
    integrations?: string[];
  }>;
  unknowns?: string[];
};

function parseVolume(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const match = String(value).replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export async function loadPricingInput(
  analysisId: string,
): Promise<PricingInput> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: {
      businessIntake: true,
      proposal: { select: { reportJson: true } },
    },
  });
  if (!analysis?.proposal?.reportJson) {
    throw new Error(`Report V2 missing for analysis ${analysisId}`);
  }

  const report = analysis.proposal.reportJson as ReportV2;
  const intake =
    analysis.businessIntake &&
    typeof analysis.businessIntake === "object" &&
    !Array.isArray(analysis.businessIntake)
      ? (analysis.businessIntake as Record<string, unknown>)
      : {};
  const opportunities = report.opportunities ?? [];
  const workflows = new Set(
    opportunities.map((item) => item.workflow).filter(Boolean),
  );
  const integrations = new Set(
    opportunities.flatMap((item) => item.integrations ?? []).filter(Boolean),
  );
  const industry = report.businessProfile?.industry ?? "general";
  const regulated = /(finance|health|legal|insurance|government)/i.test(industry);
  const migrationText = `${intake.currentTools ?? ""} ${(report.unknowns ?? []).join(" ")}`;
  const migration = /migration|legacy|replace/i.test(migrationText)
    ? integrations.size > 3
      ? "complex"
      : "light"
    : "none";
  const complexity =
    opportunities.some((item) => item.effort === "high") ||
    integrations.size > 5
      ? "high"
      : opportunities.some((item) => item.effort === "medium") ||
          integrations.size > 2
        ? "medium"
        : "low";
  const teamSize =
    report.businessProfile?.teamSize === "unknown"
      ? "small"
      : report.businessProfile?.teamSize ?? "small";

  return {
    teamSizeEstimate: teamSize,
    painPointTags: (report.findings ?? [])
      .map((item) => item.title)
      .filter((item): item is string => Boolean(item)),
    toolCount: integrations.size,
    automationCount: workflows.size,
    highImpactAutomationCount: opportunities.filter(
      (item) => item.impact === "high",
    ).length,
    mediumImpactAutomationCount: opportunities.filter(
      (item) => item.impact === "medium",
    ).length,
    lowImpactAutomationCount: opportunities.filter(
      (item) => item.impact === "low",
    ).length,
    industryTag: industry,
    scope: {
      workflowCount: Math.max(1, workflows.size),
      integrationCount: integrations.size,
      migration,
      complexity,
      compliance: regulated ? "regulated" : "standard",
      support: /ongoing|managed|support/i.test(String(intake.goals ?? ""))
        ? "managed"
        : "launch",
      monthlyVolume: parseVolume(intake.volumes),
    },
  };
}
