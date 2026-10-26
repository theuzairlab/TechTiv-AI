import type { Metadata } from "next";
import { PayNowButton } from "@/components/pages/user/pay-now-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { arePaymentsEnabled } from "@/lib/billing/settings";
import { formatDateTime } from "@/lib/format-display";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ payment?: string }>;
};

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function BillingPage({ searchParams }: PageProps) {
  const session = await requireUserSession();
  const query = await searchParams;
  const email = session.user.email.trim().toLowerCase();
  const paymentsOn = await arePaymentsEnabled();

  const payments = await prisma.payment.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      amountCents: true,
      currency: true,
      status: true,
      paidAt: true,
      createdAt: true,
      analysisId: true,
      analysis: { select: { domain: true } },
    },
  });

  const latest = payments[0] ?? null;
  const paid = latest?.status === "PAID";
  const pendingPayment = payments.find((row) => row.status === "PENDING") ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="s-label">— Billing</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          Billing
        </h1>
        <p className="mt-2 max-w-xl text-sm text-text-muted">
          The $5 charge covers one extra website analysis. It is not the full
          build. Your first blueprint stays free.
        </p>
      </div>

      {query.payment === "success" ? (
        <GlassPanel className="border-brand/30 bg-brand/5 p-4">
          <p className="text-sm text-text-primary">
            Payment received. If this page still says pending, it updates when
            Stripe confirms the charge.
          </p>
        </GlassPanel>
      ) : null}

      {query.payment === "cancel" ? (
        <GlassPanel className="p-4">
          <p className="text-sm text-text-muted">
            Checkout was not completed. You can pay when you are ready.
          </p>
        </GlassPanel>
      ) : null}

      <GlassPanel className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Next website analysis
            </p>
            <p className="mt-2 font-display text-4xl font-semibold text-text-primary">
              $5
            </p>
            <p className="mt-1 text-sm text-text-muted">One time</p>
          </div>
          <span
            className={
              paid
                ? "rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand"
                : "rounded-full bg-bg-secondary px-3 py-1 text-xs font-semibold text-text-muted"
            }
          >
            {paid ? "Payment successful" : "Pending"}
          </span>
        </div>

        {paid && latest ? (
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-muted">Amount</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {money(latest.amountCents, latest.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Website</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {latest.analysis?.domain ?? "Next analysis"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Paid</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {formatDateTime(latest.paidAt ?? latest.createdAt)}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md text-sm text-text-muted">
              {paymentsOn
                ? "This charge is waiting. It pays for one more analysis, not the full product. Pay now to continue that research."
                : "Billing is off for now. Your first blueprint stays free, and no charge is shown."}
            </p>
            {paymentsOn ? (
              <PayNowButton analysisId={pendingPayment?.analysisId ?? null} />
            ) : null}
          </div>
        )}
      </GlassPanel>

      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Payments
        </h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No payments on this account yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {payments.map((row) => {
              const successful = row.status === "PAID";
              const pending = row.status === "PENDING";
              return (
                <li key={row.id}>
                  <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium text-text-primary">
                        {row.analysis?.domain ?? "Next website analysis"}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">
                        {money(row.amountCents || 500, row.currency)}
                        {" · "}
                        {formatDateTime(row.paidAt ?? row.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-text-primary">
                        {successful
                          ? "Payment successful"
                          : pending
                            ? "Pending"
                            : row.status === "REFUNDED"
                              ? "Refunded"
                              : "Not completed"}
                      </span>
                      {pending && paymentsOn ? (
                        <PayNowButton analysisId={row.analysisId} />
                      ) : null}
                    </div>
                  </GlassPanel>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
