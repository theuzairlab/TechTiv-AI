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
import { computeCurrentTechStack } from "./current-stack.js";

const MAX_ATTEMPTS = 2;

type PageSpeedLike = {
  scores?: {
    performance?: number | null;
    seo?: number | null;
    accessibility?: number | null;
    bestPractices?: number | null;
  };
};

type TechStackLike = {
  technologies?: Array<{ name?: string; categories?: string[] }>;
};

function firstConsultationAnswer(
  consultation: ConsultationMessage[],
  fields: string[],
): string | null {
  const message = [...consultation].reverse().find((entry) => {
    const data = entry.inputJson;
    return (
      entry.role === "user" &&
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      "field" in data &&
      fields.includes(String((data as { field?: unknown }).field))
    );
  });
  return message?.content?.trim() || null;
}

function shorten(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/**
 * Builds a decision report from the raw evidence directly (no LLM) for the
 * rare case where the synthesis provider genuinely could not return a valid
 * response after retries. This must never contain meta-commentary about the
 * research process itself (e.g. "research sources were collected") — every
 * item has to be a real, specific statement grounded in what was actually
 * measured or said, even without AI-written prose.
 */
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
  const technicalRefs = refsFor("technical_measurement", "technology_detection");
  const websiteRefs = refsFor("website_page");
  const marketRefs = refsFor(
    "competitor_candidate",
    "business_discovery",
    "local_visibility",
    "answer_readiness_proxy",
  );
  const socialRefs = refsFor("social_profile", "social_mention");

  const confirmedWorkflow =
    firstConsultationAnswer(consultation, ["workflow", "painPoints"]) ??
    "the highest-priority manual process described";
  const confirmedGoal = firstConsultationAnswer(consultation, ["goals"]);

  const pageSpeedEvidence = evidence.find(
    (item) =>
      item.sourceType === "technical_measurement" &&
      item.valueJson &&
      typeof item.valueJson === "object",
  );
  const pageSpeed = pageSpeedEvidence?.valueJson as PageSpeedLike | undefined;
  const performanceScore = pageSpeed?.scores?.performance ?? null;
  const seoScore = pageSpeed?.scores?.seo ?? null;

  const stackEvidence = evidence.find(
    (item) => item.sourceType === "technology_detection" && item.valueJson,
  );
  const stack = stackEvidence?.valueJson as TechStackLike | undefined;
  const stackNames = (stack?.technologies ?? [])
    .map((tech) => tech.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, 5);

  const websitePages = evidence.filter((item) => item.sourceType === "website_page");
  const homePage = websitePages.find((page) => page.url?.match(/\/$|\.com$/)) ?? websitePages[0];

  const socialProfileEvidence = evidence.filter(
    (item) => item.sourceType === "social_profile",
  );

  const score = (covered: boolean, adjustment = 0) =>
    Math.max(
      20,
      Math.min(85, Math.round(30 + coverage.score * 0.45 + adjustment + (covered ? 10 : 0))),
    );

  const findings: SynthesisResult["findings"] = [
    {
      title: `${shorten(confirmedWorkflow, 60)} runs manually today`,
      category: "operations",
      severity: "high",
      summary: `You told us: "${shorten(confirmedWorkflow)}" This is handled manually right now, which means handling time, error rate, and ownership aren't measured — so there's no baseline to prove automation is working once it's built.`,
      evidenceRefs: contextRefs,
    },
  ];

  if (performanceScore != null && performanceScore < 80) {
    findings.push({
      title: `Website loads slower than it should (PageSpeed ${performanceScore}/100)`,
      category: "technology",
      severity: performanceScore < 50 ? "high" : "medium",
      summary: `A real PageSpeed test on your site scored ${performanceScore}/100 for performance${seoScore != null ? ` and ${seoScore}/100 for SEO` : ""}. Slow pages lose visitors before they convert, and search engines factor page speed into ranking.`,
      evidenceRefs: technicalRefs,
    });
  } else if (stackNames.length > 0) {
    findings.push({
      title: "Current stack has no automation layer connecting it",
      category: "technology",
      severity: "medium",
      summary: `Your site runs on ${stackNames.join(", ")}. These tools work independently today — there's no automation layer tying data or workflows between them, which is where most of the manual work in "${shorten(confirmedWorkflow, 60)}" is coming from.`,
      evidenceRefs: technicalRefs,
    });
  } else if (marketRefs.length > 0 && coverage.covered.includes("market")) {
    findings.push({
      title: "Competitive visibility has not been benchmarked",
      category: "marketing",
      severity: "medium",
      summary: "We found market signals but couldn't fully cross-reference them against your business this run. Until that's verified, you don't know where you stand against competitors on search and reputation.",
      evidenceRefs: marketRefs,
    });
  } else {
    findings.push({
      title: "Market and competitor data is missing this run",
      category: "marketing",
      severity: "medium",
      summary: `${coverage.missing.length > 0 ? `We couldn't collect ${coverage.missing.join(", ")} data this run` : "Some research sources were unavailable this run"} — so competitor positioning and market visibility aren't reflected in this report yet. Re-running the analysis usually resolves this.`,
      evidenceRefs: [...new Set([...websiteRefs, ...socialRefs])].slice(0, 6),
    });
  }

  return {
    businessProfile: {
      summary: homePage?.title
        ? `Based on ${homePage.title}, this business needs its confirmed manual process instrumented before automating it.`
        : "This is a partial profile assembled directly from collected evidence.",
      industry: "unconfirmed",
      teamSize: "unknown",
      operatingModel: "Requires confirmation",
    },
    executiveSummary: `The clearest problem right now is "${shorten(confirmedWorkflow, 100)}" being run manually with no measurement in place.${confirmedGoal ? ` Your stated goal — "${shorten(confirmedGoal, 100)}" — depends on fixing that first.` : ""} The first implementation phase should measure the current process, then automate the highest-confidence manual handoffs.`,
    scorecard: [
      {
        dimension: "Digital foundation",
        score: score(coverage.covered.includes("website")),
        rationale:
          performanceScore != null
            ? `Website audit measured a ${performanceScore}/100 PageSpeed performance score.`
            : coverage.covered.includes("website")
              ? "Website content was reviewed directly."
              : "Website could not be reviewed directly.",
        evidenceRefs: technicalRefs.length ? technicalRefs : websiteRefs,
      },
      {
        dimension: "Market visibility",
        score: score(coverage.covered.includes("market"), -5),
        rationale: coverage.covered.includes("market")
          ? "Market and competitor signals were collected."
          : "Market and competitor data was not available this run.",
        evidenceRefs: marketRefs,
      },
      {
        dimension: "Automation readiness",
        score: score(coverage.covered.includes("business_context"), 5),
        rationale: `The confirmed process ("${shorten(confirmedWorkflow, 60)}") is manual today with no measured baseline.`,
        evidenceRefs: contextRefs,
      },
    ],
    findings,
    competitors: [],
    opportunities: [
      {
        title: `Instrument "${shorten(confirmedWorkflow, 50)}" before automating it`,
        outcome:
          "Measure current handling time, error rate, and ownership for two to three weeks, then automate the highest-confidence manual handoffs first — this proves the fix works before wider rollout.",
        workflow: shorten(confirmedWorkflow, 80),
        type: "automation_opportunity",
        impact: "high",
        effort: "medium",
        integrations: stackNames,
        evidenceRefs: contextRefs,
      },
    ],
    socialGrowth: socialProfileEvidence.map((item) => ({
      platform: (item.title ?? "Social profile").replace(/\s*profile$/i, ""),
      finding: item.excerpt
        ? `Public profile content was reviewed directly: "${shorten(item.excerpt, 100)}"`
        : "Profile was not publicly readable without login — reviewed via public mentions only.",
      recommendation:
        "Confirm posting cadence and response times manually, then decide if a content/response workflow is worth automating.",
      evidenceRefs: [item.evidenceKey],
    })),
    recommendedServices: [
      {
        problem: `"${shorten(confirmedWorkflow, 60)}" is handled manually with no measured baseline.`,
        service: "AI Automation & Workflow",
        techStack: stackNames.length ? stackNames.slice(0, 3) : ["n8n", "Make"],
        estimatedScope: "Map the workflow, instrument a baseline, then automate the highest-confidence manual handoffs.",
        estimatedTimelineWeeks: 4,
        ctaLabel: "Build This With TechTivAI",
      },
    ],
    currentTechStack: computeCurrentTechStack(evidence),
    stackArchitecture: stackNames.length
      ? [
          {
            layer: "Existing stack",
            recommendation: `Connect ${stackNames.slice(0, 3).join(", ")} through a workflow automation layer instead of replacing them`,
            reason: "These tools were detected live on your site and already handle part of the process — automation should sit on top of them, not replace them.",
            evidenceRefs: technicalRefs,
          },
        ]
      : [],
    roadmap: [
      {
        phase: "Measure",
        objective: `Establish a real baseline for "${shorten(confirmedWorkflow, 50)}" — current volume, handling time, and error rate.`,
        deliverables: ["Workflow map", "Measurement baseline", "Data-access check"],
        dependencies: [],
        estimatedWeeks: 2,
      },
      {
        phase: "Automate",
        objective: "Automate the highest-confidence manual handoffs identified in the baseline, with human review on exceptions.",
        deliverables: ["Pilot automation", "Exception queue", "Outcome dashboard"],
        dependencies: ["Measured baseline"],
        estimatedWeeks: 3,
      },
    ],
    risks: [
      "This report was assembled directly from collected evidence because the AI synthesis step did not complete in time — some nuance a full analysis would catch may be missing.",
      "Handling time, error rate, and process ownership are not yet measured, so scope could shift once real numbers are in.",
    ],
    assumptions: [
      "The confirmed workflow described in the consultation is representative of the actual day-to-day process.",
    ],
    unknowns: [
      ...coverage.missing.map((item) => `Missing source coverage: ${item}`),
      "Current handling time, error rate, and workflow ownership",
    ],
    confidence: {
      level: "low",
      rationale:
        "The AI synthesis step did not return a valid response after retries, so this report was assembled directly from the raw evidence and consultation answers instead.",
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
      const grounded = groundSynthesis(synthesisSchema.parse(parsed), evidence);
      return { ...grounded, currentTechStack: computeCurrentTechStack(evidence) };
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
