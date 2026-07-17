import { NextResponse } from "next/server";
import {
  analysisReadyRequestSchema,
  isInternalApiAuthorized,
  notifyAnalysisReady,
} from "@/lib/email/notify-analysis-ready";

export async function POST(request: Request) {
  if (!isInternalApiAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = analysisReadyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await notifyAnalysisReady(parsed.data.analysisId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send analysis-ready email";
    console.error("[analysis-ready]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
