import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/animations/section-wrapper";

type PageShellProps = {
  badge?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageShell({
  badge = "Coming in Phase 1",
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <SectionWrapper className="pt-28 md:pt-32">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <Badge variant="cyan">{badge}</Badge>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-text-muted">{description}</p>
      </div>
      {children ? <div className="mt-12">{children}</div> : null}
    </SectionWrapper>
  );
}
