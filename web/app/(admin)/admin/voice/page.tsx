import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format-display";

export const metadata: Metadata = {
  title: "Voice",
  robots: { index: false, follow: false },
};

export default async function AdminVoicePage() {
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Commerce"
        title="Voice calls"
        description="Gemini Live consultant sessions. Recordings stay on-device for now; open a session to read its saved transcript."
      />

      {sessions.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">
            No voice sessions yet. They appear when a client starts Voice on
            /dashboard/consultant.
          </p>
        </GlassPanel>
      ) : (
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
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {formatDateTime(row.startedAt.toISOString())}
                  </td>
                  <td className="px-4 py-3">
                    {row.consultantSession._count.messages > 0 ? (
                      <Link
                        href={`/admin/consultant-sessions?session=${row.consultantSessionId}`}
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
      )}
    </div>
  );
}
