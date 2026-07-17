import type { Metadata } from "next";
import { CaseStudiesPageView } from "@/components/pages/case-studies/case-studies-page-view";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "See how TechTivAI clients reduced costs, saved hours, and scaled with AI automation — detailed stories with measurable outcomes.",
};

export default function CaseStudiesPage() {
  return <CaseStudiesPageView />;
}
