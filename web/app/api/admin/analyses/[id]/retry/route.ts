import { NextResponse } from "next/server";
import { retryFailedAnalysis } from "@/lib/admin/analyses";
import { requireAdminApi } from "@/lib/leads-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const result = await retryFailedAnalysis(id, auth.session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retry analysis";
    const status = message === "Analysis not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
