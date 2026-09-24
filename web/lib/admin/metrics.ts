import { prisma } from "@/lib/prisma";
import type { AnalysisStatus } from "@/lib/generated/prisma/client";

export type AdminOverviewMetrics = {
  users: number;
  leads: number;
  newLeads: number;
  analyses: number;
  newAssessments: number;
  consultationRequests: number;
  convertedClients: number;
  serviceOpportunities: number;
  paidBlueprints: number;
  blueprintRevenueUSD: number;
  activeSubscriptions: number;
  voiceCalls: number;
  aiChatSessions: number;
  analysesByStatus: Record<AnalysisStatus, number>;
  failedAnalyses: number;
  inFlightAnalyses: number;
  completedProposals: number;
  providerSpendUSD: number;
  providerFailures: Array<{ provider: string; count: number }>;
  avgPipelineMinutes: number | null;
  recentFailed: Array<{
    id: string;
    domain: string;
    errorMsg: string | null;
    createdAt: string;
    leadEmail: string;
  }>;
};

const TERMINAL: AnalysisStatus[] = ["DONE", "FAILED"];

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function countVoiceSessions() {
  try {
    return prisma.voiceSession?.count() ?? Promise.resolve(0);
  } catch {
    return Promise.resolve(0);
  }
}

function countConsultantSessions() {
  try {
    return prisma.consultantSession?.count() ?? Promise.resolve(0);
  } catch {
    return Promise.resolve(0);
  }
}

export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const startOfMonth = monthStart();

  const [
    users,
    leads,
    newLeads,
    analyses,
    newAssessments,
    consultationRequests,
    convertedClients,
    serviceOpportunities,
    statusGroups,
    completedProposals,
    voiceCalls,
    aiChatSessions,
    providerConfigs,
    failureGroups,
    recentFailed,
    completedWithDuration,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.analysis.count(),
    prisma.analysis.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.lead.count({ where: { source: "service_request" } }),
    prisma.lead.count({ where: { status: "WON" } }),
    prisma.lead.count({
      where: { source: "service_request", status: { not: "LOST" } },
    }),
    prisma.analysis.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.proposal.count({
      where: { analysis: { status: "DONE" } },
    }),
    countVoiceSessions().catch(() => 0),
    countConsultantSessions().catch(() => 0),
    prisma.providerConfig.findMany({
      orderBy: { provider: "asc" },
    }),
    prisma.toolUsageLog.groupBy({
      by: ["provider"],
      where: {
        status: "failed",
        createdAt: { gte: startOfMonth },
      },
      _count: { provider: true },
    }),
    prisma.analysis.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        domain: true,
        errorMsg: true,
        createdAt: true,
        lead: { select: { email: true } },
      },
    }),
    prisma.analysis.findMany({
      where: {
        status: "DONE",
        completedAt: { not: null },
      },
      select: { createdAt: true, completedAt: true },
      take: 100,
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const analysesByStatus = {
    QUEUED: 0,
    CRAWLING: 0,
    DISCOVERING: 0,
    AUDITING: 0,
    ANALYZING: 0,
    SYNTHESIZING: 0,
    PRICING: 0,
    GENERATING_PDF: 0,
    DONE: 0,
    FAILED: 0,
  } satisfies Record<AnalysisStatus, number>;

  for (const row of statusGroups) {
    analysesByStatus[row.status] = row._count?.status ?? 0;
  }

  const failedAnalyses = analysesByStatus.FAILED;
  const inFlightAnalyses = Object.entries(analysesByStatus)
    .filter(([status]) => !TERMINAL.includes(status as AnalysisStatus))
    .reduce((sum, [, count]) => sum + count, 0);

  const providerSpendUSD = providerConfigs.reduce(
    (sum, row) => sum + row.currentSpendUSD,
    0,
  );

  const durations = completedWithDuration
    .map((row) => {
      if (!row.completedAt) return null;
      return (row.completedAt.getTime() - row.createdAt.getTime()) / 60_000;
    })
    .filter((v): v is number => v != null && v > 0);

  const avgPipelineMinutes =
    durations.length > 0
      ? Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length,
        )
      : null;

  return {
    users,
    leads,
    newLeads,
    analyses,
    newAssessments,
    consultationRequests,
    convertedClients,
    serviceOpportunities,
    paidBlueprints: 0,
    blueprintRevenueUSD: 0,
    activeSubscriptions: 0,
    voiceCalls,
    aiChatSessions,
    analysesByStatus,
    failedAnalyses,
    inFlightAnalyses,
    completedProposals,
    providerSpendUSD,
    providerFailures: failureGroups
      .map((row) => ({
        provider: row.provider,
        count: row._count?.provider ?? 0,
      }))
      .sort((a, b) => b.count - a.count),
    avgPipelineMinutes,
    recentFailed: recentFailed.map((row) => ({
      id: row.id,
      domain: row.domain,
      errorMsg: row.errorMsg,
      createdAt: row.createdAt.toISOString(),
      leadEmail: row.lead?.email ?? "",
    })),
  };
}
