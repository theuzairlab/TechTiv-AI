export type ToolUsageStatus = "success" | "failed" | "skipped_budget";

export type CallProviderOptions<T> = {
  provider: string;
  endpoint: string;
  analysisId: string;
  fn: () => Promise<T>;
  costEstimateUSD?: number;
  creditsOrTokens?: number;
};

export type ProviderConfigSnapshot = {
  provider: string;
  monthlyBudgetUSD: number;
  currentSpendUSD: number;
  isEnabled: boolean;
};
