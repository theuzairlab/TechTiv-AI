import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { listAdminCompanies } from "@/lib/admin/clients";
import { formatDate } from "@/lib/format-display";

export const metadata: Metadata = {
  title: "Companies",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCompaniesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const companies = await listAdminCompanies(q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="CRM"
        title="Companies"
        description="Organizations attached to clients, analyses, and implementation work."
      />

      <form className="max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search company or domain"
          className="h-11 w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 text-sm text-text-primary"
        />
      </form>

      {companies.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">No companies yet.</p>
        </GlassPanel>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {companies.map((company) => (
            <li key={company.id}>
              <Link href={`/admin/companies/${company.id}`} className="no-underline">
                <GlassPanel className="p-5 transition-colors hover:border-brand-cyan/30">
                  <p className="font-semibold text-text-primary">{company.name}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {company.domain ?? "No domain"} · {company.userCount} members ·{" "}
                    {company.leadCount} leads
                  </p>
                  <p className="mt-2 text-xs text-text-muted">
                    AM {company.assignedAdminName ?? "unassigned"} · updated{" "}
                    {formatDate(company.updatedAt)}
                  </p>
                </GlassPanel>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
