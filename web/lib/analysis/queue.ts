import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { ANALYSIS_QUEUE_NAME } from "@/lib/analysis/constants";

export type AnalysisJobData = {
  analysisId: string;
  kind?: "analysis" | "consultation";
};

const globalForQueue = globalThis as unknown as {
  redis: Redis | undefined;
  analysisQueue: Queue<AnalysisJobData> | undefined;
};

function resolveRedisConnection(): {
  url: string;
  tls?: Record<string, never>;
} {
  const raw = (process.env.REDIS_URL ?? "redis://localhost:6379").trim();
  if (raw.startsWith("redis-cli")) {
    throw new Error(
      "REDIS_URL must contain only the Redis URL, not the redis-cli command",
    );
  }

  const url = new URL(raw);
  const isUpstash = url.hostname.endsWith(".upstash.io");
  if (isUpstash && url.protocol === "redis:") {
    url.protocol = "rediss:";
  }

  return {
    url: url.toString(),
    tls: isUpstash ? {} : undefined,
  };
}

function getRedisConnection(): Redis {
  if (!globalForQueue.redis) {
    const connection = resolveRedisConnection();
    globalForQueue.redis = new Redis(connection.url, {
      maxRetriesPerRequest: 2,
      tls: connection.tls,
      retryStrategy: (attempt) => Math.min(attempt * 250, 2_000),
    });
    globalForQueue.redis.on("error", (error) => {
      console.error(`[queue] Redis connection error: ${error.message}`);
    });
  }
  return globalForQueue.redis;
}

export function getAnalysisQueue(): Queue<AnalysisJobData> {
  if (!globalForQueue.analysisQueue) {
    globalForQueue.analysisQueue = new Queue(ANALYSIS_QUEUE_NAME, {
      connection: getRedisConnection() as never,
    }) as unknown as Queue<AnalysisJobData>;
  }
  return globalForQueue.analysisQueue;
}

async function wakeWorker(): Promise<void> {
  const configuredUrl = process.env.WORKER_WAKE_URL?.trim();
  if (!configuredUrl) return;

  const endpoint = configuredUrl.endsWith("/wake")
    ? configuredUrl
    : `${configuredUrl.replace(/\/$/, "")}/wake`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2_500);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: process.env.WORKER_WAKE_SECRET?.trim()
        ? {
            authorization: `Bearer ${process.env.WORKER_WAKE_SECRET.trim()}`,
          }
        : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(`[queue] Worker wake returned HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn(
      "[queue] Worker wake did not acknowledge before timeout; the queued job remains safe.",
      error instanceof Error ? error.message : error,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function enqueueAnalysis(analysisId: string): Promise<string> {
  const job = await getAnalysisQueue().add("analysis", {
    kind: "analysis",
    analysisId,
  });
  if (!job.id) {
    throw new Error("Failed to enqueue analysis job");
  }
  await wakeWorker();
  return String(job.id);
}

export async function enqueueConsultation(
  analysisId: string,
): Promise<string> {
  const job = await getAnalysisQueue().add("consultation", {
    kind: "consultation",
    analysisId,
  });
  if (!job.id) throw new Error("Failed to enqueue consultation");
  await wakeWorker();
  return String(job.id);
}
