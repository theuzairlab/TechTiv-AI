export type ServiceAccent = "cyan" | "lime" | "violet" | "rose";

export type Service = {
  id: string;
  label: string;
  shortDescription: string;
  features: readonly string[];
  accent: ServiceAccent;
  position: { x: number; y: number };
  isHub?: boolean;
};

function polarPosition(
  index: number,
  total: number,
  radiusX: number,
  radiusY: number,
) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + radiusX * Math.cos(angle),
    y: 50 + radiusY * Math.sin(angle),
  };
}

const outerServices = [
  {
    id: "chatbots",
    label: "AI Chatbots & Assistants",
    shortDescription: "GPT-powered assistants across web, WhatsApp, and internal support.",
    features: [
      "GPT-powered chatbots",
      "Website assistants",
      "WhatsApp bots",
      "Internal support AI",
      "Knowledge base AI",
    ],
    accent: "cyan" as const,
  },
  {
    id: "voice-agents",
    label: "AI Voice Agents",
    shortDescription: "24/7 voice reception, qualification, and outbound calling systems.",
    features: [
      "Voice receptionists",
      "Appointment booking",
      "AI phone support",
      "Lead qualification calls",
      "AI outbound calls",
    ],
    accent: "lime" as const,
  },
  {
    id: "lead-generation",
    label: "AI Lead Generation",
    shortDescription: "Automated outreach, enrichment, and SDR pipelines at scale.",
    features: [
      "AI outreach",
      "AI SDR systems",
      "Lead enrichment",
      "Email sequences",
      "LinkedIn automation",
    ],
    accent: "violet" as const,
  },
  {
    id: "crm-automation",
    label: "AI CRM Automation",
    shortDescription: "Smart pipelines, routing, and AI-scored opportunities.",
    features: [
      "Lead routing",
      "Automated follow-ups",
      "Smart pipelines",
      "Opportunity tracking",
      "AI scoring systems",
    ],
    accent: "rose" as const,
  },
  {
    id: "custom-agents",
    label: "Custom AI Agents",
    shortDescription: "Purpose-built agents for sales, support, research, and ops.",
    features: [
      "Research agents",
      "Sales agents",
      "Support agents",
      "Operations agents",
      "Internal business agents",
    ],
    accent: "cyan" as const,
  },
  {
    id: "content-automation",
    label: "AI Content Automation",
    shortDescription: "Blogs, ads, social, and SEO content generated at scale.",
    features: [
      "AI blogs",
      "AI ads",
      "Social media AI",
      "AI video scripting",
      "SEO AI systems",
    ],
    accent: "lime" as const,
  },
  {
    id: "data-analytics",
    label: "AI Data & Analytics",
    shortDescription: "Dashboards, predictive analytics, and intelligent reporting.",
    features: [
      "Dashboards",
      "AI reporting",
      "Predictive analytics",
      "Business intelligence",
      "AI insights",
    ],
    accent: "violet" as const,
  },
  {
    id: "process-automation",
    label: "Business Process Automation",
    shortDescription: "HR, finance, approvals, and document processing workflows.",
    features: [
      "HR automation",
      "Finance automation",
      "Approval workflows",
      "Operations automation",
      "Document processing AI",
    ],
    accent: "rose" as const,
  },
] as const;

export const hubService: Service = {
  id: "workflow-automation",
  label: "AI Workflow Automation",
  shortDescription: "n8n-powered automations connecting your entire business stack.",
  features: [
    "n8n automations",
    "CRM integrations",
    "Email automation",
    "Data sync",
    "Task automation",
  ],
  accent: "cyan",
  position: { x: 50, y: 50 },
  isHub: true,
};

export const services: Service[] = [
  hubService,
  ...outerServices.map((service, index) => ({
    ...service,
    position: polarPosition(index, outerServices.length, 42, 32),
  })),
];

export const serviceConnections: { from: string; to: string }[] = [
  ...outerServices.map((service) => ({
    from: hubService.id,
    to: service.id,
  })),
  { from: "chatbots", to: "voice-agents" },
  { from: "voice-agents", to: "lead-generation" },
  { from: "lead-generation", to: "crm-automation" },
  { from: "crm-automation", to: "custom-agents" },
  { from: "content-automation", to: "data-analytics" },
  { from: "data-analytics", to: "process-automation" },
  { from: "process-automation", to: "workflow-automation" },
];

export function getService(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}
