import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { ServiceEcosystem } from "@/components/sections/services/service-ecosystem";

export function ServicesSection() {
  return (
    <SectionWrapper id="services" className="bg-grid">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="cyan">AI Service Ecosystem</Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            AI Services{" "}
            <span className="text-gradient-cyan">Ecosystem</span>
          </h2>
          <p className="text-base leading-relaxed text-text-muted sm:text-lg">
            Nine interconnected AI systems — click any node to explore capabilities
            and see how they connect through your automation stack.
          </p>
        </div>
        <Button href="/services" variant="secondary" className="shrink-0 self-start lg:self-auto">
          Explore All Services
        </Button>
      </div>

      <ServiceEcosystem />
    </SectionWrapper>
  );
}
