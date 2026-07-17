import { callProvider } from "../lib/providers/index.js";
import type { PipelineContext } from "../pipeline/types.js";
import { requireProviderApiKey, toWebsiteUrl } from "./env.js";
import { fetchJson } from "./http.js";

export type FirecrawlScrapeResult = {
  url: string;
  markdown: string | null;
  metadata: Record<string, unknown>;
  links: string[];
};

type FirecrawlResponse = {
  success?: boolean;
  data?: {
    markdown?: string;
    metadata?: Record<string, unknown>;
    links?: string[];
  };
  error?: string;
};

async function scrapeUrl(
  ctx: PipelineContext,
  url: string,
): Promise<FirecrawlScrapeResult> {
  return callProvider({
    provider: "firecrawl",
    endpoint: "v2/scrape",
    analysisId: ctx.analysisId,
    costEstimateUSD: 0.01,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireProviderApiKey("FIRECRAWL_API_KEY");
      const response = await fetchJson<FirecrawlResponse>(
        "https://api.firecrawl.dev/v2/scrape",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown", "links"],
            onlyMainContent: true,
            timeout: 60000,
          }),
          timeoutMs: 120_000,
          retries: 4,
          retryDelayMs: 2_000,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Firecrawl scrape failed");
      }

      return {
        url,
        markdown: response.data.markdown ?? null,
        metadata: response.data.metadata ?? {},
        links: response.data.links ?? [],
      };
    },
  });
}

function selectKeyPages(home: FirecrawlScrapeResult): string[] {
  const root = new URL(home.url);
  const priorities = [
    /\/(services?|products?|solutions?)(\/|$)/i,
    /\/pricing(\/|$)/i,
    /\/(about|company|team)(\/|$)/i,
    /\/(case-stud|customers?|portfolio|work)(\/|$)/i,
    /\/(faq|help)(\/|$)/i,
    /\/contact(\/|$)/i,
  ];
  const valid = Array.from(
    new Set(
      home.links.filter((link) => {
        try {
          const url = new URL(link, home.url);
          return url.hostname === root.hostname && !url.hash;
        } catch {
          return false;
        }
      }),
    ),
  );
  const selected: string[] = [];
  for (const priority of priorities) {
    const match = valid.find(
      (link) => priority.test(new URL(link, home.url).pathname) && !selected.includes(link),
    );
    if (match) selected.push(new URL(match, home.url).toString());
  }
  return selected.slice(0, 7);
}

export async function crawlDomain(
  ctx: PipelineContext,
): Promise<{ pages: FirecrawlScrapeResult[]; coverage: string[] }> {
  const home = await scrapeUrl(ctx, toWebsiteUrl(ctx.domain));
  const urls = selectKeyPages(home);
  const pages = [home];
  for (const url of urls) {
    try {
      pages.push(await scrapeUrl(ctx, url));
    } catch (error) {
      console.warn(`[firecrawl] Optional page skipped: ${url}`, error);
    }
  }
  return {
    pages,
    coverage: pages.map((page) => new URL(page.url).pathname || "/"),
  };
}

export const scrapeDomain = async (
  ctx: PipelineContext,
): Promise<FirecrawlScrapeResult> =>
  scrapeUrl(ctx, toWebsiteUrl(ctx.domain));
