import { Redis } from "ioredis";
import { env } from "./env.js";

let redis: Redis | undefined;

function resolveRedisConnection(): {
  url: string;
  tls?: Record<string, never>;
} {
  const raw = env.redisUrl().trim();
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

export function getRedis(): Redis {
  if (!redis) {
    const connection = resolveRedisConnection();
    redis = new Redis(connection.url, {
      maxRetriesPerRequest: null,
      tls: connection.tls,
      retryStrategy: (attempt) => Math.min(attempt * 500, 5_000),
    });
    redis.on("error", (error) => {
      console.error(`[redis] Connection error: ${error.message}`);
    });
    redis.on("ready", () => {
      console.log("[redis] TLS connection ready");
    });
  }
  return redis;
}

export async function checkRedisConnection(): Promise<void> {
  const client = getRedis();
  const pong = await client.ping();
  if (pong !== "PONG") {
    throw new Error(`Redis ping failed: expected PONG, got ${pong}`);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = undefined;
  }
}
