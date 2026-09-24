"use client";

import { useCallback, useEffect, useState } from "react";
import { AgentConsultation } from "@/components/analysis/agent-consultation";
import { IntelligenceConsole } from "@/components/analysis/intelligence-console";
import { AnalysisTeaserResults } from "@/components/analysis/analysis-teaser-results";
import {
  fetchAnalysisPreview,
  type AnalysisPreviewPayload,
} from "@/lib/analysis/client";
import type { AnalysisStatusPayload } from "@/lib/analysis/progress";
import { cn } from "@/lib/utils";

type Phase =
  | { kind: "consultation"; session?: Session | null }
  | {
      kind: "processing";
      analysisId: string;
      guestAccessToken: string;
      companyLabel: string;
    }
  | {
      kind: "complete";
      analysisId: string;
      guestAccessToken: string;
      email: string | null;
      preview: AnalysisPreviewPayload;
    };

type Session = { analysisId: string; guestAccessToken: string };
const SESSION_KEY = "techtivai_analysis_session_v2";

type AnalyzePageViewProps = {
  /** Public marketing page vs in-portal shell. Same backend workflow. */
  variant?: "public" | "dashboard";
};

export function AnalyzePageView({
  variant = "public",
}: AnalyzePageViewProps) {
  const isDashboard = variant === "dashboard";
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({
    kind: "consultation",
    session: null,
  });

  useEffect(() => {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const restored = JSON.parse(raw) as Phase;
      const timer = window.setTimeout(() => setPhase(restored), 0);
      return () => window.clearTimeout(timer);
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const persist = (next: Phase) => {
    setPhase(next);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  };

  const handleComplete = useCallback(
    async (status: AnalysisStatusPayload) => {
      if (phase.kind !== "processing" || status.status !== "DONE") return;

      try {
        const preview = await fetchAnalysisPreview(
          phase.analysisId,
          phase.guestAccessToken,
        );
        setPhase({
          kind: "complete",
          analysisId: phase.analysisId,
          guestAccessToken: phase.guestAccessToken,
          email: null,
          preview,
        });
        window.sessionStorage.removeItem(SESSION_KEY);
      } catch {
        setError(
          isDashboard
            ? "Analysis finished but preview could not load. Open Blueprints or try again."
            : "Analysis finished but preview could not load. Try signing in.",
        );
      }
    },
    [phase, isDashboard],
  );

  const completeHref =
    phase.kind === "complete"
      ? `/dashboard/analyses/${phase.analysisId}`
      : "/dashboard";

  const loginUrl =
    phase.kind === "complete"
      ? `/login?email=${encodeURIComponent(phase.email ?? "")}&callbackUrl=${encodeURIComponent(`/dashboard/analyses/${phase.analysisId}`)}`
      : "/login";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isDashboard ? "pb-8" : "min-h-screen pb-24 pt-24 sm:pt-28",
      )}
    >
      {!isDashboard ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-cyan)_18%,transparent),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_srgb,var(--accent-lime)_8%,transparent),transparent_45%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid opacity-15"
          />
        </>
      ) : null}

      <div
        className={cn(
          "relative",
          isDashboard ? "mx-auto max-w-3xl" : "mx-auto max-w-3xl px-5 sm:px-8",
        )}
      >
        <header className={cn("mb-8", isDashboard ? "text-left" : "text-center")}>
          <p className="s-label">
            {isDashboard ? "— New analysis" : "— AI business consultant"}
          </p>
          <h1
            className={cn(
              "mt-2 font-display font-semibold tracking-tight text-text-primary",
              isDashboard
                ? "text-3xl md:text-4xl"
                : "text-3xl sm:text-4xl",
            )}
          >
            {isDashboard ? (
              <>
                Analyze a business.{" "}
                <span className="text-gradient-cyan">Build the right system.</span>
              </>
            ) : (
              <>
                Understand the business.{" "}
                <span className="text-gradient-cyan">Build the right system.</span>
              </>
            )}
          </h1>
          <p
            className={cn(
              "mt-3 text-base leading-relaxed text-text-muted sm:text-lg",
              isDashboard ? "max-w-2xl" : "mx-auto max-w-xl",
            )}
          >
            Answer a few focused questions. We’ll research the evidence and
            return a practical AI roadmap.
          </p>
        </header>

        {error ? (
          <p className="mb-4 rounded-xl border border-accent-rose/30 bg-accent-rose/10 p-3 text-sm text-accent-rose">
            {error}
          </p>
        ) : null}

        <main>
          {phase.kind === "consultation" ? (
            <AgentConsultation
              restoredSession={phase.session}
              onSession={(session) =>
                persist({ kind: "consultation", session })
              }
              onConfirmed={(session, companyLabel) =>
                persist({
                  kind: "processing",
                  ...session,
                  companyLabel,
                })
              }
            />
          ) : null}

          {phase.kind === "processing" ? (
            <IntelligenceConsole
              analysisId={phase.analysisId}
              guestAccessToken={phase.guestAccessToken}
              companyLabel={phase.companyLabel}
              onComplete={handleComplete}
            />
          ) : null}

          {phase.kind === "complete" ? (
            <AnalysisTeaserResults
              preview={phase.preview}
              email={phase.email}
              authenticated={isDashboard}
              onRequestLogin={() => {
                window.location.href = isDashboard ? completeHref : loginUrl;
              }}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
