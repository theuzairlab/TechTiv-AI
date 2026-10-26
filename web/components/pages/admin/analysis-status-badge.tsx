import type { AnalysisStatus } from "@/lib/generated/prisma/client";
import { analysisStatusLabels } from "@/lib/product-labels";
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        statusStyles[status],
        className,
      )}
    >
      {analysisStatusLabels[status]}
    </span>
  );
}

export { analysisStatusLabels };
