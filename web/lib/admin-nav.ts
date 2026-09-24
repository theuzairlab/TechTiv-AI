import {
  BarChart3,
  Bot,
  Building2,
  Cpu,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Repeat,
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
  section: "overview" | "crm" | "delivery" | "ops" | "commerce";
};

export const adminNavSections: Array<{
  id: AdminNavItem["section"];
  label: string;
}> = [
  { id: "overview", label: "Overview" },
  { id: "crm", label: "CRM" },
  { id: "delivery", label: "Delivery" },
  { id: "ops", label: "Operations" },
  { id: "commerce", label: "Commerce" },
];

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, section: "overview" },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, badgeKey: "inbox", section: "crm" },
  { href: "/admin/clients", label: "Clients", icon: UserRound, section: "crm" },
  { href: "/admin/companies", label: "Companies", icon: Building2, section: "crm" },
  { href: "/admin/leads", label: "Leads", icon: Users, badgeKey: "newLeads", section: "crm" },
  { href: "/admin/implementation", label: "Build requests", icon: Workflow, section: "delivery" },
  { href: "/admin/analyses", label: "Analyses", icon: Search, section: "delivery" },
  { href: "/admin/blueprints", label: "Blueprints", icon: FileText, section: "delivery" },
  { href: "/admin/sessions", label: "AI Sessions", icon: MessageSquare, section: "delivery" },
  { href: "/admin/consultant-sessions", label: "Consultant Chats", icon: Bot, section: "delivery" },
  { href: "/admin/providers", label: "Providers", icon: Cpu, section: "ops" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, section: "ops" },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, section: "commerce" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: Repeat, section: "commerce" },
  { href: "/admin/voice", label: "Voice", icon: Mic, section: "commerce" },
];
