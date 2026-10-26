import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPendingGuestEmail, verifyGuestAccess } from "@/lib/analysis/guest";
import { enqueueAnalysis } from "@/lib/analysis/queue";
import { consultationAccessSchema } from "@/lib/consultation/schema";
import { writeAnalysisActivity } from "@/lib/analysis/activities";
import { consumeCredit, releaseCredit } from "@/lib/billing/gate";
import { prepareResearchGate } from "@/lib/consultation/research-gate";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const parsed = consultationAccessSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: { guestAccessToken: true, domain: true, leadId: true },
  });
  if (!analysis) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }
  if (
    !verifyGuestAccess(analysis.guestAccessToken, parsed.data.guestAccessToken)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (parsed.data.email) {
    const lead = await prisma.lead.findUnique({
      where: { id: analysis.leadId },
      select: { email: true },
    });
    if (lead && isPendingGuestEmail(lead.email)) {
      await prisma.lead.update({
        where: { id: analysis.leadId },
        data: { email: parsed.data.email.trim().toLowerCase() },
      });
      await prisma.analysis.update({
        where: { id },
        data: { emailCapturedAt: new Date() },
      });
    }
  }

  const prepared = await prepareResearchGate(id);
  if (!prepared) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }

  const body = {
    existingPublicReport: prepared.existingPublicReport,
  };

  if (prepared.gate.status === "email_required") {
    return NextResponse.json({ status: "email_required", ...body });
  }
  if (prepared.gate.status === "payment_required") {
    return NextResponse.json({
      status: "payment_required",
      email: prepared.gate.email,
      ...body,
    });
  }
  if (prepared.gate.status === "use_credit") {
    const claimed = await consumeCredit(prepared.gate.paymentId, id);
    if (!claimed) {
      return NextResponse.json({
        status: "payment_required",
        email: prepared.email,
        ...body,
      });
    }
    try {
      return await startResearch(id, analysis.domain);
    } catch (error) {
      await releaseCredit(prepared.gate.paymentId);
      console.error("[consultation/confirm]", error);
      return NextResponse.json(
        {
          error:
            "The research worker is not available right now. Try again in a moment.",
        },
        { status: 503 },
      );
    }
  }

  try {
    return await startResearch(id, analysis.domain);
  } catch (error) {
    console.error("[consultation/confirm]", error);
    return NextResponse.json(
      {
        error:
          "The research worker is not available right now. Try again in a moment.",
      },
      { status: 503 },
    );
  }
}

async function startResearch(id: string, domain: string) {
  await prisma.analyzedDomain.upsert({
    where: { normalizedDomain: domain },
    create: {
      normalizedDomain: domain,
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
  return NextResponse.json({ status: "queued", analysisId: id, jobId });
}
