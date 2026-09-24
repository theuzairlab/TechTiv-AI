import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  voiceSessionId: z.string().min(1),
  transcript: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(4000),
      }),
    )
    .max(80)
    .default([]),
  errorMsg: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const voice = await prisma.voiceSession.findFirst({
    where: { id: parsed.data.voiceSessionId, userId: session.user.id },
  });
  if (!voice) {
    return NextResponse.json({ error: "Voice session not found" }, { status: 404 });
  }
  if (voice.status === "ENDED" || voice.status === "FAILED") {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.voiceSession.update({
      where: { id: voice.id },
      data: {
        status: parsed.data.errorMsg ? "FAILED" : "ENDED",
        endedAt: new Date(),
        errorMsg: parsed.data.errorMsg ?? null,
      },
    }),
    ...parsed.data.transcript.map((item) =>
      prisma.consultantMessage.create({
        data: {
          sessionId: voice.consultantSessionId,
          role: item.role,
          content: item.text,
          modality: "voice",
        },
      }),
    ),
    prisma.consultantSession.update({
      where: { id: voice.consultantSessionId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
