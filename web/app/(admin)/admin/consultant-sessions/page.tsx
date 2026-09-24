import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  AdminConsultantSessionsList,
  type AdminConsultantSessionItem,
} from "@/components/pages/admin/admin-consultant-sessions-list";
import { prisma } from "@/lib/prisma";
import type { ConsultationHistoryMessage } from "@/lib/dashboard/types";

export const metadata: Metadata = {
  title: "Consultant Chats",
  robots: { index: false, follow: false },
};

export default async function AdminConsultantSessionsPage() {
  const rows = await prisma.consultantSession.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 80,
    select: {
      id: true,
      userId: true,
      analysisId: true,
      lastMessageAt: true,
      user: { select: { name: true, email: true } },
      analysis: { select: { domain: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          modality: true,
          createdAt: true,
        },
      },
    },
  });

  const sessions: AdminConsultantSessionItem[] = rows
    .filter((row) => row.messages.length > 0)
    .map((row) => {
      const messages: ConsultationHistoryMessage[] = row.messages.map(
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
        domain: row.analysis.domain,
        analysisId: row.analysisId,
        clientName: row.user.name,
        clientEmail: row.user.email,
        userId: row.userId,
        messageCount: messages.length,
        hasVoice: row.messages.some((message) => message.modality === "voice"),
        lastAt: last?.createdAt ?? row.lastMessageAt.toISOString(),
        lastPreview: last?.content ?? null,
        messages,
      };
    });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Delivery"
        title="Consultant chats"
        description="AI Consultant conversations clients had in their dashboard after the blueprint was ready — both text chat and Gemini Live voice transcripts. Intake chat before the report is under AI Sessions."
      />

      {sessions.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">
            No consultant conversations yet. They appear after a client opens
            AI Consultant on a completed blueprint.
          </p>
        </GlassPanel>
      ) : (
        <Suspense fallback={<div className="text-sm text-text-muted">Loading…</div>}>
          <AdminConsultantSessionsList sessions={sessions} />
        </Suspense>
      )}
    </div>
  );
}
