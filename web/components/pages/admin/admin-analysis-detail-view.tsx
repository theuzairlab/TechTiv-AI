"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";
import { LeadStatusBadge } from "@/components/pages/admin/lead-status-badge";
import type { AdminAnalysisDetail } from "@/lib/admin/analyses";
import type { LeadStatus } from "@/lib/leads";
import { formatLeadDate } from "@/lib/leads-format";
import { cn } from "@/lib/utils";

type AdminAnalysisDetailViewProps = {
  analysis: AdminAnalysisDetail;
};

export function AdminAnalysisDetailView({
  analysis: initialAnalysis,
}: AdminAnalysisDetailViewProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const totalCost = analysis.usageLogs.reduce(
    (sum, log) => sum + log.costEstimateUSD,
    0,
  );

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
        label="Analysis detail"
        title={analysis.domain}
        description={`Created ${formatLeadDate(analysis.createdAt)}`}
        action={
          analysis.status === "FAILED" ? (
            <Button
              type="button"
              variant="outline"
              disabled={retrying}
              onClick={handleRetry}
            >
              <RefreshCw size={14} className={cn(retrying && "animate-spin")} />
              Retry analysis
            </Button>
          ) : null
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
        <MetricCard label="Tool calls" value={String(analysis.usageLogs.length)} />
        <MetricCard label="Est. provider cost" value={`$${totalCost.toFixed(2)}`} />
        <MetricCard
          label="Completed"
          value={
            analysis.completedAt
              ? formatLeadDate(analysis.completedAt)
              : "In progress"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel variant="elevated" className="p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Lead
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
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
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/admin/leads?lead=${analysis.lead.id}`}
              className="text-xs text-brand-cyan no-underline hover:underline"
            >
              Open in leads CRM
            </Link>
            {analysis.lead.userId ? (
              <Link
                href={`/dashboard/analyses/${analysis.id}`}
                className="text-xs text-brand-cyan no-underline hover:underline"
              >
                User dashboard view
              </Link>
            ) : null}
          </div>
        </GlassPanel>

        <GlassPanel variant="elevated" className="p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Proposal
          </h2>
          {analysis.proposal ? (
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow label="Status" value={analysis.proposal.status} />
              <DetailRow
                label="Investment"
                value={
                  analysis.proposal.costEstimateUSD != null
                    ? `$${analysis.proposal.costEstimateUSD.toLocaleString()}`
                    : "—"
                }
              />
              <DetailRow
                label="Timeline"
                value={
                  analysis.proposal.timelineWeeks != null
                    ? `${analysis.proposal.timelineWeeks} weeks`
                    : "—"
                }
              />
              {analysis.proposal.pdfUrl ? (
                <DetailRow
                  label="PDF"
                  value={
                    <a
                      href={`/api/analysis/${analysis.id}/pdf`}
                      className="text-brand-cyan hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  }
                />
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-text-muted">No proposal generated yet.</p>
          )}
        </GlassPanel>
      </div>

      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="border-b border-border-subtle/60 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Tool usage
          </h2>
        </div>
        {analysis.usageLogs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-text-muted">No tool calls logged.</p>
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
                    <td className="px-4 py-3">${log.costEstimateUSD.toFixed(4)}</td>
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
  );
}

function MetricCard({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
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
