import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Clock,
  Gauge,
  Headphones,
  Layers,
  LineChart,
  Phone,
  Plug,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react";

export type PricingTier = {
  id: string;
  name: string;
  price: string | null;
  priceSuffix?: string;
  tagline: string;
  featured?: boolean;
  badge?: string;
  features: ReadonlyArray<{ included: boolean; text: string }>;
  cta: { label: string; href: string; primary?: boolean };
};

export const pricingTiers: PricingTier[] = [
  {
    id: "growth",
    name: "Growth",
    price: "999",
    priceSuffix: "/mo",
    tagline: "For SMBs automating their first AI workflows",
    features: [
      { included: true, text: "2 AI Chatbots / Assistants" },
      { included: true, text: "10 Automated Workflows" },
      { included: true, text: "Basic RAG knowledge base" },
      { included: true, text: "CRM + Email Integration" },
      { included: true, text: "Analytics Dashboard" },
      { included: true, text: "50,000 AI interactions/mo" },
      { included: false, text: "Custom AI Agents" },
      { included: false, text: "Fine-tuned LLM" },
    ],
    cta: { label: "Get Started →", href: "/discovery" },
  },
  {
    id: "scale",
    name: "Scale",
    price: "1,999",
    priceSuffix: "/mo",
    tagline: "For growth companies running AI across all functions",
    featured: true,
    badge: "★ BEST VALUE",
    features: [
      { included: true, text: "Unlimited AI Bots & Assistants" },
      { included: true, text: "Unlimited Workflows" },
      { included: true, text: "5 Custom AI Agents" },
      { included: true, text: "Fine-tuned domain LLM" },
      { included: true, text: "Sales + Marketing AI Suite" },
      { included: true, text: "Data Pipeline + ML models" },
      { included: true, text: "500,000 AI interactions/mo" },
      { included: true, text: "Dedicated AI Engineer" },
    ],
    cta: { label: "Scale with AI →", href: "/discovery", primary: true },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    tagline: "Full AI transformation for large organizations",
    features: [
      { included: true, text: "Unlimited everything" },
      { included: true, text: "Custom AI agent fleet" },
      { included: true, text: "Proprietary LLM training" },
      { included: true, text: "On-premise / private cloud" },
      { included: true, text: "Dedicated AI team (3+ engineers)" },
      { included: true, text: "SLA + 99.9% uptime guarantee" },
      { included: true, text: "White-label options" },
      { included: true, text: "Board-level AI strategy" },
    ],
    cta: { label: "Talk to Sales →", href: "/contact" },
  },
];

export const pricingModels = [
  {
    icon: Wrench,
    title: "One-Time Setup",
    subtitle: "Implementation-based pricing",
    description:
      "Covers discovery, architecture, workflow build, integrations, AI model configuration, testing, and go-live deployment.",
    highlights: ["Workflow engineering", "Integration mapping", "AI training & QA"],
  },
  {
    icon: RefreshCw,
    title: "Monthly Maintenance",
    subtitle: "Support & infrastructure",
    description:
      "Ongoing monitoring, model updates, workflow optimization, infrastructure costs, and priority technical support.",
    highlights: ["24/7 monitoring", "Model retraining", "Priority support"],
  },
  {
    icon: TrendingUp,
    title: "Retainer Partnership",
    subtitle: "Ongoing AI optimization",
    description:
      "Strategic partnership for continuous automation expansion, new agent deployment, ROI optimization, and dedicated engineering.",
    highlights: ["Dedicated engineer", "New automations", "ROI optimization"],
  },
] as const;

