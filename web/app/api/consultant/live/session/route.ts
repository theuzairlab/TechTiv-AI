import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateConsultantSession,
  requireOwnedAnalysis,
} from "@/lib/consultant/access";
import { buildConsultantContext } from "@/lib/consultant/context";
import { createGeminiLiveToken } from "@/lib/consultant/live-token";
import { callProvider } from "@/lib/providers";
import { ProviderDisabledError } from "@/lib/providers/errors";

const schema = z.object({
  analysisId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  }

  const analysis = await requireOwnedAnalysis({
    analysisId: parsed.data.analysisId,
    userId: session.user.id,
    email: session.user.email,
  });
  if (!analysis || analysis.status !== "DONE") {
    return NextResponse.json(
      { error: "A completed blueprint is required for voice." },
      { status: 409 },
    );
  }

  const context = await buildConsultantContext(analysis.id);
  if (!context) {
    return NextResponse.json({ error: "Blueprint context missing" }, { status: 404 });
  }

  const consultantSession = await getOrCreateConsultantSession({
    userId: session.user.id,
    analysisId: analysis.id,
  });

  try {
    const live = await callProvider({
      provider: "gemini",
      endpoint: "authTokens",
      analysisId: analysis.id,
      costEstimateUSD: 0.02,
      creditsOrTokens: 1,
      fn: () => createGeminiLiveToken(),
    });

    const voice = await prisma.voiceSession.create({
      data: {
        consultantSessionId: consultantSession.id,
        userId: session.user.id,
        analysisId: analysis.id,
        provider: "gemini",
        model: live.model,
        status: "LIVE",
      },
    });

    return NextResponse.json({
      voiceSessionId: voice.id,
      token: live.token,
      model: live.model,
      systemInstruction: `${context.systemInstruction}

You are on a live phone call. Follow the caller. Do not jump back to an earlier topic. Do not call tools or search the web. Two short sentences, then wait. If you cannot hear them, ask them to repeat.`,
      clientName: context.clientName,
      domain: context.domain,
    });
  } catch (error) {
    const message =
      error instanceof ProviderDisabledError
        ? "Gemini is disabled. Enable it in Admin → Providers and set GEMINI_API_KEY."
        : error instanceof Error
          ? error.message
          : "Could not start voice session";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
