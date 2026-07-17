import { NextResponse } from "next/server";
import { listAnalysisActivities } from "@/lib/analysis/activities";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const after = url.searchParams.get("after") ?? undefined;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: { guestAccessToken: true },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (!verifyGuestAccess(analysis.guestAccessToken, token)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activities = await listAnalysisActivities(id, { after, limit: 100 });
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("[api/analysis/[id]/activities] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load activities" },
      { status: 500 },
    );
  }
}
