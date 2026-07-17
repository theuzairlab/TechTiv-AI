import {
  BarChart3,
  Cpu,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badgeKey?: "newLeads";
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Users, badgeKey: "newLeads" },
  { href: "/admin/analyses", label: "Analyses", icon: Search },
  { href: "/admin/providers", label: "Providers", icon: Cpu },
  { href: "/admin/sessions", label: "AI Sessions", icon: MessageSquare },
  { href: "/admin/proposals", label: "Proposals", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];
