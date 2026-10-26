import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata: Metadata = {
  title: "Subscriptions",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Billing"
        title="Subscriptions"
        description="Monthly plans."
      />
      <GlassPanel className="p-8">
        <p className="text-sm text-text-primary">Billing is off until Stripe is connected.</p>
        <p className="mt-2 text-sm text-text-muted">
          Monthly plans are not available yet. No one is being charged.
        </p>
      </GlassPanel>
    </div>
  );
}
