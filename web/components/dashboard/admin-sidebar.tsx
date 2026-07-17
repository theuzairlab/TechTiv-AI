"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { adminNavItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  newLeadsCount?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AdminSidebar({
  newLeadsCount = 0,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const nav = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-subtle px-4 py-5 lg:px-5">
        <Link
          href="/admin"
          className="group flex items-center gap-2.5 no-underline"
          onClick={onMobileClose}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-lime text-sm font-bold text-on-accent">
            T
          </span>
          <div>
            <p className="font-display text-base font-bold tracking-tight text-text-primary">
              Admin Center
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">
              Internal
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 lg:px-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Navigation
        </p>
        <ul className="space-y-1">
          {adminNavItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const badge =
              item.badgeKey === "newLeads" && newLeadsCount > 0
                ? newLeadsCount
                : null;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors",
                    active
                      ? "border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan"
                      : "text-text-muted hover:bg-bg-secondary/60 hover:text-text-primary",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {item.label}
                  </span>
                  {badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1.5 text-[10px] font-bold text-on-accent">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-4">
        <Link
          href="/dashboard"
          className="flex items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary/40 px-3 py-2.5 text-xs font-medium text-text-muted no-underline transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan"
          onClick={onMobileClose}
        >
          ← User portal
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border-subtle bg-bg-secondary/30 lg:block">
        <div className="sticky top-0 h-screen">{nav}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border-subtle bg-bg-primary shadow-2xl">
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute right-3 top-4 rounded-lg p-2 text-text-muted hover:bg-bg-secondary/60"
              onClick={onMobileClose}
            >
              <X size={18} />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
