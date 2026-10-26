import { DOMAIN_FRESHNESS_DAYS } from "@/lib/analysis/constants";
import { isPendingGuestEmail } from "@/lib/analysis/guest";
import { arePaymentsEnabled } from "@/lib/billing/settings";
import { gatePipelineStart, type PipelineGate } from "@/lib/billing/gate";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type PublicReportLink = {
  analysisId: string;
  completedAt: string;
  href: string;
};

export type ResearchGateResult = {
  gate: PipelineGate | { status: "allow" };
  paymentsOn: boolean;
  email: string;
  existingPublicReport: PublicReportLink | null;
};

function freshnessCutoff(): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DOMAIN_FRESHNESS_DAYS);
  return cutoff;
}

async function findPublicReport(
  domain: string,
  excludeAnalysisId: string,
): Promise<PublicReportLink | null> {
  const row = await prisma.analysis.findFirst({
    where: {
      id: { not: excludeAnalysisId },
      domain,
      status: "DONE",
      reportPublic: true,
      completedAt: { gte: freshnessCutoff() },
    },
    orderBy: { completedAt: "desc" },
    select: { id: true, completedAt: true },
  });
  if (!row?.completedAt) return null;
  return {
    analysisId: row.id,
    completedAt: row.completedAt.toISOString(),
    href: `/reports/${row.id}`,
  };
}

/** Attach the signed-in email before we decide whether this run is free. */
export async function prepareResearchGate(
  analysisId: string,
): Promise<ResearchGateResult | null> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: {
      id: true,
      domain: true,
      leadId: true,
      lead: { select: { email: true } },
    },
  });
  if (!analysis) return null;

  let email = analysis.lead.email;
  const session = await getSession();
  const accountEmail = session?.user.email?.trim().toLowerCase();

  if (accountEmail && isPendingGuestEmail(email)) {
    email = accountEmail;
    await prisma.lead.update({
      where: { id: analysis.leadId },
      data: { email },
    });
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { emailCapturedAt: new Date() },
    });
  }

  const paymentsOn = await arePaymentsEnabled();
  const existingPublicReport = await findPublicReport(analysis.domain, analysisId);

  if (!paymentsOn) {
    return {
      gate: { status: "allow" },
      paymentsOn,
      email,
      existingPublicReport,
    };
  }

  const gate = await gatePipelineStart({
    email,
    excludeAnalysisId: analysisId,
  });

  return { gate, paymentsOn, email, existingPublicReport };
}
