import { prisma } from "@/lib/prisma";
import { enqueueAnalysis } from "@/lib/analysis/queue";
import { writeAnalysisActivity } from "@/lib/analysis/activities";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { logAdminEvent } from "@/lib/admin/event-log";

export async function retryFailedAnalysisCore(
  analysisId: string,
): Promise<{ jobId: string; domain: string }> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: { id: true, domain: true, status: true },
  });

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (analysis.status !== "FAILED") {
    throw new Error("Only failed analyses can be retried");
  }

  const jobId = await prisma.$transaction(async (tx) => {
    await tx.analysis.update({
      where: { id: analysisId },
      data: {
        status: "QUEUED",
        errorMsg: null,
        completedAt: null,
      },
    });

    await tx.analyzedDomain.upsert({
      where: { normalizedDomain: analysis.domain },
      create: {
        normalizedDomain: analysis.domain,
        status: "PROCESSING",
        lastAnalysisId: analysisId,
      },
      update: {
        status: "PROCESSING",
        lastAnalysisId: analysisId,
        completedAt: null,
      },
    });

    return enqueueAnalysis(analysisId);
  });

  await writeAnalysisActivity({
    analysisId,
    kind: "status",
    message: "Retry requested — re-queuing intelligence session.",
    metadata: { jobId },
  });

  return { jobId, domain: analysis.domain };
}

export async function retryFailedAnalysis(
  analysisId: string,
  adminUserId: string,
): Promise<{ jobId: string }> {
  const result = await retryFailedAnalysisCore(analysisId);

  await logAdminEvent({
    adminUserId,
    action: "analysis.retry",
    targetType: "analysis",
    targetId: analysisId,
    metadata: { domain: result.domain, jobId: result.jobId },
  });

  return { jobId: result.jobId };
}

export async function retryFailedAnalysisAsGuest(
  analysisId: string,
  guestAccessToken: string,
): Promise<{ jobId: string }> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: { guestAccessToken: true, status: true },
  });

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (!verifyGuestAccess(analysis.guestAccessToken, guestAccessToken)) {
    throw new Error("Invalid guest access token");
  }

  const result = await retryFailedAnalysisCore(analysisId);
  return { jobId: result.jobId };
}
