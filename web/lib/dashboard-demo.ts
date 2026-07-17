export type DashboardModuleId =
  | "leads"
  | "conversations"
  | "support"
  | "workflows"
  | "calls";

export type DashboardModule = {
  id: DashboardModuleId;
  label: string;
  icon: string;
};

export const dashboardModules: DashboardModule[] = [
  { id: "leads", label: "Lead Activity", icon: "◎" },
  { id: "conversations", label: "AI Conversations", icon: "◈" },
  { id: "support", label: "Support Metrics", icon: "◇" },
  { id: "workflows", label: "Workflow Logs", icon: "⬡" },
  { id: "calls", label: "Call Analytics", icon: "◉" },
];

export const dashboardStats = [
  { label: "Active Leads", value: 142, suffix: "", trend: "+12%" },
  { label: "AI Conversations", value: 89, suffix: "", trend: "+28%" },
  { label: "Workflows Run", value: 1247, suffix: "", trend: "+8%" },
  { label: "Avg Response", value: 12, suffix: "s", trend: "-64%" },
] as const;

export type ActivityItem = {
  id: string;
  type: "lead" | "workflow" | "crm" | "call" | "chat";
  message: string;
  time: string;
};

export const activityPool: Omit<ActivityItem, "id" | "time">[] = [
  { type: "lead", message: "New lead qualified — Sarah M., Real Estate" },
  { type: "chat", message: "AI bot resolved support ticket #4821" },
  { type: "workflow", message: "Email sequence triggered for Apex Realty" },
  { type: "crm", message: "HubSpot deal stage updated → Qualified" },
  { type: "call", message: "Voice AI completed outbound call — 4m 12s" },
  { type: "lead", message: "Lead score increased to 87 — hot prospect" },
  { type: "workflow", message: "n8n workflow 'Cart Recovery' executed" },
  { type: "chat", message: "WhatsApp bot booked appointment for tomorrow" },
  { type: "crm", message: "Salesforce contact synced with enrichment data" },
  { type: "call", message: "Inbound call answered — appointment scheduled" },
];

export const conversationPreviews = [
  {
    id: "c1",
    user: "Visitor #2847",
    preview: "I need help automating our sales follow-ups...",
    status: "active" as const,
  },
  {
    id: "c2",
    user: "James R.",
    preview: "What's the pricing for voice AI integration?",
    status: "resolved" as const,
  },
  {
    id: "c3",
    user: "Elena V.",
    preview: "Can AI handle our customer support tickets?",
    status: "active" as const,
  },
];

export const supportMetrics = [
  { label: "Tickets Deflected", value: 68, unit: "%" },
  { label: "Avg Resolution", value: 42, unit: "sec" },
  { label: "CSAT Score", value: 4.8, unit: "/5" },
  { label: "Open Tickets", value: 12, unit: "" },
];

export const workflowLogs = [
  { id: "w1", name: "Lead → CRM Sync", status: "success", duration: "1.2s" },
  { id: "w2", name: "Voice Follow-up", status: "running", duration: "—" },
  { id: "w3", name: "Email Nurture Seq.", status: "success", duration: "0.8s" },
  { id: "w4", name: "Cart Recovery", status: "success", duration: "2.1s" },
  { id: "w5", name: "Slack Notification", status: "success", duration: "0.3s" },
];

export const callAnalytics = [
  { label: "Calls Today", value: 47 },
  { label: "Avg Duration", value: "3m 24s" },
  { label: "Qualified", value: "72%" },
  { label: "Booked", value: "18" },
];

export const leadActivity = [
  { name: "Sarah Mitchell", source: "Website", score: 92, status: "Hot" },
  { name: "James Chen", source: "Voice AI", score: 78, status: "Warm" },
  { name: "Elena Vasquez", source: "WhatsApp", score: 85, status: "Hot" },
  { name: "Marcus Webb", source: "LinkedIn", score: 64, status: "New" },
];

export const activityTypeColors: Record<ActivityItem["type"], string> = {
  lead: "bg-accent-cyan",
  chat: "bg-accent-violet",
  workflow: "bg-accent-lime",
  crm: "bg-accent-rose",
  call: "bg-accent-cyan",
};

export function formatActivityTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
