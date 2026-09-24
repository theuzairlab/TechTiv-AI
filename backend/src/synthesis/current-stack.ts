import type { AnalysisEvidence } from "../generated/prisma/client.js";

export type CurrentStackItem = {
  category: string;
  tool: string;
  notes: string;
};

type TechStackDetection = {
  technologies?: Array<{ name?: string; categories?: string[] }>;
};

type PageSpeedResult = {
  scores?: {
    performance?: number | null;
    seo?: number | null;
    accessibility?: number | null;
    bestPractices?: number | null;
  };
};

/**
 * Builds the "Current Technology Stack" section directly from measured
 * evidence (DetectZeStack + PageSpeed) rather than asking the LLM to guess —
 * this section reports facts about what the business already runs, so it
 * must stay deterministic and never be invented.
 */
export function computeCurrentTechStack(
  evidence: AnalysisEvidence[],
): CurrentStackItem[] {
  const items: CurrentStackItem[] = [];

  const stackEvidence = evidence.find(
    (item) => item.sourceType === "technology_detection" && item.valueJson,
  );
  const stack = stackEvidence?.valueJson as TechStackDetection | undefined;
  for (const tech of stack?.technologies ?? []) {
    if (!tech.name) continue;
    items.push({
      category: tech.categories?.[0] ?? "Detected technology",
      tool: tech.name,
      notes: "Detected live on the current website.",
    });
  }

  const pageSpeedEvidence = evidence.find(
    (item) => item.sourceType === "technical_measurement" && item.valueJson,
  );
  const pageSpeed = pageSpeedEvidence?.valueJson as PageSpeedResult | undefined;
  if (pageSpeed?.scores) {
    const { performance, seo, accessibility, bestPractices } = pageSpeed.scores;
    if (performance != null) {
      items.push({
        category: "Site performance",
        tool: "PageSpeed / Core Web Vitals",
        notes: `Performance score ${performance}/100${seo != null ? `, SEO ${seo}/100` : ""}${accessibility != null ? `, accessibility ${accessibility}/100` : ""}${bestPractices != null ? `, best practices ${bestPractices}/100` : ""}.`,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      category: "Technology detection",
      tool: "Not directly measurable",
      notes: "The current stack could not be detected automatically for this domain this run.",
    });
  }

  return items;
}
