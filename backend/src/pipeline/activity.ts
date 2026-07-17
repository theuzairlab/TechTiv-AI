import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type ActivityKind = "status" | "search" | "think" | "insight" | "warning";

export async function logAnalysisActivity(input: {
  analysisId: string;
  runId?: string;
  kind: ActivityKind;
  message: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.analysisActivity.create({
    data: {
      analysisId: input.analysisId,
      runId: input.runId,
      kind: input.kind,
      message: input.message,
      metadata: input.metadata,
    },
  });
}
