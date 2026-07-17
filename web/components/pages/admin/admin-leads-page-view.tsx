import { Suspense } from "react";
import { AdminLeadsManager } from "@/components/pages/admin/admin-leads-manager";
import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@/lib/leads";

export async function AdminLeadsPageView() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      industry: true,
      interest: true,
      message: true,
      notes: true,
      status: true,
      source: true,
      discoveryAnswers: true,
      metadata: true,
      createdAt: true,
    },
  });

  const rows = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    company: lead.company,
    phone: lead.phone,
    industry: lead.industry,
    interest: lead.interest,
    message: lead.message,
    notes: lead.notes,
    status: lead.status as LeadStatus,
    source: lead.source,
    discoveryAnswers: lead.discoveryAnswers,
    metadata: lead.metadata,
    createdAt: lead.createdAt.toISOString(),
  }));

  const statusCounts = leads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Suspense fallback={<div className="text-sm text-text-muted">Loading leads…</div>}>
      <AdminLeadsManager initialLeads={rows} statusCounts={statusCounts} />
    </Suspense>
  );
}
