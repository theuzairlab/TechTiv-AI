import type { Metadata } from "next";
import { AnalyzePageView } from "@/components/analysis/analyze-page-view";

export const metadata: Metadata = {
  title: "New analysis",
  description:
    "Start a new AI business analysis from your TechTivAI portal.",
  robots: { index: false, follow: false },
};

export default function DashboardAnalyzePage() {
  return <AnalyzePageView variant="dashboard" />;
}
