import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalysisDetailView } from "@/components/pages/user/analysis-detail-view";
import { getAnalysisForUser } from "@/lib/dashboard/analyses";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Blueprint",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisDetailPage({ params }: PageProps) {
  const session = await requireUserSession();
  const { id } = await params;

  const detail = await getAnalysisForUser(
    id,
    session.user.id,
    session.user.email,
  );

  if (!detail) {
    notFound();
  }

  return <AnalysisDetailView detail={detail} />;
}
