import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { requireOwnedAnalysis } from "@/lib/consultant/access";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analysisId = new URL(request.url).searchParams.get("analysisId");
  if (!analysisId) {
    return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  }

  const analysis = await requireOwnedAnalysis({
    analysisId,
    userId: session.user.id,
    email: session.user.email,
  });
  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const consultantSession = await prisma.consultantSession.findUnique({
    where: {
      userId_analysisId: {
        userId: session.user.id,
        analysisId,
      },
    },
    select: { id: true },
  });

  if (!consultantSession) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await prisma.consultantMessage.findMany({
    where: {
      sessionId: consultantSession.id,
      role: { in: ["user", "assistant", "tool"] },
    },
    orderBy: { createdAt: "asc" },
    take: 80,
  });

  return NextResponse.json({
    messages: messages.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      modality: row.modality,
      toolName: row.toolName,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
