import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { listAdminClients } from "@/lib/admin/clients";
import { formatDate } from "@/lib/format-display";

export const metadata: Metadata = {
  title: "Clients",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const clients = await listAdminClients(q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="CRM"
        title="Clients"
        description="Every signed-in person, their company, and activity across analyses and leads."
      />

      <form className="max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, email, or company"
          className="h-11 w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 text-sm text-text-primary"
        />
      </form>

      {clients.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">No clients match that search.</p>
        </GlassPanel>
      ) : (
        <GlassPanel className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle text-[10px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                    >
                      {client.name}
                    </Link>
                    <p className="text-xs text-text-muted">{client.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {client.companyName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="default">{client.leadCount} leads</Badge>
                      <Badge variant="cyan">{client.analysisCount} analyses</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {formatDate(client.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div>
  );
}
