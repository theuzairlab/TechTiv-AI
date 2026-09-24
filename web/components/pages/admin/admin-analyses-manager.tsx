"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";
import type { AdminAnalysisListItem } from "@/lib/admin/analyses";
import type { AnalysisStatus } from "@/lib/generated/prisma/client";
import { formatUsd } from "@/lib/format-display";
import { RelativeTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";

const SIMPLE_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "DONE", label: "Ready for client" },
  { id: "FAILED", label: "Needs retry" },
] as const;

type SimpleFilter = (typeof SIMPLE_FILTERS)[number]["id"];

function matchesSimpleFilter(
  status: AnalysisStatus,
  filter: SimpleFilter,
) {
  if (filter === "ALL") return true;
  if (filter === "DONE") return status === "DONE";
  if (filter === "FAILED") return status === "FAILED";
  return status !== "DONE" && status !== "FAILED";
}

type AdminAnalysesManagerProps = {
  initialAnalyses: AdminAnalysisListItem[];
};

export function AdminAnalysesManager({
  initialAnalyses,
}: AdminAnalysesManagerProps) {
  const searchParams = useSearchParams();
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<SimpleFilter>(
    searchParams.get("status") === "FAILED"
      ? "FAILED"
      : searchParams.get("status") === "DONE"
        ? "DONE"
        : "ALL",
  );
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return analyses.filter((row) => {
      if (!matchesSimpleFilter(row.status, statusFilter)) return false;
      if (!q) return true;
      return (
        row.domain.toLowerCase().includes(q) ||
        row.leadEmail.toLowerCase().includes(q) ||
        row.leadName.toLowerCase().includes(q)
      );
    });
  }, [analyses, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      ALL: analyses.length,
      IN_PROGRESS: analyses.filter((row) =>
        matchesSimpleFilter(row.status, "IN_PROGRESS"),
      ).length,
      DONE: analyses.filter((row) => row.status === "DONE").length,
      FAILED: analyses.filter((row) => row.status === "FAILED").length,
    };
  }, [analyses]);

  async function handleRetry(analysisId: string) {
    setRetryingId(analysisId);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analyses/${analysisId}/retry`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Retry failed");
      }
      setAnalyses((rows) =>
        rows.map((row) =>
          row.id === analysisId
            ? { ...row, status: "QUEUED", errorMsg: null }
            : row,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Delivery"
        title="Analyses"
        description="Open a report to see the same findings the client received. Pipeline tools stay on a separate tab."
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search domain, name, or email…"
            className="h-11 w-full rounded-xl border border-glass-border bg-bg-secondary/80 pl-10 pr-4 text-sm text-text-primary backdrop-blur-sm focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SIMPLE_FILTERS.map((filter) => {
            const count = statusCounts[filter.id];
            const active = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand-cyan/15 text-brand-cyan"
                    : "bg-bg-secondary/80 text-text-muted hover:text-text-primary",
                )}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <GlassPanel variant="elevated" className="overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-text-muted">
            No analyses match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border-subtle/60 bg-bg-secondary/40 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">AI score</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{row.domain}</div>
                      {row.topFinding ? (
                        <p className="mt-1 max-w-xs truncate text-xs text-text-muted">
                          {row.topFinding}
                        </p>
                      ) : null}
                      {row.errorMsg ? (
                        <p className="mt-1 max-w-xs truncate text-xs text-destructive">
                          {row.errorMsg}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-text-primary">{row.leadName}</div>
                      <div className="text-xs text-text-muted">{row.leadEmail}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {row.leadUserId ? (
                          <Link
                            href={`/admin/clients/${row.leadUserId}`}
                            className="text-brand-cyan no-underline hover:underline"
                          >
                            Client
                          </Link>
                        ) : null}
                        {row.companyId ? (
                          <Link
                            href={`/admin/companies/${row.companyId}`}
                            className="text-brand-cyan no-underline hover:underline"
                          >
                            {row.companyName ?? "Company"}
                          </Link>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AnalysisStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {row.aiScore != null ? (
                        <div>
                          <span className="font-semibold text-text-primary">
                            {row.aiScore}
                          </span>
                          <span className="text-xs">/100</span>
                          {row.opportunityCount > 0 ? (
                            <div className="text-xs">
                              {row.opportunityCount} opportunities
                            </div>
                          ) : null}
                        </div>
                      ) : row.costEstimateUSD != null ? (
                        formatUsd(row.costEstimateUSD)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      <RelativeTime value={row.createdAt} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === "FAILED" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={retryingId === row.id}
                            onClick={() => handleRetry(row.id)}
                          >
                            <RefreshCw
                              size={14}
                              className={cn(
                                retryingId === row.id && "animate-spin",
                              )}
                            />
                            Retry
                          </Button>
                        ) : null}
                        <Link
                          href={`/admin/analyses/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-muted no-underline hover:border-brand-cyan/30 hover:text-brand-cyan"
                        >
                          Open report
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
