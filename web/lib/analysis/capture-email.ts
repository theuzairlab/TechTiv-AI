import { prisma } from "@/lib/prisma";
import {
  createGuestAccessToken,
  createPendingGuestEmail,
  isPendingGuestEmail,
} from "@/lib/analysis/guest";
import { notifyAnalysisReady } from "@/lib/email/notify-analysis-ready";
import type { CaptureEmailInput } from "@/lib/analysis/schema";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import type { Prisma } from "@/lib/generated/prisma/client";

export type CaptureEmailResult =
  | { status: "captured"; email: string; notifySent: boolean }
  | { status: "already_captured"; email: string };

export async function captureAnalysisEmail(
  analysisId: string,
  input: CaptureEmailInput,
): Promise<CaptureEmailResult> {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { lead: true },
  });

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (
    !verifyGuestAccess(analysis.guestAccessToken, input.guestAccessToken)
  ) {
    throw new Error("Invalid guest access token");
  }

  const email = input.email.toLowerCase();
  const existingEmail = analysis.lead.email.toLowerCase();

  if (!isPendingGuestEmail(existingEmail)) {
    return { status: "already_captured", email: existingEmail };
  }

  const name = input.name?.trim() || analysis.lead.name;

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: analysis.leadId },
      data: {
        email,
        name,
      },
    }),
    prisma.analysis.update({
      where: { id: analysisId },
      data: {
        emailCapturedAt: new Date(),
      },
    }),
  ]);

  let notifySent = false;
  if (analysis.status === "DONE") {
    try {
      await notifyAnalysisReady(analysisId);
      notifySent = true;
    } catch (error) {
      console.error("[capture-email] notify after capture failed:", error);
    }
  }

  return { status: "captured", email, notifySent };
}

export function createGuestSession(): {
  guestAccessToken: string;
  pendingEmail: string;
} {
  const guestAccessToken = createGuestAccessToken();
  return {
    guestAccessToken,
    pendingEmail: createPendingGuestEmail(guestAccessToken),
  };
}

export function serializeBusinessIntake(
  value: unknown,
): Prisma.InputJsonValue | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as Prisma.InputJsonValue;
}
