import type { Metadata } from "next";
import { AdminAnalysisDetailPageView } from "@/components/pages/admin/admin-analysis-detail-page-view";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Analysis Detail",
  description: "Inspect a single analysis run.",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminAnalysisDetailPage({ params }: PageProps) {
  await requireAdminSession();
  const { id } = await params;
  return <AdminAnalysisDetailPageView analysisId={id} />;
}
