import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const analysisReadyRequestSchema = z.object({
  analysisId: z.string().min(1),
});

export type AnalysisReadyResult = {
  status: "sent" | "skipped";
  email: string;
  analysisId: string;
};

export async function notifyAnalysisReady(
  analysisId: string,
): Promise<AnalysisReadyResult> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      lead: true,
      proposal: {
        select: {
          costEstimateUSD: true,
          timelineWeeks: true,
        },
      },
    },
  });

  if (!analysis) {
    throw new Error(`Analysis not found: ${analysisId}`);
  }

  if (!["GENERATING_PDF", "DONE"].includes(analysis.status)) {
    throw new Error(
      `Analysis ${analysisId} must have a ready report before notify (got ${analysis.status})`,
    );
  }

  const email = analysis.lead.email.trim().toLowerCase();

  if (email.endsWith("@guest.techtivai.local")) {
    return {
      status: "skipped",
      email,
      analysisId,
    };
  }

  const name = analysis.lead.name?.trim() || "there";
  const callbackURL = `/dashboard/analyses/${encodeURIComponent(analysisId)}`;

  await auth.api.signInMagicLink({
    body: {
      email,
      name,
      callbackURL,
      metadata: {
        kind: "analysis_ready",
        analysisId,
        domain: analysis.domain,
        costEstimateUSD: analysis.proposal?.costEstimateUSD ?? null,
        timelineWeeks: analysis.proposal?.timelineWeeks ?? null,
        recipientName: name,
      },
    },
    headers: new Headers({
      "content-type": "application/json",
      origin: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    }),
  });

  return {
    status: "sent",
    email,
    analysisId,
  };
}

export function isInternalApiAuthorized(request: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const alt = request.headers.get("x-internal-secret")?.trim() ?? "";

  return bearer === secret || alt === secret;
}
