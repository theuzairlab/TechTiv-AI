import type { Metadata } from "next";
import { DiscoveryPageView } from "@/components/pages/discovery/discovery-page-view";

export const metadata: Metadata = {
  title: "AI Discovery",
  description:
    "Full-screen AI onboarding with multi-step interview, dynamic recommendations, scoring engine, and proposal generation.",
};

export default function DiscoveryPage() {
  return <DiscoveryPageView />;
}
