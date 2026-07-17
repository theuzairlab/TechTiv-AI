import type { Metadata } from "next";
import { AdminDashboardPageView } from "@/components/pages/admin/admin-dashboard-page-view";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "TechTivAI internal admin dashboard.",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const session = await requireAdminSession();

  return <AdminDashboardPageView session={session} />;
}
