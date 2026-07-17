/**
 * One-off script to verify BullMQ queue wiring.
 * Run while the worker is running: npm run test:enqueue
 */
import { Queue } from "bullmq";
import { getRedis, disconnectRedis } from "./lib/redis.js";
import { ANALYSIS_QUEUE_NAME, type AnalysisJobData } from "./lib/queue.js";

async function main(): Promise<void> {
  const queue = new Queue<AnalysisJobData>(ANALYSIS_QUEUE_NAME, {
    connection: getRedis(),
  });

  const job = await queue.add("analysis", {
    analysisId: "test-phase0-" + Date.now(),
  });

  console.log(`[test] Enqueued job id=${job.id} to queue="${ANALYSIS_QUEUE_NAME}"`);
  await queue.close();
  await disconnectRedis();
}

main().catch((error) => {
  console.error("[test] Enqueue failed:", error);
  process.exit(1);
});
