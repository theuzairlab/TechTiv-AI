import type { AnalysisStatusPayload } from "@/lib/analysis/progress";
import type { BusinessIntake } from "@/lib/analysis/schema";
import type { AnalysisActivityItem } from "@/lib/analysis/activities";

export type SubmitAnalysisResponse =
  | {
      status: "queued";
      analysisId: string;
      jobId: string;
      guestAccessToken: string;
      message: string;
    }
  | {
      status: "in_progress";
      message: string;
      notifyRegistered?: boolean;
    }
  | {
      status: "cached";
      analysisId: string;
      completedAt: string;
      message: string;
    }
  | {
      status: "rate_limited";
      retryAfter: string;
      message: string;
    }
  | {
      error: string;
      details?: string;
    };

export type SubmitAnalysisInput = {
  domain?: string;
  email?: string;
  name?: string;
  company?: string;
  businessIntake?: BusinessIntake;
  notifyIfInProgress?: boolean;
  guestAccessToken?: string;
};

export async function submitAnalysisRequest(
  input: SubmitAnalysisInput,
): Promise<{ ok: boolean; status: number; body: SubmitAnalysisResponse }> {
  const response = await fetch("/api/analysis", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as SubmitAnalysisResponse;
  return { ok: response.ok, status: response.status, body };
}

export async function fetchAnalysisStatus(
  analysisId: string,
): Promise<AnalysisStatusPayload> {
  const response = await fetch(`/api/analysis/${analysisId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load analysis status");
  }

  return response.json() as Promise<AnalysisStatusPayload>;
}

export async function fetchAnalysisActivities(
  analysisId: string,
  token: string,
  after?: string,
): Promise<AnalysisActivityItem[]> {
  const params = new URLSearchParams({ token });
  if (after) params.set("after", after);

  const response = await fetch(
    `/api/analysis/${analysisId}/activities?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to load activities");
  }

  const body = (await response.json()) as { activities: AnalysisActivityItem[] };
  return body.activities;
}

export async function captureAnalysisEmailRequest(input: {
  analysisId: string;
  guestAccessToken: string;
  email: string;
  name?: string;
}): Promise<{ status: string; email: string; notifySent?: boolean }> {
  const response = await fetch(
    `/api/analysis/${input.analysisId}/capture-email`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        name: input.name,
        guestAccessToken: input.guestAccessToken,
      }),
    },
  );

  const body = (await response.json()) as {
    status: string;
    email: string;
    notifySent?: boolean;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Failed to save email");
  }

  return body;
}

export async function retryAnalysisRequest(input: {
  analysisId: string;
  guestAccessToken: string;
}): Promise<{ jobId: string }> {
  const response = await fetch(`/api/analysis/${input.analysisId}/retry`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ guestAccessToken: input.guestAccessToken }),
  });

  const body = (await response.json()) as { jobId?: string; error?: string };
  if (!response.ok || !body.jobId) {
    throw new Error(body.error ?? "Failed to retry analysis");
  }

  return { jobId: body.jobId };
}

export type AnalysisPreviewPayload = {
  analysisId: string;
  domain: string;
  companyName: string | null;
  teaser: {
    businessSummary: string | null;
    painPoints: string[];
    automationHighlights: Array<{
      area: string;
      description: string;
      impact: string;
    }>;
    competitorGaps: string[];
    industryTag: string | null;
    digitalMaturity: string | null;
    quickWins: Array<{
      title: string;
      description: string;
      effort: string;
    }>;
    seoHighlights: string[];
    geoHighlights: string[];
    aeoHighlights: string[];
    revenueOpportunities: string[];
    costEstimateUSD: number | null;
    timelineWeeks: number | null;
    coverage: {
      score: number;
      status: "complete" | "partial" | "limited";
      covered: string[];
      missing: string[];
      evidenceCount: number;
    } | null;
    confidence: {
      level: "high" | "medium" | "low";
      rationale: string;
    } | null;
    scorecard: Array<{
      dimension: string;
      score: number;
      rationale: string;
      evidenceRefs: string[];
    }>;
    findings: Array<{
      title: string;
      category: string;
      severity: string;
      summary: string;
    }>;
  };
  locked: Record<string, boolean>;
};

export async function fetchAnalysisPreview(
  analysisId: string,
  token: string,
): Promise<AnalysisPreviewPayload> {
  const response = await fetch(
    `/api/analysis/${analysisId}/preview?token=${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to load preview");
  }

  return response.json() as Promise<AnalysisPreviewPayload>;
}
