import type { AnalysisEvidence } from "../generated/prisma/client.js";

const EXPECTED = [
  "website",
  "technical",
  "market",
  "visibility",
  "business_context",
] as const;

export type CoverageSummary = {
  score: number;
  status: "complete" | "partial" | "limited";
  covered: string[];
  missing: string[];
  evidenceCount: number;
};

export function calculateCoverage(
  evidence: AnalysisEvidence[],
  hasConsultation: boolean,
): CoverageSummary {
  const covered = new Set<string>();
  if (evidence.some((item) => item.sourceType === "website_page")) {
    covered.add("website");
  }
  if (
    evidence.some((item) =>
      ["technical_measurement", "technology_detection"].includes(item.sourceType),
    )
  ) {
    covered.add("technical");
  }
  if (
    evidence.some((item) =>
      ["competitor_candidate", "business_discovery"].includes(item.sourceType),
    )
  ) {
    covered.add("market");
  }
  if (
    evidence.some((item) =>
      ["local_visibility", "answer_readiness_proxy"].includes(item.sourceType),
    )
  ) {
    covered.add("visibility");
  }
  if (hasConsultation) covered.add("business_context");
  const missing = EXPECTED.filter((area) => !covered.has(area));
  const score = Math.round((covered.size / EXPECTED.length) * 100);
  return {
    score,
    status: score >= 80 ? "complete" : score >= 40 ? "partial" : "limited",
    covered: [...covered],
    missing,
    evidenceCount: evidence.length,
  };
}
