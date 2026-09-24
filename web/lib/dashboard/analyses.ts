import { prisma } from "@/lib/prisma";
import { asReportV2, type ReportV2 } from "@/lib/report-v2/types";
import {
  averageScorecardScore,
  type AnalysisDetail,
  type AnalysisListItem,
  type AutomationItem,
  type ConsultationHistoryMessage,
  type DashboardHighlight,
  type ServiceRequestItem,
  type StrategyJson,
  type TechStackItem,
} from "@/lib/dashboard/types";

export type {
  AnalysisDetail,
  AnalysisListItem,
  AutomationItem,
  ConsultationHistoryMessage,
  DashboardHighlight,
  ServiceRequestItem,
  StrategyJson,
  TechStackItem,
} from "@/lib/dashboard/types";

export { averageScorecardScore } from "@/lib/dashboard/types";

function asObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function summarizeReport(reportJson: unknown): {
  aiScore: number | null;
  opportunityCount: number;
  automationCount: number;
  serviceCount: number;
  topFinding: string | null;
  topOpportunity: string | null;
  coverageStatus: ReportV2["coverage"]["status"] | null;
} {
  const report = asReportV2(reportJson);
  if (!report) {
    return {
      aiScore: null,
      opportunityCount: 0,
      automationCount: 0,
      serviceCount: 0,
      topFinding: null,
      topOpportunity: null,
      coverageStatus: null,
    };
  }

  const opportunities = report.opportunities ?? [];
  return {
    aiScore: averageScorecardScore(report.scorecard),
    opportunityCount: opportunities.length,
    automationCount: opportunities.filter(
      (item) => item.type === "automation_opportunity",
    ).length,
    serviceCount: report.recommendedServices?.length ?? 0,
    topFinding: report.findings?.[0]?.title ?? null,
    topOpportunity: opportunities[0]?.title ?? null,
    coverageStatus: report.coverage?.status ?? null,
  };
}

async function leadIdsForUser(userId: string, email: string): Promise<string[]> {
  const leads = await prisma.lead.findMany({
    where: {
      OR: [{ userId }, { email: email.toLowerCase() }],
    },
    select: { id: true },
  });
  return leads.map((lead) => lead.id);
}

