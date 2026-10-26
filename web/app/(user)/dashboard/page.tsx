import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserDashboardPageView } from "@/components/pages/user/user-dashboard-page-view";
import { getDashboardStats } from "@/lib/dashboard/analyses";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Portal",
  description:
    "Your TechTivAI home — the next blueprint, analysis, or build request on this account.",
  robots: { index: false, follow: false },
};

type DashboardPageProps = {
  searchParams: Promise<{ analysisId?: string }>;
};

export default async function UserDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await requireUserSession();
  const params = await searchParams;

  if (params.analysisId) {
    redirect(`/dashboard/analyses/${params.analysisId}`);
  }

  const stats = await getDashboardStats(session.user.id, session.user.email);

  return (
    <UserDashboardPageView
      firstName={session.user.name.split(" ")[0] ?? "there"}
      recent={stats.recent}
      activeRun={stats.activeRun}
      highlight={stats.highlight}
      serviceRequestPreview={stats.serviceRequestPreview}
    />
  );
}
