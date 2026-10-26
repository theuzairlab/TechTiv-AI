"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export type AdminPaymentRow = {
  id: string;
  email: string;
  domain: string | null;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  consumedAt: string | null;
};

type AdminPaymentsManagerProps = {
  initialEnabled: boolean;
  stripeConfigured: boolean;
  payments: AdminPaymentRow[];
};

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function AdminPaymentsManager({
  initialEnabled,
  stripeConfigured,
  payments,
}: AdminPaymentsManagerProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentsEnabled: next }),
      });
      const body = (await response.json()) as {
        paymentsEnabled?: boolean;
        error?: string;
      };
      if (!response.ok || typeof body.paymentsEnabled !== "boolean") {
        throw new Error(body.error ?? "Could not update payments");
      }
      setEnabled(body.paymentsEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update payments");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Settings"
        title="Payments"
        description="Turn the next-website charge on or off. Off keeps the current flow, with no pay step for visitors."
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      <GlassPanel className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-text-primary">
            {enabled ? "Payments are on" : "Payments are off"}
          </p>
          <p className="mt-1 max-w-xl text-sm text-text-muted">
            {enabled
              ? "The first blueprint stays free. A later new website asks for payment before research starts."
              : "Visitors do not see a pay step. Analyses start the way they do today."}
          </p>
          {enabled && !stripeConfigured ? (
            <p className="mt-2 text-sm text-destructive">
              Stripe keys are missing. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_BLUEPRINT_PRICE_ID on the web app before visitors can pay.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant={enabled ? "outline" : "primary"}
          disabled={saving}
          onClick={() => void toggle(!enabled)}
        >
          {saving ? "Saving…" : enabled ? "Turn off" : "Turn on"}
        </Button>
      </GlassPanel>

      <GlassPanel className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border-subtle text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Used</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-text-muted" colSpan={5}>
                  No payments yet.
                </td>
              </tr>
            ) : (
              payments.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle/70 last:border-0">
                  <td className="px-4 py-3 text-text-primary">{row.email}</td>
                  <td className="px-4 py-3 text-text-muted">{row.domain ?? "—"}</td>
                  <td className="px-4 py-3 text-text-primary">
                    {money(row.amountCents, row.currency)}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{row.status}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {row.consumedAt ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  );
}
