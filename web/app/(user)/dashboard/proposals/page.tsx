import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { listServiceRequestsForUser } from "@/lib/dashboard/analyses";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";
import { formatDateTime } from "@/lib/format-display";
import {
  implementationStatusLabels,
  implementationStatusVariants,
} from "@/lib/implementation";
import { requireUserSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata: Metadata = {
  title: "Build requests",
  robots: { index: false, follow: false },
};

export default async function UserProposalsPage() {
  const session = await requireUserSession();
  const serviceRequests = await listServiceRequestsForUser(
    session.user.id,
    session.user.email,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="s-label">— Build requests</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          Build requests
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Work you asked TechTivAI to build from a blueprint. The blueprint
          itself stays under Blueprints.
        </p>
      </div>

      {serviceRequests.length === 0 ? (
        <GlassPanel className="p-6">
          <p className="text-sm text-text-muted">
            No build requests yet. Open a blueprint and choose{" "}
            <span className="text-text-primary">Build this with TechTivAI</span>.
          </p>
          <Button href="/dashboard/blueprints" className="mt-5" size="sm">
            View blueprints
          </Button>
        </GlassPanel>
      ) : (
        <ul className="space-y-3">
          {serviceRequests.map((item) => (
            <li key={item.id}>
              <GlassPanel className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">
                    {item.service ?? "Build request"}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {item.analysisDomain ?? item.company ?? "Business"}
                    {" · "}
                    {formatDateTime(item.createdAt)}
                    {item.assignedAdminName
                      ? ` · ${item.assignedAdminName}`
                      : ""}
                  </p>
                  {item.problem ? (
                    <p className="mt-2 text-sm text-text-muted">
                      <span className="font-medium text-text-primary">Problem: </span>
                      {item.problem}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={leadStatusVariants[item.status]}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  {item.implementationStatus ? (
                    <Badge variant={implementationStatusVariants[item.implementationStatus]}>
                      {implementationStatusLabels[item.implementationStatus]}
                    </Badge>
                  ) : null}
                  {item.analysisId ? (
                    <Button
                      href={`/dashboard/analyses/${item.analysisId}`}
                      size="sm"
                      variant="secondary"
                    >
                      <FileText size={14} className="mr-1.5" />
                      Blueprint
                    </Button>
                  ) : null}
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
