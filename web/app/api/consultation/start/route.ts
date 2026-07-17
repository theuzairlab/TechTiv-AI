import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGuestSession } from "@/lib/analysis/capture-email";
import { resolveAnalysisDomain } from "@/lib/analysis/intake";
import { enqueueConsultation } from "@/lib/analysis/queue";
import { startConsultationSchema } from "@/lib/consultation/schema";

export async function POST(request: Request) {
  try {
    const parsed = startConsultationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid business details" },
        { status: 400 },
      );
    }

    const { companyName, footprint } = parsed.data;
    const { guestAccessToken, pendingEmail } = createGuestSession();
    const isWebsite = !/(facebook|instagram|linkedin|twitter|x|tiktok|youtube)\.com/i.test(
      footprint,
    );
    const socialLinks = isWebsite
      ? { website: footprint }
      : footprint.includes("linkedin")
        ? { linkedin: footprint }
        : footprint.includes("instagram")
          ? { instagram: footprint }
          : footprint.includes("facebook")
            ? { facebook: footprint }
            : footprint.includes("tiktok")
              ? { tiktok: footprint }
              : footprint.includes("youtube")
                ? { youtube: footprint }
                : { twitter: footprint };
    const domain = resolveAnalysisDomain({
      company: companyName,
      businessIntake: { companyName, socialLinks },
    });

    const analysis = await prisma.analysis.create({
      data: {
        domain,
        guestAccessToken,
        socialLinks,
        businessIntake: { companyName, socialLinks },
        lead: {
          create: {
            name: companyName,
            company: companyName,
            email: pendingEmail,
            source: "adaptive_consultation",
          },
        },
        consultation: {
          create: [
            {
              role: "assistant",
              content:
                "I’ll learn how your business works, then research your market and build a practical AI plan.",
            },
            {
              role: "user",
              content: `${companyName} — ${footprint}`,
              inputJson: { companyName, footprint },
            },
          ],
        },
      },
      select: { id: true },
    });

    await enqueueConsultation(analysis.id);
    return NextResponse.json(
      { analysisId: analysis.id, guestAccessToken },
      { status: 201 },
    );
  } catch (error) {
    console.error("[consultation/start]", error);
    return NextResponse.json(
      { error: "Could not start consultation" },
      { status: 500 },
    );
  }
}
