import { prisma } from "@/lib/prisma";
import { DOMAIN_FRESHNESS_DAYS } from "@/lib/analysis/constants";

export type DomainDedupResult =
  | { type: "proceed" }
  | { type: "in_progress" }
  | {
      type: "cached";
      analysisId: string;
      completedAt: Date;
    };

function freshnessCutoff(): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DOMAIN_FRESHNESS_DAYS);
  return cutoff;
}

export async function checkDomainDedup(
  normalizedDomain: string,
): Promise<DomainDedupResult> {
  const record = await prisma.analyzedDomain.findUnique({
    where: { normalizedDomain },
  });

  if (!record) {
    return { type: "proceed" };
  }

  if (record.status === "PROCESSING") {
    return { type: "in_progress" };
  }

  if (
    record.status === "COMPLETED" &&
    record.completedAt &&
    record.completedAt >= freshnessCutoff() &&
    record.lastAnalysisId
  ) {
    return {
      type: "cached",
      analysisId: record.lastAnalysisId,
      completedAt: record.completedAt,
    };
  }

  return { type: "proceed" };
}
