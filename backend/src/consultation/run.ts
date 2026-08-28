import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createClaudeMessage } from "../providers/claude.js";
import { buildSiteBrief } from "./site-brief.js";
import {
  mergeSocialLinks,
  parseBusinessIntake,
  parseSocialLinks,
} from "../pipeline/intake.js";
import type { Prisma } from "../generated/prisma/client.js";

const replySchema = z.object({
  message: z.string().min(1),
  field: z.enum([
    "industry",
    "location",
    "goals",
    "currentTools",
    "workflow",
    "painPoints",
    "volumes",
    "constraints",
    "competitors",
  ]),
  inputType: z.enum([
    "text",
    "textarea",
    "single_choice",
    "multi_choice",
  ]),
  options: z.array(z.string()).max(6).optional(),
  complete: z.boolean(),
});

type Reply = z.infer<typeof replySchema>;

function fallbackReply(
  turns: number,
  answered: Set<string>,
  hasGroundedBusinessContext: boolean,
): Reply {
  const fallbacks: Reply[] = [
    ...(hasGroundedBusinessContext
      ? []
      : [
          {
            message:
              "In your own words, what does the business do and who are your customers?",
            field: "industry" as const,
            inputType: "textarea" as const,
            complete: false,
          },
        ]),
    {
      message: "What is the main result you want AI to create for your business?",
      field: "goals",
      inputType: "textarea",
      complete: false,
    },
    {
      message: "Which process currently consumes the most manual time?",
      field: "workflow",
      inputType: "textarea",
      complete: false,
    },
    {
      message: "What tools or systems does your team use today?",
      field: "currentTools",
      inputType: "text",
      complete: false,
    },
    {
      message: "Roughly how many leads, requests, or transactions do you handle each month?",
      field: "volumes",
      inputType: "text",
      complete: false,
    },
    {
      message: "I have enough context. Review the brief below, then start the research.",
      field: "constraints",
      inputType: "text",
      complete: true,
    },
  ];
  return (
    fallbacks.find((item) => !item.complete && !answered.has(item.field)) ??
    fallbacks[Math.min(turns, fallbacks.length - 1)]!
  );
}

function hasAskedQuestion(
  consultation: Array<{ role: string; inputJson: unknown }>,
): boolean {
  return consultation.some(
    (message) =>
      message.role === "assistant" &&
      message.inputJson &&
      typeof message.inputJson === "object" &&
      !Array.isArray(message.inputJson) &&
      "field" in (message.inputJson as Record<string, unknown>),
  );
}

export async function runConsultationTurn(analysisId: string): Promise<void> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      consultation: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!analysis) throw new Error(`Analysis not found: ${analysisId}`);

  let intake = parseBusinessIntake(analysis.businessIntake);

  // Ground the very first question in what the business actually is before
  // asking anything, instead of letting Claude guess industry from the name.
  if (!hasAskedQuestion(analysis.consultation) && !intake?.siteBrief) {
    try {
      const socialLinks = mergeSocialLinks(
        parseSocialLinks(analysis.socialLinks),
        intake?.socialLinks ?? {},
      );
      const siteBrief = await buildSiteBrief({
        analysisId,
        domain: analysis.domain,
        socialLinks,
        additionalNotes: intake?.additionalNotes,
      });
      if (siteBrief) {
        const updatedIntake = { ...(intake ?? {}), siteBrief };
        await prisma.analysis.update({
          where: { id: analysisId },
          data: { businessIntake: updatedIntake as Prisma.InputJsonValue },
        });
        intake = updatedIntake;
      }
    } catch (error) {
      console.warn("[consultation] site brief build failed:", error);
    }
  }

  const userTurns = analysis.consultation.filter((m) => m.role === "user").length;
  const transcript = analysis.consultation.map((message) => ({
    role: message.role,
    content: message.content,
    data: message.inputJson,
  }));
  const answeredFields = new Set(
    analysis.consultation.flatMap((message) => {
      const data = message.inputJson;
      if (
        message.role !== "user" ||
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        !("field" in data)
      ) {
        return [];
      }
      return [String((data as { field?: unknown }).field ?? "")];
    }),
  );

  const groundedIndustry =
    intake?.siteBrief && intake.siteBrief.industry !== "unknown"
      ? intake.siteBrief.industry
      : undefined;

  let reply: Reply;
  try {
    const response = await createClaudeMessage({
      analysisId,
      endpoint: "messages/consultation",
      system: `You are TechTivAI's senior business consultant, running a discovery call like a real agency would — not a generic questionnaire.
The business has already been researched before this call. Known context is in "businessIntake.siteBrief" (from the real website/social content) — treat it as ground truth.
Never ask what industry the business is in, what it does, or who its customers are if siteBrief.industry is not "unknown" — that is already confirmed.
Ask exactly one useful follow-up question at a time. Only ask about things NOT already covered by siteBrief or the transcript:
- real day-to-day problems or pain points specific to this business
- concrete goals or outcomes they want AI/automation to achieve
- current tools and where the workflow actually breaks down
- team size, volume, or constraints relevant to scoping
- named competitors they specifically worry about, if not already evident
Never invent generic industry-classification multiple-choice options. If siteBrief is missing or its industry is "unknown", ask one open-ended text question first to understand what the business actually does — do not guess from the company name.
Use single_choice when exactly one answer is allowed. Use multi_choice only when several answers can be true at once. For choice questions provide 2-6 distinct, specific options grounded in the business context — never generic placeholders. For text inputs omit options.
After 3-5 useful user answers (fewer than before, since research already happened), set complete=true and invite the user to start research.
Return ONLY JSON:
{"message":"short question or completion message","field":"industry|location|goals|currentTools|workflow|painPoints|volumes|constraints|competitors","inputType":"text|textarea|single_choice|multi_choice","options":["optional"],"complete":false}`,
      user: JSON.stringify({
        businessIntake: intake,
        socialLinks: analysis.socialLinks,
        transcript,
        userTurns,
      }),
    });
    const first = response.text.indexOf("{");
    const last = response.text.lastIndexOf("}");
    reply = replySchema.parse(
      JSON.parse(response.text.slice(first, last + 1)),
    );
    if (!reply.complete && answeredFields.has(reply.field)) {
      reply = fallbackReply(userTurns, answeredFields, Boolean(groundedIndustry));
    }
  } catch (error) {
    console.warn("[consultation] Claude fallback:", error);
    reply = fallbackReply(userTurns, answeredFields, Boolean(groundedIndustry));
  }

  await prisma.consultationMessage.create({
    data: {
      analysisId,
      role: "assistant",
      content: reply.message,
      inputJson: reply,
    },
  });
}
