import { Redis } from "ioredis";
import { env } from "./env.js";

let redis: Redis | undefined;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.redisUrl(), {
      maxRetriesPerRequest: null,
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
