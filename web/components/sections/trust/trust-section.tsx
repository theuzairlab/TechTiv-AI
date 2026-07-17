import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { TrustMap } from "@/components/sections/trust/trust-map";
import { clientLogos, complianceBadges } from "@/lib/trust";
import { GlassPanel } from "@/components/ui/glass-panel";

export function TrustSection() {
  return (
    <SectionWrapper id="trust" className="bg-grid">
      <div className="mb-10 space-y-4 text-center sm:text-left">
        <Badge variant="cyan">Trust & Global Positioning</Badge>
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          Trusted{" "}
          <span className="text-gradient-cyan">Globally</span> by Modern
          Businesses
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-text-muted sm:mx-0 sm:text-lg">
          Enterprise-grade AI automation deployed across continents — with the
          security and compliance standards your business demands.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <TrustMap />

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Trusted By
            </h3>
            <StaggerChildren className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {clientLogos.map((client) => (
                <StaggerItem key={client.name}>
                  <GlassPanel className="flex items-center gap-3 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-violet/15 text-xs font-bold text-accent-violet ring-1 ring-accent-violet/30">
                      {client.initials}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {client.name}
                    </span>
                  </GlassPanel>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Compliance & Security
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {complianceBadges.map((badge) => (
                <GlassPanel
                  key={badge.id}
                  className="p-4 transition-colors hover:border-accent-cyan/30"
                >
                  <p className="text-sm font-semibold text-text-primary">
                    {badge.label}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {badge.description}
                  </p>
                </GlassPanel>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
