import { verifyGuestAccess } from "@/lib/analysis/guest";
import { prisma } from "@/lib/prisma";

export type AnalysisPreview = {
  analysisId: string;
  domain: string;
  status: string;
  companyName: string | null;
  emailCaptured: boolean;
  teaser: {
    businessSummary: string | null;
    painPoints: string[];
    automationHighlights: Array<{ area: string; description: string }>;
    costEstimateUSD: number | null;
    timelineWeeks: number | null;
  };
};

export async function getAnalysisPreview(
  analysisId: string,
  guestAccessToken?: string | null,
): Promise<AnalysisPreview | null> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      proposal: true,
      lead: { select: { email: true } },
    },
  });

  if (!analysis) return null;

  if (
    analysis.guestAccessToken &&
    !verifyGuestAccess(analysis.guestAccessToken, guestAccessToken ?? null)
  ) {
    return null;
  }

  const intake =
    analysis.businessIntake &&
    typeof analysis.businessIntake === "object" &&
    !Array.isArray(analysis.businessIntake)
      ? (analysis.businessIntake as { companyName?: string })
      : {};

  const strategy =
    analysis.proposal?.strategyJson &&
    typeof analysis.proposal.strategyJson === "object" &&
    !Array.isArray(analysis.proposal.strategyJson)
      ? (analysis.proposal.strategyJson as {
          businessSummary?: string;
          painPoints?: string[];
          automationOpportunities?: Array<{
            area: string;
            description: string;
          }>;
        })
      : {};

  const automations = (strategy.automationOpportunities ?? []).slice(0, 2);

  return {
    analysisId: analysis.id,
    domain: analysis.domain,
    status: analysis.status,
    companyName: intake.companyName ?? null,
    emailCaptured: Boolean(analysis.emailCapturedAt),
    teaser: {
      businessSummary: strategy.businessSummary?.slice(0, 280) ?? null,
      painPoints: (strategy.painPoints ?? []).slice(0, 3),
      automationHighlights: automations,
      costEstimateUSD: analysis.proposal?.costEstimateUSD ?? null,
      timelineWeeks: analysis.proposal?.timelineWeeks ?? null,
    },
  };
}
