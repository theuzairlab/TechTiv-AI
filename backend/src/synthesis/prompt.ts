import type {
  AnalysisEvidence,
  ConsultationMessage,
} from "../generated/prisma/client.js";
import {
  companyLabel,
  formatLocation,
  parseBusinessIntake,
  parseSocialLinks,
} from "../pipeline/intake.js";
import type { PipelineContext } from "../pipeline/types.js";
import type { CoverageSummary } from "./coverage.js";
import { synthesisJsonSchemaForPrompt } from "./schema.js";

function evidenceBundle(evidence: AnalysisEvidence[]) {
  const grouped = new Map<string, unknown[]>();
  for (const item of evidence) {
    const list = grouped.get(item.provider) ?? [];
    list.push({
      id: item.evidenceKey,
      type: item.sourceType,
      title: item.title,
      url: item.url,
      query: item.query,
      excerpt: item.excerpt?.slice(0, 900),
      metric: item.metricPath,
      value: item.valueJson,
      entityConfidence: item.entityConfidence,
    });
    grouped.set(item.provider, list.slice(0, 16));
  }
  return Object.fromEntries(grouped);
}

export function buildSynthesisPrompt(
  evidence: AnalysisEvidence[],
  consultation: ConsultationMessage[],
  coverage: CoverageSummary,
  ctx: PipelineContext,
): { system: string; user: string } {
  const intake = parseBusinessIntake(ctx.businessIntake);
  const label = companyLabel(intake, ctx.domain);

  const system = `You are a senior business consultant at TechTivAI writing a report a business owner will actually read and act on.
Ground every score, finding, competitor, and opportunity in the supplied evidence and confirmed consultation context — cite exact evidence IDs internally via evidenceRefs, but this is for internal grounding only, never for the reader.
Write every "title" and "summary" in findings, and every "title" and "outcome" in opportunities, as plain, direct statements a non-technical business owner would immediately understand — state the real problem clearly (what is happening and why it hurts the business), then the concrete solution (what to build and what changes). Avoid hedging language, jargon like "evidence coverage" or "grounding", and vague generalities.
Do not treat Google People Also Ask as proof of AI citation visibility; call it an answer-readiness proxy internally, but phrase the actual finding in plain terms (e.g. "customers can't easily get a straight answer about X from search or AI assistants").
Competitors are verified only when evidence shows a strong entity/category match.
Put unsupported possibilities in assumptions or unknowns, never as facts.
Do not generate prices, commercial amounts, savings amounts, ROI, or final delivery duration — a separate deterministic engine computes those.
For each roadmap phase, set "estimatedWeeks" to a realistic duration based on the complexity and dependencies of that phase's deliverables (simple phases: 1-2 weeks, moderate: 3-4 weeks, complex/dependent phases: 5+ weeks) — this drives the client-facing timeline, so be specific and realistic rather than defaulting to the same number every time.

Every item in "opportunities" must be tagged with a "type" so the report can group recommendations the way TechTivAI sells them:
- "ai_opportunity": a general AI capability (AI-assisted decisions, content, analytics) not covered by the categories below.
- "automation_opportunity": workflow/process automation connecting existing tools (no new AI agent or chat surface).
- "ai_agent": an autonomous or semi-autonomous AI agent that performs multi-step work (e.g. an AI sales/ops/support agent).
- "chatbot_voice_ai": a chatbot or voice AI surface for customer/lead interaction (text or phone).
- "web_app_development": a new or rebuilt website, web app, dashboard, or customer portal.
Only use types that are actually justified by evidence — do not force every type to appear if there is no real opportunity in that category; it is fine for some types to be absent from "opportunities" entirely.

Populate "socialGrowth" only for social platforms that actually have evidence (a profile that was read, or public mentions found) — one entry per platform with a plain-language "finding" (what's actually there or missing) and a concrete "recommendation". If there is no social evidence at all, return an empty array — never invent findings for platforms with no evidence.

Populate "recommendedServices" by mapping the most important findings/opportunities to specific, sellable TechTivAI services. Choose "service" from TechTivAI's actual offerings: "AI Agent Development", "AI Automation & Workflow", "AI Chatbot Development", "AI Voice Receptionist / Voice AI", "AI-Powered Web Development", "AI-Powered Mobile App Development", "AI/ML & Data Solutions", "Custom AI Assistant (RAG/LLM)". Each entry needs: the specific "problem" (plain language, tied to a real finding), the "service" name from that list, a short "techStack" array of concrete tools/technologies TechTivAI would use, "estimatedScope" (one short sentence on what's included), a realistic "estimatedTimelineWeeks", and a "ctaLabel" like "Build This With TechTivAI". Only recommend services that are actually justified by the findings — 2 to 5 entries is typical, do not pad to reach a count.

Do not generate "currentTechStack" — that section is populated separately from measured evidence and is not your responsibility.
Keep prose concise and specific. Return ONLY valid JSON matching:
${synthesisJsonSchemaForPrompt}`;

  const user = JSON.stringify(
    {
      business: {
        company: label,
        domain: ctx.domain,
        industry: intake?.industry,
        location: formatLocation(intake?.location),
        teamSize: intake?.teamSize,
        goals: intake?.goals ?? [],
        socialLinks: {
          ...parseSocialLinks(ctx.socialLinks),
          ...(intake?.socialLinks ?? {}),
        },
        confirmedContext: intake,
      },
      consultation: consultation.map((message) => ({
        role: message.role,
        content: message.content,
        data: message.inputJson,
      })),
      coverage,
      evidenceByProvider: evidenceBundle(evidence),
    },
    null,
    2,
  );

  return { system, user };
}

export function buildSynthesisRetryPrompt(
  previousOutput: string,
  validationError?: string,
): string {
  return `The previous output was invalid. Return one complete JSON object matching the schema.
Use only evidence IDs from the original evidence bundle. No markdown or commentary.
Validation problem:
${validationError?.slice(0, 1800) ?? "The output did not match the schema."}

Previous output:
${previousOutput.slice(0, 3500)}`;
}
