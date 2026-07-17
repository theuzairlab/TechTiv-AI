import type { AnalysisStatus } from "@/lib/generated/prisma/client";

export type PipelineProgressStep = {
  status: AnalysisStatus;
  label: string;
  description: string;
};

/** Ordered pipeline stages shown to guests and dashboard. */
export const PIPELINE_PROGRESS_STEPS: PipelineProgressStep[] = [
  {
    status: "QUEUED",
    label: "Queued",
    description: "Your intelligence session is in the queue",
  },
  {
    status: "CRAWLING",
    label: "Crawling site",
    description: "Reading your website content",
  },
  {
    status: "DISCOVERING",
    label: "Discovering presence",
    description: "Finding social profiles, leadership, and reputation signals",
  },
  {
    status: "AUDITING",
    label: "Technical audit",
    description: "Checking performance, stack, and foundations",
  },
  {
    status: "ANALYZING",
    label: "Market & visibility",
    description: "Competitors, SEO, GEO, and AEO signals",
  },
  {
    status: "SYNTHESIZING",
    label: "Synthesizing",
    description: "Building your AI transformation strategy",
  },
  {
    status: "PRICING",
    label: "Pricing",
    description: "Calculating investment and timeline",
  },
  {
    status: "GENERATING_PDF",
    label: "Preparing report",
    description: "Generating your downloadable blueprint",
  },
  {
    status: "DONE",
    label: "Complete",
    description: "Your blueprint is ready",
  },
];

const STATUS_ORDER: AnalysisStatus[] = PIPELINE_PROGRESS_STEPS.map(
  (step) => step.status,
);

export function getStatusIndex(status: AnalysisStatus): number {
  if (status === "FAILED") return -1;
  const index = STATUS_ORDER.indexOf(status);
  return index >= 0 ? index : 0;
}

export function isTerminalStatus(status: AnalysisStatus): boolean {
  return status === "DONE" || status === "FAILED";
}

export function progressPercent(
  status: AnalysisStatus,
  errorMsg?: string | null,
): number {
  if (status === "DONE") return 100;
  if (status === "FAILED") {
    const failedAt = failedStepFromError(errorMsg);
    if (failedAt) {
      const index = getStatusIndex(failedAt);
      const max = STATUS_ORDER.length - 2;
      return Math.min(90, Math.round(((index + 1) / (max + 1)) * 100));
    }
    return 0;
  }
  const index = getStatusIndex(status);
  const max = STATUS_ORDER.length - 2;
  return Math.min(95, Math.round(((index + 1) / (max + 1)) * 100));
}

export function friendlyErrorMessage(errorMsg: string | null | undefined): string {
  if (!errorMsg) {
    return "Something went wrong while analyzing this business. You can try again.";
  }

  const lower = errorMsg.toLowerCase();
  if (lower.includes("tavily") || lower.includes("serpapi") || lower.includes("fetch failed") || lower.includes("connecttimeout")) {
    return "A research provider timed out while gathering market signals. Your progress was saved — retry to continue.";
  }
  if (lower.includes("pagespeed") || lower.includes("lighthouse")) {
    return "The technical audit provider could not load the website reliably. Retry to continue with available signals.";
  }
  if (
    lower.includes("claude") ||
    lower.includes("anthropic") ||
    lower.includes("synthesis") ||
    lower.includes("synthesize") ||
    lower.includes("evidencerefs") ||
    lower.includes("too_small")
  ) {
    return "The AI report response was incomplete or the provider timed out. Your collected research is saved; retry will use a fresh isolated run.";
  }
  if (lower.includes("firecrawl")) {
    return "Website crawl failed temporarily. Retry to re-run the intelligence session.";
  }

  const stepMatch = errorMsg.match(/Step "([^"]+)" failed:\s*(.+)/i);
  if (stepMatch) {
    const detail = stepMatch[2].split("|")[0]?.trim() ?? stepMatch[2];
    return `The ${stepMatch[1]} step failed: ${detail.slice(0, 160)}`;
  }

  return errorMsg.slice(0, 220);
}

export function failedStepFromError(
  errorMsg: string | null | undefined,
): AnalysisStatus | null {
  const match = errorMsg?.match(/Step "([^"]+)" failed/i);
  if (!match) return null;

  const map: Record<string, AnalysisStatus> = {
    crawl: "CRAWLING",
    discover: "DISCOVERING",
    audit: "AUDITING",
    competitors: "ANALYZING",
    synthesize: "SYNTHESIZING",
    pricing: "PRICING",
    narrative: "GENERATING_PDF",
    pdf: "GENERATING_PDF",
  };

  return map[match[1]] ?? null;
}

export type AnalysisStatusPayload = {
  analysisId: string;
  domain: string;
  status: AnalysisStatus;
  errorMsg: string | null;
  createdAt: string;
  completedAt: string | null;
  proposalId: string | null;
  proposalStatus: string | null;
  pdfUrl: string | null;
  emailCaptured: boolean;
};

