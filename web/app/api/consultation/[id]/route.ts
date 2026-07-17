import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGuestAccess } from "@/lib/analysis/guest";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token");
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: {
      guestAccessToken: true,
      businessIntake: true,
      consultation: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          inputJson: true,
          createdAt: true,
        },
      },
    },
  });
  if (!analysis) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }
  if (!verifyGuestAccess(analysis.guestAccessToken, token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    messages: analysis.consultation.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
    businessIntake: analysis.businessIntake,
  });
}
