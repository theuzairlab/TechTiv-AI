"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Mail,
  AlertTriangle,
} from "lucide-react";
import {
  PIPELINE_PROGRESS_STEPS,
  getStatusIndex,
  isTerminalStatus,
  progressPercent,
  type AnalysisStatusPayload,
} from "@/lib/analysis/progress";
import { fetchAnalysisStatus } from "@/lib/analysis/client";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

type AnalysisProgressPanelProps = {
  analysisId: string;
  email: string;
  initialStatus?: AnalysisStatusPayload | null;
};

export function AnalysisProgressPanel({
  analysisId,
  email,
  initialStatus = null,
}: AnalysisProgressPanelProps) {
  const [status, setStatus] = useState<AnalysisStatusPayload | null>(
    initialStatus,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const next = await fetchAnalysisStatus(analysisId);
        if (cancelled) return;
        setStatus(next);
        setError(null);

        if (!isTerminalStatus(next.status)) {
          timer = setTimeout(poll, 2500);
        }
      } catch {
        if (cancelled) return;
        setError("Could not refresh status. Retrying…");
        timer = setTimeout(poll, 4000);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [analysisId]);

  const current = status?.status ?? "QUEUED";
  const currentIndex = getStatusIndex(current);
  const percent = progressPercent(current);
  const done = current === "DONE";
  const failed = current === "FAILED";

  return (
    <GlassPanel variant="elevated" className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="s-label">— Analysis in progress</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">
            {status?.domain ?? "Your website"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Job ID: <span className="font-mono text-xs">{analysisId}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-text-primary">
            {failed ? "—" : `${percent}%`}
          </p>
          <p className="text-xs text-text-muted">complete</p>
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-bg-secondary">
        <motion.div
          className={cn(
            "h-full rounded-full",
            failed ? "bg-accent-rose" : "bg-gradient-to-r from-accent-cyan to-accent-lime",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${failed ? 100 : percent}%` }}
          transition={{ duration: 0.45 }}
        />
      </div>

      <ol className="mt-8 space-y-3">
        {PIPELINE_PROGRESS_STEPS.filter((step) => step.status !== "DONE").map(
          (step) => {
            const stepIndex = getStatusIndex(step.status);
            const complete = !failed && currentIndex > stepIndex;
            const active = !failed && !done && currentIndex === stepIndex;

            return (
              <li
                key={step.status}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-3",
                  active
                    ? "border-brand-cyan/30 bg-brand-cyan/10"
                    : "border-border-subtle bg-bg-secondary/40",
                )}
              >
                {complete ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                ) : active ? (
                  <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-brand-cyan" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-text-dim" />
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {step.label}
                  </p>
                  <p className="text-xs text-text-muted">{step.description}</p>
                </div>
              </li>
            );
          },
        )}
      </ol>

      {error ? (
        <p className="mt-4 text-sm text-accent-rose" role="status">
          {error}
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {failed ? (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-accent-rose/30 bg-accent-rose/10 p-4"
          >
            <div className="flex gap-3">
              <AlertTriangle className="size-5 shrink-0 text-accent-rose" />
              <div>
                <p className="font-semibold text-text-primary">Analysis failed</p>
                <p className="mt-1 text-sm text-text-muted">
                  {status?.errorMsg ?? "Something went wrong while analyzing."}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-brand/25 bg-brand/10 p-4"
          >
            <p className="font-semibold text-text-primary">Blueprint ready</p>
            <p className="mt-1 text-sm text-text-muted">
              We emailed a secure magic link to{" "}
              <strong className="text-text-primary">{email}</strong>. Sign in to
              view and download your report.
            </p>
            <Button href="/login" className="mt-4" size="sm">
              Open sign-in
            </Button>
          </motion.div>
        ) : !failed ? (
          <motion.div
            key="notify"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex gap-3 rounded-xl border border-border-subtle bg-bg-secondary/50 p-4"
          >
            <Mail className="mt-0.5 size-5 shrink-0 text-brand-cyan" />
            <div>
              <p className="font-semibold text-text-primary">
                We&apos;ll email you when processing completes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">
                You can keep this page open to watch progress, or leave anytime.
                When the analysis finishes we&apos;ll send a notification to{" "}
                <strong className="text-text-primary">{email}</strong> with a
                magic link to your blueprint.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassPanel>
  );
}
