import type { PrismaClient } from "../../generated/prisma/client.js";
import {
  ProviderBudgetExceededError,
  ProviderDisabledError,
  ProviderNotConfiguredError,
} from "./errors.js";
import type {
  CallProviderOptions,
  ProviderCallResult,
  ProviderConfigSnapshot,
  ToolUsageStatus,
} from "./types.js";

function unwrapProviderResult<T>(
  result: ProviderCallResult<T>,
): { value: T; creditsOrTokens?: number; costEstimateUSD?: number } {
  if (
    result &&
    typeof result === "object" &&
    "value" in result &&
    (result as { value: T }).value !== undefined
  ) {
    const wrapped = result as { value: T } & {
      creditsOrTokens?: number;
      costEstimateUSD?: number;
    };
    return {
      value: wrapped.value,
      creditsOrTokens: wrapped.creditsOrTokens,
      costEstimateUSD: wrapped.costEstimateUSD,
    };
  }

  return { value: result as T };
}

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
  const analysisDelegate = (
    db as unknown as {
      analysis?: {
        findUnique: (args: {
          where: { id: string };
          select: { currentRunId: true };
        }) => Promise<{ currentRunId: string | null } | null>;
      };
    }
  ).analysis;
  const analysis = analysisDelegate
    ? await analysisDelegate.findUnique({
        where: { id: input.analysisId },
        select: { currentRunId: true },
      })
    : null;
  await db.toolUsageLog.create({
    data: {
      analysisId: input.analysisId,
      runId: analysis?.currentRunId,
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
  let costEstimateUSD = opts.costEstimateUSD ?? 0;
  let creditsOrTokens = opts.creditsOrTokens ?? 0;

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
    const rawResult = await opts.fn();
    const { value, creditsOrTokens: reportedCredits, costEstimateUSD: reportedCost } =
      unwrapProviderResult(rawResult);

    if (reportedCredits !== undefined) {
      creditsOrTokens = reportedCredits;
    }
    if (reportedCost !== undefined) {
      costEstimateUSD = reportedCost;
    }

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
      // Store the real fractional cost — rounding up to a whole dollar per
      // call (as this used to) exhausts a budget roughly 100x faster than
      // intended for cheap calls like a $0.01 search.
      await db.providerConfig.update({
        where: { provider: opts.provider },
        data: {
          currentSpendUSD: {
            increment: costEstimateUSD,
          },
        },
      });
    }

    return value;
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
