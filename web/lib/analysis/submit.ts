import { prisma } from "@/lib/prisma";
import { checkDomainDedup } from "@/lib/analysis/dedup";
import { enqueueAnalysis } from "@/lib/analysis/queue";
import {
  InvalidDomainError,
} from "@/lib/analysis/normalize-domain";
import { checkRateLimit, checkGuestRateLimit } from "@/lib/analysis/rate-limit";
import type { CreateAnalysisInput } from "@/lib/analysis/schema";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  buildBusinessIntake,
  mergeSocialLinks,
  resolveAnalysisDomain,
} from "@/lib/analysis/intake";
import {
  createGuestSession,
  serializeBusinessIntake,
} from "@/lib/analysis/capture-email";
import { writeAnalysisActivity } from "@/lib/analysis/activities";
import {
  createPendingGuestEmail,
  isPendingGuestEmail,
} from "@/lib/analysis/guest";
import { ensureCompanyForContact } from "@/lib/companies";

export type AnalysisSubmissionResult =
  | {
      status: "queued";
      analysisId: string;
      jobId: string;
      guestAccessToken: string;
      message: string;
    }
  | {
      status: "in_progress";
      message: string;
      notifyRegistered?: boolean;
    }
  | {
      status: "cached";
      analysisId: string;
      completedAt: string;
      message: string;
    }
  | {
      status: "rate_limited";
      retryAfter: string;
      message: string;
    };

function toJsonValue(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (!value) return undefined;
  return value as Prisma.InputJsonValue;
}

function cleanSocialLinks(
  socialLinks: ReturnType<typeof mergeSocialLinks>,
): Prisma.InputJsonValue | undefined {
  if (!socialLinks) return undefined;

  const cleaned = Object.fromEntries(
    Object.entries(socialLinks).filter(([, value]) => Boolean(value)),
  );

  return Object.keys(cleaned).length > 0
    ? (cleaned as Prisma.InputJsonValue)
    : undefined;
}

