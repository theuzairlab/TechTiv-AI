import { prisma } from "@/lib/prisma";
import type {
  AnalysisStatus,
  ProposalStatus,
} from "@/lib/generated/prisma/client";
import { asReportV2, type ReportV2 } from "@/lib/report-v2/types";

export type StrategyJson = {
  businessSummary?: string;
  painPoints?: string[];
  competitorGaps?: string[];
  industryTag?: string;
  teamSizeEstimate?: string;
  digitalMaturity?: string;
  seoAudit?: {
    strengths?: string[];
    gaps?: string[];
    opportunities?: string[];
  };
  geoAeoAudit?: {
    localPresence?: string[];
    aiAnswerReadiness?: string[];
    gaps?: string[];
  };
  socialPresence?: {
    platformsFound?: string[];
    strengths?: string[];
    gaps?: string[];
  };
  trustSignals?: string[];
  quickWins?: Array<{
    title?: string;
    description?: string;
    effort?: string;
  }>;
  revenueOpportunities?: string[];
  implementationPhases?: Array<{
    name?: string;
    weeks?: number;
    focus?: string;
  }>;
  leadershipNotes?: string[];
};

export type TechStackItem = {
  category?: string;
  tool?: string;
  name?: string;
  reason?: string;
};

export type AutomationItem = {
  area?: string;
  title?: string;
  description?: string;
  impact?: string;
};

export type AnalysisListItem = {
  id: string;
  domain: string;
  status: AnalysisStatus;
  createdAt: string;
  completedAt: string | null;
  costEstimateUSD: number | null;
  timelineWeeks: number | null;
  pdfUrl: string | null;
  proposalStatus: ProposalStatus | null;
};

export type AnalysisDetail = {
  id: string;
  domain: string;
  status: AnalysisStatus;
  errorMsg: string | null;
  createdAt: string;
  completedAt: string | null;
  leadEmail: string;
  proposal: {
    id: string;
    status: ProposalStatus;
    strategyJson: StrategyJson | null;
    techStack: TechStackItem[];
    automationBlueprint: AutomationItem[];
    narrativeText: string | null;
    costEstimateUSD: number | null;
    timelineWeeks: number | null;
    pdfUrl: string | null;
    reportJson: ReportV2 | null;
  } | null;
  evidence: Array<{
    key: string;
    provider: string;
    sourceType: string;
    title: string | null;
    url: string | null;
    excerpt: string | null;
  }>;
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
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
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    domain: row.domain,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    costEstimateUSD: row.proposal?.costEstimateUSD ?? null,
    timelineWeeks: row.proposal?.timelineWeeks ?? null,
    pdfUrl: row.proposal?.pdfUrl ?? null,
    proposalStatus: row.proposal?.status ?? null,
  }));
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
  };
}

export async function getDashboardStats(userId: string, email: string) {
  const analyses = await listAnalysesForUser(userId, email);
  const done = analyses.filter((item) => item.status === "DONE");
  const withProposal = analyses.filter((item) => item.proposalStatus != null);

  return {
    blueprints: done.length,
    proposals: withProposal.length,
    inFlight: analyses.filter(
      (item) => item.status !== "DONE" && item.status !== "FAILED",
    ).length,
    recent: analyses.slice(0, 5),
  };
}
