import type { Metadata } from "next";
import { AnalyzePageView } from "@/components/analysis/analyze-page-view";

export const metadata: Metadata = {
  title: "Analyze your business",
  description:
    "Start a free AI business intelligence session — no email required. Watch live research and unlock your full blueprint when ready.",
};

export default function AnalyzePage() {
  return <AnalyzePageView />;
}
