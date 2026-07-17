import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { enqueueAnalysis } from "@/lib/analysis/queue";
import { consultationAccessSchema } from "@/lib/consultation/schema";
import { writeAnalysisActivity } from "@/lib/analysis/activities";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const parsed = consultationAccessSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: {
      guestAccessToken: true,
      domain: true,
      businessIntake: true,
    },
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

  await prisma.analyzedDomain.upsert({
    where: { normalizedDomain: analysis.domain },
    create: {
      normalizedDomain: analysis.domain,
      status: "PROCESSING",
      lastAnalysisId: id,
    },
    update: {
      status: "PROCESSING",
      lastAnalysisId: id,
      completedAt: null,
    },
  });
  await writeAnalysisActivity({
    analysisId: id,
    kind: "status",
    message: "Brief confirmed — starting evidence collection.",
  });
  const jobId = await enqueueAnalysis(id);
  return NextResponse.json({ analysisId: id, jobId });
}
