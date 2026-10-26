import { RESEARCH_STALL_MS } from "@/lib/analysis/constants";
import { prisma } from "@/lib/prisma";

const TERMINAL = new Set(["DONE", "FAILED"]);

export async function analysisHeartbeat(analysisId: string): Promise<{
  stalled: boolean;
  lastActivityAt: string | null;
}> {
  const [analysis, latest] = await Promise.all([
    prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { status: true, createdAt: true },
    }),
    prisma.analysisActivity.findFirst({
      where: { analysisId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (!analysis || TERMINAL.has(analysis.status)) {
    return {
      stalled: false,
      lastActivityAt: latest?.createdAt.toISOString() ?? null,
    };
  }

  const beat = latest?.createdAt ?? analysis.createdAt;
  return {
    stalled: Date.now() - beat.getTime() > RESEARCH_STALL_MS,
    lastActivityAt: beat.toISOString(),
  };
}
