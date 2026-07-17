export function estimateClaudeCostUsd(
  inputTokens: number,
  outputTokens: number,
): number {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  return Number((inputCost + outputCost).toFixed(4));
}