export async function userOwnsAnalysis(
  analysisId: string,
  userId: string,
  email: string,
): Promise<boolean> {
  const leadIds = await leadIdsForUser(userId, email);
  if (leadIds.length === 0) return false;

  const row = await prisma.analysis.findFirst({
    where: { id: analysisId, leadId: { in: leadIds } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function listAnalysesForUser(
  userId: string,
  email: string,
): Promise<AnalysisListItem[]> {
  const leadIds = await leadIdsForUser(userId, email);
  if (leadIds.length === 0) return [];

  const rows = await prisma.analysis.findMany({
    where: { leadId: { in: leadIds } },
    orderBy: { createdAt: "desc" },
    include: {
      proposal: {
        select: {
          status: true,
          costEstimateUSD: true,
          timelineWeeks: true,
          pdfUrl: true,
          reportJson: true,
        },
      },
    },
  });

  return rows.map((row) => {
    const summary = summarizeReport(row.proposal?.reportJson);
    return {
      id: row.id,
      domain: row.domain,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      costEstimateUSD: row.proposal?.costEstimateUSD ?? null,
      timelineWeeks: row.proposal?.timelineWeeks ?? null,
      pdfUrl: row.proposal?.pdfUrl ?? null,
      proposalStatus: row.proposal?.status ?? null,
      aiScore: summary.aiScore,
      opportunityCount: summary.opportunityCount,
      automationCount: summary.automationCount,
      serviceCount: summary.serviceCount,
      topFinding: summary.topFinding,
      topOpportunity: summary.topOpportunity,
      coverageStatus: summary.coverageStatus,
      // Phase 2 Stripe entitlement will replace this default.
      pdfUnlocked: row.status === "DONE",
    };
  });
}

export async function getAnalysisForUser(
  analysisId: string,
  userId: string,
  email: string,
): Promise<AnalysisDetail | null> {
  const leadIds = await leadIdsForUser(userId, email);
  if (leadIds.length === 0) return null;

  const row = await prisma.analysis.findFirst({
    where: {
      id: analysisId,
      leadId: { in: leadIds },
    },
    include: {
      lead: { select: { email: true } },
      proposal: true,
      consultation: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!row) return null;

  const strategy = asObject(row.proposal?.strategyJson);
  const evidence = row.currentRunId
    ? await prisma.analysisEvidence.findMany({
        where: { runId: row.currentRunId },
        orderBy: { capturedAt: "asc" },
        select: {
          evidenceKey: true,
          provider: true,
          sourceType: true,
          title: true,
          url: true,
          excerpt: true,
        },
      })
    : [];

  return {
    id: row.id,
    domain: row.domain,
    status: row.status,
    errorMsg: row.errorMsg,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    leadEmail: row.lead.email,
    proposal: row.proposal
      ? {
          id: row.proposal.id,
          status: row.proposal.status,
          strategyJson: strategy as StrategyJson | null,
          techStack: asArray<TechStackItem>(row.proposal.techStack),
          automationBlueprint: asArray<AutomationItem>(
            row.proposal.automationBlueprint,
          ),
          narrativeText: row.proposal.narrativeText,
          costEstimateUSD: row.proposal.costEstimateUSD,
          timelineWeeks: row.proposal.timelineWeeks,
          pdfUrl: row.proposal.pdfUrl,
          reportJson: asReportV2(row.proposal.reportJson),
        }
      : null,
    evidence: evidence.map((item) => ({
      key: item.evidenceKey,
      provider: item.provider,
      sourceType: item.sourceType,
      title: item.title,
      url: item.url,
      excerpt: item.excerpt,
    })),
    consultation: row.consultation.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
    pdfUnlocked: row.status === "DONE",
  };
}

export async function listConsultationMessagesForUser(
  analysisId: string,
  userId: string,
  email: string,
): Promise<ConsultationHistoryMessage[]> {
  const owns = await userOwnsAnalysis(analysisId, userId, email);
  if (!owns) return [];

  const messages = await prisma.consultationMessage.findMany({
    where: { analysisId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));
}

export async function listServiceRequestsForUser(
  userId: string,
  email: string,
): Promise<ServiceRequestItem[]> {
  const rows = await prisma.lead.findMany({
    where: {
      source: "service_request",
      OR: [{ userId }, { email: email.toLowerCase() }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      implementationStatus: true,
      createdAt: true,
      company: true,
      message: true,
      metadata: true,
      assignedAdmin: { select: { name: true } },
    },
  });

  return rows.map((row) => {
    const metadata = asObject(row.metadata) ?? {};
    return {
      id: row.id,
      status: row.status,
      implementationStatus: row.implementationStatus,
      assignedAdminName: row.assignedAdmin?.name ?? null,
      createdAt: row.createdAt.toISOString(),
      company: row.company,
      message: row.message,
      service: asString(metadata.service),
      problem: asString(metadata.problem),
      techStack: asStringArray(metadata.techStack),
      estimatedScope: asString(metadata.estimatedScope),
      estimatedTimelineWeeks: asNumber(metadata.estimatedTimelineWeeks),
      analysisId: asString(metadata.analysisId),
      analysisDomain:
        asString(metadata.analysisDomain) ?? row.company ?? null,
    };
  });
}

export async function getDashboardStats(userId: string, email: string) {
  const analyses = await listAnalysesForUser(userId, email);
  const serviceRequests = await listServiceRequestsForUser(userId, email);
  const done = analyses.filter((item) => item.status === "DONE");
  const withProposal = analyses.filter((item) => item.proposalStatus != null);
  const latestDone = done[0] ?? null;

  const highlight: DashboardHighlight | null = latestDone
    ? {
        analysisId: latestDone.id,
        domain: latestDone.domain,
        aiScore: latestDone.aiScore,
        coverageStatus: latestDone.coverageStatus,
        opportunityCount: latestDone.opportunityCount,
        automationCount: latestDone.automationCount,
        serviceCount: latestDone.serviceCount,
        topOpportunity: latestDone.topOpportunity,
        completedAt: latestDone.completedAt,
      }
    : null;

  return {
    blueprints: done.length,
    proposals: withProposal.length,
    inFlight: analyses.filter(
      (item) => item.status !== "DONE" && item.status !== "FAILED",
    ).length,
    serviceRequests: serviceRequests.length,
    openServiceRequests: serviceRequests.filter(
      (item) => item.status === "NEW" || item.status === "CONTACTED",
    ).length,
    recent: analyses.slice(0, 5),
    highlight,
    serviceRequestPreview: serviceRequests.slice(0, 3),
  };
}
