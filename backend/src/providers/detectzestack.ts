import { callProvider } from "../lib/providers/index.js";
import type { PipelineContext } from "../pipeline/types.js";
import { requireProviderApiKey } from "./env.js";
import { fetchJson } from "./http.js";

export type DetectZeStackTechnology = {
  name: string;
  categories: string[];
  confidence: number | null;
  source: string | null;
  version: string | null;
  cpe: string | null;
};

export type DetectZeStackResult = {
  url: string;
  domain: string;
  statusCode: number | null;
  technologies: DetectZeStackTechnology[];
  detectionTimeMs: number | null;
};

type DetectZeStackTechnologyRaw = {
  name?: string;
  category?: string;
  categories?: string[];
  confidence?: number;
  source?: string;
  version?: string;
  cpe?: string;
};

type DetectZeStackApiResponse = {
  url?: string;
  domain?: string;
  status_code?: number;
  detection_time_ms?: number;
  technologies?: DetectZeStackTechnologyRaw[];
  meta?: {
    status_code?: number;
    tech_count?: number;
    detection_time_ms?: number;
  };
  error?: string;
  message?: string;
};

function normalizeCategories(tech: DetectZeStackTechnologyRaw): string[] {
  if (Array.isArray(tech.categories) && tech.categories.length > 0) {
    return tech.categories;
  }
  if (tech.category) {
    return [tech.category];
  }
  return [];
}

export async function detectTechStack(
  ctx: PipelineContext,
): Promise<DetectZeStackResult> {
  return callProvider({
    provider: "detectzestack",
    endpoint: "analyze",
    analysisId: ctx.analysisId,
    costEstimateUSD: 0,
    creditsOrTokens: 1,
    fn: async () => {
      const apiKey = requireProviderApiKey("DETECTZESTACK_API_KEY");
      const params = new URLSearchParams({ url: ctx.domain });

      const response = await fetchJson<DetectZeStackApiResponse>(
        `https://detectzestack.com/analyze?${params.toString()}`,
        {
          headers: {
            "X-API-Key": apiKey,
          },
          timeoutMs: 60_000,
          retries: 3,
        },
      );

      if (response.error || response.message) {
        throw new Error(response.error ?? response.message ?? "DetectZeStack analyze failed");
      }

      const technologies = (response.technologies ?? []).map((tech) => ({
        name: tech.name ?? "Unknown",
        categories: normalizeCategories(tech),
        confidence: tech.confidence ?? null,
        source: tech.source ?? null,
        version: tech.version ?? null,
        cpe: tech.cpe ?? null,
      }));

      return {
        url: response.url ?? `https://${ctx.domain}`,
        domain: response.domain ?? ctx.domain,
        statusCode: response.status_code ?? response.meta?.status_code ?? null,
        technologies,
        detectionTimeMs:
          response.detection_time_ms ?? response.meta?.detection_time_ms ?? null,
      };
    },
  });
}
