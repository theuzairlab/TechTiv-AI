import { prisma } from "../lib/prisma.js";
import { notifyAnalysisReadyAndLog } from "../notify/analysis-ready.js";
import { loadPipelineContext, logStepStart } from "./context.js";
import { logAnalysisActivity } from "./activity.js";
import { ensureCurrentRun } from "./run.js";
import { runAuditStep } from "./steps/audit.js";
import { runCompetitorsStep } from "./steps/competitors.js";
import { runCrawlStep } from "./steps/crawl.js";
import { runDiscoverStep } from "./steps/discover.js";
import { runNarrativeStep } from "./steps/narrative.js";
import { runPdfStep } from "./steps/pdf.js";
import { runPricingStep } from "./steps/price.js";
import { runSocialStep } from "./steps/social.js";
import { runSynthesizeStep } from "./steps/synthesize.js";
import type { PipelineContext } from "./types.js";
import {
  markAnalysisDone,
  markAnalysisFailed,
  updateAnalysisStatus,
  writeRawSignal,
} from "./update-status.js";

async function writeNotifyFailureSignal(
  ctx: PipelineContext,
  error: string,
): Promise<void> {
  await writeRawSignal(ctx.analysisId, "notify", {
    domain: ctx.domain,
    status: "failed",
    error,
  });
  await logAnalysisActivity({
    analysisId: ctx.analysisId,
    runId: ctx.runId,
    kind: "warning",
    message:
      "The report is ready, but email delivery failed. The report remains available here.",
    metadata: { step: "notify", error: error.slice(0, 300) },
  });
}

type NamedStep = {
  name: string;
  run: (ctx: PipelineContext) => Promise<void>;
};

const PIPELINE_STEPS: NamedStep[] = [
  { name: "crawl", run: runCrawlStep },
  { name: "discover", run: runDiscoverStep },
  { name: "social", run: runSocialStep },
  { name: "audit", run: runAuditStep },
  { name: "competitors", run: runCompetitorsStep },
  { name: "synthesize", run: runSynthesizeStep },
  { name: "pricing", run: runPricingStep },
  { name: "narrative", run: runNarrativeStep },
  { name: "pdf", run: runPdfStep },
];

function formatError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);

  const parts = [error.message];
  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof Error) {
    parts.push(`cause: ${cause.message}`);
  }
  return parts.join(" | ");
}

export async function runPipeline(analysisId: string): Promise<void> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: { id: true, domain: true, status: true },
  });

  if (!analysis) {
    throw new Error(`Analysis not found: ${analysisId}`);
  }

  if (analysis.status === "DONE") {
    console.log(`[pipeline] Analysis ${analysisId} already DONE — skipping`);
    return;
  }

  await ensureCurrentRun(analysisId);
  const ctx = await loadPipelineContext(analysisId);

  console.log(`[pipeline] Starting analysis ${analysisId} for ${ctx.domain}`);

  try {
    await updateAnalysisStatus(analysisId, "QUEUED");
    await logStepStart(
      ctx,
      "queued",
      "Queued — assembling intelligence profile from your business inputs.",
    );

    for (const step of PIPELINE_STEPS) {
      console.log(`[pipeline] → ${step.name}`);
      try {
        await step.run(ctx);
        console.log(`[pipeline] ✓ ${step.name}`);
      } catch (stepError) {
        const detail = formatError(stepError);
        throw new Error(`Step "${step.name}" failed: ${detail}`, {
          cause: stepError,
        });
      }
    }

    try {
      await notifyAnalysisReadyAndLog(ctx);
    } catch (notifyError) {
      const notifyMessage = formatError(notifyError);
      console.error(
        `[pipeline] Analysis ${analysisId} notify failed (non-fatal):`,
        notifyMessage,
      );
      await writeNotifyFailureSignal(ctx, notifyMessage);
    }

    await markAnalysisDone(analysisId, ctx.domain);

    console.log(`[pipeline] Analysis ${analysisId} completed`);
  } catch (error) {
    const message = formatError(error);

    console.error(`[pipeline] Analysis ${analysisId} failed:`, message);
    try {
      await logAnalysisActivity({
        analysisId,
        runId: ctx.runId,
        kind: "warning",
        message: `Session interrupted: ${message.slice(0, 180)}`,
        metadata: { error: message.slice(0, 400) },
      });
    } catch {
      // ignore activity write failures during crash path
    }
    await markAnalysisFailed(analysisId, ctx.domain, message);
    throw error;
  }
}
