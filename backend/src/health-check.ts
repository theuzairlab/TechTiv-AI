import { checkDatabaseConnection, disconnectDatabase } from "./lib/prisma.js";
import { checkRedisConnection, disconnectRedis } from "./lib/redis.js";

async function main(): Promise<void> {
  console.log("[health] Checking Redis...");
  await checkRedisConnection();
  console.log("[health] Redis: PONG");

  console.log("[health] Checking database...");
  await checkDatabaseConnection();
  console.log("[health] Database: OK");

  console.log("[health] All checks passed");
}

main()
  .catch((error) => {
    console.error("[health] Check failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectRedis();
    await disconnectDatabase();
  });
