import type { AnalysisEvidence } from "../generated/prisma/client.js";
import type { SynthesisResult } from "./schema.js";

function validRefs(refs: string[], known: Set<string>): string[] {
  return Array.from(new Set(refs.filter((ref) => known.has(ref))));
}

export function groundSynthesis(
  result: SynthesisResult,
  evidence: AnalysisEvidence[],
): SynthesisResult {
  const known = new Set(evidence.map((item) => item.evidenceKey));
  const assumptions = [...result.assumptions];

  const scorecard = result.scorecard
    .map((item) => ({ ...item, evidenceRefs: validRefs(item.evidenceRefs, known) }))
    .filter((item) => {
      if (item.evidenceRefs.length) return true;
      assumptions.push(`Unverified score: ${item.dimension} — ${item.rationale}`);
      return false;
    });
  const findings = result.findings
    .map((item) => ({ ...item, evidenceRefs: validRefs(item.evidenceRefs, known) }))
    .filter((item) => {
      if (item.evidenceRefs.length) return true;
      assumptions.push(`Unverified finding: ${item.title} — ${item.summary}`);
      return false;
    });
  const opportunities = result.opportunities
    .map((item) => ({ ...item, evidenceRefs: validRefs(item.evidenceRefs, known) }))
    .filter((item) => {
      if (item.evidenceRefs.length) return true;
      assumptions.push(`Potential opportunity requiring validation: ${item.title}`);
      return false;
    });
  const socialGrowth = (result.socialGrowth ?? [])
    .map((item) => ({ ...item, evidenceRefs: validRefs(item.evidenceRefs, known) }))
    .filter((item) => {
      if (item.evidenceRefs.length) return true;
      assumptions.push(`Unverified social finding: ${item.platform} — ${item.finding}`);
      return false;
    });
  const competitors = result.competitors
    .map((item) => {
      const refs = validRefs(item.evidenceRefs, known);
      const confidence = Math.max(
        0,
        ...refs.map(
          (ref) =>
            evidence.find((entry) => entry.evidenceKey === ref)
              ?.entityConfidence ?? 0,
        ),
      );
      return {
        ...item,
        evidenceRefs: refs,
        verified: item.verified && confidence >= 0.55,
      };
    })
    .filter((item) => item.evidenceRefs.length > 0);

  if (scorecard.length < 3 || findings.length < 2 || opportunities.length < 1) {
    throw new Error("Synthesis grounding coverage below report minimum");
  }

  return {
    ...result,
    scorecard,
    findings,
    opportunities,
    competitors,
    socialGrowth,
    assumptions: Array.from(new Set(assumptions)).slice(0, 12),
    stackArchitecture: result.stackArchitecture.map((item) => ({
      ...item,
      evidenceRefs: validRefs(item.evidenceRefs, known),
    })),
  };
}
