import type { PrismaClient } from "@/lib/generated/prisma/client";
import {
  ProviderBudgetExceededError,
  ProviderDisabledError,
  ProviderNotConfiguredError,
} from "@/lib/providers/errors";
import type {
  CallProviderOptions,
  ProviderConfigSnapshot,
  ToolUsageStatus,
} from "@/lib/providers/types";

export function isBudgetExceeded(config: ProviderConfigSnapshot): boolean {
  if (config.monthlyBudgetUSD <= 0) {
    return false;
  }

  return config.currentSpendUSD >= config.monthlyBudgetUSD;
}

async function logToolUsage(
  db: PrismaClient,
  input: {
    analysisId: string;
    provider: string;
    endpoint: string;
    creditsOrTokens: number;
    costEstimateUSD: number;
    latencyMs: number;
    status: ToolUsageStatus;
  },
): Promise<void> {
  await db.toolUsageLog.create({
    data: {
      analysisId: input.analysisId,
      provider: input.provider,
      endpoint: input.endpoint,
      creditsOrTokens: input.creditsOrTokens,
      costEstimateUSD: input.costEstimateUSD,
      latencyMs: input.latencyMs,
      status: input.status,
    },
  });
}

async function logSkippedCall(
  db: PrismaClient,
  opts: CallProviderOptions<unknown>,
  status: ToolUsageStatus,
): Promise<void> {
  await logToolUsage(db, {
    analysisId: opts.analysisId,
    provider: opts.provider,
    endpoint: opts.endpoint,
    creditsOrTokens: opts.creditsOrTokens ?? 0,
    costEstimateUSD: opts.costEstimateUSD ?? 0,
    latencyMs: 0,
    status,
  });
}

async function loadProviderConfig(
  db: PrismaClient,
  provider: string,
): Promise<ProviderConfigSnapshot> {
  const config = await db.providerConfig.findUnique({
    where: { provider },
    select: {
      provider: true,
      monthlyBudgetUSD: true,
      currentSpendUSD: true,
      isEnabled: true,
    },
  });

  if (!config) {
    throw new ProviderNotConfiguredError(provider);
  }

  return config;
}

export async function callProviderWithClient<T>(
  db: PrismaClient,
  opts: CallProviderOptions<T>,
): Promise<T> {
  const config = await loadProviderConfig(db, opts.provider);
  const costEstimateUSD = opts.costEstimateUSD ?? 0;
  const creditsOrTokens = opts.creditsOrTokens ?? 0;

  if (!config.isEnabled) {
    await logSkippedCall(db, opts, "skipped_budget");
    throw new ProviderDisabledError(opts.provider);
  }

  if (isBudgetExceeded(config)) {
    await logSkippedCall(db, opts, "skipped_budget");
    throw new ProviderBudgetExceededError(
      opts.provider,
      config.monthlyBudgetUSD,
      config.currentSpendUSD,
    );
  }

  const startedAt = Date.now();

  try {
    const result = await opts.fn();
    const latencyMs = Date.now() - startedAt;

    await logToolUsage(db, {
      analysisId: opts.analysisId,
      provider: opts.provider,
      endpoint: opts.endpoint,
      creditsOrTokens,
      costEstimateUSD,
      latencyMs,
      status: "success",
    });

    if (costEstimateUSD > 0) {
      await db.providerConfig.update({
        where: { provider: opts.provider },
        data: {
          currentSpendUSD: {
            increment: Math.ceil(costEstimateUSD),
          },
        },
      });
    }

    return result;
  } catch (error) {
    const latencyMs = Date.now() - startedAt;

    await logToolUsage(db, {
      analysisId: opts.analysisId,
      provider: opts.provider,
      endpoint: opts.endpoint,
      creditsOrTokens,
      costEstimateUSD,
      latencyMs,
      status: "failed",
    });

    throw error;
  }
}
