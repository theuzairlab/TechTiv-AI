/**
 * Verify Phase 1 tables exist and existing data is intact.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../lib/generated/prisma/client";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const [
    leadCount,
    userCount,
    providerCount,
    analysisCount,
    domainCount,
    signalCount,
    proposalCount,
    usageCount,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.user.count(),
    prisma.providerConfig.count(),
    prisma.analysis.count(),
    prisma.analyzedDomain.count(),
    prisma.rawSignal.count(),
    prisma.proposal.count(),
    prisma.toolUsageLog.count(),
  ]);

  const providers = await prisma.providerConfig.findMany({
    select: { provider: true, isEnabled: true, monthlyBudgetUSD: true },
    orderBy: { provider: "asc" },
  });

  console.log("[verify] Existing data:");
  console.log(`  leads: ${leadCount}`);
  console.log(`  users: ${userCount}`);
  console.log("[verify] Pipeline tables:");
  console.log(`  analyzed_domains: ${domainCount}`);
  console.log(`  analyses: ${analysisCount}`);
  console.log(`  raw_signals: ${signalCount}`);
  console.log(`  proposals: ${proposalCount}`);
  console.log(`  tool_usage_logs: ${usageCount}`);
  console.log(`  provider_configs: ${providerCount}`);
  console.log("[verify] Providers:", providers);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error("[verify] Failed:", error);
  process.exit(1);
});
