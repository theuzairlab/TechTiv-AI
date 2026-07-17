import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

const ctaOptions = [
  {
    title: "AI-Assisted Onboarding",
    description: "Get a personalized AI blueprint in under 60 seconds.",
    href: "/discovery",
    label: "Start AI Discovery",
    variant: "primary" as const,
  },
  {
    title: "Talk to AI Consultant",
    description: "Voice or chat consultation with our automation architect.",
    href: "/contact",
    label: "Start Consultation",
    variant: "secondary" as const,
  },
  {
    title: "Book Strategy Call",
    description: "Schedule a 1-on-1 call with our AI transformation team.",
    href: "/contact",
    label: "Book a Call",
    variant: "outline" as const,
  },
  {
    title: "Manual Onboarding",
    description: "Prefer a form? Tell us about your business and we'll reach out.",
    href: "/contact",
    label: "Contact Us",
    variant: "ghost" as const,
  },
];

export function CtaSection() {
  return (
    <SectionWrapper id="cta" className="bg-grid pb-28 md:pb-32">
      <GlassPanel
        variant="elevated"
        className="relative overflow-hidden px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-cyan)_16%,transparent),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_srgb,var(--accent-violet)_12%,transparent),transparent_55%)]"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <Badge variant="lime" className="mb-6">
            Get Started
          </Badge>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Get Your AI{" "}
            <span className="text-gradient-cyan">Transformation Blueprint</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            Ready to deploy intelligent automation across your business? Choose
            how you want to start — every path leads to a custom AI roadmap.
          </p>

          <StaggerChildren className="mt-10 grid gap-4 sm:grid-cols-2">
            {ctaOptions.map((option) => (
              <StaggerItem key={option.title}>
                <div className="flex h-full flex-col rounded-2xl border border-glass-border bg-bg-secondary/40 p-5 text-left backdrop-blur-sm transition-colors hover:border-accent-cyan/30">
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {option.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                    {option.description}
                  </p>
                  <Button
                    href={option.href}
                    variant={option.variant}
                    size="sm"
                    className="mt-4 self-start"
                  >
                    {option.label}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <p className="mt-8 text-xs text-text-muted sm:text-sm">
            No commitment required · Free discovery session · Enterprise-ready
          </p>
        </div>
      </GlassPanel>
    </SectionWrapper>
  );
}
