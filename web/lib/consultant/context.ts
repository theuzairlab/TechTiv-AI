import { asReportV2 } from "@/lib/report-v2/types";
import { prisma } from "@/lib/prisma";

function clip(value: string, max: number) {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

export async function buildConsultantContext(analysisId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      lead: { select: { name: true, company: true, email: true } },
      proposal: { select: { reportJson: true, narrativeText: true } },
      consultation: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
        take: 12,
      },
    },
  });

  if (!analysis) return null;

  const report = asReportV2(analysis.proposal?.reportJson);
  const findings = (report?.findings ?? [])
    .slice(0, 6)
    .map((item) => `- ${item.title}: ${item.summary}`)
    .join("\n");
  const opportunities = (report?.opportunities ?? [])
    .slice(0, 8)
    .map((item) => `- [${item.type}] ${item.title} — ${item.outcome}`)
    .join("\n");
  const services = (report?.recommendedServices ?? [])
    .slice(0, 5)
    .map(
      (item) =>
        `- ${item.service}: ${item.problem} (${item.estimatedTimelineWeeks} weeks)`,
    )
    .join("\n");
  const stack = (report?.currentTechStack ?? [])
    .slice(0, 8)
    .map((item) => `- ${item.category}: ${item.tool}`)
    .join("\n");
  const intake = analysis.consultation
    .map((item) => `${item.role}: ${clip(item.content, 280)}`)
    .join("\n");

  const systemInstruction = `You are TivAI, a senior TechTivAI consultant on a call with ${analysis.lead.name} about ${analysis.domain}${analysis.lead.company ? ` (${analysis.lead.company})` : ""}.

How you work:
- Read the blueprint first. Use it. Do not dump it.
- Answer in 2–4 short sentences. One idea. Then stop.
- Sound like a sharp consultant: specific, useful, no filler, no recap of what they just said.
- Ask at most one question, and only if you need a decision.
- Casual chat (“what’s up”, “how are you”) gets one brief human line, then one practical next step. Do not pitch the whole report.
- Never list a menu of options unless they ask. Never stack “should we also… and maybe… and what’s most practical”.
- Do not invent metrics or vendor pricing.

Research (only when they need live/external facts):
- research_web — Tavily
- research_google — SerpAPI
- fetch_page — Firecrawl
- deep_research — Tavily + SerpAPI
After tools, answer briefly and cite titles/URLs. If research fails, say so and use the blueprint.

Blueprint (your notes — do not read this back):
Executive summary:
${clip(report?.executiveSummary ?? analysis.proposal?.narrativeText ?? "Report still loading.", 500)}

Scorecard: ${(report?.scorecard ?? []).map((item) => `${item.dimension} ${item.score}`).join(", ") || "n/a"}

Problems:
${findings || "None stored"}

Opportunities:
${opportunities || "None stored"}

Current stack:
${stack || "None stored"}

Recommended TechTivAI services:
${services || "None stored"}

Intake conversation (before the report):
${intake || "None stored"}`;

  return {
    domain: analysis.domain,
    clientName: analysis.lead.name,
    systemInstruction,
  };
}
