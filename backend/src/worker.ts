import { Worker, type Job } from "bullmq";
import { runPipeline } from "./pipeline/index.js";
import { runConsultationTurn } from "./consultation/run.js";
import { getRedis } from "./lib/redis.js";
import {
  ANALYSIS_QUEUE_NAME,
  type AnalysisJobData,
  type AnalysisJobResult,
} from "./lib/queue.js";

async function processAnalysisJob(
  job: Job<AnalysisJobData, AnalysisJobResult>,
): Promise<AnalysisJobResult> {
  const { analysisId } = job.data;
  const kind = job.data.kind ?? "analysis";

  console.log(
    `[worker] Received ${kind} job ${job.id} for analysisId=${analysisId}`,
  );

  if (kind === "consultation") {
    await runConsultationTurn(analysisId);
  } else {
    await runPipeline(analysisId);
  }

  return { analysisId, status: "completed" };
}

export function createAnalysisWorker(): Worker<AnalysisJobData, AnalysisJobResult> {
  const worker = new Worker<AnalysisJobData, AnalysisJobResult>(
    ANALYSIS_QUEUE_NAME,
    processAnalysisJob,
    {
      connection: getRedis() as never,
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[worker] Job ${job?.id ?? "unknown"} failed:`, error);
  });

  worker.on("error", (error) => {
    console.error("[worker] Worker error:", error);
  });

  return worker;
}
