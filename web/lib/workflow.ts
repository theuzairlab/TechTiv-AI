export type WorkflowNodeType = "trigger" | "ai" | "action" | "output";

export type WorkflowNode = {
  id: string;
  label: string;
  description: string;
  type: WorkflowNodeType;
  icon: string;
};

export const workflowPipeline: WorkflowNode[] = [
  {
    id: "lead-entry",
    label: "Lead enters website",
    description: "Form submission captured via webhook",
    type: "trigger",
    icon: "⚡",
  },
  {
    id: "ai-qualify",
    label: "AI qualifies lead",
    description: "GPT scores intent, budget, and fit",
    type: "ai",
    icon: "🧠",
  },
  {
    id: "crm-update",
    label: "CRM updates automatically",
    description: "HubSpot contact + deal stage synced",
    type: "action",
    icon: "🔄",
  },
  {
    id: "voice-call",
    label: "Voice AI calls customer",
    description: "Vapi outbound qualification call",
    type: "ai",
    icon: "📞",
  },
  {
    id: "email-sequence",
    label: "Email sequence triggered",
    description: "Personalized 5-step nurture flow",
    type: "action",
    icon: "✉️",
  },
  {
    id: "appointment",
    label: "Appointment booked",
    description: "Calendar slot confirmed automatically",
    type: "action",
    icon: "📅",
  },
  {
    id: "dashboard",
    label: "Dashboard updated",
    description: "Live analytics + team notification",
    type: "output",
    icon: "📊",
  },
];

export type NodePosition = {
  x: number;
  y: number;
};

/** Default layout — percentage positions inside the canvas */
export const defaultWorkflowPositions: Record<string, NodePosition> = {
  "lead-entry": { x: 4, y: 38 },
  "ai-qualify": { x: 18, y: 22 },
  "crm-update": { x: 32, y: 42 },
  "voice-call": { x: 46, y: 26 },
  "email-sequence": { x: 60, y: 44 },
  "appointment": { x: 74, y: 28 },
  dashboard: { x: 88, y: 40 },
};

export const workflowEdges = workflowPipeline.slice(0, -1).map((node, index) => ({
  from: node.id,
  to: workflowPipeline[index + 1].id,
}));

export const nodeTypeStyles: Record<
  WorkflowNodeType,
  { badge: string; border: string; glow: string }
> = {
  trigger: {
    badge: "bg-accent-lime/15 text-accent-lime border-accent-lime/30",
    border: "border-accent-lime/40",
    glow: "shadow-glow-lime",
  },
  ai: {
    badge: "bg-accent-violet/15 text-accent-violet border-accent-violet/30",
    border: "border-accent-violet/40",
    glow: "shadow-glow-cyan",
  },
  action: {
    badge: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
    border: "border-accent-cyan/40",
    glow: "shadow-glow-cyan",
  },
  output: {
    badge: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
    border: "border-accent-rose/40",
    glow: "shadow-glow-cyan",
  },
};
