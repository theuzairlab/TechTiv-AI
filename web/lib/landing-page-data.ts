import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  Box,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  Cloud,
  CloudCog,
  Database,
  Eye,
  FileText,
  Handshake,
  Laptop,
  Layers,
  LineChart,
  Link2,
  Mail,
  MessageSquare,
  Mic,
  Microscope,
  Package,
  PenLine,
  PenTool,
  RefreshCw,
  Rocket,
  Scale,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

export const tickerItems = [
  "AI AUTOMATION",
  "AUTONOMOUS AGENTS",
  "CUSTOM LLMs",
  "WORKFLOW AUTOMATION",
  "DATA SCIENCE AI",
  "SALES AI",
  "COMPUTER VISION",
  "NLP SYSTEMS",
  "AI DEVOPS",
  "PREDICTIVE ANALYTICS",
] as const;

export type LandingServiceCard = {
  num: string;
  title: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  c1: string;
  c2: string;
  pills: string[];
  span?: 1 | 2 | 3;
};

export const landingServices: LandingServiceCard[] = [
  {
    num: "01 — BUSINESS AUTOMATION",
    title: "Business Process Automation",
    name: "Business Process Automation",
    description:
      "End-to-end AI automation of your core business workflows — from procurement to HR to finance. Eliminate manual work permanently.",
    icon: Building2,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: ["Invoice AI", "HR Automation", "Approval Flows", "ERP AI Layer", "Document AI"],
  },
  {
    num: "02 — OPERATIONS AI",
    title: "Intelligent Operations",
    name: "Intelligent Operations",
    description:
      "AI that monitors, optimizes, and self-heals your operations in real time — predictive maintenance, anomaly detection, supply chain intelligence.",
    icon: Settings,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: ["Predictive Maintenance", "Supply Chain AI", "Anomaly Detection", "OpsBot"],
  },
  {
    num: "03 — DEV AUTOMATION",
    title: "AI-Powered Development",
    name: "AI-Powered Development",
    description:
      "Supercharge software development with AI code generation, automated testing, CI/CD intelligence, and AI code review pipelines.",
    icon: Laptop,
    iconBg: "rgba(198,255,0,0.08)",
    c1: "#c6ff00",
    c2: "#3de8ff",
    pills: ["Code Generation", "Auto QA Testing", "CI/CD AI", "Bug Detection AI", "API Builder"],
  },
  {
    num: "04 — AUTONOMOUS AI AGENTS",
    title: "Multi-Agent AI Systems",
    name: "Multi-Agent AI Systems",
    description:
      "Deploy fleets of specialized autonomous agents that collaborate to complete complex, multi-step business objectives — research, outreach, analysis, execution — without human intervention. Powered by LangGraph, CrewAI & AutoGen.",
    icon: Bot,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: [
      "Research Agents",
      "Sales Agents",
      "Data Agents",
      "Compliance Agents",
      "Multi-Agent Orchestration",
      "Tool-Using Agents",
      "RAG Agents",
    ],
    span: 2,
  },
  {
    num: "05 — CUSTOM AI MODELS",
    title: "Custom LLMs & Fine-Tuning",
    name: "Custom LLMs & Fine-Tuning",
    description:
      "Build domain-specific language models trained on your proprietary data — legal, medical, finance, retail, manufacturing — with your brand's voice and knowledge.",
    icon: Brain,
    iconBg: "rgba(198,255,0,0.08)",
    c1: "#c6ff00",
    c2: "#3de8ff",
    pills: ["Fine-Tuning GPT/LLaMA", "RAG Architecture", "Model Distillation", "Private LLM Deploy"],
  },
  {
    num: "06 — WORKFLOW AUTOMATION",
    title: "Intelligent Workflow Engine",
    name: "Intelligent Workflow Engine",
    description:
      "Visual AI workflow builder with 500+ pre-built connectors. Automate any process across any tool — CRM, ERP, email, Slack, databases — with AI decision logic.",
    icon: RefreshCw,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: ["n8n / Make Automation", "AI Decision Trees", "Zapier Enterprise", "Event-Driven AI"],
  },
  {
    num: "07 — DATA & AI SCIENCE",
    title: "Data Science & ML Engineering",
    name: "Data Science & ML Engineering",
    description:
      "Full-cycle data science — from raw data pipelines to production ML models. Predictive analytics, clustering, NLP, and computer vision deployments.",
    icon: BarChart3,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: ["ML Model Development", "Data Pipelines", "Feature Engineering", "MLOps"],
  },
  {
    num: "08 — COMPUTER VISION AI",
    title: "Vision & Perception Systems",
    name: "Vision & Perception Systems",
    description:
      "Deploy production computer vision for quality inspection, OCR, object detection, and visual analytics — trained on your data and integrated into live operations.",
    icon: Eye,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: ["Visual Inspection", "OCR & Document AI", "Object Detection", "Real-Time Video AI"],
  },
  {
    num: "09 — SALES & MARKETING AI",
    title: "AI-Driven Revenue Growth",
    name: "AI-Driven Revenue Growth",
    description:
      "Autonomous lead generation, AI-powered outreach bots, personalized content engines, and predictive scoring — turn your entire GTM motion into an AI-powered revenue machine.",
    icon: Rocket,
    iconBg: "rgba(198,255,0,0.08)",
    c1: "#c6ff00",
    c2: "#3de8ff",
    pills: [
      "Lead Gen Agents",
      "Email AI Sequences",
      "AI SDR Bot",
      "Personalization Engine",
      "Conversion AI",
      "Ad Creative AI",
      "Social Media AI",
    ],
    span: 2,
  },
  {
    num: "10 — CONVERSATIONAL AI",
    title: "AI Chatbots & Voice Agents",
    name: "AI Chatbots & Voice Agents",
    description:
      "Enterprise conversational AI for support, sales, and internal ops — web, WhatsApp, voice calls, and Slack. Trained on your data with human-quality responses.",
    icon: MessageSquare,
    iconBg: "rgba(61,232,255,0.08)",
    c1: "#3de8ff",
    c2: "#c6ff00",
    pills: ["WhatsApp AI Bot", "Voice AI Agent", "Support Deflection", "Multilingual AI"],
  },
];

