import { prisma } from "../../lib/prisma.js";
import { calculateCoverage } from "../../synthesis/coverage.js";
import { persistSynthesisProposal } from "../../synthesis/persist-proposal.js";
import type { SynthesisResult } from "../../synthesis/schema.js";
import { synthesizeFromSignals } from "../../synthesis/synthesize.js";
import { logInsight, logStepStart, logThink } from "../context.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import type { PipelineContext } from "../types.js";
import { updateAnalysisStatus, writeRawSignal } from "../update-status.js";
import { recordEvidence } from "../evidence.js";
import type { Prisma } from "../../generated/prisma/client.js";

const REF = "stub-evidence";
const STUB_SYNTHESIS: SynthesisResult = {
  businessProfile: {
    summary: "A growing SaaS business with repeatable sales and support workflows.",
    industry: "saas",
    teamSize: "small",
    operatingModel: "Digital-first recurring revenue",
  },
  executiveSummary:
    "The strongest near-term opportunity is to connect lead capture, qualification, and follow-up before adding broader AI automation.",
  scorecard: [
    { dimension: "Operations", score: 58, rationale: "Manual handoffs remain.", evidenceRefs: [REF] },
    { dimension: "Growth", score: 64, rationale: "Demand exists but follow-up is inconsistent.", evidenceRefs: [REF] },
    { dimension: "Technology", score: 70, rationale: "The stack can support integrations.", evidenceRefs: [REF] },
  ],
  findings: [
    { title: "Slow lead handoff", category: "sales", severity: "high", summary: "Lead routing is not consistently automated.", evidenceRefs: [REF] },
    { title: "Thin proof content", category: "trust", severity: "medium", summary: "Case-study evidence is limited.", evidenceRefs: [REF] },
  ],
  competitors: [],
  opportunities: [
    {
      title: "Lead response system",
      outcome: "Faster, measurable lead follow-up",
      workflow: "Lead capture and qualification",
      type: "automation_opportunity",
      impact: "high",
      effort: "medium",
      integrations: ["CRM", "Email"],
      evidenceRefs: [REF],
    },
  ],
  stackArchitecture: [
    { layer: "CRM", recommendation: "HubSpot", reason: "Central workflow record", evidenceRefs: [REF] },
  ],
  socialGrowth: [],
  recommendedServices: [
    {
      problem: "Lead routing is not consistently automated.",
      service: "AI Automation & Workflow",
      techStack: ["HubSpot", "n8n"],
      estimatedScope: "Automate lead capture, qualification, and routing into the CRM.",
      estimatedTimelineWeeks: 4,
      ctaLabel: "Build This With TechTivAI",
    },
  ],
  currentTechStack: [
    { category: "CRM", tool: "HubSpot", notes: "Detected live on the current website." },
  ],
  roadmap: [
    { phase: "Foundation", objective: "Instrument the funnel", deliverables: ["CRM lifecycle", "Measurement baseline"], dependencies: [], estimatedWeeks: 2 },
    { phase: "Automation", objective: "Automate lead response", deliverables: ["Routing", "Follow-up"], dependencies: ["Foundation"], estimatedWeeks: 3 },
  ],
  risks: ["Poor CRM data quality"],
  assumptions: ["Team can assign a workflow owner"],
  unknowns: ["Monthly qualified lead volume"],
  confidence: { level: "medium", rationale: "Stub fixture has intentionally limited evidence." },
};

export async function runSynthesizeStep(ctx: PipelineContext): Promise<void> {
  await updateAnalysisStatus(ctx.analysisId, "SYNTHESIZING");
  await logStepStart(
    ctx,
    "synthesize",
    "Building an evidence-grounded decision report…",
  );
  await logThink(
    ctx,
    "Checking source coverage and linking every material conclusion to evidence.",
  );

  if (PIPELINE_USE_STUBS) {
    await prisma.analysisEvidence.upsert({
      where: {
        runId_evidenceKey: { runId: ctx.runId, evidenceKey: REF },
      },
      create: {
        runId: ctx.runId,
        evidenceKey: REF,
        provider: "fixture",
        sourceType: "business_discovery",
        excerpt: "Stub evidence for pipeline verification.",
        entityConfidence: 1,
      },
      update: {},
    });
  }

  const consultation = await prisma.consultationMessage.findMany({
    where: { analysisId: ctx.analysisId },
    orderBy: { createdAt: "asc" },
  });
  await recordEvidence(
    ctx,
    consultation
      .filter((message) => message.role === "user")
      .map((message) => ({
        provider: "consultation",
        sourceType: "confirmed_business_context",
        title:
          message.inputJson &&
          typeof message.inputJson === "object" &&
          !Array.isArray(message.inputJson) &&
          "field" in message.inputJson
            ? String(
                (message.inputJson as { field?: unknown }).field ??
                  "business context",
              )
            : "business context",
        excerpt: message.content,
        value: (message.inputJson ?? {
          content: message.content,
        }) as Prisma.InputJsonValue,
        entityConfidence: 1,
      })),
  );
  const evidence = await prisma.analysisEvidence.findMany({
    where: { runId: ctx.runId },
    orderBy: { capturedAt: "asc" },
  });
  const coverage = calculateCoverage(evidence, consultation.length > 0);
  await prisma.analysisRun.update({
    where: { id: ctx.runId },
    data: { coverageJson: coverage },
  });

  const synthesis = PIPELINE_USE_STUBS
    ? STUB_SYNTHESIS
    : await synthesizeFromSignals(ctx, evidence, consultation, coverage);

  await persistSynthesisProposal(ctx, synthesis, coverage);
  await writeRawSignal(
    ctx.analysisId,
    "synthesis-v2",
    { coverage, report: synthesis },
    ctx.runId,
  );
  await logInsight(
    ctx,
    coverage.status === "complete"
      ? "Evidence checks passed — the decision report is grounded and ready for scope modeling."
      : `A ${coverage.status} report is ready; missing coverage is disclosed in the report.`,
  );
}
