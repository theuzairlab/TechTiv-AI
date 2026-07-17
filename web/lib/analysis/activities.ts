import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type AnalysisActivityKind =
  | "status"
  | "search"
  | "think"
  | "insight"
  | "warning";

export type AnalysisActivityItem = {
  id: string;
  kind: AnalysisActivityKind;
  message: string;
  metadata: unknown;
  createdAt: string;
};

export async function listAnalysisActivities(
  analysisId: string,
  options?: { after?: string; limit?: number },
): Promise<AnalysisActivityItem[]> {
  const limit = options?.limit ?? 80;

  const rows = await prisma.analysisActivity.findMany({
    where: {
      analysisId,
      ...(options?.after
        ? { id: { gt: options.after } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as AnalysisActivityKind,
    message: row.message,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function writeAnalysisActivity(input: {
  analysisId: string;
  kind: AnalysisActivityKind;
  message: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.analysisActivity.create({
    data: {
      analysisId: input.analysisId,
      kind: input.kind,
      message: input.message,
      metadata: input.metadata,
    },
  });
}
