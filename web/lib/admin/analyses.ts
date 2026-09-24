import { prisma } from "@/lib/prisma";
import type { AnalysisStatus } from "@/lib/generated/prisma/client";
import { retryFailedAnalysis as retryFailedAnalysisShared } from "@/lib/analysis/retry";
import { asReportV2, type ReportV2 } from "@/lib/report-v2/types";
import {
  averageScorecardScore,
  type ConsultationHistoryMessage,
} from "@/lib/dashboard/types";

export type AdminAnalysisListItem = {
  id: string;
  domain: string;
  status: AnalysisStatus;
  errorMsg: string | null;
  createdAt: string;
  completedAt: string | null;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadUserId: string | null;
  companyId: string | null;
  companyName: string | null;
  proposalStatus: string | null;
  costEstimateUSD: number | null;
  aiScore: number | null;
  topFinding: string | null;
  opportunityCount: number;
};

export type AdminAnalysisDetail = {
  id: string;
  domain: string;
  status: AnalysisStatus;
  errorMsg: string | null;
  createdAt: string;
  completedAt: string | null;
  socialLinks: unknown;
  lead: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    status: string;
    userId: string | null;
    companyId: string | null;
  };
  proposal: {
    id: string;
    status: string;
    costEstimateUSD: number | null;
    timelineWeeks: number | null;
    pdfUrl: string | null;
    narrativeText: string | null;
    strategyJson: unknown;
    reportJson: ReportV2 | null;
  } | null;
  consultation: ConsultationHistoryMessage[];
  rawSignals: Array<{
    id: string;
    source: string;
    fetchedAt: string;
    payload: unknown;
  }>;
  usageLogs: Array<{
    id: string;
    provider: string;
    endpoint: string;
    status: string;
    costEstimateUSD: number;
    latencyMs: number;
    createdAt: string;
  }>;
};

function summarizeReport(reportJson: unknown) {
  const report = asReportV2(reportJson);
  if (!report) {
    return { aiScore: null, topFinding: null, opportunityCount: 0 };
  }
  return {
    aiScore: averageScorecardScore(report.scorecard),
    topFinding: report.findings?.[0]?.title ?? null,
    opportunityCount: report.opportunities?.length ?? 0,
  };
}

export async function listAdminAnalyses(options?: {
  status?: AnalysisStatus;
  search?: string;
  limit?: number;
}): Promise<AdminAnalysisListItem[]> {
  const search = options?.search?.trim().toLowerCase();
  const limit = options?.limit ?? 100;

  const rows = await prisma.analysis.findMany({
    where: {
      ...(options?.status ? { status: options.status } : {}),
      ...(search
        ? {
            OR: [
              { domain: { contains: search, mode: "insensitive" } },
              { lead: { email: { contains: search, mode: "insensitive" } } },
              { lead: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          userId: true,
          companyId: true,
          companyRecord: { select: { name: true } },
        },
      },
      proposal: {
        select: { status: true, costEstimateUSD: true, reportJson: true },
      },
    },
  });

  return rows.map((row) => {
    const summary = summarizeReport(row.proposal?.reportJson);
    return {
      id: row.id,
      domain: row.domain,
      status: row.status,
      errorMsg: row.errorMsg,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      leadId: row.lead.id,
      leadName: row.lead.name,
      leadEmail: row.lead.email,
      leadUserId: row.lead.userId,
      companyId: row.lead.companyId,
      companyName: row.lead.companyRecord?.name ?? null,
      proposalStatus: row.proposal?.status ?? null,
      costEstimateUSD: row.proposal?.costEstimateUSD ?? null,
      aiScore: summary.aiScore,
      topFinding: summary.topFinding,
      opportunityCount: summary.opportunityCount,
    };
  });
}

export async function getAdminAnalysisDetail(
  analysisId: string,
): Promise<AdminAnalysisDetail | null> {
  const row = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          status: true,
          userId: true,
          companyId: true,
        },
      },
      proposal: true,
      consultation: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
      rawSignals: { orderBy: { fetchedAt: "asc" } },
      usageLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    domain: row.domain,
    status: row.status,
    errorMsg: row.errorMsg,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    socialLinks: row.socialLinks,
    lead: row.lead,
    proposal: row.proposal
      ? {
          id: row.proposal.id,
          status: row.proposal.status,
          costEstimateUSD: row.proposal.costEstimateUSD,
          timelineWeeks: row.proposal.timelineWeeks,
          pdfUrl: row.proposal.pdfUrl,
          narrativeText: row.proposal.narrativeText,
          strategyJson: row.proposal.strategyJson,
          reportJson: asReportV2(row.proposal.reportJson),
        }
      : null,
    consultation: row.consultation.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
    rawSignals: row.rawSignals.map((signal) => ({
      id: signal.id,
      source: signal.source,
      fetchedAt: signal.fetchedAt.toISOString(),
      payload: signal.payload,
    })),
    usageLogs: row.usageLogs.map((log) => ({
      id: log.id,
      provider: log.provider,
      endpoint: log.endpoint,
      status: log.status,
      costEstimateUSD: log.costEstimateUSD,
      latencyMs: log.latencyMs,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

export async function retryFailedAnalysis(
  analysisId: string,
  adminUserId: string,
): Promise<{ jobId: string }> {
  return retryFailedAnalysisShared(analysisId, adminUserId);
}
