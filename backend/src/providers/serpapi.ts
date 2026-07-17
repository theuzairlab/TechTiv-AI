import { callProvider } from "../lib/providers/index.js";
import type { PipelineContext } from "../pipeline/types.js";
import { requireProviderApiKey } from "./env.js";
import { fetchJson } from "./http.js";

export type SerpApiResult = {
  query: string;
  organicResults: Array<{
    position: number;
    title: string;
    link: string;
    snippet?: string;
  }>;
  relatedSearches: string[];
  localResults?: Array<{
    title: string;
    address?: string;
    rating?: number;
    reviews?: number;
  }>;
  peopleAlsoAsk?: string[];
};

type SerpApiResponse = {
  error?: string;
  organic_results?: Array<{
    position?: number;
    title?: string;
    link?: string;
    snippet?: string;
  }>;
  related_searches?: Array<{ query?: string }>;
  local_results?: Array<{
    title?: string;
    address?: string;
    rating?: number;
    reviews?: number;
  }>;
  people_also_ask?: Array<{ question?: string }>;
};

async function runSerpSearch(
  ctx: PipelineContext,
  query: string,
  endpoint: string,
): Promise<SerpApiResult> {
  return callProvider({
    provider: "serpapi",
    endpoint,
    analysisId: ctx.analysisId,
    costEstimateUSD: 0.01,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireProviderApiKey("SERPAPI_KEY");
      const params = new URLSearchParams({
        engine: "google",
        q: query,
        api_key: apiKey,
        num: "8",
      });

      const response = await fetchJson<SerpApiResponse>(
        `https://serpapi.com/search.json?${params.toString()}`,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return {
        query,
        organicResults: (response.organic_results ?? []).map((item, index) => ({
          position: item.position ?? index + 1,
          title: item.title ?? "",
          link: item.link ?? "",
          snippet: item.snippet,
        })),
        relatedSearches: (response.related_searches ?? [])
          .map((item) => item.query)
          .filter((value): value is string => Boolean(value)),
        localResults: (response.local_results ?? []).map((item) => ({
          title: item.title ?? "",
          address: item.address,
          rating: item.rating,
          reviews: item.reviews,
        })),
        peopleAlsoAsk: (response.people_also_ask ?? [])
          .map((item) => item.question)
          .filter((value): value is string => Boolean(value)),
      };
    },
  });
}

export async function fetchSerpSignals(
  ctx: PipelineContext,
  query?: string,
): Promise<SerpApiResult> {
  return runSerpSearch(
    ctx,
    query ?? `${ctx.domain} competitors SEO`,
    "search.json",
  );
}

export async function fetchGeoSerpSignals(
  ctx: PipelineContext,
  query: string,
): Promise<SerpApiResult> {
  return runSerpSearch(ctx, query, "search.json/geo");
}

export async function fetchAeoSerpSignals(
  ctx: PipelineContext,
  query: string,
): Promise<SerpApiResult> {
  return runSerpSearch(ctx, query, "search.json/aeo");
}
