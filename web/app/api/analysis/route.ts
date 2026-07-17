import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createAnalysisSchema,
  mapSubmissionError,
  submitAnalysis,
} from "@/lib/analysis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const session = await getSession();
    const result = await submitAnalysis(parsed.data, {
      userId: session?.user.id ?? null,
    });

    if (result.status === "rate_limited") {
      return NextResponse.json(result, { status: 429 });
    }

    if (result.status === "queued") {
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[api/analysis] POST failed:", error);
    const mapped = mapSubmissionError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
