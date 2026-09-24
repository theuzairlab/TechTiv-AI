"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@/lib/auth";
import { AdminHeader } from "@/components/dashboard/admin-header";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

type AdminShellProps = {
  session: Session;
  newLeadsCount?: number;
  inboxUnreadCount?: number;
  children: React.ReactNode;
};

export function AdminShell({
  session,
  newLeadsCount: initialNewLeadsCount = 0,
  inboxUnreadCount: initialInboxUnreadCount = 0,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(initialNewLeadsCount);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(
    initialInboxUnreadCount,
  );

  const handleCountChange = useCallback((count: number) => {
    setNewLeadsCount(count);
  }, []);

  useEffect(() => {
    async function loadUnread() {
      try {
        const response = await fetch("/api/conversations/unread?scope=inbox");
        if (!response.ok) return;
        const payload = (await response.json()) as { unreadCount?: number };
        setInboxUnreadCount(payload.unreadCount ?? 0);
      } catch {
        // Keep last known count.
      }
    }

    const onChange = () => void loadUnread();
    window.addEventListener("inbox-unread-changed", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener("inbox-unread-changed", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar
        newLeadsCount={newLeadsCount}
        inboxUnreadCount={inboxUnreadCount}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          session={session}
          newLeadsCount={newLeadsCount}
          onNewLeadsCountChange={handleCountChange}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
