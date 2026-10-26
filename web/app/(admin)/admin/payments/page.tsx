import type { Metadata } from "next";
import { AdminPaymentsManager } from "@/components/pages/admin/admin-payments-manager";
import { arePaymentsEnabled, stripeIsConfigured } from "@/lib/billing/settings";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  const paymentsEnabled = await arePaymentsEnabled();
  let payments: Array<{
    id: string;
    email: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: Date;
    paidAt: Date | null;
    consumedAt: Date | null;
    analysis: { domain: string } | null;
  }> = [];

  try {
    payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        amountCents: true,
        currency: true,
        status: true,
        createdAt: true,
        paidAt: true,
        consumedAt: true,
        analysis: { select: { domain: true } },
      },
    });
  } catch (error) {
    console.error("[admin/payments] list failed:", error);
  }

  return (
    <AdminPaymentsManager
      initialEnabled={paymentsEnabled}
      stripeConfigured={stripeIsConfigured()}
      payments={payments.map((row) => ({
        id: row.id,
        email: row.email,
        domain: row.analysis?.domain ?? null,
        amountCents: row.amountCents,
        currency: row.currency,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        paidAt: row.paidAt?.toISOString() ?? null,
        consumedAt: row.consumedAt?.toISOString() ?? null,
      }))}
    />
  );
}
