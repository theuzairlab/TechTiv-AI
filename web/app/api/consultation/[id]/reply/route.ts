import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { enqueueConsultation } from "@/lib/analysis/queue";
import { replyConsultationSchema } from "@/lib/consultation/schema";
import type { Prisma } from "@/lib/generated/prisma/client";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const parsed = replyConsultationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid answer" },
      { status: 400 },
    );
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: { guestAccessToken: true, businessIntake: true },
  });
  if (!analysis) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }
  if (
    !verifyGuestAccess(
      analysis.guestAccessToken,
      parsed.data.guestAccessToken,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const intake =
    analysis.businessIntake &&
    typeof analysis.businessIntake === "object" &&
    !Array.isArray(analysis.businessIntake)
      ? (analysis.businessIntake as Record<string, unknown>)
      : {};

  await prisma.$transaction([
    prisma.analysis.update({
      where: { id },
      data: {
        businessIntake: {
          ...intake,
          [parsed.data.field]:
            parsed.data.field === "goals"
              ? parsed.data.value
                  .split(/,|\n/)
                  .map((item) => item.trim())
                  .filter(Boolean)
              : parsed.data.value,
        } as Prisma.InputJsonValue,
      },
    }),
    prisma.consultationMessage.create({
      data: {
        analysisId: id,
        role: "user",
        content: parsed.data.value,
        inputJson: {
          field: parsed.data.field,
          value: parsed.data.value,
        },
      },
    }),
  ]);

  await enqueueConsultation(id);
  return NextResponse.json({ accepted: true });
}
