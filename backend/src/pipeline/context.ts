import { prisma } from "../lib/prisma.js";
import type { PipelineContext } from "./types.js";
import { logAnalysisActivity } from "./activity.js";

export async function loadPipelineContext(
  analysisId: string,
): Promise<PipelineContext> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: {
      id: true,
      currentRunId: true,
      domain: true,
      businessIntake: true,
      socialLinks: true,
    },
  });

  if (!analysis) {
    throw new Error(`Analysis not found: ${analysisId}`);
  }
  if (!analysis.currentRunId) {
    throw new Error(`Analysis run not initialized: ${analysisId}`);
  }

  return {
    analysisId: analysis.id,
    runId: analysis.currentRunId,
    domain: analysis.domain,
    businessIntake: analysis.businessIntake,
    socialLinks: analysis.socialLinks,
  };
}

export async function logStepStart(
  ctx: PipelineContext,
  step: string,
  message: string,
): Promise<void> {
  await logAnalysisActivity({
    analysisId: ctx.analysisId,
    runId: ctx.runId,
    kind: "status",
    message,
    metadata: { step },
  });
}

export async function logSearch(
  ctx: PipelineContext,
  query: string,
  source: string,
): Promise<void> {
  await logAnalysisActivity({
    analysisId: ctx.analysisId,
    runId: ctx.runId,
    kind: "search",
    message: `Searching ${source}: “${query}”`,
    metadata: { query, source },
  });
}

export async function logThink(
  ctx: PipelineContext,
  message: string,
): Promise<void> {
  await logAnalysisActivity({
    analysisId: ctx.analysisId,
    runId: ctx.runId,
    kind: "think",
    message,
  });
}

export async function logInsight(
  ctx: PipelineContext,
  message: string,
): Promise<void> {
  await logAnalysisActivity({
    analysisId: ctx.analysisId,
    runId: ctx.runId,
    kind: "insight",
    message,
  });
}
