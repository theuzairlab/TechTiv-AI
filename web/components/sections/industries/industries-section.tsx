import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { IndustriesGrid } from "@/components/sections/industries/industries-grid";

export function IndustriesSection() {
  return (
    <SectionWrapper id="industries" className="bg-grid">
      <div className="mb-10 max-w-2xl space-y-4">
        <Badge variant="cyan">Industry Solutions</Badge>
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          Industry{" "}
          <span className="text-gradient-cyan">Solutions</span>
        </h2>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          Specialized AI automation for your vertical — select an industry to
          explore tailored systems, features, and projected outcomes.
        </p>
      </div>

      <IndustriesGrid />
    </SectionWrapper>
  );
}
