"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@/lib/auth";
import { AdminHeader } from "@/components/dashboard/admin-header";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

type AdminShellProps = {
  session: Session;
  newLeadsCount?: number;
  children: React.ReactNode;
};

export function AdminShell({
  session,
  newLeadsCount: initialNewLeadsCount = 0,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(initialNewLeadsCount);

  useEffect(() => {
    setNewLeadsCount(initialNewLeadsCount);
  }, [initialNewLeadsCount]);

  const handleCountChange = useCallback((count: number) => {
    setNewLeadsCount(count);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar
        newLeadsCount={newLeadsCount}
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
