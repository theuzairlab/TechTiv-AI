import type { Metadata } from "next";
import Link from "next/link";
import { listAnalysesForUser } from "@/lib/dashboard/analyses";
import { formatDateTime } from "@/lib/format-display";
import { requireUserSession } from "@/lib/session";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata: Metadata = {
  title: "Blueprints",
  robots: { index: false, follow: false },
};

export default async function UserBlueprintsPage() {
  const session = await requireUserSession();
  const analyses = await listAnalysesForUser(
    session.user.id,
    session.user.email,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="s-label">— Blueprints</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
            Blueprints
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Every analysis on this account. A finished one is your blueprint.
          </p>
        </div>
        <Button href="/dashboard/analyze" size="sm">
          New analysis
        </Button>
      </div>

      {analyses.length === 0 ? (
        <GlassPanel className="p-6">
          <p className="text-sm text-text-muted">
            You haven&apos;t analyzed a business on this account yet.{" "}
            <Link href="/dashboard/analyze" className="text-brand-cyan hover:text-brand">
              Start an analysis
            </Link>
            .
          </p>
        </GlassPanel>
      ) : (
        <ul className="space-y-3">
          {analyses.map((item) => (
            <li key={item.id}>
              <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold text-text-primary">{item.domain}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {item.completedAt
                      ? formatDateTime(item.completedAt)
                      : formatDateTime(item.createdAt)}
                    {item.aiScore != null ? ` · Score ${item.aiScore}` : ""}
                    {item.opportunityCount > 0
                      ? ` · ${item.opportunityCount} opportunities`
                      : ""}
                  </p>
                  {item.topFinding ? (
                    <p className="mt-1 line-clamp-1 text-sm text-text-muted">
                      Top problem: {item.topFinding}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <AnalysisStatusBadge status={item.status} />
                  <Button href={`/dashboard/analyses/${item.id}`} size="sm">
                    Open
                  </Button>
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
