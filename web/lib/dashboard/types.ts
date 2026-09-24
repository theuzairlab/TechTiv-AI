import type {
  AnalysisStatus,
  ImplementationStatus,
  LeadStatus,
  ProposalStatus,
} from "@/lib/generated/prisma/client";
import type { ReportV2 } from "@/lib/report-v2/types";

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
  aiScore: number | null;
  opportunityCount: number;
  automationCount: number;
  serviceCount: number;
  topFinding: string | null;
  topOpportunity: string | null;
  coverageStatus: ReportV2["coverage"]["status"] | null;
  pdfUnlocked: boolean;
};

export type ConsultationHistoryMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export type ServiceRequestItem = {
  id: string;
  status: LeadStatus;
  implementationStatus: ImplementationStatus | null;
  assignedAdminName: string | null;
  createdAt: string;
  company: string | null;
  message: string | null;
  service: string | null;
  problem: string | null;
  techStack: string[];
  estimatedScope: string | null;
  estimatedTimelineWeeks: number | null;
  analysisId: string | null;
  analysisDomain: string | null;
};

export type DashboardHighlight = {
  analysisId: string;
  domain: string;
  aiScore: number | null;
  coverageStatus: ReportV2["coverage"]["status"] | null;
  opportunityCount: number;
  automationCount: number;
  serviceCount: number;
  topOpportunity: string | null;
  completedAt: string | null;
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
  consultation: ConsultationHistoryMessage[];
  /** Phase 2 will flip this after Stripe entitlement. Until then, owners can download. */
  pdfUnlocked: boolean;
};

export function averageScorecardScore(
  scorecard: Array<{ score: number }> | undefined | null,
): number | null {
  if (!scorecard?.length) return null;
  const total = scorecard.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / scorecard.length);
}
