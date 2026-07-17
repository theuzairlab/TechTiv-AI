import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createClaudeMessage } from "../providers/claude.js";

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

function fallbackReply(turns: number, answered = new Set<string>()): Reply {
  const fallbacks: Reply[] = [
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

export async function runConsultationTurn(analysisId: string): Promise<void> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      consultation: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!analysis) throw new Error(`Analysis not found: ${analysisId}`);

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

  let reply: Reply;
  try {
    const response = await createClaudeMessage({
      analysisId,
      endpoint: "messages/consultation",
      system: `You are TechTivAI's concise AI business consultant.
Ask exactly one useful follow-up question at a time.
Use the known business context and transcript. Do not repeat answered questions.
Prioritize actual workflows, current tools, volumes, pain points, goals, constraints, and competitors.
After 4-6 useful user answers, set complete=true and invite the user to start research.
Use single_choice when exactly one answer is allowed.
Use multi_choice only when several answers can be true at once.
For choice questions provide 2-6 distinct options. For text inputs omit options.
Return ONLY JSON:
{"message":"short question or completion message","field":"industry|location|goals|currentTools|workflow|painPoints|volumes|constraints|competitors","inputType":"text|textarea|single_choice|multi_choice","options":["optional"],"complete":false}`,
      user: JSON.stringify({
        businessIntake: analysis.businessIntake,
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
      reply = fallbackReply(userTurns, answeredFields);
    }
  } catch (error) {
    console.warn("[consultation] Claude fallback:", error);
    reply = fallbackReply(userTurns, answeredFields);
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
