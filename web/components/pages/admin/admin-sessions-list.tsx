"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ConsultationTranscript } from "@/components/analysis/report-view";
import { formatDateTime } from "@/lib/format-display";
import type { ConsultationHistoryMessage } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export type AdminSessionItem = {
  id: string;
  domain: string;
  clientName: string;
  clientEmail: string;
  userId: string | null;
  messageCount: number;
  lastAt: string | null;
  lastPreview: string | null;
  messages: ConsultationHistoryMessage[];
};

export function AdminSessionsList({ sessions }: { sessions: AdminSessionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(sessions[0]?.id ?? null);

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
                  <p className="font-semibold text-text-primary">{row.domain}</p>
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
                      href={`/admin/analyses/${row.id}`}
                      className="text-brand-cyan no-underline hover:underline"
                    >
                      Open client report
                    </Link>
                    {row.userId ? (
                      <Link
                        href={`/admin/clients/${row.userId}`}
                        className="text-brand-cyan no-underline hover:underline"
                      >
                        Client 360
                      </Link>
                    ) : null}
                  </div>
                  <ConsultationTranscript
                    messages={row.messages}
                    audience="admin"
                    title="Intake conversation"
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
