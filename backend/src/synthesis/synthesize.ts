import type {
  AnalysisEvidence,
  ConsultationMessage,
} from "../generated/prisma/client.js";
import { createClaudeMessage } from "../providers/claude.js";
import type { PipelineContext } from "../pipeline/types.js";
import { extractJsonFromText } from "./parse-json.js";
import {
  buildSynthesisPrompt,
  buildSynthesisRetryPrompt,
} from "./prompt.js";
import { synthesisSchema, type SynthesisResult } from "./schema.js";
import type { CoverageSummary } from "./coverage.js";
import { groundSynthesis } from "./grounding.js";
import { logAnalysisActivity } from "../pipeline/activity.js";

const MAX_ATTEMPTS = 2;

function buildFallbackSynthesis(
  evidence: AnalysisEvidence[],
  consultation: ConsultationMessage[],
  coverage: CoverageSummary,
): SynthesisResult {
  const firstRef = evidence[0]!.evidenceKey;
  const refsFor = (...types: string[]) => {
    const refs = evidence
      .filter((item) => types.includes(item.sourceType))
      .slice(0, 4)
      .map((item) => item.evidenceKey);
    return refs.length ? refs : [firstRef];
  };
  const contextRefs = refsFor("confirmed_business_context");
  const technicalRefs = refsFor(
    "technical_measurement",
    "technology_detection",
    "website_page",
  );
  const marketRefs = refsFor(
    "competitor_candidate",
    "business_discovery",
    "local_visibility",
    "answer_readiness_proxy",
  );
  const confirmedWorkflow =
    [...consultation]
      .reverse()
      .find((message) => {
        const data = message.inputJson;
        return (
          message.role === "user" &&
          data &&
          typeof data === "object" &&
          !Array.isArray(data) &&
          "field" in data &&
          ["workflow", "goals", "painPoints"].includes(
            String((data as { field?: unknown }).field),
          )
        );
      })?.content ?? "the highest-priority confirmed workflow";
  const score = (covered: boolean, adjustment = 0) =>
    Math.max(
      20,
      Math.min(85, Math.round(30 + coverage.score * 0.45 + adjustment + (covered ? 10 : 0))),
    );

  return {
    businessProfile: {
      summary:
        "This is a partial evidence-grounded profile assembled while the primary synthesis provider was unavailable.",
      industry: "unconfirmed",
      teamSize: "unknown",
      operatingModel: "Requires confirmation",
    },
    executiveSummary:
      "The collected evidence supports a focused discovery and measurement phase. The first implementation should validate the confirmed workflow, establish a baseline, and automate only after the operating data is verified.",
    scorecard: [
      {
        dimension: "Digital foundation",
        score: score(coverage.covered.includes("website")),
        rationale: coverage.covered.includes("website")
          ? "Website or technical evidence was collected."
          : "Website coverage is incomplete.",
        evidenceRefs: technicalRefs,
      },
      {
        dimension: "Market visibility",
        score: score(coverage.covered.includes("market"), -5),
        rationale: coverage.covered.includes("market")
          ? "Market discovery evidence was collected."
          : "Market coverage is incomplete.",
        evidenceRefs: marketRefs,
      },
      {
        dimension: "Automation readiness",
        score: score(coverage.covered.includes("business_context"), 5),
        rationale:
          "The consultation identified workflow context, but implementation metrics still require validation.",
        evidenceRefs: contextRefs,
      },
    ],
    findings: [
      {
        title: "Confirmed workflow requires a measured baseline",
        category: "operations",
        severity: "high",
        summary: `The consultation identifies ${confirmedWorkflow} as a priority. Current handling time, error rate, and ownership should be measured before automation.`,
        evidenceRefs: contextRefs,
      },
      {
        title:
          coverage.status === "complete"
            ? "Core research sources were collected"
            : "Research coverage is incomplete",
        category: "technology",
        severity: coverage.status === "limited" ? "high" : "medium",
        summary:
          coverage.missing.length > 0
            ? `Missing coverage: ${coverage.missing.join(", ")}.`
            : "Website, market, visibility, and business-context sources are represented.",
        evidenceRefs: [...new Set([...technicalRefs, ...marketRefs])].slice(0, 6),
      },
    ],
    competitors: [],
    opportunities: [
      {
        title: "Instrument the priority workflow",
        outcome:
          "Create a reliable baseline and remove the highest-confidence manual handoffs first.",
        workflow: confirmedWorkflow,
        impact: "high",
        effort: "medium",
        integrations: [],
        evidenceRefs: contextRefs,
      },
    ],
    stackArchitecture: [],
    roadmap: [
      {
        phase: "Validate",
        objective: "Confirm owners, volumes, handling time, and exceptions.",
        deliverables: ["Workflow map", "Measurement baseline", "Data-access check"],
        dependencies: [],
      },
      {
        phase: "Pilot",
        objective: "Automate one bounded workflow with human review.",
        deliverables: ["Pilot automation", "Exception queue", "Outcome dashboard"],
        dependencies: ["Validated baseline"],
      },
    ],
    risks: [
      "Provider interruption limited the depth of AI synthesis.",
      "Unconfirmed operating metrics can change scope and expected value.",
    ],
    assumptions: [
      "The consultation answers accurately describe the current workflow.",
    ],
    unknowns: [
      ...coverage.missing.map((item) => `Missing source coverage: ${item}`),
      "Current handling time, error rate, and workflow ownership",
    ],
    confidence: {
      level: "low",
      rationale:
        "This partial report uses collected evidence and deterministic fallback assembly because the synthesis provider did not return a valid complete response.",
    },
  };
}

