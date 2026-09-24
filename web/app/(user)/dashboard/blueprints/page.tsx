import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { listAnalysesForUser } from "@/lib/dashboard/analyses";
import { formatDateTime, formatUsd } from "@/lib/format-display";
import { requireUserSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata: Metadata = {
  title: "My Blueprints",
  robots: { index: false, follow: false },
};

export default async function UserBlueprintsPage() {
  const session = await requireUserSession();
  const analyses = await listAnalysesForUser(
    session.user.id,
    session.user.email,
  );
  const blueprints = analyses.filter((item) => item.status === "DONE");

  return (
    <div className="space-y-6">
      <div>
        <p className="s-label">— Blueprints</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          My Blueprints
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Completed AI analyses with strategy and pricing.
        </p>
      </div>

      {blueprints.length === 0 ? (
        <GlassPanel className="p-6">
          <p className="text-sm text-text-muted">
            No completed blueprints yet.{" "}
            <Link href="/dashboard/analyze" className="text-brand-cyan hover:text-brand">
              Run a free analysis
            </Link>
            .
          </p>
        </GlassPanel>
      ) : (
        <ul className="space-y-3">
          {blueprints.map((item) => (
            <li key={item.id}>
              <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold text-text-primary">{item.domain}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {item.completedAt
                      ? formatDateTime(item.completedAt)
                      : formatDateTime(item.createdAt)}
                    {item.aiScore != null ? ` · AI score ${item.aiScore}` : ""}
                    {item.opportunityCount > 0
                      ? ` · ${item.opportunityCount} opportunities`
                      : ""}
                    {item.costEstimateUSD != null
                      ? ` · ${formatUsd(item.costEstimateUSD)}`
                      : ""}
                    {item.timelineWeeks != null
                      ? ` · ${item.timelineWeeks} weeks`
                      : ""}
                  </p>
                  {item.topFinding ? (
                    <p className="mt-1 line-clamp-1 text-sm text-text-muted">
                      Top problem: {item.topFinding}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="lime">DONE</Badge>
                  <Button href={`/dashboard/analyses/${item.id}`} size="sm">
                    <FileText size={14} className="mr-1.5" />
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