export const landingAgents = [
  { icon: Bot, bg: "rgba(61,232,255,0.1)", name: "TivAgent — Sales SDR", role: "Prospects, qualifies, books meetings autonomously", status: "LIVE" as const },
  { icon: PenLine, bg: "rgba(198,255,0,0.1)", name: "ContentBot — Writer Agent", role: "Blogs, ads, social posts at scale", status: "LIVE" as const },
  { icon: Microscope, bg: "rgba(61,232,255,0.1)", name: "ResearchBot — Intel Agent", role: "Market research, news monitoring, summaries", status: "LIVE" as const },
  { icon: MessageSquare, bg: "rgba(198,255,0,0.1)", name: "SupportGenie — CS Agent", role: "Tier-1 support, refunds, escalations", status: "LIVE" as const },
  { icon: Briefcase, bg: "rgba(61,232,255,0.1)", name: "FinanceAI — CFO Agent", role: "Invoice processing, expense reports, forecasting", status: "BETA" as const },
  { icon: Scale, bg: "rgba(61,232,255,0.1)", name: "LegalMind — Compliance Agent", role: "Contract review, clause extraction, risk scoring", status: "BETA" as const },
  { icon: Package, bg: "rgba(198,255,0,0.1)", name: "OpsBot — Operations Agent", role: "Supply chain monitoring, vendor management", status: "LIVE" as const },
];

export const landingMarketingCards = [
  { icon: Target, title: "AI Lead Generation", desc: "Autonomous agents that identify, qualify, and enrich leads from LinkedIn, web, and databases 24/7 — filling your CRM without a single sales rep.", kpis: [["10x", "More leads"], ["90%", "Cost down"]] },
  { icon: Mail, title: "AI Email & Outreach", desc: "Hyper-personalized cold email sequences, LinkedIn DM automation, and follow-up workflows powered by GPT — with human-level personalization at massive scale.", kpis: [["45%", "Open rate"], ["8x", "Reply rate"]] },
  { icon: Handshake, title: "AI Sales Assistant (SDR)", desc: "A full AI SDR that handles inbound lead qualification, objection handling, demo scheduling, and CRM updates — 24/7 without salary.", kpis: [["3x", "Pipeline speed"], ["60%", "Cost per lead"]] },
  { icon: PenTool, title: "AI Content Engine", desc: "Generate blogs, ads, social posts, video scripts, and landing pages at scale — on-brand, SEO-optimized, and personalized for every segment.", kpis: [["100x", "Content output"], ["5x", "Engagement"]] },
  { icon: BarChart3, title: "Predictive Lead Scoring", desc: "ML models that score and rank leads by conversion probability — so your sales team always works the hottest opportunities first.", kpis: [["35%", "Win rate up"], ["2x", "Deal velocity"]] },
  { icon: RefreshCw, title: "Customer Retention AI", desc: "Churn prediction models, personalized re-engagement campaigns, and AI loyalty programs that keep your customers coming back automatically.", kpis: [["40%", "Churn reduction"], ["2.5x", "LTV boost"]] },
];

