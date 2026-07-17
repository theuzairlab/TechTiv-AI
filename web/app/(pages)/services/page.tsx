import type { Metadata } from "next";
import { ServicesPageView } from "@/components/pages/services/services-page-view";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore TechTivAI's full AI automation ecosystem — workflows, agents, voice AI, CRM automation, and more with pricing and ROI.",
};

export default function ServicesPage() {
  return <ServicesPageView />;
}
