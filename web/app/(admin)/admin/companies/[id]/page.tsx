import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { AssignAdminForm } from "@/components/admin/assign-admin-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { getAdminCompanyDetail, listAdminAssignees } from "@/lib/admin/clients";
import { formatDateTime } from "@/lib/format-display";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";

export const metadata: Metadata = {
  title: "Company",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [company, assignees] = await Promise.all([
    getAdminCompanyDetail(id),
    listAdminAssignees(),
  ]);
  if (!company) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Company"
        title={company.name}
        description={company.domain ?? "No public domain on file"}
        action={
          <AssignAdminForm
            companyId={company.id}
            currentAdminId={company.assignedAdminId}
            assignees={assignees}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassPanel className="p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">Members</h2>
          {company.users.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">No portal users yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border-subtle/60">
              {company.users.map((user) => (
                <li key={user.id} className="py-3">
                  <Link
                    href={`/admin/clients/${user.id}`}
                    className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">Leads</h2>
          {company.leads.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">No leads for this company.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border-subtle/60">
              {company.leads.map((lead) => (
                <li key={lead.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/leads?lead=${lead.id}`}
                      className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                    >
                      {lead.name}
                    </Link>
                    <Badge variant={leadStatusVariants[lead.status]}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    {lead.email} · {lead.source} · {formatDateTime(lead.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
