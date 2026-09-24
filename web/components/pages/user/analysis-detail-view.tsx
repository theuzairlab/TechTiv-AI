"use client";

import Link from "next/link";
import { ArrowLeft, Download, Lock, MessageSquare, Mic } from "lucide-react";
import type { AnalysisDetail } from "@/lib/dashboard/types";
import { averageScorecardScore } from "@/lib/dashboard/types";
import { AnalysisProgressPanel } from "@/components/analysis/analysis-progress-panel";
import {
  ConsultationTranscript,
  ReportView,
} from "@/components/analysis/report-view";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { isTerminalStatus } from "@/lib/analysis/progress";

export function AnalysisDetailView({ detail }: { detail: AnalysisDetail }) {
  const proposal = detail.proposal;
  const report = proposal?.reportJson;
  const inFlight = !isTerminalStatus(detail.status);
  const aiScore = averageScorecardScore(report?.scorecard);

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted no-underline hover:text-brand-cyan"
        >
          <ArrowLeft size={14} /> Back to overview
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="s-label">— Strategy report</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
              {detail.domain}
            </h1>
            {aiScore != null ? (
              <p className="mt-2 text-base text-text-muted">
                Business AI Score{" "}
                <span className="font-semibold text-brand-cyan">{aiScore}/100</span>
              </p>
            ) : null}
          </div>
          <Badge variant={detail.status === "DONE" ? "lime" : "default"}>
            {detail.status}
          </Badge>
        </div>
      </div>

      {inFlight ? (
        <AnalysisProgressPanel
          analysisId={detail.id}
          email={detail.leadEmail}
          initialStatus={{
            analysisId: detail.id,
            domain: detail.domain,
            status: detail.status,
            errorMsg: detail.errorMsg,
            createdAt: detail.createdAt,
            completedAt: detail.completedAt,
            proposalId: proposal?.id ?? null,
            proposalStatus: proposal?.status ?? null,
            pdfUrl: proposal?.pdfUrl ?? null,
            emailCaptured: true,
          }}
        />
      ) : null}

      {detail.status === "FAILED" ? (
        <GlassPanel className="border-accent-rose/30 bg-accent-rose/10 p-6">
          <p className="text-lg font-semibold text-text-primary">Analysis paused</p>
          <p className="mt-2 text-base text-text-muted">{detail.errorMsg}</p>
        </GlassPanel>
      ) : null}

      {detail.status === "DONE" ? (
        <PortalActions
          analysisId={detail.id}
          pdfUnlocked={detail.pdfUnlocked}
          hasReport={Boolean(report || proposal)}
        />
      ) : null}

      {detail.status === "DONE" && report ? (
        <ReportView
          analysisId={detail.id}
          domain={detail.domain}
          leadEmail={detail.leadEmail}
          report={report}
          pdfUnlocked={detail.pdfUnlocked}
        />
      ) : null}

      {detail.status === "DONE" && proposal && !report ? (
        <GlassPanel className="p-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Legacy report
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-text-muted">
            {proposal.narrativeText ??
              proposal.strategyJson?.businessSummary ??
              "This report predates the current report format."}
          </p>
        </GlassPanel>
      ) : null}

      <ConsultationTranscript messages={detail.consultation} />
    </div>
  );
}

function PortalActions({
  analysisId,
  pdfUnlocked,
  hasReport,
}: {
  analysisId: string;
  pdfUnlocked: boolean;
  hasReport: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassPanel className="p-5">
        <MessageSquare size={18} className="text-brand-cyan" />
        <h3 className="mt-3 font-display text-base font-semibold text-text-primary">
          AI Consultant
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Continue the text conversation about this blueprint and next steps.
        </p>
        <Button
          href={`/dashboard/consultant?analysisId=${analysisId}`}
          size="sm"
          className="mt-4"
        >
          Open chat
        </Button>
      </GlassPanel>

      <GlassPanel className="p-5">
        <Mic size={18} className="text-brand-cyan" />
        <h3 className="mt-3 font-display text-base font-semibold text-text-primary">
          Voice Consultant
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Talk through this blueprint in real time with Gemini Live.
        </p>
        <Button
          href={`/dashboard/consultant?analysisId=${analysisId}#voice`}
          size="sm"
          className="mt-4"
        >
          Open voice
        </Button>
      </GlassPanel>

      <GlassPanel className="flex flex-col justify-between p-5">
        <div>
          {pdfUnlocked ? (
            <Download size={18} className="text-brand-cyan" />
          ) : (
            <Lock size={18} className="text-text-muted" />
          )}
          <h3 className="mt-3 font-display text-base font-semibold text-text-primary">
            PDF download
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {pdfUnlocked
              ? "Full strategy PDF is available for this blueprint."
              : "PDF unlock will require the $5 Blueprint entitlement."}
          </p>
        </div>
        {hasReport && pdfUnlocked ? (
          <Button href={`/api/analysis/${analysisId}/pdf`} size="sm" className="mt-4">
            <Download size={14} className="mr-1.5" /> Download PDF
          </Button>
        ) : (
          <Button size="sm" className="mt-4" disabled>
            <Lock size={14} className="mr-1.5" /> Locked
          </Button>
        )}
      </GlassPanel>
    </div>
  );
}
