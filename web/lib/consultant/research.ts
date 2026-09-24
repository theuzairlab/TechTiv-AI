import { callProvider } from "@/lib/providers";
import type { ConsultantToolName } from "@/lib/consultant/tools";

function requireKey(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function clip(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

async function tavilySearch(analysisId: string, query: string) {
  return callProvider({
    provider: "tavily",
    endpoint: "consultant/search",
    analysisId,
    costEstimateUSD: 0.01,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireKey("TAVILY_API_KEY");
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          max_results: 5,
          include_answer: true,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        answer?: string;
        results?: Array<{ title?: string; url?: string; content?: string }>;
      };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Tavily search failed");
      }
      return {
        answer: payload.answer ?? null,
        results: (payload.results ?? []).map((item) => ({
          title: item.title ?? "",
          url: item.url ?? "",
          content: clip(item.content ?? "", 500),
        })),
      };
    },
  });
}

async function serpSearch(analysisId: string, query: string) {
  return callProvider({
    provider: "serpapi",
    endpoint: "consultant/search.json",
    analysisId,
    costEstimateUSD: 0.01,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireKey("SERPAPI_KEY");
      const params = new URLSearchParams({
        engine: "google",
        q: query,
        api_key: apiKey,
        num: "6",
      });
      const response = await fetch(`https://serpapi.com/search.json?${params}`);
      const payload = (await response.json()) as {
        error?: string;
        organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
        people_also_ask?: Array<{ question?: string }>;
      };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "SerpAPI search failed");
      }
      return {
        organic: (payload.organic_results ?? []).map((item) => ({
          title: item.title ?? "",
          url: item.link ?? "",
          snippet: item.snippet ?? "",
        })),
        peopleAlsoAsk: (payload.people_also_ask ?? [])
          .map((item) => item.question)
          .filter((item): item is string => Boolean(item)),
      };
    },
  });
}

async function fetchPage(analysisId: string, url: string) {
  return callProvider({
    provider: "firecrawl",
    endpoint: "v2/scrape",
    analysisId,
    costEstimateUSD: 0.01,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireKey("FIRECRAWL_API_KEY");
      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
          timeout: 45000,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: { markdown?: string };
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Firecrawl scrape failed");
      }
      return {
        url,
        markdown: clip(payload.data?.markdown ?? "", 4000),
      };
    },
  });
}

export type ToolRunResult = {
  toolName: ConsultantToolName;
  query: string;
  ok: boolean;
  data: unknown;
};

export async function runConsultantTool(options: {
  analysisId: string;
  name: string;
  args: Record<string, unknown>;
}): Promise<ToolRunResult> {
  const name = options.name as ConsultantToolName;
  const query =
    typeof options.args.query === "string"
      ? options.args.query
      : typeof options.args.url === "string"
        ? options.args.url
        : "";

  try {
    if (name === "research_web") {
      if (!query) throw new Error("query is required");
      const data = await tavilySearch(options.analysisId, query);
      return { toolName: name, query, ok: true, data };
    }
    if (name === "research_google") {
      if (!query) throw new Error("query is required");
      const data = await serpSearch(options.analysisId, query);
      return { toolName: name, query, ok: true, data };
    }
    if (name === "fetch_page") {
      const url = typeof options.args.url === "string" ? options.args.url : "";
      if (!url.startsWith("http")) throw new Error("url is required");
      const data = await fetchPage(options.analysisId, url);
      return { toolName: name, query: url, ok: true, data };
    }
    if (name === "deep_research") {
      if (!query) throw new Error("query is required");
      const [web, google] = await Promise.allSettled([
        tavilySearch(options.analysisId, query),
        serpSearch(options.analysisId, query),
      ]);
      return {
        toolName: name,
        query,
        ok: true,
        data: {
          web: web.status === "fulfilled" ? web.value : { error: String(web.reason) },
          google:
            google.status === "fulfilled"
              ? google.value
              : { error: String(google.reason) },
        },
      };
    }
    throw new Error(`Unknown tool ${options.name}`);
  } catch (error) {
    return {
      toolName: name,
      query,
      ok: false,
      data: { error: error instanceof Error ? error.message : "Tool failed" },
    };
  }
}