async function registerInProgressNotify(
  input: CreateAnalysisInput,
  normalizedDomain: string,
  userId: string | null,
  email: string,
): Promise<void> {
  const existing = await prisma.lead.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  const metadata = {
    notifyForDomain: normalizedDomain,
    notifyRequestedAt: new Date().toISOString(),
  };

  if (existing) {
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        metadata: {
          ...((existing.metadata as Record<string, unknown> | null) ?? {}),
          ...metadata,
        } as Prisma.InputJsonValue,
      },
    });
    return;
  }

  await prisma.lead.create({
    data: {
      name: input.name?.trim() || "Discovery visitor",
      email,
      company: input.company?.trim() || null,
      source: "discovery",
      userId,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

function analysisDomainOrNull(input: CreateAnalysisInput) {
  try {
    return resolveAnalysisDomain(input);
  } catch {
    return null;
  }
}

async function findOrCreateLead(
  input: CreateAnalysisInput,
  userId: string | null,
  guestAccessToken: string,
) {
  const resolvedEmail = input.email?.trim()
    ? input.email.trim().toLowerCase()
    : createPendingGuestEmail(guestAccessToken);

  const existing = await prisma.lead.findFirst({
    where: { email: resolvedEmail },
    orderBy: { createdAt: "desc" },
  });

  const discoveryAnswers = toJsonValue(input.discoveryAnswers);
  const socialMetadata = cleanSocialLinks(mergeSocialLinks(input));
  const businessIntake = buildBusinessIntake(input);

  if (existing) {
    const companyId =
      existing.companyId ??
      (await ensureCompanyForContact({
        email: resolvedEmail,
        companyName:
          businessIntake.companyName?.trim() ||
          input.company?.trim() ||
          existing.company,
        personName: input.name?.trim() || existing.name,
        domain: analysisDomainOrNull(input),
        userId: userId ?? existing.userId,
      }));

    return prisma.lead.update({
      where: { id: existing.id },
      data: {
        name: input.name?.trim() || existing.name,
        company:
          businessIntake.companyName?.trim() ||
          input.company?.trim() ||
          existing.company,
        source: "discovery",
        userId: userId ?? existing.userId,
        companyId,
        discoveryAnswers: discoveryAnswers ?? existing.discoveryAnswers ?? undefined,
        metadata: {
          ...((existing.metadata as Record<string, unknown> | null) ?? {}),
          ...(socialMetadata ? { socialLinks: socialMetadata } : {}),
          businessIntake,
        } as Prisma.InputJsonValue,
      },
    });
  }

  const companyId = await ensureCompanyForContact({
    email: resolvedEmail,
    companyName: businessIntake.companyName?.trim() || input.company?.trim(),
    personName: input.name?.trim(),
        domain: analysisDomainOrNull(input),
    userId,
  });

  return prisma.lead.create({
    data: {
      name: input.name?.trim() || businessIntake.companyName?.trim() || "Discovery visitor",
      email: resolvedEmail,
      company: businessIntake.companyName?.trim() || input.company?.trim() || null,
      source: "discovery",
      userId,
      companyId,
      discoveryAnswers,
      metadata: {
        ...(socialMetadata ? { socialLinks: socialMetadata } : {}),
        businessIntake,
      } as Prisma.InputJsonValue,
    },
  });
}

export async function submitAnalysis(
  input: CreateAnalysisInput,
  options?: { userId?: string | null },
): Promise<AnalysisSubmissionResult> {
  const normalizedDomain = resolveAnalysisDomain(input);
  const userId = options?.userId ?? null;
  const guestAccessToken = input.guestAccessToken ?? createGuestSession().guestAccessToken;
  const businessIntake = buildBusinessIntake(input);
  const socialLinks = cleanSocialLinks(mergeSocialLinks(input));

  const dedup = await checkDomainDedup(normalizedDomain);
  if (dedup.type === "in_progress") {
    if (input.notifyIfInProgress && input.email?.trim()) {
      await registerInProgressNotify(
        input,
        normalizedDomain,
        userId,
        input.email.trim().toLowerCase(),
      );
    }

    return {
      status: "in_progress",
      message:
        "This business is currently being analyzed. Leave your email and we'll notify you when it's ready.",
      notifyRegistered: Boolean(input.notifyIfInProgress && input.email?.trim()),
    };
  }

  if (dedup.type === "cached") {
    return {
      status: "cached",
      analysisId: dedup.analysisId,
      completedAt: dedup.completedAt.toISOString(),
      message:
        "We recently analyzed this business. You can view the existing report or request a fresh analysis later.",
    };
  }

  if (input.email?.trim()) {
    const rateLimit = await checkRateLimit(input.email);
    if (!rateLimit.allowed) {
      return {
        status: "rate_limited",
        retryAfter: rateLimit.retryAfter.toISOString(),
        message: `Free analysis limit reached. You can request another analysis after ${rateLimit.retryAfter.toISOString()}.`,
      };
    }
  } else {
    const rateLimit = await checkGuestRateLimit(guestAccessToken);
    if (!rateLimit.allowed) {
      return {
        status: "rate_limited",
        retryAfter: rateLimit.retryAfter.toISOString(),
        message: `Free analysis limit reached. Try again after ${rateLimit.retryAfter.toISOString()}.`,
      };
    }
  }

  const lead = await findOrCreateLead(input, userId, guestAccessToken);
  const emailCapturedAt = input.email?.trim() ? new Date() : null;

  const analysis = await prisma.$transaction(async (tx) => {
    const created = await tx.analysis.create({
      data: {
        leadId: lead.id,
        domain: normalizedDomain,
        socialLinks,
        businessIntake: serializeBusinessIntake(businessIntake),
        guestAccessToken,
        emailCapturedAt,
        status: "QUEUED",
      },
    });

    await tx.analyzedDomain.upsert({
      where: { normalizedDomain },
      create: {
        normalizedDomain,
        status: "PROCESSING",
        lastAnalysisId: created.id,
      },
      update: {
        status: "PROCESSING",
        lastAnalysisId: created.id,
        completedAt: null,
      },
    });

    return created;
  });

  await writeAnalysisActivity({
    analysisId: analysis.id,
    kind: "status",
    message: "Intelligence session initialized — preparing deep business discovery.",
    metadata: {
      company: businessIntake.companyName ?? null,
      domain: normalizedDomain,
    },
  });

  const jobId = await enqueueAnalysis(analysis.id);

  return {
    status: "queued",
    analysisId: analysis.id,
    jobId,
    guestAccessToken,
    message: input.email?.trim()
      ? "Analysis queued. We'll email you when your blueprint is ready."
      : "Analysis started. Add your email during processing to receive the full report.",
  };
}

export function mapSubmissionError(error: unknown): {
  status: number;
  body: { error: string; details?: string };
} {
  if (error instanceof InvalidDomainError) {
    return {
      status: 400,
      body: { error: "Validation failed", details: error.message },
    };
  }

  return {
    status: 500,
    body: { error: "Failed to start analysis" },
  };
}

export { isPendingGuestEmail };
