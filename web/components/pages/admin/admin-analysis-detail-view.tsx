"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, MessageSquare, RefreshCw, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";
import { LeadStatusBadge } from "@/components/pages/admin/lead-status-badge";
import {
  ConsultationTranscript,
  ReportView,
} from "@/components/analysis/report-view";
import { MessageClientButton } from "@/components/admin/message-client-button";
import type { AdminAnalysisDetail } from "@/lib/admin/analyses";
import { averageScorecardScore } from "@/lib/dashboard/types";
import type { LeadStatus } from "@/lib/leads";
import { formatLeadDate } from "@/lib/leads-format";
import { formatUsd } from "@/lib/format-display";
import { cn } from "@/lib/utils";

type AdminAnalysisDetailViewProps = {
  analysis: AdminAnalysisDetail;
};

type DetailTab = "report" | "conversation" | "pipeline";

export function AdminAnalysisDetailView({
  analysis: initialAnalysis,
}: AdminAnalysisDetailViewProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("report");

  const report = analysis.proposal?.reportJson ?? null;
  const aiScore = averageScorecardScore(report?.scorecard);
  const totalCost = analysis.usageLogs.reduce(
    (sum, log) => sum + log.costEstimateUSD,
    0,
  );

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analyses/${analysis.id}/retry`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Retry failed");
      }
      setAnalysis((prev) => ({
        ...prev,
        status: "QUEUED",
        errorMsg: null,
        completedAt: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/analyses"
          className="inline-flex items-center gap-1 text-sm text-text-muted no-underline hover:text-brand-cyan"
        >
          <ArrowLeft size={14} /> Back to analyses
        </Link>
      </div>

      <AdminPageHeader
        label="Client report"
        title={analysis.domain}
        description={
          aiScore != null
            ? `Business AI score ${aiScore}/100 · Created ${formatLeadDate(analysis.createdAt)}`
            : `Created ${formatLeadDate(analysis.createdAt)}`
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {analysis.lead.userId ? (
              <MessageClientButton
                userId={analysis.lead.userId}
                relatedLeadId={analysis.lead.id}
              />
            ) : null}
            {analysis.status === "FAILED" ? (
              <Button
                type="button"
                variant="outline"
                disabled={retrying}
                onClick={handleRetry}
              >
                <RefreshCw size={14} className={cn(retrying && "animate-spin")} />
                Retry analysis
              </Button>
            ) : null}
          </div>
        }
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      {analysis.errorMsg ? (
        <GlassPanel className="border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
            Pipeline error
          </p>
          <p className="mt-2 text-sm text-text-primary">{analysis.errorMsg}</p>
        </GlassPanel>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Status">
          <AnalysisStatusBadge status={analysis.status} />
        </MetricCard>
        <MetricCard
          label="Client"
          value={analysis.lead.name}
          hint={analysis.lead.email}
        />
        <MetricCard
          label="Investment"
          value={
            analysis.proposal?.costEstimateUSD != null
              ? formatUsd(analysis.proposal.costEstimateUSD)
              : "—"
          }
          hint={
            analysis.proposal?.timelineWeeks != null
              ? `${analysis.proposal.timelineWeeks} weeks`
              : undefined
          }
        />
        <MetricCard
          label="Completed"
          value={
            analysis.completedAt
              ? formatLeadDate(analysis.completedAt)
              : "In progress"
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <GlassPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Who this is for
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <DetailRow label="Name" value={analysis.lead.name} />
            <DetailRow label="Email" value={analysis.lead.email} />
            <DetailRow label="Company" value={analysis.lead.company ?? "—"} />
            <DetailRow
              label="CRM status"
              value={
                <LeadStatusBadge status={analysis.lead.status as LeadStatus} />
              }
            />
          </dl>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href={`/admin/leads?lead=${analysis.lead.id}`}
              className="text-brand-cyan no-underline hover:underline"
            >
              Open in leads
            </Link>
            {analysis.lead.userId ? (
              <Link
                href={`/admin/clients/${analysis.lead.userId}`}
                className="text-brand-cyan no-underline hover:underline"
              >
                Client 360
              </Link>
            ) : null}
            {analysis.lead.companyId ? (
              <Link
                href={`/admin/companies/${analysis.lead.companyId}`}
                className="text-brand-cyan no-underline hover:underline"
              >
                Company
              </Link>
            ) : null}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            How to use this page
          </p>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            <li>
              <span className="font-medium text-text-primary">Client report</span>
              {" — "}the same findings and recommendations the client received.
            </li>
            <li>
              <span className="font-medium text-text-primary">AI conversation</span>
              {" — "}what they told the consultant before the report.
            </li>
            <li>
              <span className="font-medium text-text-primary">Pipeline</span>
              {" — "}internal tool usage and cost, not shown to the client.
            </li>
          </ul>
        </GlassPanel>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "report", label: "Client report", icon: Search },
            { id: "conversation", label: "AI conversation", icon: MessageSquare },
            { id: "pipeline", label: "Pipeline & tools", icon: Wrench },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-cyan/15 text-brand-cyan"
                  : "bg-bg-secondary/80 text-text-muted hover:text-text-primary",
              )}
            >
              <Icon size={14} />
              {item.label}
              {item.id === "conversation" && analysis.consultation.length > 0
                ? ` (${analysis.consultation.length})`
                : null}
            </button>
          );
        })}
      </div>

      {tab === "report" ? (
        <div className="space-y-6">
          {report ? (
            <ReportView
              analysisId={analysis.id}
              domain={analysis.domain}
              leadEmail={analysis.lead.email}
              report={report}
              pdfUnlocked
              audience="admin"
            />
          ) : analysis.proposal?.narrativeText ? (
            <GlassPanel className="p-6">
              <h2 className="font-display text-xl font-semibold text-text-primary">
                Client narrative
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-text-muted">
                {analysis.proposal.narrativeText}
              </p>
            </GlassPanel>
          ) : (
            <GlassPanel className="p-8 text-center">
              <p className="text-sm text-text-muted">
                {analysis.status === "DONE"
                  ? "This run finished without a client-facing report."
                  : "The client report appears here when analysis completes."}
              </p>
            </GlassPanel>
          )}
        </div>
      ) : null}

      {tab === "conversation" ? (
        <ConsultationTranscript
          messages={analysis.consultation}
          audience="admin"
          title="What the client discussed with AI"
        />
      ) : null}

      {tab === "pipeline" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Tool calls"
              value={String(analysis.usageLogs.length)}
            />
            <MetricCard
              label="Est. provider cost"
              value={`$${totalCost.toFixed(2)}`}
            />
          </div>

          <GlassPanel variant="elevated" className="overflow-hidden">
            <div className="border-b border-border-subtle/60 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Tool usage
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Internal only — the client does not see this table.
              </p>
            </div>
            {analysis.usageLogs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-text-muted">
                No tool calls logged.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-bg-secondary/40 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-4 py-3">Provider</th>
                      <th className="px-4 py-3">Endpoint</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Latency</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/60">
                    {analysis.usageLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {log.provider}
                        </td>
                        <td className="px-4 py-3 text-text-muted">{log.endpoint}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                              log.status === "failed"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-accent-lime/15 text-accent-lime",
                            )}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          ${log.costEstimateUSD.toFixed(4)}
                        </td>
                        <td className="px-4 py-3">{log.latencyMs}ms</td>
                        <td className="px-4 py-3 text-xs text-text-muted">
                          {formatLeadDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Raw signals ({analysis.rawSignals.length})
            </h2>
            {analysis.rawSignals.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">No raw signals stored.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {analysis.rawSignals.map((signal) => (
                  <details
                    key={signal.id}
                    className="rounded-xl border border-border-subtle/60 bg-bg-secondary/30 p-3"
                  >
                    <summary className="cursor-pointer text-sm font-medium text-text-primary">
                      {signal.source}{" "}
                      <span className="text-xs font-normal text-text-muted">
                        · {formatLeadDate(signal.fetchedAt)}
                      </span>
                    </summary>
                    <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-bg-primary p-3 text-xs text-text-muted">
                      {JSON.stringify(signal.payload, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value?: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassPanel className="p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className="mt-2 font-display text-xl font-semibold text-text-primary">
        {children ?? value}
      </div>
      {hint ? <p className="mt-1 truncate text-xs text-text-muted">{hint}</p> : null}
    </GlassPanel>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right text-text-primary">{value}</dd>
    </div>
  );
}
