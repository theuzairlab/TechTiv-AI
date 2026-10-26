import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { arePaymentsEnabled } from "@/lib/billing/settings";

export const metadata: Metadata = {
  title: "Enterprise AI & Automation",
  description:
    "TechTivAI delivers enterprise-grade AI automation, autonomous agents, custom LLMs, and intelligent workflows.",
  robots: { index: false, follow: false },
};

export default async function HomePage() {
  const paymentsEnabled = await arePaymentsEnabled();
  return <LandingPage paymentsEnabled={paymentsEnabled} />;
}
