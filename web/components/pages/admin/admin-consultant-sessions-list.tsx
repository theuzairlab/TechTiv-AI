"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Mic, MessageSquare } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { ConsultationTranscript } from "@/components/analysis/report-view";
import { formatDateTime } from "@/lib/format-display";
import type { ConsultationHistoryMessage } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export type AdminConsultantSessionItem = {
  id: string;
  domain: string;
  analysisId: string;
  clientName: string;
  clientEmail: string;
  userId: string;
  messageCount: number;
  hasVoice: boolean;
  lastAt: string | null;
  lastPreview: string | null;
  messages: ConsultationHistoryMessage[];
};

export function AdminConsultantSessionsList({
  sessions,
}: {
  sessions: AdminConsultantSessionItem[];
}) {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("session");
  const initialOpenId =
    requestedId && sessions.some((row) => row.id === requestedId)
      ? requestedId
      : sessions[0]?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(initialOpenId);

  return (
    <ul className="space-y-3">
      {sessions.map((row) => {
        const open = openId === row.id;
        return (
          <li key={row.id}>
            <GlassPanel className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : row.id)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">
                      {row.domain}
                    </p>
                    {row.hasVoice ? (
                      <Badge variant="cyan">
                        <Mic size={10} className="mr-1 inline" />
                        Voice
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <MessageSquare size={10} className="mr-1 inline" />
                        Text
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {row.clientName} · {row.messageCount} messages
                    {row.lastAt ? ` · last ${formatDateTime(row.lastAt)}` : ""}
                  </p>
                  {!open && row.lastPreview ? (
                    <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                      {row.lastPreview}
                    </p>
                  ) : null}
                </div>
                <ChevronDown
                  size={18}
                  className={cn(
                    "mt-1 shrink-0 text-text-muted transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open ? (
                <div className="space-y-4 border-t border-border-subtle/60 px-5 py-4">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/admin/analyses/${row.analysisId}`}
                      className="text-brand-cyan no-underline hover:underline"
                    >
                      Open client report
                    </Link>
                    <Link
                      href={`/admin/clients/${row.userId}`}
                      className="text-brand-cyan no-underline hover:underline"
                    >
                      Client 360
                    </Link>
                  </div>
                  <ConsultationTranscript
                    messages={row.messages}
                    audience="admin"
                    title="Blueprint consultant conversation"
                    plain
                  />
                </div>
              ) : null}
            </GlassPanel>
          </li>
        );
      })}
    </ul>
  );
}
