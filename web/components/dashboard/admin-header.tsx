"use client";

import { Menu } from "lucide-react";
import type { Session } from "@/lib/auth";
import { AdminNotifications } from "@/components/dashboard/admin-notifications";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type AdminHeaderProps = {
  session: Session;
  newLeadsCount?: number;
  onNewLeadsCountChange?: (count: number) => void;
  onMenuClick?: () => void;
};

export function AdminHeader({
  session,
  newLeadsCount = 0,
  onNewLeadsCountChange,
  onMenuClick,
}: AdminHeaderProps) {
  const user = session.user;

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-nav-bg/90 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-xl border border-border-subtle text-text-muted lg:hidden"
            onClick={onMenuClick}
          >
            <Menu size={18} />
          </button>
          <div className="lg:hidden">
            <p className="font-display text-sm font-bold text-text-primary">Admin</p>
            <p className="text-[10px] text-text-muted">TechTivAI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <AdminNotifications
            newLeadsCount={newLeadsCount}
            onCountChange={onNewLeadsCountChange ?? (() => {})}
          />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-text-primary">{user.name}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
