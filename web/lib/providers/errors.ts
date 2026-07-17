export class ProviderError extends Error {
  readonly provider: string;

  constructor(provider: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.provider = provider;
  }
}

export class ProviderNotConfiguredError extends ProviderError {
  constructor(provider: string) {
    super(provider, `Provider "${provider}" is not configured`);
  }
}

export class ProviderDisabledError extends ProviderError {
  constructor(provider: string) {
    super(provider, `Provider "${provider}" is disabled`);
  }
}

export class ProviderBudgetExceededError extends ProviderError {
  constructor(provider: string, monthlyBudgetUSD: number, currentSpendUSD: number) {
    super(
      provider,
      `Provider "${provider}" monthly budget exceeded (${currentSpendUSD}/${monthlyBudgetUSD} USD)`,
    );
  }
}
