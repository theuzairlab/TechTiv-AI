import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGuestSession } from "@/lib/analysis/capture-email";
import { parseBusinessLinks } from "@/lib/analysis/links";
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

    const { companyName, links, additionalInfo } = parsed.data;
    const { website, socialLinks, raw } = parseBusinessLinks(links);

    if (!website && Object.keys(socialLinks).length === 0) {
      return NextResponse.json(
        {
          error:
            "Enter a website domain and/or at least one social profile link",
        },
        { status: 400 },
      );
    }

    const resolvedSocialLinks = {
      ...socialLinks,
      ...(website ? { website } : {}),
    };

    const { guestAccessToken, pendingEmail } = createGuestSession();

    const domain = resolveAnalysisDomain({
      company: companyName,
      businessIntake: { companyName, socialLinks: resolvedSocialLinks },
    });

    const trimmedInfo = additionalInfo?.trim();
    const openingUserMessage = [
      `${companyName} — ${raw.join(", ")}`,
      trimmedInfo ? `Additional context: ${trimmedInfo}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const analysis = await prisma.analysis.create({
      data: {
        domain,
        guestAccessToken,
        socialLinks: resolvedSocialLinks,
        businessIntake: {
          companyName,
          socialLinks: resolvedSocialLinks,
          additionalNotes: trimmedInfo || undefined,
        },
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
                "I’ll research your business first, then ask only what matters before building your plan.",
            },
            {
              role: "user",
              content: openingUserMessage,
              inputJson: {
                companyName,
                links: raw,
                additionalInfo: trimmedInfo || null,
              },
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
