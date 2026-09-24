import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminSessionsList } from "@/components/pages/admin/admin-sessions-list";
import { prisma } from "@/lib/prisma";
import type { ConsultationHistoryMessage } from "@/lib/dashboard/types";

export const metadata: Metadata = {
  title: "AI Sessions",
  robots: { index: false, follow: false },
};

export default async function AdminSessionsPage() {
  const analyses = await prisma.analysis.findMany({
    where: { consultation: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      domain: true,
      createdAt: true,
      lead: { select: { name: true, email: true, userId: true } },
      consultation: {
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true, role: true },
      },
    },
  });

  const sessions = analyses.map((row) => {
    const messages: ConsultationHistoryMessage[] = row.consultation.map(
      (message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      }),
    );
    const last = messages[messages.length - 1] ?? null;
    return {
      id: row.id,
      domain: row.domain,
      clientName: row.lead.name,
      clientEmail: row.lead.email,
      userId: row.lead.userId,
      messageCount: messages.length,
      lastAt: last?.createdAt ?? null,
      lastPreview: last?.content ?? null,
      messages,
    };
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Delivery"
        title="AI Sessions"
        description="Read the intake chat the client had with TivAI before the report was built. Expand a card to see the full conversation."
      />

      {sessions.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">
            No AI consultation transcripts yet. They appear after a client
            chats with the consultant during analysis.
          </p>
        </GlassPanel>
      ) : (
        <AdminSessionsList sessions={sessions} />
      )}
    </div>
  );
}
