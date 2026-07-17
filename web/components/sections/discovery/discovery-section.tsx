import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { DiscoveryWizard } from "@/components/sections/discovery/discovery-wizard";

export function DiscoverySection() {
  return (
    <SectionWrapper id="discovery" className="bg-grid">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="cyan">AI Discovery</Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            AI Discovery{" "}
            <span className="text-gradient-cyan">Experience</span>
          </h2>
          <p className="text-base leading-relaxed text-text-muted sm:text-lg">
            Turn visitors into qualified leads — answer four quick questions and
            get personalized AI system recommendations with projected ROI.
          </p>
        </div>
        <Button href="/discovery" variant="secondary" className="shrink-0 self-start lg:self-auto">
          Full Discovery Platform
        </Button>
      </div>

      <DiscoveryWizard />
    </SectionWrapper>
  );
}
