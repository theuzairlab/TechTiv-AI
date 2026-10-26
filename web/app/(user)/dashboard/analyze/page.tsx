import type { Metadata } from "next";
import { AnalyzePageView } from "@/components/analysis/analyze-page-view";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "New analysis",
  description:
    "Start a new AI business analysis from your TechTivAI portal.",
  robots: { index: false, follow: false },
};

export default async function DashboardAnalyzePage() {
  const session = await requireUserSession();
  return (
    <AnalyzePageView
      variant="dashboard"
      accountEmail={session.user.email}
    />
  );
}
