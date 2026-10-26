export type ChargeDecision =
  | "allow"
  | "use_credit"
  | "email_required"
  | "payment_required";

/**
 * Used only when an admin has turned payments on.
 * The first finished run for an email stays free. A later new website needs a paid credit.
 */
export function decideCharge(input: {
  hasRealEmail: boolean;
  freeRunsUsed: number;
  freeLimit: number;
  isSalesClient: boolean;
  hasUnusedCredit: boolean;
}): ChargeDecision {
  if (!input.hasRealEmail) return "email_required";
  if (input.isSalesClient) return "allow";
  if (input.freeRunsUsed < input.freeLimit) return "allow";
  if (input.hasUnusedCredit) return "use_credit";
  return "payment_required";
}
