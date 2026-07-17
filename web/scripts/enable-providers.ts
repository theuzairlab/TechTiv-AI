/**
 * Enable pipeline providers for local/dev live runs.
 * Usage: npx tsx scripts/enable-providers.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const PROVIDERS_TO_ENABLE = [
  { provider: "firecrawl", monthlyBudgetUSD: 50, rateLimitPerMinute: 10 },
  { provider: "pagespeed", monthlyBudgetUSD: 0, rateLimitPerMinute: 60 },
  { provider: "detectzestack", monthlyBudgetUSD: 0, rateLimitPerMinute: 30 },
  { provider: "tavily", monthlyBudgetUSD: 40, rateLimitPerMinute: 30 },
  { provider: "serpapi", monthlyBudgetUSD: 40, rateLimitPerMinute: 30 },
  { provider: "claude", monthlyBudgetUSD: 200, rateLimitPerMinute: 20 },
  { provider: "resend", monthlyBudgetUSD: 20, rateLimitPerMinute: 60 },
] as const;

async function main() {
  const { prisma } = await import("../lib/prisma");

  await prisma.$transaction(
    PROVIDERS_TO_ENABLE.map((row) =>
      prisma.providerConfig.upsert({
        where: { provider: row.provider },
        create: {
          ...row,
          currentSpendUSD: 0,
          isEnabled: true,
        },
        update: {
          monthlyBudgetUSD: row.monthlyBudgetUSD,
          rateLimitPerMinute: row.rateLimitPerMinute,
          isEnabled: true,
        },
      }),
    ),
  );

  const rows = await prisma.providerConfig.findMany({
    orderBy: { provider: "asc" },
    select: { provider: true, isEnabled: true },
  });

  console.log(
    `[enable-providers] Upserted ${PROVIDERS_TO_ENABLE.length} required provider(s)`,
  );
  for (const row of rows) {
    console.log(`  ${row.provider}: ${row.isEnabled ? "enabled" : "disabled"}`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("[enable-providers] Failed:", error);
  process.exit(1);
});
