import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateConsultantSession,
  requireOwnedAnalysis,
} from "@/lib/consultant/access";
import { buildConsultantContext } from "@/lib/consultant/context";
import { runConsultantChat } from "@/lib/consultant/gemini-chat";
import { ProviderDisabledError } from "@/lib/providers/errors";

const schema = z.object({
  analysisId: z.string().min(1),
  message: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const analysis = await requireOwnedAnalysis({
    analysisId: parsed.data.analysisId,
    userId: session.user.id,
    email: session.user.email,
  });
  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }
  if (analysis.status !== "DONE") {
    return NextResponse.json(
      { error: "Finish the blueprint before chatting with the consultant." },
      { status: 409 },
    );
  }

  const context = await buildConsultantContext(analysis.id);
  if (!context) {
    return NextResponse.json({ error: "Blueprint context missing" }, { status: 404 });
  }

  const consultantSession = await getOrCreateConsultantSession({
    userId: session.user.id,
    analysisId: analysis.id,
  });

  const historyRows = await prisma.consultantMessage.findMany({
    where: { sessionId: consultantSession.id, role: { in: ["user", "assistant"] } },
    orderBy: { createdAt: "asc" },
    take: 30,
  });
  const history = historyRows.map((row) => ({
    role: row.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: row.content,
  }));

  await prisma.consultantMessage.create({
    data: {
      sessionId: consultantSession.id,
      role: "user",
      content: parsed.data.message,
      modality: "text",
    },
  });

  try {
    const { reply, research } = await runConsultantChat({
      analysisId: analysis.id,
      systemInstruction: context.systemInstruction,
      history,
      userMessage: parsed.data.message,
    });

    for (const item of research) {
      await prisma.consultantMessage.create({
        data: {
          sessionId: consultantSession.id,
          role: "tool",
          content: item.ok ? `Researched: ${item.query}` : `Research failed: ${item.query}`,
          modality: "text",
          toolName: item.toolName,
          toolPayload: item.data as object,
        },
      });
    }

    const assistant = await prisma.consultantMessage.create({
      data: {
        sessionId: consultantSession.id,
        role: "assistant",
        content: reply,
        modality: "text",
      },
    });

    await prisma.consultantSession.update({
      where: { id: consultantSession.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      reply: assistant.content,
      research: research.map((item) => ({
        tool: item.toolName,
        query: item.query,
        ok: item.ok,
      })),
    });
  } catch (error) {
    const message =
      error instanceof ProviderDisabledError
        ? "Gemini is disabled. Enable it in Admin → Providers and set GEMINI_API_KEY."
        : error instanceof Error
          ? error.message
          : "Consultant is unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
