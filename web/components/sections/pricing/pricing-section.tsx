import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { PricingCalculator } from "@/components/sections/pricing/pricing-calculator";

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="bg-grid">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="cyan">AI Pricing Engine</Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            AI Pricing{" "}
            <span className="text-gradient-cyan">Intelligence Engine</span>
          </h2>
          <p className="text-base leading-relaxed text-text-muted sm:text-lg">
            Adjust workflows, integrations, AI models, and volume — get instant
            setup, maintenance, and retainer estimates with ROI projections.
          </p>
        </div>
        <Button href="/pricing" variant="secondary" className="shrink-0 self-start lg:self-auto">
          Full Pricing Page
        </Button>
      </div>

      <PricingCalculator />
    </SectionWrapper>
  );
}
