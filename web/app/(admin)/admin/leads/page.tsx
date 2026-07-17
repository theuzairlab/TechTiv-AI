import type { Metadata } from "next";
import { AdminLeadsPageView } from "@/components/pages/admin/admin-leads-page-view";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return <AdminLeadsPageView />;
}
