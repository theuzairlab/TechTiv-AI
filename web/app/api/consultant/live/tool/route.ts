import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { runConsultantTool } from "@/lib/consultant/research";

const schema = z.object({
  voiceSessionId: z.string().min(1),
  name: z.string().min(1),
  args: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tool call" }, { status: 400 });
  }

  const voice = await prisma.voiceSession.findFirst({
    where: { id: parsed.data.voiceSessionId, userId: session.user.id },
    select: { analysisId: true, consultantSessionId: true },
  });
  if (!voice) {
    return NextResponse.json({ error: "Voice session not found" }, { status: 404 });
  }

  const result = await runConsultantTool({
    analysisId: voice.analysisId,
    name: parsed.data.name,
    args: parsed.data.args,
  });

  await prisma.consultantMessage.create({
    data: {
      sessionId: voice.consultantSessionId,
      role: "tool",
      content: result.ok
        ? `Voice research: ${result.query}`
        : `Voice research failed: ${result.query}`,
      modality: "voice",
      toolName: result.toolName,
      toolPayload: result.data as object,
    },
  });

  return NextResponse.json({
    ok: result.ok,
    result: result.data,
    query: result.query,
    tool: result.toolName,
  });
}
