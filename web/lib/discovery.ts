export const businessTypes = [
  { id: "real-estate", label: "Real Estate", icon: "🏠" },
  { id: "ecommerce", label: "Ecommerce", icon: "🛒" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "law-firm", label: "Law Firm", icon: "⚖️" },
  { id: "agency", label: "Agency", icon: "📣" },
  { id: "saas", label: "SaaS", icon: "💻" },
  { id: "logistics", label: "Logistics", icon: "🚚" },
  { id: "finance", label: "Finance", icon: "💰" },
] as const;

export const businessSizes = [
  { id: "solo", label: "Solo", description: "1 person" },
  { id: "small", label: "Small Team", description: "2–10 people" },
  { id: "medium", label: "Medium Business", description: "11–50 people" },
  { id: "enterprise", label: "Enterprise", description: "50+ people" },
] as const;

export const businessProblems = [
  { id: "manual-work", label: "Too much manual work" },
  { id: "slow-leads", label: "Slow lead response" },
  { id: "support-overload", label: "Customer support overload" },
  { id: "missed-appointments", label: "Missed appointments" },
  { id: "sales-inefficiency", label: "Sales inefficiency" },
  { id: "poor-crm", label: "Poor CRM management" },
] as const;

export const businessTools = [
  { id: "hubspot", label: "HubSpot" },
  { id: "salesforce", label: "Salesforce" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "slack", label: "Slack" },
  { id: "gmail", label: "Gmail" },
  { id: "google-sheets", label: "Google Sheets" },
] as const;

export const aiRecommendations = [
  {
    id: "voice-agent",
    label: "AI Voice Agent",
    description: "24/7 phone reception, qualification, and booking",
  },
  {
    id: "crm-automation",
    label: "CRM Automation",
    description: "Smart pipelines, routing, and follow-ups",
  },
  {
    id: "lead-qualification",
    label: "Lead Qualification System",
    description: "Instant scoring, routing, and outreach triggers",
  },
  {
    id: "support-bot",
    label: "AI Support Bot",
    description: "GPT-powered support across web and messaging",
  },
  {
    id: "workflow-automation",
    label: "Workflow Automation",
    description: "n8n automations connecting your entire stack",
  },
  {
    id: "appointment-system",
    label: "AI Appointment System",
    description: "Scheduling, reminders, and no-show recovery",
  },
] as const;

export type BusinessTypeId = (typeof businessTypes)[number]["id"];
export type BusinessSizeId = (typeof businessSizes)[number]["id"];
export type ProblemId = (typeof businessProblems)[number]["id"];
export type ToolId = (typeof businessTools)[number]["id"];
export type RecommendationId = (typeof aiRecommendations)[number]["id"];

export type DiscoveryAnswers = {
  businessType: BusinessTypeId | null;
  businessSize: BusinessSizeId | null;
  problems: ProblemId[];
  tools: ToolId[];
};

export type DiscoveryRoi = {
  hoursSavedPerWeek: number;
  monthlySavings: number;
  revenueIncreasePercent: number;
  impactScore: number;
};

export type DiscoveryResult = {
  recommendations: (typeof aiRecommendations)[number][];
  roi: DiscoveryRoi;
  summary: string;
};

export const discoverySteps = [
  {
    id: "businessType",
    title: "What type of business do you run?",
    subtitle: "We'll tailor AI systems to your industry workflows.",
    mode: "single" as const,
  },
  {
    id: "businessSize",
    title: "How big is your team?",
    subtitle: "Team size affects automation scope and ROI potential.",
    mode: "single" as const,
  },
  {
    id: "problems",
    title: "What are your biggest bottlenecks?",
    subtitle: "Select all that apply — we'll prioritize the highest-impact fixes.",
    mode: "multi" as const,
  },
  {
    id: "tools",
    title: "What tools do you use today?",
    subtitle: "Optional — helps us map integrations to your existing stack.",
    mode: "multi-optional" as const,
  },
] as const;

const industryRecommendations: Record<BusinessTypeId, RecommendationId[]> = {
  "real-estate": ["voice-agent", "crm-automation", "lead-qualification"],
  ecommerce: ["support-bot", "workflow-automation", "crm-automation"],
  healthcare: ["appointment-system", "support-bot", "workflow-automation"],
  "law-firm": ["workflow-automation", "appointment-system", "crm-automation"],
  agency: ["lead-qualification", "crm-automation", "workflow-automation"],
  saas: ["support-bot", "crm-automation", "workflow-automation"],
  logistics: ["workflow-automation", "crm-automation", "support-bot"],
  finance: ["workflow-automation", "crm-automation", "lead-qualification"],
};

