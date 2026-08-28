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

export function AnalyzePageView() {
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
        setError("Analysis finished but preview could not load. Try signing in.");
      }
    },
    [phase],
  );

  const loginUrl =
    phase.kind === "complete"
      ? `/login?email=${encodeURIComponent(phase.email ?? "")}&callbackUrl=${encodeURIComponent(`/dashboard/analyses/${phase.analysisId}`)}`
      : "/login";

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-24 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-cyan)_18%,transparent),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_srgb,var(--accent-lime)_8%,transparent),transparent_45%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-15" />

      <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
        <header className="mb-8 text-center">
          <p className="s-label">— AI business consultant</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Understand the business.{" "}
            <span className="text-gradient-cyan">Build the right system.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
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
                onRequestLogin={() => {
                  window.location.href = loginUrl;
                }}
              />
            ) : null}
        </main>
      </div>
    </div>
  );
}
