import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getAdminOverviewMetrics } from "@/lib/admin/metrics";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  const metrics = await getAdminOverviewMetrics();
  const funnel = [
    { label: "Users", value: metrics.users },
    { label: "Assessments this month", value: metrics.newAssessments },
    { label: "Completed blueprints", value: metrics.analysesByStatus.DONE },
    { label: "AI chat sessions", value: metrics.aiChatSessions },
    { label: "Service requests", value: metrics.consultationRequests },
    { label: "Open service opportunities", value: metrics.serviceOpportunities },
    { label: "Won / converted", value: metrics.convertedClients },
  ];
  const max = Math.max(...funnel.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Operations"
        title="Analytics"
        description="Funnel from signed-in users through assessments, blueprints, and converted service work. Revenue metrics appear after payments."
      />

      <GlassPanel className="p-6">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Conversion funnel
        </h2>
        <ul className="mt-6 space-y-4">
          {funnel.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-text-muted">{item.label}</span>
                <span className="font-medium text-text-primary">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </GlassPanel>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassPanel className="p-5">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Paid blueprints
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-text-primary">
            {metrics.paidBlueprints}
          </p>
          <p className="mt-1 text-xs text-text-muted">Awaiting Stripe</p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Active subscriptions
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-text-primary">
            {metrics.activeSubscriptions}
          </p>
          <p className="mt-1 text-xs text-text-muted">Not enabled yet</p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Voice calls
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-text-primary">
            {metrics.voiceCalls}
          </p>
          <p className="mt-1 text-xs text-text-muted">Gemini Live sessions</p>
        </GlassPanel>
      </div>
    </div>
  );
}
