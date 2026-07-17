import type { AnalysisStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const statusStyles: Record<AnalysisStatus, string> = {
  QUEUED: "bg-text-muted/15 text-text-muted",
  CRAWLING: "bg-brand-cyan/15 text-brand-cyan",
  DISCOVERING: "bg-brand-cyan/15 text-brand-cyan",
  AUDITING: "bg-brand-cyan/15 text-brand-cyan",
  ANALYZING: "bg-brand-cyan/15 text-brand-cyan",
  SYNTHESIZING: "bg-brand/15 text-brand",
  PRICING: "bg-brand/15 text-brand",
  GENERATING_PDF: "bg-brand/15 text-brand",
  DONE: "bg-accent-lime/15 text-accent-lime",
  FAILED: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<AnalysisStatus, string> = {
  QUEUED: "Queued",
  CRAWLING: "Crawling",
  DISCOVERING: "Discovering",
  AUDITING: "Auditing",
  ANALYZING: "Analyzing",
  SYNTHESIZING: "Synthesizing",
  PRICING: "Pricing",
  GENERATING_PDF: "Generating PDF",
  DONE: "Done",
  FAILED: "Failed",
};

export function AnalysisStatusBadge({
  status,
  className,
}: {
  status: AnalysisStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export { statusLabels as analysisStatusLabels };
