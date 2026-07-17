import { callProvider } from "../lib/providers/index.js";
import { requireProviderApiKey } from "./env.js";
import { fetchJson } from "./http.js";
import { estimateClaudeCostUsd } from "./claude-cost.js";

export type ClaudeMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: {
    type?: string;
    message?: string;
  };
};

const DEFAULT_MODEL = "claude-sonnet-4-6";

export function getClaudeModel(): string {
  return process.env.CLAUDE_MODEL?.trim() || DEFAULT_MODEL;
}

export async function createClaudeMessage(input: {
  system: string;
  user: string;
  analysisId: string;
  endpoint?: string;
}): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  return callProvider({
    provider: "claude",
    endpoint: input.endpoint ?? "messages",
    analysisId: input.analysisId,
    fn: async () => {
      const apiKey = requireProviderApiKey("ANTHROPIC_API_KEY");

      const response = await fetchJson<ClaudeMessageResponse>(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: getClaudeModel(),
            max_tokens: 8192,
            system: input.system,
            messages: [{ role: "user", content: input.user }],
          }),
          timeoutMs: 60_000,
          retries: 0,
          retryDelayMs: 1500,
        },
      );

      if (response.error?.message) {
        throw new Error(response.error.message);
      }

      const text = (response.content ?? [])
        .filter((block) => block.type === "text" && block.text)
        .map((block) => block.text)
        .join("\n")
        .trim();

      if (!text) {
        throw new Error("Claude returned an empty response");
      }

      const inputTokens = response.usage?.input_tokens ?? 0;
      const outputTokens = response.usage?.output_tokens ?? 0;

      return {
        value: { text, inputTokens, outputTokens },
        creditsOrTokens: inputTokens + outputTokens,
        costEstimateUSD: estimateClaudeCostUsd(inputTokens, outputTokens),
      };
    },
  });
}
