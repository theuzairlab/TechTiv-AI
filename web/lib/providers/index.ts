import { prisma } from "@/lib/prisma";
import { callProviderWithClient } from "@/lib/providers/call-provider";
import type { CallProviderOptions } from "@/lib/providers/types";

export { callProviderWithClient, isBudgetExceeded } from "@/lib/providers/call-provider";
export {
  ProviderBudgetExceededError,
  ProviderDisabledError,
  ProviderError,
  ProviderNotConfiguredError,
} from "@/lib/providers/errors";
export type {
  CallProviderOptions,
  ProviderConfigSnapshot,
  ToolUsageStatus,
} from "@/lib/providers/types";

export async function callProvider<T>(
  opts: CallProviderOptions<T>,
): Promise<T> {
  return callProviderWithClient(prisma, opts);
}
