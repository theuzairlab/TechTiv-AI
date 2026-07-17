"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Globe, LayoutDashboard, Sparkles } from "lucide-react";
import type { Session } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const userNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/blueprints", label: "My Blueprints", icon: Sparkles },
  { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
  { href: "/analyze", label: "New analysis", icon: Globe },
] as const;

type UserShellProps = {
  session: Session;
  children: React.ReactNode;
};

export function UserShell({ session, children }: UserShellProps) {
  const pathname = usePathname();
  const user = session.user;
  const showAdminLink = isAdmin(user.role);

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-nav-bg/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="group flex items-center gap-2.5 no-underline">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-lime text-xs font-bold text-on-accent">
                T
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-text-primary">
                My Portal
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {showAdminLink ? (
              <Link
                href="/admin"
                className="hidden text-xs text-text-muted no-underline transition-colors hover:text-brand sm:inline"
              >
                Admin center →
              </Link>
            ) : null}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-text-primary">{user.name}</p>
              <p className="text-xs text-text-muted">
                {user.email}
                {user.username ? ` · @${user.username}` : ""}
              </p>
            </div>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[200px_1fr] sm:px-6 lg:px-8">
        <nav className="flex gap-1 overflow-x-auto lg:block lg:overflow-visible">
          <ul className="flex gap-1 lg:sticky lg:top-24 lg:flex-col lg:gap-1">
            {userNav.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors",
                      active
                        ? "border border-brand/25 bg-brand/10 text-brand"
                        : "text-text-muted hover:bg-bg-secondary/60 hover:text-text-primary",
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
