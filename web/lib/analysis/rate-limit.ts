import { prisma } from "@/lib/prisma";
import {
  FREE_ANALYSIS_LIMIT,
  FREE_ANALYSIS_WINDOW_DAYS,
} from "@/lib/analysis/constants";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: Date };

function windowStart(): Date {
  const since = new Date();
  since.setDate(since.getDate() - FREE_ANALYSIS_WINDOW_DAYS);
  return since;
}

/** Paying clients bypass the free-tier analysis limit. */
export async function isPayingClient(email: string): Promise<boolean> {
  const lead = await prisma.lead.findFirst({
    where: {
      email: email.toLowerCase(),
      status: { in: ["WON", "PROPOSAL_SENT"] },
    },
    select: { id: true },
  });

  return Boolean(lead);
}

export async function checkGuestRateLimit(
  guestAccessToken: string,
): Promise<RateLimitResult> {
  const since = windowStart();

  const recentAnalyses = await prisma.analysis.findMany({
    where: {
      guestAccessToken,
      createdAt: { gte: since },
      status: { not: "FAILED" },
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  if (recentAnalyses.length < FREE_ANALYSIS_LIMIT) {
    return { allowed: true };
  }

  const oldest = recentAnalyses[0]?.createdAt;
  const retryAfter = new Date(oldest ?? since);
  retryAfter.setDate(retryAfter.getDate() + FREE_ANALYSIS_WINDOW_DAYS);

  return { allowed: false, retryAfter };
}

export async function checkRateLimit(email: string): Promise<RateLimitResult> {
  const normalizedEmail = email.toLowerCase();

  if (await isPayingClient(normalizedEmail)) {
    return { allowed: true };
  }

  const since = windowStart();

  const recentAnalyses = await prisma.analysis.findMany({
    where: {
      lead: { email: normalizedEmail },
      createdAt: { gte: since },
      status: { not: "FAILED" },
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  if (recentAnalyses.length < FREE_ANALYSIS_LIMIT) {
    return { allowed: true };
  }

  const oldest = recentAnalyses[0]?.createdAt;
  const retryAfter = new Date(oldest ?? since);
  retryAfter.setDate(retryAfter.getDate() + FREE_ANALYSIS_WINDOW_DAYS);

  return { allowed: false, retryAfter };
}
