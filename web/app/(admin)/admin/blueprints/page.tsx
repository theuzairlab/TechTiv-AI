import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatUsd } from "@/lib/format-display";

export const metadata: Metadata = {
  title: "Blueprints",
  robots: { index: false, follow: false },
};

export default async function AdminBlueprintsPage() {
  const rows = await prisma.proposal.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      analysis: {
        select: {
          id: true,
          domain: true,
          status: true,
          lead: {
            select: { name: true, email: true, userId: true, company: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Delivery"
        title="Blueprints"
        description="Generated strategy reports and PDFs across the platform."
      />

      {rows.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">No generated blueprints yet.</p>
        </GlassPanel>
      ) : (
        <GlassPanel className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle text-[10px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Investment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-bg-secondary/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/analyses/${row.analysis.id}`}
                      className="font-medium text-text-primary no-underline hover:text-brand-cyan"
                    >
                      {row.analysis.domain}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {row.analysis.lead.userId ? (
                      <Link
                        href={`/admin/clients/${row.analysis.lead.userId}`}
                        className="text-text-primary no-underline hover:text-brand-cyan"
                      >
                        {row.analysis.lead.name}
                      </Link>
                    ) : (
                      row.analysis.lead.name
                    )}
                    <p className="text-xs">{row.analysis.lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {row.costEstimateUSD != null
                      ? formatUsd(row.costEstimateUSD)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={row.analysis.status === "DONE" ? "lime" : "default"}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {formatDateTime(row.updatedAt.toISOString())}
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
