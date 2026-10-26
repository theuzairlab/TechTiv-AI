import { FREE_ANALYSIS_LIMIT, FREE_ANALYSIS_WINDOW_DAYS } from "@/lib/analysis/constants";
import { isPayingClient } from "@/lib/analysis/rate-limit";
import { isPendingGuestEmail } from "@/lib/analysis/guest";
import { prisma } from "@/lib/prisma";
import { decideCharge, type ChargeDecision } from "@/lib/billing/decide";

export type PipelineGate =
  | { status: "allow" }
  | { status: "use_credit"; paymentId: string }
  | { status: "email_required" }
  | { status: "payment_required"; email: string };

function windowStart(): Date {
  const since = new Date();
  since.setDate(since.getDate() - FREE_ANALYSIS_WINDOW_DAYS);
  return since;
}

export function hasRealBillingEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return !isPendingGuestEmail(email);
}

export async function gatePipelineStart(input: {
  email: string | null | undefined;
  excludeAnalysisId?: string;
}): Promise<PipelineGate> {
  const email = input.email?.trim().toLowerCase() ?? "";
  const real = hasRealBillingEmail(email);

  const [freeRunsUsed, isSalesClient, credit] = real
    ? await Promise.all([
        prisma.analysis.count({
          where: {
            ...(input.excludeAnalysisId
              ? { id: { not: input.excludeAnalysisId } }
              : {}),
            status: { not: "FAILED" },
            createdAt: { gte: windowStart() },
            lead: { email },
          },
        }),
        isPayingClient(email),
        prisma.payment.findFirst({
          where: { email, status: "PAID", consumedAt: null },
          orderBy: { paidAt: "asc" },
          select: { id: true },
        }),
      ])
    : [0, false, null];

  const decision: ChargeDecision = decideCharge({
    hasRealEmail: real,
    freeRunsUsed,
    freeLimit: FREE_ANALYSIS_LIMIT,
    isSalesClient,
    hasUnusedCredit: Boolean(credit),
  });

  if (decision === "email_required") return { status: "email_required" };
  if (decision === "payment_required") return { status: "payment_required", email };
  if (decision === "use_credit" && credit) {
    return { status: "use_credit", paymentId: credit.id };
  }
  return { status: "allow" };
}

/** Claim a paid credit. Returns false if another request already took it. */
export async function consumeCredit(
  paymentId: string,
  analysisId: string,
): Promise<boolean> {
  const taken = await prisma.payment.updateMany({
    where: { id: paymentId, status: "PAID", consumedAt: null },
    data: { consumedAt: new Date(), analysisId },
  });
  return taken.count === 1;
}

export async function releaseCredit(paymentId: string): Promise<void> {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: "PAID" },
    data: { consumedAt: null, analysisId: null },
  });
}
