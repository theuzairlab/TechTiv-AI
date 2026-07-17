import { NextResponse } from "next/server";
import { z } from "zod";
import { retryFailedAnalysisAsGuest } from "@/lib/analysis/retry";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const bodySchema = z.object({
  guestAccessToken: z.string().uuid(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: "guestAccessToken is required" },
        { status: 400 },
      );
    }

    const result = await retryFailedAnalysisAsGuest(
      id,
      parsed.data.guestAccessToken,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retry analysis";
    const status =
      message === "Analysis not found"
        ? 404
        : message === "Invalid guest access token"
          ? 403
          : message === "Only failed analyses can be retried"
            ? 400
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
