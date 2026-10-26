import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { consultationAccessSchema } from "@/lib/consultation/schema";
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
    select: { guestAccessToken: true },
  });
  if (!analysis) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }
  if (!verifyGuestAccess(analysis.guestAccessToken, parsed.data.guestAccessToken)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const prepared = await prepareResearchGate(id);
  if (!prepared) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }

  if (prepared.gate.status === "payment_required") {
    return NextResponse.json({
      status: "payment_required",
      email: prepared.gate.email,
      existingPublicReport: prepared.existingPublicReport,
    });
  }
  if (prepared.gate.status === "email_required") {
    return NextResponse.json({
      status: "email_required",
      existingPublicReport: prepared.existingPublicReport,
    });
  }
  if (prepared.gate.status === "use_credit") {
    return NextResponse.json({
      status: "paid",
      existingPublicReport: prepared.existingPublicReport,
    });
  }

  return NextResponse.json({
    status: "allow",
    existingPublicReport: prepared.existingPublicReport,
  });
}
