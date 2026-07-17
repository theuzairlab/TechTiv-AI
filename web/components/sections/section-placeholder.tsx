import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionWrapper } from "@/components/animations/section-wrapper";

type SectionPlaceholderProps = {
  id: string;
  sectionNumber: number;
  title: string;
  description: string;
  badge?: string;
};

export function SectionPlaceholder({
  id,
  sectionNumber,
  title,
  description,
  badge = "Phase 1",
}: SectionPlaceholderProps) {
  return (
    <SectionWrapper id={id} delay={sectionNumber * 0.02} className="bg-grid">
      <GlassPanel className="p-8 md:p-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Badge variant="cyan">
              Section {String(sectionNumber).padStart(2, "0")}
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-text-muted">
              {description}
            </p>
          </div>
          <Badge variant="violet" className="shrink-0 self-start">
            {badge}
          </Badge>
        </div>
      </GlassPanel>
    </SectionWrapper>
  );
}
