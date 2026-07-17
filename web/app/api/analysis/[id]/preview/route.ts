import { NextResponse } from "next/server";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { prisma } from "@/lib/prisma";
import { asReportV2 } from "@/lib/report-v2/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type StrategyJson = {
  businessSummary?: string;
  painPoints?: string[];
  competitorGaps?: string[];
  industryTag?: string;
  digitalMaturity?: string;
  quickWins?: Array<{
    title?: string;
    description?: string;
    effort?: string;
  }>;
  seoAudit?: { opportunities?: string[]; gaps?: string[] };
  geoAeoAudit?: {
    localPresence?: string[];
    aiAnswerReadiness?: string[];
    gaps?: string[];
  };
  revenueOpportunities?: string[];
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const token = new URL(request.url).searchParams.get("token");

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        domain: true,
        status: true,
        guestAccessToken: true,
        businessIntake: true,
        proposal: {
          select: {
            costEstimateUSD: true,
            timelineWeeks: true,
            strategyJson: true,
            narrativeText: true,
            automationBlueprint: true,
            techStack: true,
            reportJson: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (!verifyGuestAccess(analysis.guestAccessToken, token)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (analysis.status !== "DONE") {
      return NextResponse.json(
        { error: "Analysis not complete", status: analysis.status },
        { status: 409 },
      );
    }

    const report = asReportV2(analysis.proposal?.reportJson);
    const strategy =
      analysis.proposal?.strategyJson &&
      typeof analysis.proposal.strategyJson === "object" &&
      !Array.isArray(analysis.proposal.strategyJson)
        ? (analysis.proposal.strategyJson as StrategyJson)
        : {};

    const automations = Array.isArray(analysis.proposal?.automationBlueprint)
      ? (
          analysis.proposal.automationBlueprint as Array<{
            area?: string;
            description?: string;
            impact?: string;
          }>
        )
          .filter((item) => item.area && item.description)
          .slice(0, 2)
          .map((item) => ({
            area: String(item.area),
            description: String(item.description),
            impact: String(item.impact ?? "medium"),
          }))
      : [];

    const painPoints = report
      ? report.findings.slice(0, 3).map((item) => item.title)
      : (strategy.painPoints ?? []).slice(0, 3);
    const summary =
      report?.executiveSummary.slice(0, 520) ??
      strategy.businessSummary?.slice(0, 420) ??
      null;
    const quickWins = (strategy.quickWins ?? [])
      .slice(0, 2)
      .map((win) => ({
        title: win.title ?? "Quick win",
        description: win.description ?? "",
        effort: win.effort ?? "medium",
      }));

    return NextResponse.json({
      analysisId: analysis.id,
      domain: analysis.domain,
      companyName:
        typeof analysis.businessIntake === "object" &&
        analysis.businessIntake &&
        !Array.isArray(analysis.businessIntake) &&
        "companyName" in analysis.businessIntake
          ? String(
              (analysis.businessIntake as { companyName?: string }).companyName ??
                "",
            ) || null
          : null,
      teaser: {
        businessSummary: summary,
        painPoints,
        automationHighlights: automations,
        competitorGaps: report
          ? report.competitors
              .filter((item) => item.verified)
              .slice(0, 2)
              .map((item) => item.positioning)
          : (strategy.competitorGaps ?? []).slice(0, 2),
        industryTag: report?.businessProfile.industry ?? strategy.industryTag ?? null,
        digitalMaturity: strategy.digitalMaturity ?? null,
        quickWins: report
          ? report.opportunities.slice(0, 2).map((item) => ({
              title: item.title,
              description: item.outcome,
              effort: item.effort,
            }))
          : quickWins,
        seoHighlights: (strategy.seoAudit?.opportunities ?? []).slice(0, 2),
        geoHighlights: (strategy.geoAeoAudit?.localPresence ?? []).slice(0, 2),
        aeoHighlights: (strategy.geoAeoAudit?.aiAnswerReadiness ?? []).slice(0, 2),
        revenueOpportunities: report
          ? report.opportunities.slice(0, 2).map((item) => item.outcome)
          : (strategy.revenueOpportunities ?? []).slice(0, 2),
        coverage: report?.coverage ?? null,
        confidence: report?.confidence ?? null,
        scorecard: report?.scorecard.slice(0, 4) ?? [],
        findings:
          report?.findings.slice(0, 3).map((item) => ({
            title: item.title,
            category: item.category,
            severity: item.severity,
            summary: item.summary,
          })) ?? [],
        costEstimateUSD: analysis.proposal?.costEstimateUSD ?? null,
        timelineWeeks: analysis.proposal?.timelineWeeks ?? null,
      },
      locked: {
        fullStrategy: true,
        fullAutomationBlueprint: true,
        pdfDownload: true,
        roiModel: Boolean(report?.roi?.available),
        implementationPhases: true,
        fullSeoGeoAeo: true,
      },
    });
  } catch (error) {
    console.error("[api/analysis/[id]/preview] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load preview" },
      { status: 500 },
    );
  }
}
