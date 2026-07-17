import type { Metadata } from "next";
import { IndustriesPageView } from "@/components/pages/industries/industries-page-view";

export const metadata: Metadata = {
  title: "Industry Solutions",
  description:
    "Specialized AI automation for real estate, healthcare, ecommerce, law, agencies, SaaS, logistics, and finance.",
};

export default function IndustriesPage() {
  return <IndustriesPageView />;
}
