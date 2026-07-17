import { prisma } from "@/lib/prisma";
import { logAdminEvent } from "@/lib/admin/event-log";

export type ProviderMonitorRow = {
  provider: string;
  monthlyBudgetUSD: number;
  currentSpendUSD: number;
  rateLimitPerMinute: number;
  isEnabled: boolean;
  spendPercent: number;
  failuresThisMonth: number;
  callsThisMonth: number;
  avgLatencyMs: number | null;
};

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function listProviderMonitorRows(): Promise<ProviderMonitorRow[]> {
  const startOfMonth = monthStart();

  const [configs, usageStats] = await Promise.all([
    prisma.providerConfig.findMany({ orderBy: { provider: "asc" } }),
    prisma.toolUsageLog.groupBy({
      by: ["provider"],
      where: { createdAt: { gte: startOfMonth } },
      _count: { provider: true },
      _avg: { latencyMs: true },
    }),
  ]);

  const failureStats = await prisma.toolUsageLog.groupBy({
    by: ["provider"],
    where: {
      createdAt: { gte: startOfMonth },
      status: "failed",
    },
    _count: { provider: true },
  });

  const callsByProvider = new Map(
    usageStats.map((row) => [row.provider, row._count.provider]),
  );
  const failuresByProvider = new Map(
    failureStats.map((row) => [row.provider, row._count.provider]),
  );
  const latencyByProvider = new Map(
    usageStats.map((row) => [row.provider, row._avg.latencyMs]),
  );

  return configs.map((config) => {
    const spendPercent =
      config.monthlyBudgetUSD > 0
        ? Math.round(
            (config.currentSpendUSD / config.monthlyBudgetUSD) * 100,
          )
        : 0;

    return {
      provider: config.provider,
      monthlyBudgetUSD: config.monthlyBudgetUSD,
      currentSpendUSD: config.currentSpendUSD,
      rateLimitPerMinute: config.rateLimitPerMinute,
      isEnabled: config.isEnabled,
      spendPercent,
      failuresThisMonth: failuresByProvider.get(config.provider) ?? 0,
      callsThisMonth: callsByProvider.get(config.provider) ?? 0,
      avgLatencyMs: latencyByProvider.get(config.provider) ?? null,
    };
  });
}

export async function updateProviderConfig(
  provider: string,
  data: {
    isEnabled?: boolean;
    monthlyBudgetUSD?: number;
    resetSpend?: boolean;
  },
  adminUserId: string,
): Promise<ProviderMonitorRow> {
  const existing = await prisma.providerConfig.findUnique({
    where: { provider },
  });

  if (!existing) {
    throw new Error(`Provider not found: ${provider}`);
  }

  await prisma.providerConfig.update({
    where: { provider },
    data: {
      ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
      ...(data.monthlyBudgetUSD !== undefined
        ? { monthlyBudgetUSD: data.monthlyBudgetUSD }
        : {}),
      ...(data.resetSpend ? { currentSpendUSD: 0 } : {}),
    },
  });

  await logAdminEvent({
    adminUserId,
    action: "provider.update",
    targetType: "provider",
    targetId: provider,
    metadata: data,
  });

  const rows = await listProviderMonitorRows();
  const updated = rows.find((row) => row.provider === provider);
  if (!updated) {
    throw new Error("Provider update failed");
  }
  return updated;
}
