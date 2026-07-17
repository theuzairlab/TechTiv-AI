"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { formatRelativeTime, getSourceLabel } from "@/lib/leads-format";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 3 * 60 * 1000;

type NotificationLead = {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
};

type AdminNotificationsProps = {
  newLeadsCount: number;
  onCountChange: (count: number) => void;
};

export function AdminNotifications({
  newLeadsCount,
  onCountChange,
}: AdminNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [recentLeads, setRecentLeads] = useState<NotificationLead[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (!response.ok) return;

      const data = (await response.json()) as {
        newLeadsCount: number;
        recentLeads: NotificationLead[];
      };

      setRecentLeads(data.recentLeads);
      onCountChange(data.newLeadsCount);
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchNotifications();

    const interval = window.setInterval(fetchNotifications, POLL_INTERVAL_MS);
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = () => {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      setLoading(true);
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={handleOpen}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary/40 text-text-muted transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan",
          open && "border-brand-cyan/30 text-brand-cyan",
        )}
      >
        <Bell size={18} />
        {newLeadsCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1 text-[10px] font-bold text-on-accent">
            {newLeadsCount > 9 ? "9+" : newLeadsCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary shadow-2xl">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Notifications</p>
              <p className="text-xs text-text-muted">
                {newLeadsCount > 0
                  ? `${newLeadsCount} new lead${newLeadsCount === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </p>
            </div>
            <Link
              href="/admin/leads?status=NEW"
              className="text-xs text-brand-cyan no-underline hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && recentLeads.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">Loading…</p>
            ) : recentLeads.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <CheckCheck size={24} className="mb-2 text-brand-cyan" />
                <p className="text-sm text-text-muted">No new leads right now</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle/60">
                {recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/admin/leads?lead=${lead.id}`}
                      className="block px-4 py-3 no-underline transition-colors hover:bg-bg-secondary/40"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {lead.name}
                          </p>
                          <p className="truncate text-xs text-text-muted">{lead.email}</p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-brand-cyan">
                            {getSourceLabel(lead.source)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-text-muted">
                          {formatRelativeTime(lead.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
