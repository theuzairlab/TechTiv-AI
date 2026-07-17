import { callProvider } from "../lib/providers/index.js";
import type { PipelineContext } from "../pipeline/types.js";
import { requireProviderApiKey, toWebsiteUrl } from "./env.js";
import { fetchJson } from "./http.js";

export type PageSpeedResult = {
  url: string;
  strategy: string;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  metrics: Record<string, number | null>;
};

type PageSpeedApiResponse = {
  lighthouseResult?: {
    categories?: Record<
      string,
      {
        score?: number | null;
      }
    >;
    audits?: Record<
      string,
      {
        numericValue?: number | null;
      }
    >;
  };
  error?: { message?: string };
};

function scoreFromCategory(
  categories: PageSpeedApiResponse["lighthouseResult"] extends infer T
    ? T extends { categories?: infer C }
      ? C
      : never
    : never,
  key: string,
): number | null {
  const score = categories?.[key]?.score;
  if (score == null) return null;
  return Math.round(score * 100);
}

export async function auditPageSpeed(
  ctx: PipelineContext,
): Promise<PageSpeedResult> {
  return callProvider({
    provider: "pagespeed",
    endpoint: "v5/runPagespeed",
    analysisId: ctx.analysisId,
    costEstimateUSD: 0,
    creditsOrTokens: 1,
    fn: async () => {
      const url = toWebsiteUrl(ctx.domain);
      const apiKey = requireProviderApiKey("PAGESPEED_API_KEY");
      const params = new URLSearchParams({
        url,
        strategy: "mobile",
        category: "performance",
        key: apiKey,
      });
      params.append("category", "seo");
      params.append("category", "accessibility");
      params.append("category", "best-practices");

      const response = await fetchJson<PageSpeedApiResponse>(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
        {
          timeoutMs: 120_000,
          retries: 3,
          retryDelayMs: 2_500,
        },
      );

      if (response.error?.message) {
        throw new Error(response.error.message);
      }

      const categories = response.lighthouseResult?.categories ?? {};
      const audits = response.lighthouseResult?.audits ?? {};

      return {
        url,
        strategy: "mobile",
        scores: {
          performance: scoreFromCategory(categories, "performance"),
          seo: scoreFromCategory(categories, "seo"),
          accessibility: scoreFromCategory(categories, "accessibility"),
          bestPractices: scoreFromCategory(categories, "best-practices"),
        },
        metrics: {
          firstContentfulPaint:
            audits["first-contentful-paint"]?.numericValue ?? null,
          largestContentfulPaint:
            audits["largest-contentful-paint"]?.numericValue ?? null,
          totalBlockingTime: audits["total-blocking-time"]?.numericValue ?? null,
          cumulativeLayoutShift:
            audits["cumulative-layout-shift"]?.numericValue ?? null,
        },
      };
    },
  });
}
