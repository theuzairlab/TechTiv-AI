import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { callProviderWithClient, isBudgetExceeded } from "./call-provider.js";
import {
  ProviderBudgetExceededError,
  ProviderDisabledError,
  ProviderNotConfiguredError,
} from "./errors.js";

const baseOpts = {
  provider: "firecrawl",
  endpoint: "crawl",
  analysisId: "analysis_test_1",
  costEstimateUSD: 2.5,
  creditsOrTokens: 1,
};

function createMockDb(config: {
  provider?: {
    provider: string;
    monthlyBudgetUSD: number;
    currentSpendUSD: number;
    isEnabled: boolean;
  } | null;
}) {
  const toolUsageLogCreate = vi.fn().mockResolvedValue({ id: "log_1" });
  const providerConfigUpdate = vi.fn().mockResolvedValue({});

  const db = {
    providerConfig: {
      findUnique: vi.fn().mockResolvedValue(config.provider ?? null),
      update: providerConfigUpdate,
    },
    toolUsageLog: {
      create: toolUsageLogCreate,
    },
  };

  return {
    db: db as unknown as PrismaClient,
    toolUsageLogCreate,
    providerConfigUpdate,
  };
}

describe("isBudgetExceeded", () => {
  it("treats zero budget as unlimited", () => {
    expect(
      isBudgetExceeded({
        provider: "pagespeed",
        monthlyBudgetUSD: 0,
        currentSpendUSD: 999,
        isEnabled: true,
      }),
    ).toBe(false);
  });

  it("blocks when spend meets budget", () => {
    expect(
      isBudgetExceeded({
        provider: "firecrawl",
        monthlyBudgetUSD: 50,
        currentSpendUSD: 50,
        isEnabled: true,
      }),
    ).toBe(true);
  });
});

describe("callProviderWithClient", () => {
  it("throws when provider is not configured", async () => {
    const { db } = createMockDb({ provider: null });

    await expect(
      callProviderWithClient(db, {
        ...baseOpts,
        fn: async () => "ok",
      }),
    ).rejects.toBeInstanceOf(ProviderNotConfiguredError);
  });

  it("blocks disabled provider and logs skipped_budget", async () => {
    const { db, toolUsageLogCreate } = createMockDb({
      provider: {
        provider: "firecrawl",
        monthlyBudgetUSD: 50,
        currentSpendUSD: 0,
        isEnabled: false,
      },
    });

    const fn = vi.fn().mockResolvedValue("ok");

    await expect(
      callProviderWithClient(db, {
        ...baseOpts,
        fn,
      }),
    ).rejects.toBeInstanceOf(ProviderDisabledError);

    expect(fn).not.toHaveBeenCalled();
    expect(toolUsageLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "skipped_budget",
        provider: "firecrawl",
        analysisId: "analysis_test_1",
      }),
    });
  });

  it("blocks when budget is exceeded and logs skipped_budget", async () => {
    const { db, toolUsageLogCreate } = createMockDb({
      provider: {
        provider: "firecrawl",
        monthlyBudgetUSD: 50,
        currentSpendUSD: 50,
        isEnabled: true,
      },
    });

    const fn = vi.fn().mockResolvedValue("ok");

    await expect(
      callProviderWithClient(db, {
        ...baseOpts,
        fn,
      }),
    ).rejects.toBeInstanceOf(ProviderBudgetExceededError);

    expect(fn).not.toHaveBeenCalled();
    expect(toolUsageLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: "skipped_budget" }),
    });
  });

  it("returns result, logs success, and increments spend", async () => {
    const { db, toolUsageLogCreate, providerConfigUpdate } = createMockDb({
      provider: {
        provider: "firecrawl",
        monthlyBudgetUSD: 50,
        currentSpendUSD: 10,
        isEnabled: true,
      },
    });

    const fn = vi.fn().mockResolvedValue({ pages: 3 });

    const result = await callProviderWithClient(db, {
      ...baseOpts,
      fn,
    });

    expect(result).toEqual({ pages: 3 });
    expect(fn).toHaveBeenCalledOnce();
    expect(toolUsageLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "success",
        costEstimateUSD: 2.5,
        creditsOrTokens: 1,
      }),
    });
    expect(providerConfigUpdate).toHaveBeenCalledWith({
      where: { provider: "firecrawl" },
      data: { currentSpendUSD: { increment: 2.5 } },
    });
  });

  it("logs failed calls without incrementing spend", async () => {
    const { db, toolUsageLogCreate, providerConfigUpdate } = createMockDb({
      provider: {
        provider: "firecrawl",
        monthlyBudgetUSD: 50,
        currentSpendUSD: 10,
        isEnabled: true,
      },
    });

    const fn = vi.fn().mockRejectedValue(new Error("upstream timeout"));

    await expect(
      callProviderWithClient(db, {
        ...baseOpts,
        fn,
      }),
    ).rejects.toThrow("upstream timeout");

    expect(toolUsageLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: "failed" }),
    });
    expect(providerConfigUpdate).not.toHaveBeenCalled();
  });

  it("allows calls when budget is zero (unlimited)", async () => {
    const { db, providerConfigUpdate } = createMockDb({
      provider: {
        provider: "pagespeed",
        monthlyBudgetUSD: 0,
        currentSpendUSD: 100,
        isEnabled: true,
      },
    });

    const result = await callProviderWithClient(db, {
      ...baseOpts,
      provider: "pagespeed",
      costEstimateUSD: 0,
      fn: async () => "ok",
    });

    expect(result).toBe("ok");
    expect(providerConfigUpdate).not.toHaveBeenCalled();
  });

  it("uses metrics returned from wrapped provider results", async () => {
    const { db, toolUsageLogCreate } = createMockDb({
      provider: {
        provider: "claude",
        monthlyBudgetUSD: 200,
        currentSpendUSD: 0,
        isEnabled: true,
      },
    });

    const result = await callProviderWithClient(db, {
      provider: "claude",
      endpoint: "messages/synthesis",
      analysisId: "analysis_test_1",
      fn: async () => ({
        value: { text: "ok" },
        creditsOrTokens: 1200,
        costEstimateUSD: 0.04,
      }),
    });

    expect(result).toEqual({ text: "ok" });
    expect(toolUsageLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        creditsOrTokens: 1200,
        costEstimateUSD: 0.04,
      }),
    });
  });
});
