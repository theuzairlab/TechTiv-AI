import { prisma } from "../lib/prisma.js";

export async function ensureCurrentRun(analysisId: string): Promise<string> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: {
      currentRunId: true,
      runs: {
        orderBy: { attempt: "desc" },
        take: 1,
        select: { id: true, attempt: true, status: true },
      },
    },
  });

  if (!analysis) throw new Error(`Analysis not found: ${analysisId}`);

  const latest = analysis.runs[0];
  if (
    analysis.currentRunId &&
    latest?.id === analysis.currentRunId &&
    !["DONE", "FAILED"].includes(latest.status)
  ) {
    return latest.id;
  }

  const run = await prisma.analysisRun.create({
    data: {
      analysisId,
      attempt: (latest?.attempt ?? 0) + 1,
      status: "QUEUED",
    },
    select: { id: true },
  });

  await prisma.analysis.update({
    where: { id: analysisId },
    data: { currentRunId: run.id },
  });

  return run.id;
}
