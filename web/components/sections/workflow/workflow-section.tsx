import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { WorkflowCanvas } from "@/components/sections/workflow/workflow-canvas";

export function WorkflowSection() {
  return (
    <SectionWrapper id="workflow" className="bg-grid">
      <div className="mb-10 max-w-2xl space-y-4">
        <Badge variant="cyan">Workflow Visualizer</Badge>
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          Live AI Workflow{" "}
          <span className="text-gradient-cyan">Visualizer</span>
        </h2>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          See how leads flow through your automation stack — from website capture
          to CRM, voice AI, email sequences, and live dashboard updates.
        </p>
      </div>

      <WorkflowCanvas />
    </SectionWrapper>
  );
}
