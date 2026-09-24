import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Cpu,
  FileText,
  Search,
  Users,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";
import { LeadStatusBadge } from "@/components/pages/admin/lead-status-badge";
import type { Session } from "@/lib/auth";
import { getAdminOverviewMetrics } from "@/lib/admin/metrics";
import { leadStatusLabels, type LeadStatus } from "@/lib/leads";
import { formatRelativeTime, getSourceLabel } from "@/lib/leads-format";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

type AdminDashboardPageViewProps = {
  session: Session;
};

export async function AdminDashboardPageView({ session }: AdminDashboardPageViewProps) {
  const [metrics, recentLeads, statusGroups] = await Promise.all([
    getAdminOverviewMetrics(),
    prisma.lead
      .findMany({
        orderBy: { createdAt: "desc" },
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
      .groupBy({
        by: ["status"],
        _count: { status: true },
      })
      .catch(() => []),
  ]);

  const pipeline = (["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"] as const).map(
    (status) => ({
      status,
      count: statusGroups.find((g) => g.status === status)?._count.status ?? 0,
    }),
  );

  const analysisStages = [
    { key: "inFlight", label: "In flight", count: metrics.inFlightAnalyses },
    { key: "DONE", label: "Completed", count: metrics.analysesByStatus.DONE },
    { key: "FAILED", label: "Failed", count: metrics.failedAnalyses },
  ] as const;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin overview"
        title={
          <>
            Command center,{" "}
            <span className="text-gradient-cyan">{session.user.name.split(" ")[0]}</span>
          </>
        }
        description="What needs attention, then a snapshot of the pipeline."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New leads"
          value={metrics.newLeads}
          href="/admin/leads?status=NEW"
          hint="Waiting in CRM"
        />
        <StatCard
          label="Build requests"
          value={metrics.consultationRequests}
          href="/admin/implementation"
          highlight={metrics.consultationRequests > 0}
          hint="Clients asking us to build"
        />
        <StatCard
          label="In-flight analyses"
          value={metrics.inFlightAnalyses}
          href="/admin/analyses"
          highlight={metrics.inFlightAnalyses > 0}
        />
        <StatCard
          label="Failed analyses"
          value={metrics.failedAnalyses}
          href="/admin/analyses?status=FAILED"
          highlight={metrics.failedAnalyses > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients" value={metrics.users} href="/admin/clients" />
        <StatCard
          label="Completed reports"
          value={metrics.completedProposals}
          href="/admin/analyses?status=DONE"
        />
        <StatCard
          label="Won clients"
          value={metrics.convertedClients}
          href="/admin/leads?status=WON"
        />
        <StatCard
          label="Provider spend"
          value={`$${metrics.providerSpendUSD.toFixed(2)}`}
          href="/admin/providers"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New assessments (mo.)"
          value={metrics.newAssessments}
          href="/admin/analyses"
          hint="Started this month"
        />
        <StatCard
          label="AI chat sessions"
          value={metrics.aiChatSessions}
          href="/admin/consultant-sessions"
          hint="Dashboard consultant"
        />
        <StatCard
          label="Voice calls"
          value={metrics.voiceCalls}
          href="/admin/voice"
          hint="Gemini Live sessions"
        />
        <StatCard
          label="Service opportunities"
          value={metrics.serviceOpportunities}
          href="/admin/implementation"
          hint="Open build requests"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassPanel variant="elevated" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Recent leads
              </p>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Latest submissions
              </h2>
            </div>
            <Link
              href="/admin/leads"
              className="flex items-center gap-1 text-xs text-brand-cyan no-underline hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No leads yet. Submissions from contact and discovery will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle/60">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads?lead=${lead.id}`}
                    className="flex items-center justify-between gap-4 py-3 no-underline transition-colors hover:text-brand-cyan"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">{lead.name}</p>
                      <p className="truncate text-sm text-text-muted">{lead.email}</p>
                      <p className="mt-1 text-xs text-brand-cyan">
                        {getSourceLabel(lead.source)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <LeadStatusBadge status={lead.status as LeadStatus} />
                      <span className="text-[10px] text-text-muted">
                        {formatRelativeTime(lead.createdAt.toISOString())}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel variant="elevated" className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Search size={18} className="text-brand-cyan" />
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Analysis pipeline
              </h2>
            </div>
            <ul className="space-y-3">
              {analysisStages.map((item) => (
                <li key={item.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="font-medium text-text-primary">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand transition-all"
                      style={{
                        width:
                          metrics.analyses > 0
                            ? `${(item.count / metrics.analyses) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {metrics.avgPipelineMinutes != null ? (
              <p className="mt-4 text-xs text-text-muted">
                Avg completion time (recent): ~{metrics.avgPipelineMinutes} min
              </p>
            ) : null}
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users size={18} className="text-brand-cyan" />
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Lead pipeline
              </h2>
            </div>
            <ul className="space-y-3">
              {pipeline.map((item) => (
                <li key={item.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-text-muted">{leadStatusLabels[item.status]}</span>
                    <span className="font-medium text-text-primary">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand transition-all"
                      style={{
                        width:
                          metrics.leads > 0
                            ? `${(item.count / metrics.leads) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel variant="elevated" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Recent failures
              </h2>
            </div>
            <Link
              href="/admin/analyses?status=FAILED"
              className="text-xs text-brand-cyan no-underline hover:underline"
            >
              View all
            </Link>
          </div>
          {metrics.recentFailed.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">
              No failed analyses recently.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle/60">
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
                      <p className="mt-1 truncate text-xs text-destructive">{row.errorMsg}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>

        <GlassPanel variant="elevated" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-brand-cyan" />
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Provider health
              </h2>
            </div>
            <Link
              href="/admin/providers"
              className="text-xs text-brand-cyan no-underline hover:underline"
            >
              Manage
            </Link>
          </div>
          {metrics.providerFailures.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">
              No provider failures this month.
            </p>
          ) : (
            <ul className="space-y-3">
              {metrics.providerFailures.slice(0, 6).map((row) => (
                <li key={row.provider}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-primary">{row.provider}</span>
                    <span className="font-medium text-destructive">
                      {row.count} failures
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
            <FileText size={14} />
            Total tracked spend: ${metrics.providerSpendUSD.toFixed(2)}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
  hint,
}: {
  label: string;
  value: number | string;
  href: string;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <Link href={href} className="no-underline">
      <GlassPanel
        className={cn(
          "p-5 transition-colors hover:border-brand-cyan/30",
          highlight && "border-brand-cyan/30 bg-brand-cyan/5",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-text-primary">{value}</p>
        {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
      </GlassPanel>
    </Link>
  );
}
