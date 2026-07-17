import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        domain: true,
        status: true,
        errorMsg: true,
        createdAt: true,
        completedAt: true,
        guestAccessToken: true,
        emailCapturedAt: true,
        proposal: {
          select: {
            id: true,
            status: true,
            pdfUrl: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json({
      analysisId: analysis.id,
      domain: analysis.domain,
      status: analysis.status,
      errorMsg: analysis.errorMsg,
      createdAt: analysis.createdAt.toISOString(),
      completedAt: analysis.completedAt?.toISOString() ?? null,
      proposalId: analysis.proposal?.id ?? null,
      proposalStatus: analysis.proposal?.status ?? null,
      pdfUrl: analysis.proposal?.pdfUrl ?? null,
      emailCaptured: Boolean(analysis.emailCapturedAt),
    });
  } catch (error) {
    console.error("[api/analysis/[id]] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load analysis status" },
      { status: 500 },
    );
  }
}
