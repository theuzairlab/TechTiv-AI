import { DiscoverySection } from "@/components/sections/discovery/discovery-section";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { ServicesSection } from "@/components/sections/services/services-section";
import { TrustSection } from "@/components/sections/trust/trust-section";
import { WorkflowSection } from "@/components/sections/workflow/workflow-section";
import { VoiceSection } from "@/components/sections/voice/voice-section";
import { PricingSection } from "@/components/sections/pricing/pricing-section";
import { IndustriesSection } from "@/components/sections/industries/industries-section";
import { CaseStudiesSection } from "@/components/sections/case-studies/case-studies-section";
import { DashboardSection } from "@/components/sections/dashboard/dashboard-section";
import { CtaSection } from "@/components/sections/cta/cta-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <DiscoverySection />
      <ServicesSection />
      <WorkflowSection />
      <VoiceSection />
      <PricingSection />
      <IndustriesSection />
      <CaseStudiesSection />
      <DashboardSection />
      <CtaSection />
    </>
  );
}