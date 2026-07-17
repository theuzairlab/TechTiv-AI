import { prisma } from "../prisma.js";
import { callProviderWithClient } from "./call-provider.js";
import type { CallProviderOptions } from "./types.js";

export { callProviderWithClient, isBudgetExceeded } from "./call-provider.js";
export {
  ProviderBudgetExceededError,
  ProviderDisabledError,
  ProviderError,
  ProviderNotConfiguredError,
} from "./errors.js";
export type {
  CallProviderOptions,
  ProviderConfigSnapshot,
  ToolUsageStatus,
} from "./types.js";

export async function callProvider<T>(
  opts: CallProviderOptions<T>,
): Promise<T> {
  return callProviderWithClient(prisma, opts);
}
