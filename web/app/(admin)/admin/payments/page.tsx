import type { Metadata } from "next";
import { AdminEmptyModule } from "@/components/pages/admin/admin-empty-module";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return (
    <AdminEmptyModule
      label="Commerce"
      title="Payments"
      description="One-time $5 blueprint payments will appear here after Stripe checkout is enabled."
      columns={["Client", "Amount", "Status", "Blueprint", "Date"]}
    />
  );
}
