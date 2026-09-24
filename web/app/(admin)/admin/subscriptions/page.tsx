import type { Metadata } from "next";
import { AdminEmptyModule } from "@/components/pages/admin/admin-empty-module";

export const metadata: Metadata = {
  title: "Subscriptions",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionsPage() {
  return (
    <AdminEmptyModule
      label="Commerce"
      title="Subscriptions"
      description="Monthly plans and entitlements will list here once billing is live."
      columns={["Client", "Plan", "Status", "Renews", "MRR"]}
    />
  );
}
