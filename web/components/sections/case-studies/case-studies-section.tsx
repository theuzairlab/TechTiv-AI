import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { CaseStudiesShowcase } from "@/components/sections/case-studies/case-studies-showcase";

export function CaseStudiesSection() {
  return (
    <SectionWrapper id="case-studies" className="bg-grid">
      <div className="mb-10 max-w-2xl space-y-4">
        <Badge variant="cyan">Case Studies</Badge>
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          Client{" "}
          <span className="text-gradient-cyan">Case Studies</span>
        </h2>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          Real before-and-after results — hours saved, revenue gained, faster
          response times, and measurable cost reduction across industries.
        </p>
      </div>

      <CaseStudiesShowcase />
    </SectionWrapper>
  );
}
