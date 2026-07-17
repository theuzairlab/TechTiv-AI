import type { Metadata } from "next";
import { AdminProvidersPageView } from "@/components/pages/admin/admin-providers-page-view";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Providers",
  description: "Monitor API provider spend and health.",
  robots: { index: false, follow: false },
};

export default async function AdminProvidersPage() {
  await requireAdminSession();
  return <AdminProvidersPageView />;
}
