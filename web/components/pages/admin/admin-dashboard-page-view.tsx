import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";
import { LeadStatusBadge } from "@/components/pages/admin/lead-status-badge";
import type { Session } from "@/lib/auth";
import { getAdminOverviewMetrics } from "@/lib/admin/metrics";
import type { LeadStatus } from "@/lib/leads";
import { formatRelativeTime, getSourceLabel } from "@/lib/leads-format";
import {
  implementationStatusLabels,
  type ImplementationStatus,
} from "@/lib/implementation";
import { prisma } from "@/lib/prisma";

type AdminDashboardPageViewProps = {
  session: Session;
};

export async function AdminDashboardPageView({ session }: AdminDashboardPageViewProps) {
  const [metrics, newLeads, buildRequests, openBuildRequestCount] = await Promise.all([
    getAdminOverviewMetrics(),
    prisma.lead
      .findMany({
        where: { status: "NEW" },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          source: true,
          status: true,
          createdAt: true,
        },
      })
      .catch(() => []),
    prisma.lead
      .findMany({
        where: {
          source: "service_request",
          OR: [
            { implementationStatus: null },
            { implementationStatus: { notIn: ["DELIVERED", "CLOSED"] } },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          implementationStatus: true,
          createdAt: true,
          metadata: true,
        },
      })
      .catch(() => []),
    prisma.lead
      .count({
        where: {
          source: "service_request",
          OR: [
            { implementationStatus: null },
            { implementationStatus: { notIn: ["DELIVERED", "CLOSED"] } },
          ],
        },
      })
      .catch(() => 0),
  ]);

  const firstName = session.user.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Today"
        title={<>What needs you, {firstName}</>}
        description="Reply to new people, fix failed analyses, and scope open build requests."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Queue
          title="Reply"
          count={metrics.newLeads}
          href="/admin/leads?status=NEW"
          empty="No new leads are waiting."
          isEmpty={newLeads.length === 0}
        >
          {newLeads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads?lead=${lead.id}`}
                className="block py-3 no-underline hover:text-brand-cyan"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">{lead.name}</p>
                    <p className="truncate text-xs text-text-muted">{lead.email}</p>
                    <p className="mt-1 text-xs text-text-muted">{getSourceLabel(lead.source)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <LeadStatusBadge status={lead.status as LeadStatus} />
                    <span className="text-[10px] text-text-muted">
                      {formatRelativeTime(lead.createdAt.toISOString())}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </Queue>

        <Queue
          title="Fix"
          count={metrics.failedAnalyses}
          href="/admin/analyses?status=FAILED"
          empty="No failed analyses."
          isEmpty={metrics.recentFailed.length === 0}
        >
          {metrics.recentFailed.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/analyses/${row.id}`}
                className="block py-3 no-underline hover:text-brand-cyan"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-text-primary">{row.domain}</p>
                  <AnalysisStatusBadge status="FAILED" />
                </div>
                <p className="mt-1 truncate text-xs text-text-muted">{row.leadEmail}</p>
                {row.errorMsg ? (
                  <p className="mt-1 line-clamp-2 text-xs text-destructive">{row.errorMsg}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </Queue>

        <Queue
          title="Scope"
          count={openBuildRequestCount}
          href="/admin/implementation"
          empty="No open build requests."
          isEmpty={buildRequests.length === 0}
        >
          {buildRequests.map((lead) => {
            const metadata =
              lead.metadata && typeof lead.metadata === "object" && !Array.isArray(lead.metadata)
                ? (lead.metadata as Record<string, unknown>)
                : {};
            const service =
              typeof metadata.service === "string" && metadata.service.trim()
                ? metadata.service
                : "Build request";
            return (
              <li key={lead.id}>
                <Link
                  href="/admin/implementation"
                  className="block py-3 no-underline hover:text-brand-cyan"
                >
                  <p className="font-medium text-text-primary">{lead.name}</p>
                  <p className="mt-1 truncate text-xs text-text-muted">
                    {service}
                    {lead.implementationStatus
                      ? ` · ${implementationStatusLabels[lead.implementationStatus as ImplementationStatus]}`
                      : ""}
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatRelativeTime(lead.createdAt.toISOString())}
                  </p>
                </Link>
              </li>
            );
          })}
        </Queue>
      </div>
    </div>
  );
}

function Queue({
  title,
  count,
  href,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  count: number;
  href: string;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <GlassPanel variant="elevated" className="flex flex-col p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 font-display text-3xl font-bold text-text-primary">{count}</p>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-brand-cyan no-underline hover:underline"
        >
          Open <ArrowRight size={14} />
        </Link>
      </div>
      {isEmpty ? (
        <p className="py-8 text-sm text-text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-border-subtle/60">{children}</ul>
      )}
    </GlassPanel>
  );
}
