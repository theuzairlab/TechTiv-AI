"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  captureAnalysisEmailRequest,
  fetchAnalysisActivities,
  fetchAnalysisStatus,
  retryAnalysisRequest,
} from "@/lib/analysis/client";
import type { AnalysisActivityItem } from "@/lib/analysis/activities";
import {
  PIPELINE_PROGRESS_STEPS,
  friendlyErrorMessage,
  progressPercent,
  type AnalysisStatusPayload,
} from "@/lib/analysis/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IntelligenceConsole({
  analysisId,
  guestAccessToken,
  companyLabel,
  onComplete,
}: {
  analysisId: string;
  guestAccessToken: string;
  companyLabel?: string;
  onComplete?: (status: AnalysisStatusPayload) => void;
}) {
  const [status, setStatus] = useState<AnalysisStatusPayload | null>(null);
  const [activities, setActivities] = useState<AnalysisActivityItem[]>([]);
  const [retrying, setRetrying] = useState(false);
  const [streamGeneration, setStreamGeneration] = useState(0);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    const addActivity = (item: AnalysisActivityItem) => {
      setActivities((current) =>
        current.some((existing) => existing.id === item.id)
          ? current
          : [...current, item].slice(-80),
      );
    };

    const source = new EventSource(
      `/api/analysis/${analysisId}/stream?token=${encodeURIComponent(guestAccessToken)}`,
    );
    source.addEventListener("activity", (event) => {
      addActivity(JSON.parse((event as MessageEvent).data));
    });
    source.addEventListener("status", (event) => {
      const next = JSON.parse((event as MessageEvent).data);
      setStatus((current) =>
        current
          ? { ...current, ...next }
          : ({
              analysisId,
              domain: companyLabel ?? "Business",
              createdAt: new Date().toISOString(),
              proposalId: null,
              proposalStatus: null,
              pdfUrl: null,
              ...next,
            } as AnalysisStatusPayload),
      );
    });
    source.addEventListener("complete", () => source.close());
    source.onerror = () => {
      source.close();
    };

    const fallback = async () => {
      if (disposed) return;
      try {
        const [next, events] = await Promise.all([
          fetchAnalysisStatus(analysisId),
          fetchAnalysisActivities(analysisId, guestAccessToken),
        ]);
        setStatus(next);
        for (const event of events) addActivity(event);
        if (next.status === "DONE") onComplete?.(next);
        if (next.status !== "DONE" && next.status !== "FAILED") {
          window.setTimeout(fallback, 5000);
        }
      } catch {
        window.setTimeout(fallback, 3500);
      }
    };
    void fallback();

    return () => {
      disposed = true;
      source.close();
    };
  }, [
    analysisId,
    guestAccessToken,
    companyLabel,
    onComplete,
    streamGeneration,
  ]);

  useEffect(() => {
    if (status?.status === "DONE") onComplete?.(status);
  }, [status, onComplete]);

  const currentStep = useMemo(
    () =>
      PIPELINE_PROGRESS_STEPS.find((step) => step.status === status?.status) ??
      PIPELINE_PROGRESS_STEPS[0],
    [status?.status],
  );
  const failed = status?.status === "FAILED";
  const done = status?.status === "DONE";

  const retry = async () => {
    setRetrying(true);
    setError(null);
    try {
      await retryAnalysisRequest({ analysisId, guestAccessToken });
      setStatus((current) =>
        current
          ? { ...current, status: "QUEUED", errorMsg: null, completedAt: null }
          : current,
      );
      setActivities([]);
      setStreamGeneration((current) => current + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetrying(false);
    }
  };

  const saveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailSaving(true);
    try {
      await captureAnalysisEmailRequest({
        analysisId,
        guestAccessToken,
        email,
      });
      setEmailSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save email");
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="sticky top-20 z-10 rounded-2xl border border-border-subtle bg-bg-primary/90 px-4 py-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-xl",
              failed
                ? "bg-accent-rose/12 text-accent-rose"
                : done
                  ? "bg-brand/12 text-brand"
                  : "bg-brand-cyan/12 text-brand-cyan",
            )}
          >
            {failed ? (
              <AlertTriangle size={15} />
            ) : done ? (
              <CheckCircle2 size={15} />
            ) : (
              <Loader2 size={15} className="animate-spin" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {failed
                ? "Research paused"
                : done
                  ? "Report ready"
                  : currentStep?.label}
            </p>
            <p className="truncate text-xs text-text-muted">
              {failed
                ? friendlyErrorMessage(status?.errorMsg)
                : currentStep?.description}
            </p>
          </div>
          <span className="text-xs tabular-nums text-text-muted">
            {progressPercent(status?.status ?? "QUEUED", status?.errorMsg)}%
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-cyan/12 text-brand-cyan">
          <Bot size={16} />
        </span>
        <div className="rounded-2xl rounded-tl-md border border-border-subtle bg-bg-secondary/40 px-4 py-3">
          <p className="text-sm leading-relaxed text-text-primary">
            I’m researching {companyLabel ?? "your business"} now. I’ll show
            the sources I check and the useful signals I find.
          </p>
        </div>
      </div>

      <div className="space-y-3" aria-live="polite">
        {activities.map((activity) => (
          <ActivityTurn key={activity.id} activity={activity} />
        ))}
      </div>

      {!emailSaved && !status?.emailCaptured && activities.length >= 3 ? (
        <div className="ml-11 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-4">
          <div className="flex gap-3">
            <Mail size={17} className="mt-0.5 shrink-0 text-brand-cyan" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                Want the full report delivered?
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Add your email while I continue. You can also stay here.
              </p>
              <form onSubmit={saveEmail} className="mt-3 flex gap-2">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-border-subtle bg-bg-primary/60 px-3 text-sm text-text-primary outline-none focus:border-brand-cyan/40"
                />
                <Button type="submit" size="sm" disabled={emailSaving}>
                  {emailSaving ? "Saving…" : "Notify me"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : emailSaved ? (
        <p className="ml-11 text-xs text-brand">
          Email saved — we’ll send the secure report link when ready.
        </p>
      ) : null}

      {failed ? (
        <div className="ml-11 rounded-2xl border border-accent-rose/30 bg-accent-rose/8 p-4">
          <p className="text-sm font-medium text-text-primary">
            I couldn’t complete this pass
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">
            {friendlyErrorMessage(status?.errorMsg)}
          </p>
          {status?.errorMsg ? (
            <details className="mt-2 text-xs text-text-muted">
              <summary className="cursor-pointer">Technical details</summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg bg-bg-primary/50 p-3 font-mono text-[10px] leading-relaxed">
                {status.errorMsg.slice(0, 1200)}
                {status.errorMsg.length > 1200
                  ? "\n…additional details hidden"
                  : ""}
              </pre>
            </details>
          ) : null}
          <Button
            type="button"
            className="mt-4"
            onClick={retry}
            disabled={retrying}
          >
            <RefreshCw
              size={15}
              className={cn("mr-2", retrying && "animate-spin")}
            />
            {retrying ? "Restarting…" : "Try again"}
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-accent-rose">{error}</p> : null}
    </div>
  );
}

function ActivityTurn({ activity }: { activity: AnalysisActivityItem }) {
  if (activity.kind === "search") {
    return (
      <details className="ml-11 rounded-xl border border-border-subtle/60 bg-bg-secondary/20 px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-text-muted">
          <Search size={13} className="text-brand-cyan" />
          Researching a source
          <ChevronDown size={12} className="ml-auto" />
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          {activity.message}
        </p>
      </details>
    );
  }

  if (activity.kind === "status") {
    return (
      <div className="ml-11 flex items-center gap-2 py-1 text-xs text-text-muted">
        <Loader2 size={12} className="animate-spin text-brand-cyan" />
        {activity.message}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl",
          activity.kind === "warning"
            ? "bg-accent-rose/12 text-accent-rose"
            : "bg-brand/12 text-brand",
        )}
      >
        {activity.kind === "warning" ? (
          <AlertTriangle size={15} />
        ) : (
          <Sparkles size={15} />
        )}
      </span>
      <div className="rounded-2xl rounded-tl-md border border-border-subtle bg-bg-secondary/35 px-4 py-3">
        <p className="text-sm leading-relaxed text-text-primary">
          {activity.message}
        </p>
      </div>
    </div>
  );
}
