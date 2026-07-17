import type { Metadata } from "next";
import { AdminAnalysesPageView } from "@/components/pages/admin/admin-analyses-page-view";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Analyses",
  description: "Monitor and manage AI analysis pipeline runs.",
  robots: { index: false, follow: false },
};

export default async function AdminAnalysesPage() {
  await requireAdminSession();
  return <AdminAnalysesPageView />;
}
