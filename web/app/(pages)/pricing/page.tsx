import type { Metadata } from "next";
import { PricingPageView } from "@/components/pages/pricing/pricing-page-view";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent AI automation pricing — Growth, Scale, and Enterprise plans with dynamic setup, maintenance, and retainer estimates powered by our AI Pricing Engine.",
};

export default function PricingPage() {
  return <PricingPageView />;
}
