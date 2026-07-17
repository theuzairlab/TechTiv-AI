export type ToolUsageStatus = "success" | "failed" | "skipped_budget";

export type ProviderCallMetrics = {
  creditsOrTokens?: number;
  costEstimateUSD?: number;
};

export type ProviderCallResult<T> =
  | T
  | ({ value: T } & ProviderCallMetrics);

export type CallProviderOptions<T> = {
  provider: string;
  endpoint: string;
  analysisId: string;
  fn: () => Promise<ProviderCallResult<T>>;
  costEstimateUSD?: number;
  creditsOrTokens?: number;
};

export type ProviderConfigSnapshot = {
  provider: string;
  monthlyBudgetUSD: number;
  currentSpendUSD: number;
  isEnabled: boolean;
};
