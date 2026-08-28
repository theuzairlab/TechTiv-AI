import type { AnalysisStatus, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export async function updateAnalysisStatus(
  analysisId: string,
  status: AnalysisStatus,
): Promise<void> {
  const analysis = await prisma.analysis.update({
    where: { id: analysisId },
    data: { status },
    select: { currentRunId: true },
  });
  if (analysis.currentRunId) {
    await prisma.analysisRun.update({
      where: { id: analysis.currentRunId },
      data: { status },
    });
  }
}

export async function writeRawSignal(
  analysisId: string,
  source: string,
  payload: Prisma.InputJsonValue,
  runId?: string,
): Promise<void> {
  const resolvedRunId =
    runId ??
    (
      await prisma.analysis.findUnique({
        where: { id: analysisId },
        select: { currentRunId: true },
      })
    )?.currentRunId;
  await prisma.rawSignal.create({
    data: {
      analysisId,
      runId: resolvedRunId,
      source,
      payload,
    },
  });
}

export async function markAnalysisDone(
  analysisId: string,
  domain: string,
): Promise<void> {
  const completedAt = new Date();
  const currentRunId = (
    await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { currentRunId: true },
    })
  )?.currentRunId;

  await prisma.$transaction([
    prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "DONE",
        completedAt,
        errorMsg: null,
      },
    }),
    // upsert, not update: a prior FAILED attempt on this same domain deletes
    // the lock row (see markAnalysisFailed below). If a retry then succeeds,
    // the row may not exist yet — a plain update would throw here and
    // discard an otherwise fully-completed report at the very last step.
    prisma.analyzedDomain.upsert({
      where: { normalizedDomain: domain },
      create: {
        normalizedDomain: domain,
        status: "COMPLETED",
        completedAt,
        lastAnalysisId: analysisId,
      },
      update: {
        status: "COMPLETED",
        completedAt,
        lastAnalysisId: analysisId,
      },
    }),
    prisma.analysisRun.updateMany({
      where: { analysisId, id: currentRunId ?? undefined },
      data: { status: "DONE", completedAt, errorMsg: null },
    }),
  ]);
}

export async function markAnalysisFailed(
  analysisId: string,
  domain: string,
  errorMsg: string,
): Promise<void> {
  const currentRunId = (
    await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { currentRunId: true },
    })
  )?.currentRunId;
  await prisma.$transaction([
    prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "FAILED",
        errorMsg,
        completedAt: new Date(),
      },
    }),
    prisma.analyzedDomain.deleteMany({
      where: { normalizedDomain: domain },
    }),
    prisma.analysisRun.updateMany({
      where: { id: currentRunId ?? undefined, analysisId },
      data: {
        status: "FAILED",
        errorMsg,
        completedAt: new Date(),
      },
    }),
  ]);
}
