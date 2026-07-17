/**
 * Enable pipeline providers for local/dev live runs.
 * Usage: npx tsx scripts/enable-providers.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const PROVIDERS_TO_ENABLE = [
  "firecrawl",
  "pagespeed",
  "detectzestack",
  "tavily",
  "serpapi",
  "claude",
  "resend",
] as const;

async function main() {
  const { prisma } = await import("../lib/prisma");

  const result = await prisma.providerConfig.updateMany({
    where: { provider: { in: [...PROVIDERS_TO_ENABLE] } },
    data: { isEnabled: true },
  });

  const rows = await prisma.providerConfig.findMany({
    orderBy: { provider: "asc" },
    select: { provider: true, isEnabled: true },
  });

  console.log(`[enable-providers] Updated ${result.count} row(s)`);
  for (const row of rows) {
    console.log(`  ${row.provider}: ${row.isEnabled ? "enabled" : "disabled"}`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("[enable-providers] Failed:", error);
  process.exit(1);
});