export async function synthesizeFromSignals(
  ctx: PipelineContext,
  evidence: AnalysisEvidence[],
  consultation: ConsultationMessage[],
  coverage: CoverageSummary,
): Promise<SynthesisResult> {
  if (evidence.length === 0) {
    throw new Error("Cannot synthesize without normalized evidence");
  }

  const { system, user } = buildSynthesisPrompt(
    evidence,
    consultation,
    coverage,
    ctx,
  );
  let lastOutput = "";
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let heartbeat: ReturnType<typeof setTimeout> | undefined;
    try {
      const promptUser =
        attempt === 1
          ? user
          : `${user}\n\n${buildSynthesisRetryPrompt(
              lastOutput,
              lastError?.message,
            )}`;

      await logAnalysisActivity({
        analysisId: ctx.analysisId,
        runId: ctx.runId,
        kind: "think",
        message:
          attempt === 1
            ? "Drafting the evidence-linked decision report…"
            : `Revalidating citations and report structure (attempt ${attempt}/${MAX_ATTEMPTS})…`,
        metadata: { step: "synthesize", attempt },
      });
      heartbeat = setTimeout(() => {
        void logAnalysisActivity({
          analysisId: ctx.analysisId,
          runId: ctx.runId,
          kind: "status",
          message:
            "The synthesis provider is taking longer than usual; the session is still active.",
          metadata: { step: "synthesize", attempt },
        }).catch(() => undefined);
      }, 20_000);

      const { text } = await createClaudeMessage({
        system,
        user: promptUser,
        analysisId: ctx.analysisId,
        endpoint: attempt === 1 ? "messages/synthesis" : "messages/synthesis-retry",
      });

      lastOutput = text;
      const parsed = extractJsonFromText(text);
      return groundSynthesis(synthesisSchema.parse(parsed), evidence);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await logAnalysisActivity({
        analysisId: ctx.analysisId,
        runId: ctx.runId,
        kind: "warning",
        message:
          attempt < MAX_ATTEMPTS
            ? `The synthesis response was incomplete; automatically retrying (${attempt}/${MAX_ATTEMPTS}).`
            : "The synthesis provider remained unavailable; assembling an honest partial report from collected evidence.",
        metadata: {
          step: "synthesize",
          attempt,
          errorType: lastError.name,
        },
      });
    } finally {
      if (heartbeat) clearTimeout(heartbeat);
    }
  }

  return buildFallbackSynthesis(evidence, consultation, coverage);
}
