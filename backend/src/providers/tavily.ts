import { callProvider } from "../lib/providers/index.js";
import type { PipelineContext } from "../pipeline/types.js";
import { requireProviderApiKey } from "./env.js";
import { fetchJson } from "./http.js";

export type TavilySearchResult = {
  query: string;
  results: Array<{
    title: string;
    url: string;
    content: string;
    score?: number;
  }>;
};

type TavilyApiResponse = {
  results?: Array<{
    title: string;
    url: string;
    content: string;
    score?: number;
  }>;
  error?: string;
};

async function runTavilySearch(
  ctx: PipelineContext,
  query: string,
  endpoint: string,
  maxResults = 5,
): Promise<TavilySearchResult> {
  return callProvider({
    provider: "tavily",
    endpoint,
    analysisId: ctx.analysisId,
    costEstimateUSD: 0.01,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireProviderApiKey("TAVILY_API_KEY");

      const response = await fetchJson<TavilyApiResponse>(
        "https://api.tavily.com/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: "basic",
            max_results: maxResults,
            include_answer: false,
          }),
        },
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return {
        query,
        results: (response.results ?? []).map((item) => ({
          title: item.title,
          url: item.url,
          content: item.content,
          score: item.score,
        })),
      };
    },
  });
}

export async function searchCompetitorSignals(
  ctx: PipelineContext,
  query?: string,
): Promise<TavilySearchResult> {
  return runTavilySearch(
    ctx,
    query ?? `main competitors and market positioning for ${ctx.domain}`,
    "search",
  );
}

export async function searchDiscoverySignals(
  ctx: PipelineContext,
  query: string,
): Promise<TavilySearchResult> {
  return runTavilySearch(ctx, query, "search/discovery", 6);
}

export async function searchVisibilitySignals(
  ctx: PipelineContext,
  query: string,
): Promise<TavilySearchResult> {
  return runTavilySearch(ctx, query, "search/visibility", 5);
}