export const landingStack: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Brain, "GPT-4o", "Foundation LLM"],
  [Zap, "Claude 3.5", "Reasoning AI"],
  [Sparkles, "Gemini 1.5", "Multimodal"],
  [Layers, "LLaMA 3.1", "Open Source LLM"],
  [Link2, "LangChain", "LLM Framework"],
  [Workflow, "LangGraph", "Agent Orchestration"],
  [Users, "CrewAI", "Multi-Agent"],
  [Bot, "AutoGen", "Agent Framework"],
  [Database, "LlamaIndex", "RAG Engine"],
  [Box, "Pinecone", "Vector DB"],
  [Search, "Weaviate", "Vector Search"],
  [RefreshCw, "n8n", "Workflow Engine"],
  [Settings, "Make.com", "Automation"],
  [Cloud, "AWS Bedrock", "Cloud AI"],
  [CloudCog, "Azure OpenAI", "Enterprise AI"],
  [Sparkles, "Hugging Face", "Model Hub"],
  [Mic, "Whisper", "Speech AI"],
  [Eye, "CLIP", "Vision AI"],
  [LineChart, "MLflow", "MLOps"],
  [Rocket, "FastAPI", "AI API Backend"],
];

export const landingProcess = [
  { num: "WEEK 1", title: "AI Audit & Discovery", desc: "Deep dive into your processes, data, and goals. Map every automation opportunity." },
  { num: "WEEK 2", title: "AI Blueprint", desc: "Design full AI architecture — models, agents, workflows, integrations, and data flows." },
  { num: "WEEK 3-4", title: "Build & Train", desc: "Build, configure, and train all AI systems. Integrate with your existing tech stack." },
  { num: "WEEK 5", title: "Test & Refine", desc: "Rigorous testing, edge case handling, performance tuning, and team training." },
  { num: "WEEK 6", title: "Go Live", desc: "Full deployment with real-time monitoring, dashboards, and 30-day hypercare." },
  { num: "ONGOING", title: "Optimize & Scale", desc: "Continuous AI improvement, new automations, and scaling as your business grows.", ongoing: true },
] as const;

export const landingResults = [
  ["85", "%", "Average Cost Reduction", "Across automated business processes post-deployment"],
  ["12", "x", "Productivity Multiplier", "Teams accomplish 12x more output with AI augmentation"],
  ["300", "+", "AI Deployments", "Successful projects across Pakistan, UAE, and UK"],
  ["6", "wk", "Average Time to Value", "From discovery to live AI in production"],
] as const;

export const landingAgentForceCards = [
  { icon: Search, title: "Research Agent", desc: "Deep web research, competitor analysis, market intel" },
  { icon: Mail, title: "Outreach Agent", desc: "Personalized email sequences, follow-ups, booking" },
  { icon: BarChart3, title: "Analysis Agent", desc: "Data analysis, report generation, KPI tracking" },
  { icon: Scale, title: "Compliance Agent", desc: "Document review, policy checks, risk assessment" },
] as const;

export const landingWorkflowNodes = [
  { icon: Zap, label: "Trigger", sub: "Event / Schedule / API", active: "cyan" as const, trigger: "AI Routes" },
  { icon: Brain, label: "AI Brain", sub: "Classify & Decide", trigger: "Enriches" },
  { icon: Link2, label: "Integrate", sub: "CRM / ERP / API", trigger: "Executes" },
  { icon: CheckCircle2, label: "Action", sub: "Send / Update / Alert", active: "lime" as const, trigger: "Learns" },
  { icon: BarChart3, label: "Optimize", sub: "Self-Improves", trigger: undefined },
] as const satisfies ReadonlyArray<{
  icon: LucideIcon;
  label: string;
  sub: string;
  active?: "cyan" | "lime";
  trigger?: string;
}>;

export const landingFlowCategories = [
  { icon: Mail, title: "Email & Comms AI", desc: "Auto-triage, reply drafting, sentiment routing, smart follow-ups" },
  { icon: FileText, title: "Document Processing", desc: "Invoice extraction, contract parsing, OCR, data validation" },
  { icon: Building2, title: "Finance Automation", desc: "AP/AR automation, reconciliation, expense AI, reporting" },
  { icon: Users, title: "HR & Talent AI", desc: "Resume screening, onboarding flows, leave management, payroll" },
] as const;

export const landingPerceptionItems = [
  { icon: FileText, label: "Document AI" },
  { icon: Sparkles, label: "Sentiment NLP" },
  { icon: Eye, label: "Vision AI" },
  { icon: Mic, label: "Speech AI" },
] as const;
