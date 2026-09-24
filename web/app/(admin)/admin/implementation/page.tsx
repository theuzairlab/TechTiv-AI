import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { ImplementationStatusSelect } from "@/components/admin/implementation-status-select";
import { LeadAssigneeSelect } from "@/components/admin/lead-assignee-select";
import { MessageClientButton } from "@/components/admin/message-client-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format-display";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";
import type { LeadStatus } from "@/lib/leads";
import { listAdminAssignees } from "@/lib/admin/clients";
import {
  implementationStatusHelp,
  type ImplementationStatus,
} from "@/lib/implementation";

export const metadata: Metadata = {
  title: "Implementation",
  robots: { index: false, follow: false },
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function AdminImplementationPage() {
  const [rows, assignees] = await Promise.all([
    prisma.lead.findMany({
      where: { source: "service_request" },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true } },
        assignedAdmin: { select: { name: true } },
        companyRecord: { select: { name: true } },
      },
    }),
    listAdminAssignees(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Delivery"
        title="Build requests"
        description="When a client taps “Build this with TechTivAI” on their report, the request lands here. Review it, message them, then update status as work moves."
      />

      {rows.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">
            No build requests yet. They appear after a client asks TechTivAI to
            implement a recommended service.
          </p>
        </GlassPanel>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const metadata = asObject(row.metadata) ?? {};
            const service =
              asString(metadata.service) ?? "Requested service";
            const problem = asString(metadata.problem);
            const scope = asString(metadata.estimatedScope);
            const techStack = asStringArray(metadata.techStack);
            const timelineWeeks = asNumber(metadata.estimatedTimelineWeeks);
            const analysisId = asString(metadata.analysisId);
            const analysisDomain =
              asString(metadata.analysisDomain) ??
              row.companyRecord?.name ??
              row.company;
            const implementationStatus =
              row.implementationStatus as ImplementationStatus | null;

            return (
              <li key={row.id}>
                <GlassPanel className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Client asked us to build
                      </p>
                      <h2 className="mt-1 font-display text-xl font-semibold text-text-primary">
                        {service}
                      </h2>
                      <p className="mt-1 text-sm text-text-muted">
                        {analysisDomain ?? "Business"} ·{" "}
                        {formatDateTime(row.createdAt.toISOString())}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={leadStatusVariants[row.status as LeadStatus]}>
                        Sales: {getStatusLabel(row.status as LeadStatus)}
                      </Badge>
                      {implementationStatus ? (
                        <span className="text-xs text-text-muted">
                          {implementationStatusHelp[implementationStatus]}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">
                          Not started — pick this up
                        </span>
                      )}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-text-muted">
                        Client
                      </dt>
                      <dd className="mt-1 text-sm text-text-primary">
                        {row.user ? (
                          <Link
                            href={`/admin/clients/${row.user.id}`}
                            className="text-text-primary no-underline hover:text-brand-cyan"
                          >
                            {row.user.name}
                          </Link>
                        ) : (
                          row.email
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-text-muted">
                        Owner
                      </dt>
                      <dd className="mt-1">
                        <LeadAssigneeSelect
                          leadId={row.id}
                          currentAdminId={row.assignedAdminId}
                          assignees={assignees}
                        />
                      </dd>
                    </div>
                    {problem ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-text-muted">
                          Why they asked
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                          {problem}
                        </dd>
                      </div>
                    ) : null}
                    {scope ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-text-muted">
                          Suggested scope
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                          {scope}
                        </dd>
                      </div>
                    ) : null}
                    {techStack.length ? (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-text-muted">
                          Tools mentioned
                        </dt>
                        <dd className="mt-1 text-sm text-text-primary">
                          {techStack.join(", ")}
                        </dd>
                      </div>
                    ) : null}
                    {timelineWeeks != null ? (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-text-muted">
                          Suggested timeline
                        </dt>
                        <dd className="mt-1 text-sm text-text-primary">
                          {timelineWeeks} week{timelineWeeks === 1 ? "" : "s"}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/60 pt-4">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">
                        Delivery status
                      </p>
                      <ImplementationStatusSelect
                        leadId={row.id}
                        value={implementationStatus}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {analysisId ? (
                        <Link
                          href={`/admin/analyses/${analysisId}`}
                          className="text-sm text-brand-cyan no-underline hover:underline"
                        >
                          Open client report
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/leads?lead=${row.id}`}
                          className="text-sm text-brand-cyan no-underline hover:underline"
                        >
                          Open lead
                        </Link>
                      )}
                      {row.user ? (
                        <div className="text-right">
                          <MessageClientButton
                            userId={row.user.id}
                            relatedLeadId={row.id}
                          />
                          <p className="mt-1 text-[11px] text-text-muted">
                            Opens a thread in Inbox so you can talk about this
                            request.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </GlassPanel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
