import type { AnalysisStatus } from "@/lib/generated/prisma/client";

/** Plain status lines. Database enum values stay unchanged. */
export const analysisStatusLabels: Record<AnalysisStatus, string> = {
  QUEUED: "Waiting to start",
  CRAWLING: "Researching your site",
  DISCOVERING: "Researching your site",
  AUDITING: "Reviewing how the business runs",
  ANALYZING: "Finding opportunities",
  SYNTHESIZING: "Writing the blueprint",
  PRICING: "Writing the blueprint",
  GENERATING_PDF: "Preparing the PDF",
  DONE: "Blueprint ready",
  FAILED: "Needs attention",
};

export function analysisStatusLabel(status: AnalysisStatus): string {
  return analysisStatusLabels[status];
}

export const productWords = {
  blueprint: "Blueprint",
  analysis: "Analysis",
  buildRequest: "Build request",
  consultant: "Consultant",
  messages: "Messages",
} as const;
