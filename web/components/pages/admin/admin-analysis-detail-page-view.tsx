import { AdminAnalysisDetailView } from "@/components/pages/admin/admin-analysis-detail-view";
import { getAdminAnalysisDetail } from "@/lib/admin/analyses";
import { notFound } from "next/navigation";

type AdminAnalysisDetailPageViewProps = {
  analysisId: string;
};

export async function AdminAnalysisDetailPageView({
  analysisId,
}: AdminAnalysisDetailPageViewProps) {
  const analysis = await getAdminAnalysisDetail(analysisId);
  if (!analysis) notFound();

  return <AdminAnalysisDetailView analysis={analysis} />;
}
