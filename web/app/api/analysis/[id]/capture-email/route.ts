import { NextResponse } from "next/server";
import { captureEmailSchema } from "@/lib/analysis/schema";
import { captureAnalysisEmail } from "@/lib/analysis/capture-email";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = captureEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const result = await captureAnalysisEmail(id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to capture email";
    const status =
      message === "Analysis not found"
        ? 404
        : message === "Invalid guest access token"
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