const problemRecommendations: Record<ProblemId, RecommendationId[]> = {
  "manual-work": ["workflow-automation"],
  "slow-leads": ["lead-qualification", "voice-agent"],
  "support-overload": ["support-bot"],
  "missed-appointments": ["appointment-system", "voice-agent"],
  "sales-inefficiency": ["lead-qualification", "crm-automation"],
  "poor-crm": ["crm-automation"],
};

const sizeBaseHours: Record<BusinessSizeId, number> = {
  solo: 10,
  small: 20,
  medium: 38,
  enterprise: 72,
};

const sizeHourlyRate: Record<BusinessSizeId, number> = {
  solo: 45,
  small: 55,
  medium: 68,
  enterprise: 85,
};

const problemHours: Record<ProblemId, number> = {
  "manual-work": 8,
  "slow-leads": 5,
  "support-overload": 6,
  "missed-appointments": 4,
  "sales-inefficiency": 5,
  "poor-crm": 4,
};

const industrySummaries: Record<BusinessTypeId, string> = {
  "real-estate":
    "Your real estate operation is primed for voice AI and CRM automation to capture and qualify leads faster.",
  ecommerce:
    "Ecommerce teams see the fastest ROI from support automation and abandoned-cart recovery workflows.",
  healthcare:
    "Healthcare practices benefit most from appointment automation and patient communication AI.",
  "law-firm":
    "Law firms gain efficiency through intake automation, scheduling AI, and document workflows.",
  agency:
    "Agencies scale faster with AI outreach, lead gen systems, and automated client reporting.",
  saas:
    "SaaS companies reduce churn with AI support, onboarding automation, and smart CRM pipelines.",
  logistics:
    "Logistics operations unlock efficiency with dispatch automation and real-time workflow orchestration.",
  finance:
    "Finance teams accelerate compliance and client service with document AI and workflow automation.",
};

function getRecommendationById(id: RecommendationId) {
  const recommendation = aiRecommendations.find((item) => item.id === id);
  if (!recommendation) {
    throw new Error(`Unknown recommendation: ${id}`);
  }
  return recommendation;
}

export function calculateDiscoveryResult(
  answers: DiscoveryAnswers,
): DiscoveryResult | null {
  if (!answers.businessType || !answers.businessSize) {
    return null;
  }

  const recIds = new Set<RecommendationId>();

  for (const id of industryRecommendations[answers.businessType]) {
    recIds.add(id);
  }

  for (const problem of answers.problems) {
    for (const id of problemRecommendations[problem]) {
      recIds.add(id);
    }
  }

  if (recIds.size < 3) {
    recIds.add("workflow-automation");
  }

  const recommendations = [...recIds]
    .slice(0, 4)
    .map(getRecommendationById);

  const hoursFromProblems = answers.problems.reduce(
    (sum, problem) => sum + problemHours[problem],
    0,
  );
  const toolBonus = Math.min(answers.tools.length * 2, 8);
  const hoursSavedPerWeek =
    sizeBaseHours[answers.businessSize] + hoursFromProblems + toolBonus;

  const hourlyRate = sizeHourlyRate[answers.businessSize];
  const monthlySavings = Math.round(hoursSavedPerWeek * hourlyRate * 4.33);

  const revenueIncreasePercent = Math.min(
    45,
    8 +
      answers.problems.length * 5 +
      (answers.businessSize === "enterprise" ? 12 : answers.businessSize === "medium" ? 8 : 4),
  );

  const impactScore = Math.min(
    98,
    52 +
      answers.problems.length * 7 +
      recommendations.length * 4 +
      (answers.businessSize === "enterprise" ? 10 : 0),
  );

  return {
    recommendations,
    roi: {
      hoursSavedPerWeek,
      monthlySavings,
      revenueIncreasePercent,
      impactScore,
    },
    summary: industrySummaries[answers.businessType],
  };
}

export const emptyDiscoveryAnswers: DiscoveryAnswers = {
  businessType: null,
  businessSize: null,
  problems: [],
  tools: [],
};
