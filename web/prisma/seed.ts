import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../lib/generated/prisma/client";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const PROVIDERS = [
  { provider: "firecrawl", monthlyBudgetUSD: 50, rateLimitPerMinute: 10 },
  { provider: "pagespeed", monthlyBudgetUSD: 0, rateLimitPerMinute: 60 },
  { provider: "detectzestack", monthlyBudgetUSD: 0, rateLimitPerMinute: 30 },
  { provider: "tavily", monthlyBudgetUSD: 40, rateLimitPerMinute: 30 },
  { provider: "serpapi", monthlyBudgetUSD: 40, rateLimitPerMinute: 30 },
  { provider: "claude", monthlyBudgetUSD: 200, rateLimitPerMinute: 20 },
  { provider: "resend", monthlyBudgetUSD: 20, rateLimitPerMinute: 60 },
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  for (const row of PROVIDERS) {
    await prisma.providerConfig.upsert({
      where: { provider: row.provider },
      create: {
        provider: row.provider,
        monthlyBudgetUSD: row.monthlyBudgetUSD,
        rateLimitPerMinute: row.rateLimitPerMinute,
        isEnabled: false,
        currentSpendUSD: 0,
      },
      update: {
        monthlyBudgetUSD: row.monthlyBudgetUSD,
        rateLimitPerMinute: row.rateLimitPerMinute,
      },
    });
  }

  await prisma.providerConfig.deleteMany({ where: { provider: "wappalyzer" } });

  const count = await prisma.providerConfig.count();
  console.log(`[seed] ProviderConfig rows: ${count}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
