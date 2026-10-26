import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { AdminSessionsList } from "@/components/pages/admin/admin-sessions-list";
import {
  AdminConsultantSessionsList,
  type AdminConsultantSessionItem,
} from "@/components/pages/admin/admin-consultant-sessions-list";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format-display";
import type { ConsultationHistoryMessage } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Conversations",
  robots: { index: false, follow: false },
};

type ConversationType = "intake" | "consultant" | "voice";

const types: Array<{ id: ConversationType; label: string }> = [
  { id: "intake", label: "Intake" },
  { id: "consultant", label: "Consultant" },
  { id: "voice", label: "Voice" },
];

function parseType(value: string | undefined): ConversationType {
  if (value === "intake" || value === "voice" || value === "consultant") return value;
  return "consultant";
}

export default async function AdminConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type = parseType(params.type);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Talk"
        title="Conversations"
        description="Intake is the chat before the blueprint. Consultant is the chat after it. Voice is a call on that consultant session."
      />

      <div className="flex flex-wrap gap-2">
        {types.map((item) => (
          <Link
            key={item.id}
            href={`/admin/conversations?type=${item.id}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm no-underline",
              type === item.id
                ? "bg-brand-cyan/15 text-brand-cyan"
                : "text-text-muted hover:bg-bg-secondary/60 hover:text-text-primary",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {type === "intake" ? <IntakeList /> : null}
      {type === "consultant" ? (
        <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
          <ConsultantList />
        </Suspense>
      ) : null}
      {type === "voice" ? <VoiceList /> : null}
    </div>
  );
}

async function IntakeList() {
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
    const messages: ConsultationHistoryMessage[] = row.consultation.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }));
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

  if (sessions.length === 0) {
    return (
      <GlassPanel className="p-8 text-center">
        <p className="text-sm text-text-muted">
          No intake chats yet. They appear when someone talks with TivAI before the blueprint is ready.
        </p>
      </GlassPanel>
    );
  }

  return <AdminSessionsList sessions={sessions} />;
}

async function ConsultantList() {
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
      const messages: ConsultationHistoryMessage[] = row.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      }));
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

  if (sessions.length === 0) {
    return (
      <GlassPanel className="p-8 text-center">
        <p className="text-sm text-text-muted">
          No consultant chats yet. They appear after a client opens the consultant on a finished blueprint.
        </p>
      </GlassPanel>
    );
  }

  return <AdminConsultantSessionsList sessions={sessions} />;
}

async function VoiceList() {
  const sessions = await prisma.voiceSession.findMany({
    orderBy: { startedAt: "desc" },
    take: 80,
    include: {
      analysis: { select: { domain: true } },
      user: { select: { name: true, email: true } },
      consultantSession: {
        select: {
          _count: { select: { messages: { where: { modality: "voice" } } } },
        },
      },
    },
  });

  if (sessions.length === 0) {
    return (
      <GlassPanel className="p-8 text-center">
        <p className="text-sm text-text-muted">
          No voice calls yet. They appear when a client starts a voice call with the consultant.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle text-[10px] uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Client</th>
            <th className="px-4 py-3 font-semibold">Blueprint</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Started</th>
            <th className="px-4 py-3 font-semibold">Transcript</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">
          {sessions.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <p className="text-text-primary">{row.user.name}</p>
                <p className="text-xs text-text-muted">{row.user.email}</p>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/analyses/${row.analysisId}`}
                  className="text-text-primary no-underline hover:text-brand-cyan"
                >
                  {row.analysis.domain}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge variant={row.status === "LIVE" ? "lime" : "default"}>
                  {row.status === "LIVE" ? "Live" : "Ended"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-text-muted">
                {formatDateTime(row.startedAt.toISOString())}
              </td>
              <td className="px-4 py-3">
                {row.consultantSession._count.messages > 0 ? (
                  <Link
                    href={`/admin/conversations?type=consultant&session=${row.consultantSessionId}`}
                    className="text-sm text-brand-cyan no-underline hover:underline"
                  >
                    View ({row.consultantSession._count.messages})
                  </Link>
                ) : (
                  <span className="text-xs text-text-muted">
                    {row.status === "LIVE" ? "In progress" : "No transcript"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassPanel>
  );
}
