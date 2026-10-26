import { prisma } from "@/lib/prisma";

const SETTING_ID = "default";

/** Missing table or a missing row both mean payments stay off. */
export async function arePaymentsEnabled(): Promise<boolean> {
  try {
    const row = await prisma.billingSetting.findUnique({
      where: { id: SETTING_ID },
      select: { paymentsEnabled: true },
    });
    return row?.paymentsEnabled ?? false;
  } catch (error) {
    console.error("[billing] could not read payments switch:", error);
    return false;
  }
}

export async function setPaymentsEnabled(paymentsEnabled: boolean): Promise<boolean> {
  const row = await prisma.billingSetting.upsert({
    where: { id: SETTING_ID },
    create: { id: SETTING_ID, paymentsEnabled },
    update: { paymentsEnabled },
    select: { paymentsEnabled: true },
  });
  return row.paymentsEnabled;
}

export function stripeIsConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      process.env.STRIPE_BLUEPRINT_PRICE_ID?.trim(),
  );
}
