import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { DashboardDemo } from "@/components/sections/dashboard/dashboard-demo";

export function DashboardSection() {
  return (
    <SectionWrapper id="dashboard" className="bg-grid">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="cyan">Live Dashboard</Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Live Dashboard{" "}
            <span className="text-gradient-cyan">Demo</span>
          </h2>
          <p className="text-base leading-relaxed text-text-muted sm:text-lg">
            See the platform in action — live lead activity, AI conversations,
            workflow logs, support metrics, and call analytics in one command
            center.
          </p>
        </div>
        <Button href="/dashboard" variant="secondary" className="shrink-0 self-start lg:self-auto">
          Open Admin Dashboard
        </Button>
      </div>

      <DashboardDemo />
    </SectionWrapper>
  );
}
