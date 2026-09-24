import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { MessageClientButton } from "@/components/admin/message-client-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { getAdminClientDetail, listAdminAssignees } from "@/lib/admin/clients";
import { getStatusLabel } from "@/lib/leads-format";
import { leadStatusVariants } from "@/lib/leads-format";
import { formatDate, formatDateTime } from "@/lib/format-display";
import {
  implementationStatusLabels,
  implementationStatusVariants,
} from "@/lib/implementation";
import { AssignAdminForm } from "@/components/admin/assign-admin-form";

export const metadata: Metadata = {
  title: "Client",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [client, assignees] = await Promise.all([
    getAdminClientDetail(id),
    listAdminAssignees(),
  ]);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Client 360"
        title={client.name}
        description={client.email}
        action={<MessageClientButton userId={client.id} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassPanel className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Profile
          </p>
          <p className="mt-2 text-sm text-text-primary">Role: {client.role}</p>
          <p className="mt-1 text-sm text-text-muted">
            Joined {formatDate(client.createdAt)}
          </p>
        </GlassPanel>
        <GlassPanel className="p-5 lg:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Company
          </p>
          {client.company ? (
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/admin/companies/${client.company.id}`}
                  className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                >
                  {client.company.name}
                </Link>
                <p className="text-sm text-text-muted">
                  {client.company.domain ?? "No domain"}{" "}
                  {client.company.industry ? `· ${client.company.industry}` : ""}
                </p>
              </div>
              <AssignAdminForm
                companyId={client.company.id}
                currentAdminId={client.company.assignedAdminId}
                assignees={assignees}
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-muted">No company linked yet.</p>
          )}
        </GlassPanel>
      </div>

      <GlassPanel className="p-5">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Leads & requests
        </h2>
        {client.leads.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No leads for this client.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-subtle/60">
            {client.leads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link
                    href={`/admin/leads?lead=${lead.id}`}
                    className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {lead.source} · {formatDateTime(lead.createdAt)}
                    {lead.assignedAdminName ? ` · AM ${lead.assignedAdminName}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={leadStatusVariants[lead.status]}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                  {lead.implementationStatus ? (
                    <Badge variant={implementationStatusVariants[lead.implementationStatus]}>
                      {implementationStatusLabels[lead.implementationStatus]}
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      <GlassPanel className="p-5">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Analyses
        </h2>
        {client.analyses.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No analyses yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-subtle/60">
            {client.analyses.map((analysis) => (
              <li key={analysis.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <Link
                    href={`/admin/analyses/${analysis.id}`}
                    className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                  >
                    {analysis.domain}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {formatDateTime(analysis.createdAt)}
                  </p>
                </div>
                <Badge variant={analysis.status === "DONE" ? "lime" : "default"}>
                  {analysis.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      {client.conversations.length > 0 ? (
        <GlassPanel className="p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Conversations
          </h2>
          <ul className="mt-4 space-y-2">
            {client.conversations.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/inbox?id=${row.id}`}
                  className="text-sm text-brand-cyan no-underline hover:underline"
                >
                  Thread {formatDateTime(row.lastMessageAt)}
                </Link>
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}
    </div>
  );
}
