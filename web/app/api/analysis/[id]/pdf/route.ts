import { NextResponse } from "next/server";
import { buildProposalPdf } from "@/lib/dashboard/build-pdf";
import { getAnalysisForUser } from "@/lib/dashboard/analyses";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const detail = await getAnalysisForUser(
      id,
      session.user.id,
      session.user.email,
    );

    if (!detail) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (detail.status !== "DONE" || !detail.proposal) {
      return NextResponse.json(
        { error: "Proposal PDF is not ready yet" },
        { status: 409 },
      );
    }

    const bytes = await buildProposalPdf(detail);
    const filename = `techtivai-${detail.domain.replace(/[^a-z0-9.-]/gi, "_")}.pdf`;

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[api/analysis/[id]/pdf] failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
