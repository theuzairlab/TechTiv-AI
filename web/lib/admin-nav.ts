import {
  BarChart3,
  Cpu,
  CreditCard,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Search,
  UserRound,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badgeKey?: "newLeads" | "inbox";
  section: "today" | "people" | "work" | "talk" | "settings";
};

export const adminNavSections: Array<{
  id: AdminNavItem["section"];
  label: string;
}> = [
  { id: "today", label: "Today" },
  { id: "people", label: "People" },
  { id: "work", label: "Work" },
  { id: "talk", label: "Talk" },
  { id: "settings", label: "Settings" },
];

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, section: "today" },
  { href: "/admin/leads", label: "Leads", icon: Users, badgeKey: "newLeads", section: "people" },
  { href: "/admin/clients", label: "Clients", icon: UserRound, section: "people" },
  { href: "/admin/analyses", label: "Analyses", icon: Search, section: "work" },
  { href: "/admin/implementation", label: "Build requests", icon: Workflow, section: "work" },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, badgeKey: "inbox", section: "talk" },
  { href: "/admin/conversations", label: "Conversations", icon: MessageSquare, section: "talk" },
  { href: "/admin/providers", label: "Providers", icon: Cpu, section: "settings" },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, section: "settings" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, section: "settings" },
];