export const pricingFactors: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Workflow,
    title: "Workflows",
    description: "Number of automated business processes and decision trees",
  },
  {
    icon: Plug,
    title: "Integrations",
    description: "CRM, ERP, email, Slack, WhatsApp, and custom API connections",
  },
  {
    icon: Brain,
    title: "AI Models",
    description: "LLM tiers, fine-tuning, RAG knowledge bases, and agent count",
  },
  {
    icon: Gauge,
    title: "Complexity",
    description: "Multi-step logic, conditional routing, and custom AI behavior",
  },
  {
    icon: Phone,
    title: "Call Volume",
    description: "AI voice agents, receptionists, and outbound call automation",
  },
  {
    icon: Headphones,
    title: "Support Volume",
    description: "Ticket deflection, chatbot interactions, and helpdesk AI load",
  },
  {
    icon: Layers,
    title: "CRM Requirements",
    description: "HubSpot, Salesforce, GoHighLevel sync depth and custom fields",
  },
];

export const pricingEngineFeatures = [
  {
    icon: RefreshCw,
    title: "Real-Time Updates",
    description: "Estimates refresh instantly as you adjust workflows, volume, and complexity.",
  },
  {
    icon: LineChart,
    title: "ROI Projections",
    description: "Projected hours saved, annual savings, and payback period on every quote.",
  },
  {
    icon: Clock,
    title: "Implementation Timeline",
    description: "Week-by-week deployment estimate based on scope and integration depth.",
  },
  {
    icon: Target,
    title: "Automation Coverage",
    description: "Percentage of operations automatable with your current configuration.",
  },
] as const;

export const blueprintExample = {
  systemLabel: "AI Workflow System",
  setup: 4500,
  monthly: 499,
  retainer: 1500,
  timelineWeeks: 4,
  automationCoverage: 72,
  hoursSaved: 48,
  annualSavings: 31680,
};

export const pricingComparisonRows = [
  { feature: "AI Chatbots / Assistants", growth: "2", scale: "Unlimited", enterprise: "Unlimited" },
  { feature: "Automated Workflows", growth: "10", scale: "Unlimited", enterprise: "Unlimited" },
  { feature: "Custom AI Agents", growth: "—", scale: "5", enterprise: "Unlimited fleet" },
  { feature: "Fine-tuned LLM", growth: "—", scale: "✓", enterprise: "Proprietary" },
  { feature: "AI Interactions / mo", growth: "50K", scale: "500K", enterprise: "Unlimited" },
  { feature: "Dedicated Engineer", growth: "—", scale: "✓", enterprise: "3+ team" },
  { feature: "SLA & Uptime", growth: "Standard", scale: "Priority", enterprise: "99.9%" },
  { feature: "On-Premise / Private Cloud", growth: "—", scale: "—", enterprise: "✓" },
] as const;

export const pricingFaqs = [
  {
    question: "How does the dynamic pricing engine work?",
    answer:
      "Our AI Pricing Engine analyzes your workflow count, integrations, AI model requirements, automation complexity, call volume, support load, and CRM needs — then generates setup, maintenance, and retainer estimates in real time.",
  },
  {
    question: "What's included in one-time setup?",
    answer:
      "Discovery, solution architecture, workflow engineering, integration mapping, AI model configuration, testing, team training, and production deployment.",
  },
  {
    question: "Can I start with Growth and upgrade later?",
    answer:
      "Yes. Most clients start on Growth, prove ROI within 60–90 days, then upgrade to Scale or Enterprise as automation expands across departments.",
  },
  {
    question: "Do you offer custom enterprise pricing?",
    answer:
      "Enterprise plans are fully custom — including proprietary LLM training, on-premise deployment, dedicated engineering teams, and board-level AI strategy.",
  },
  {
    question: "How accurate are ROI projections?",
    answer:
      "Projections are based on industry benchmarks and your configured automation scope. Final ROI is validated during the free AI Discovery session with your actual business data.",
  },
] as const;

export const addOnServices = [
  { icon: Sparkles, label: "AI Voice Agent", note: "From $299/mo per line" },
  { icon: Shield, label: "Enterprise Security Pack", note: "SOC 2 + audit logging" },
  { icon: Brain, label: "Custom LLM Fine-Tuning", note: "Project-based" },
] as const;
