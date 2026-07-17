import { PIPELINE_USE_STUBS } from "../pipeline/stub.js";
import type { PipelineContext } from "../pipeline/types.js";
import { writeRawSignal } from "../pipeline/update-status.js";
import { logAnalysisActivity } from "../pipeline/activity.js";

export type NotifyReadyResult = {
  status: "sent" | "stubbed" | "skipped";
  detail?: string;
};

function webAppBaseUrl(): string | null {
  const url =
    process.env.WEB_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

/**
 * Ask the Next.js app to send the analysis-ready email + magic link.
 * Auth/magic-link issuance stays on web; the worker only triggers notify.
 */
export async function notifyAnalysisReady(
  analysisId: string,
): Promise<NotifyReadyResult> {
  if (PIPELINE_USE_STUBS) {
    return { status: "stubbed", detail: "PIPELINE_USE_STUBS=true" };
  }

  const baseUrl = webAppBaseUrl();
  const secret = process.env.INTERNAL_API_SECRET?.trim();

  if (!baseUrl || !secret) {
    console.warn(
      "[notify] WEB_APP_URL/INTERNAL_API_SECRET missing — skipping analysis-ready email",
    );
    return {
      status: "skipped",
      detail: "WEB_APP_URL or INTERNAL_API_SECRET not configured",
    };
  }

  const response = await fetch(`${baseUrl}/api/internal/analysis-ready`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ analysisId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `analysis-ready notify failed (${response.status}): ${text.slice(0, 300)}`,
    );
  }

  const body = (await response.json()) as {
    status?: "sent" | "skipped";
    email?: string;
  };
  return {
    status: body.status ?? "sent",
    detail: body.email ? `recipient=${body.email}` : undefined,
  };
}

export async function notifyAnalysisReadyAndLog(
  ctx: PipelineContext,
): Promise<void> {
  const result = await notifyAnalysisReady(ctx.analysisId);

  await writeRawSignal(ctx.analysisId, "notify", {
    domain: ctx.domain,
    ...result,
  });
  await logAnalysisActivity({
    analysisId: ctx.analysisId,
    runId: ctx.runId,
    kind: result.status === "sent" ? "insight" : "warning",
    message:
      result.status === "sent"
        ? "Secure report email accepted for delivery."
        : result.status === "skipped"
          ? "Report email was not sent because no deliverable email is available."
          : "Email delivery was stubbed for this environment.",
    metadata: { step: "notify", ...result },
  });
}
