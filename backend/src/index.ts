import { checkDatabaseConnection, disconnectDatabase } from "./lib/prisma.js";
import { checkRedisConnection, disconnectRedis } from "./lib/redis.js";
import { createAnalysisWorker } from "./worker.js";
import {
  startHealthServer,
  type WorkerHealthState,
} from "./health-server.js";

const healthState: WorkerHealthState = {
  status: "starting",
  startedAt: new Date().toISOString(),
};
const healthServer = startHealthServer(healthState);

async function runHealthChecks(): Promise<void> {
  console.log("[worker] Running startup health checks...");
  await checkRedisConnection();
  console.log("[worker] Redis: OK");
  await checkDatabaseConnection();
  console.log("[worker] Database: OK");
}

async function main(): Promise<void> {
  await runHealthChecks();

  const worker = createAnalysisWorker();
  healthState.status = "ready";
  console.log("[worker] BullMQ consumer started — waiting for jobs");

  const shutdown = async (signal: string) => {
    console.log(`[worker] Received ${signal}, shutting down...`);
    await worker.close();
    await disconnectRedis();
    await disconnectDatabase();
    await new Promise<void>((resolve) => healthServer.close(() => resolve()));
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  healthState.status = "error";
  healthState.error =
    error instanceof Error ? error.message : "Unknown worker startup error";
  console.error("[worker] Fatal startup error:", error);
  setTimeout(() => process.exit(1), 500);
});
