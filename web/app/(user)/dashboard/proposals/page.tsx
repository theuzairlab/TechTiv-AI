import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import {
  listAnalysesForUser,
  listServiceRequestsForUser,
} from "@/lib/dashboard/analyses";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";
import { formatDateTime, formatUsd } from "@/lib/format-display";
import {
  implementationStatusLabels,
  implementationStatusVariants,
} from "@/lib/implementation";
import { requireUserSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata: Metadata = {
  title: "Proposals",
  robots: { index: false, follow: false },
};

export default async function UserProposalsPage() {
  const session = await requireUserSession();
  const [analyses, serviceRequests] = await Promise.all([
    listAnalysesForUser(session.user.id, session.user.email),
    listServiceRequestsForUser(session.user.id, session.user.email),
  ]);
  const proposals = analyses.filter((item) => item.proposalStatus != null);

  return (
    <div className="space-y-8">
      <div>
        <p className="s-label">— Proposals</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          Proposals
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Service requests you submitted, plus generated proposal blueprints.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Service requests
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Requests sent from recommended TechTivAI services on your blueprints.
          </p>
        </div>

        {serviceRequests.length === 0 ? (
          <GlassPanel className="p-6">
            <p className="text-sm text-text-muted">
              No service requests yet. Open a completed blueprint and use{" "}
              <span className="text-text-primary">Build This With TechTivAI</span>{" "}
              on a recommended service.
            </p>
          </GlassPanel>
        ) : (
          <ul className="space-y-3">
            {serviceRequests.map((item) => (
              <li key={item.id}>
                <GlassPanel className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-primary">
                      {item.service ?? "Service request"}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {item.analysisDomain ?? item.company ?? "Business"}
                      {" · "}
                      {formatDateTime(item.createdAt)}
                      {item.assignedAdminName
                        ? ` · Account manager ${item.assignedAdminName}`
                        : ""}
                    </p>
                    {item.problem ? (
                      <p className="mt-2 text-sm text-text-muted">
                        <span className="font-medium text-text-primary">Problem: </span>
                        {item.problem}
                      </p>
                    ) : null}
                    {item.estimatedScope ? (
                      <p className="mt-1 text-sm text-text-muted">
                        <span className="font-medium text-text-primary">Scope: </span>
                        {item.estimatedScope}
                        {item.estimatedTimelineWeeks != null
                          ? ` · ${item.estimatedTimelineWeeks} weeks`
                          : ""}
                      </p>
                    ) : null}
                    {item.message ? (
                      <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                        {item.message}
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
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Generated proposal blueprints
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Analyses that already have strategy and pricing attached.
          </p>
        </div>

        {proposals.length === 0 ? (
          <GlassPanel className="p-6">
            <p className="text-sm text-text-muted">
              No generated proposals yet.{" "}
              <Link href="/dashboard/analyze" className="text-brand-cyan hover:text-brand">
                Start an analysis
              </Link>{" "}
              to generate one.
            </p>
          </GlassPanel>
        ) : (
          <ul className="space-y-3">
            {proposals.map((item) => (
              <li key={item.id}>
                <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <p className="font-semibold text-text-primary">{item.domain}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Status: {item.proposalStatus}
                      {item.aiScore != null ? ` · AI score ${item.aiScore}` : ""}
                      {item.costEstimateUSD != null
                        ? ` · ${formatUsd(item.costEstimateUSD)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="cyan">{item.status}</Badge>
                    {item.status === "DONE" && item.pdfUnlocked ? (
                      <Button
                        href={`/api/analysis/${item.id}/pdf`}
                        size="sm"
                        variant="secondary"
                      >
                        <Download size={14} className="mr-1.5" />
                        PDF
                      </Button>
                    ) : null}
                    <Button href={`/dashboard/analyses/${item.id}`} size="sm">
                      View
                    </Button>
                  </div>
                </GlassPanel>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
