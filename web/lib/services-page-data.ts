import type { ServiceAccent } from "@/lib/services";

export type ServiceWorkflow = {
  title: string;
  steps: string[];
};

export type ServicePricingExample = {
  tier: string;
  range: string;
  note: string;
};

export type ServiceRoiMetric = {
  label: string;
  value: string;
};

export type ServicePageDetail = {
  id: string;
  overview: string;
  useCases: string[];
  workflows: ServiceWorkflow[];
  pricingExamples: ServicePricingExample[];
  integrations: string[];
  expectedRoi: ServiceRoiMetric[];
  accent: ServiceAccent;
};

export const servicePageDetails: ServicePageDetail[] = [
  {
    id: "workflow-automation",
    accent: "cyan",
    overview:
      "The core automation hub connecting your CRM, email, databases, and internal tools through intelligent n8n workflows — with AI decision nodes that route, enrich, and execute without manual handoffs.",
    useCases: [
      "Lead routing and enrichment across CRM + email",
      "Invoice-to-ERP sync with approval gates",
      "Support ticket triage and auto-assignment",
      "Multi-step onboarding sequences for new clients",
    ],
    workflows: [
      {
        title: "Lead → CRM → Outreach",
        steps: ["Form submit", "AI qualify", "CRM update", "Email sequence", "SDR alert"],
      },
      {
        title: "Support → Resolution",
        steps: ["Ticket created", "AI classify", "Knowledge lookup", "Auto-reply or escalate"],
      },
    ],
    pricingExamples: [
      { tier: "Starter", range: "$999–$1,499/mo", note: "Up to 10 active workflows" },
      { tier: "Growth", range: "$1,999–$3,500/mo", note: "Unlimited workflows + integrations" },
      { tier: "Enterprise", range: "Custom", note: "Private cloud, SLA, dedicated engineer" },
    ],
    integrations: ["HubSpot", "Salesforce", "Slack", "Gmail", "WhatsApp", "n8n", "Make.com", "Zapier"],
    expectedRoi: [
      { label: "Hours saved / week", value: "20–60 hrs" },
      { label: "Error reduction", value: "70–90%" },
      { label: "Payback period", value: "4–8 weeks" },
    ],
  },
  {
    id: "chatbots",
    accent: "cyan",
    overview:
      "GPT-powered assistants deployed on your website, WhatsApp, and internal portals — trained on your knowledge base with human-quality responses and seamless handoff to your team.",
    useCases: [
      "24/7 website visitor qualification",
      "WhatsApp customer support at scale",
      "Internal HR and IT helpdesk bots",
      "Product recommendation and upsell flows",
    ],
    workflows: [
      {
        title: "Visitor → Qualified Lead",
        steps: ["Chat opens", "Intent detect", "Qualify questions", "CRM push", "Book call"],
      },
    ],
    pricingExamples: [
      { tier: "Starter", range: "$799–$1,200/mo", note: "1 bot, 25k messages/mo" },
      { tier: "Scale", range: "$1,800–$2,800/mo", note: "Multi-channel + RAG knowledge base" },
    ],
    integrations: ["OpenAI", "WhatsApp Business", "Intercom", "Zendesk", "Pinecone", "HubSpot"],
    expectedRoi: [
      { label: "Support deflection", value: "40–65%" },
      { label: "Lead capture lift", value: "25–40%" },
      { label: "Response time", value: "< 3 sec" },
    ],
  },
  {
    id: "voice-agents",
    accent: "lime",
    overview:
      "Autonomous voice AI for inbound reception, outbound qualification, appointment booking, and follow-ups — natural conversations that never miss a call.",
    useCases: [
      "After-hours phone reception and booking",
      "Outbound lead qualification calls",
      "Appointment reminders and no-show recovery",
      "Tier-1 phone support with warm transfer",
    ],
    workflows: [
      {
        title: "Inbound Call → Booked Meeting",
        steps: ["Answer call", "Identify intent", "Qualify", "Check calendar", "Confirm + CRM"],
      },
    ],
    pricingExamples: [
      { tier: "Starter", range: "$1,200–$1,800/mo", note: "1 voice agent, 500 mins" },
      { tier: "Scale", range: "$2,500–$4,500/mo", note: "Multi-line + outbound campaigns" },
    ],
    integrations: ["Twilio", "Vapi", "Calendly", "HubSpot", "Google Calendar", "Whisper"],
    expectedRoi: [
      { label: "Missed call recovery", value: "85%+" },
      { label: "Booking rate lift", value: "30–50%" },
      { label: "Cost vs human SDR", value: "70% lower" },
    ],
  },
  {
    id: "lead-generation",
    accent: "violet",
    overview:
      "AI SDR systems that prospect, enrich, personalize outreach, and book meetings — running 24/7 across email, LinkedIn, and voice channels.",
    useCases: [
      "Automated cold outreach with personalization",
      "LinkedIn prospecting and follow-up sequences",
      "Lead enrichment from web and databases",
      "Inbound lead instant response and nurture",
    ],
    workflows: [
      {
        title: "Prospect → Meeting Booked",
        steps: ["ICP scrape", "Enrich", "AI personalize", "Multi-touch sequence", "Book demo"],
      },
    ],
    pricingExamples: [
      { tier: "Growth", range: "$1,500–$2,500/mo", note: "1 AI SDR, 2k contacts/mo" },
      { tier: "Scale", range: "$3,000–$6,000/mo", note: "Multi-channel + CRM sync" },
    ],
    integrations: ["Apollo", "LinkedIn", "HubSpot", "Salesforce", "Instantly", "Gmail"],
    expectedRoi: [
      { label: "Pipeline velocity", value: "2–4x" },
      { label: "Reply rate lift", value: "3–8x" },
      { label: "Cost per meeting", value: "60% lower" },
    ],
  },
  {
    id: "crm-automation",
    accent: "rose",
    overview:
      "Intelligent CRM layers that score leads, route opportunities, trigger follow-ups, and keep pipelines clean — so reps only work the hottest deals.",
    useCases: [
      "AI lead scoring and auto-routing",
      "Stale deal re-engagement sequences",
      "Pipeline hygiene and data enrichment",
      "Forecasting and win-probability models",
    ],
    workflows: [
      {
        title: "New Lead → Routed Rep",
        steps: ["Lead in CRM", "AI score", "Assign owner", "Slack notify", "Follow-up task"],
      },
    ],
    pricingExamples: [
      { tier: "Growth", range: "$1,200–$2,000/mo", note: "CRM automation layer" },
      { tier: "Enterprise", range: "Custom", note: "Custom scoring models + BI" },
    ],
    integrations: ["HubSpot", "Salesforce", "Pipedrive", "Slack", "Zapier", "Clearbit"],
    expectedRoi: [
      { label: "Win rate improvement", value: "20–35%" },
      { label: "Rep admin time saved", value: "8–15 hrs/wk" },
      { label: "Data accuracy", value: "90%+" },
    ],
  },
  {
    id: "custom-agents",
    accent: "cyan",
    overview:
      "Purpose-built autonomous agents for research, sales, support, compliance, and operations — orchestrated with LangGraph and CrewAI for multi-step objectives.",
    useCases: [
      "Research agent for market and competitor intel",
      "Sales SDR agent for outreach and booking",
      "Compliance agent for document review",
      "Ops agent for vendor and supply chain monitoring",
    ],
    workflows: [
      {
        title: "Multi-Agent Research Task",
        steps: ["Define objective", "Research agent", "Analysis agent", "Report + CRM update"],
      },
    ],
    pricingExamples: [
      { tier: "Single Agent", range: "$2,500–$4,000 setup + $800/mo", note: "1 custom agent" },
      { tier: "Agent Fleet", range: "$8,000–$25,000+", note: "Multi-agent orchestration" },
    ],
    integrations: ["LangGraph", "CrewAI", "OpenAI", "Pinecone", "Slack", "Custom APIs"],
    expectedRoi: [
      { label: "Task automation", value: "80–95%" },
      { label: "24/7 availability", value: "Always on" },
      { label: "Scale without hiring", value: "10x output" },
    ],
  },
  {
    id: "content-automation",
    accent: "lime",
    overview:
      "AI content engines that generate blogs, ads, social posts, video scripts, and SEO assets at scale — on-brand, personalized, and optimized for conversion.",
    useCases: [
      "Blog and SEO content at 100x volume",
      "Ad creative and A/B variant generation",
      "Social media calendars and post drafts",
      "Personalized email and landing page copy",
    ],
    workflows: [
      {
        title: "Brief → Published Content",
        steps: ["Topic input", "Research", "Draft + SEO", "Review gate", "CMS publish"],
      },
    ],
    pricingExamples: [
      { tier: "Creator", range: "$999–$1,500/mo", note: "50 assets/mo" },
      { tier: "Scale", range: "$2,500–$4,000/mo", note: "Unlimited + brand voice training" },
    ],
    integrations: ["WordPress", "Webflow", "Meta Ads", "Google Ads", "Canva", "Notion"],
    expectedRoi: [
      { label: "Content output", value: "50–100x" },
      { label: "Production cost", value: "70% lower" },
      { label: "Engagement lift", value: "2–5x" },
    ],
  },
  {
    id: "data-analytics",
    accent: "violet",
    overview:
      "AI-powered dashboards, predictive models, and automated insight generation — turning raw business data into decisions without waiting on analysts.",
    useCases: [
      "Executive AI dashboards with auto-insights",
      "Churn and revenue forecasting models",
      "Anomaly detection on KPIs",
      "Natural language queries over business data",
    ],
    workflows: [
      {
        title: "Data → Insight → Alert",
        steps: ["Pipeline ingest", "Model score", "Dashboard update", "Slack alert if anomaly"],
      },
    ],
    pricingExamples: [
      { tier: "Analytics", range: "$1,500–$2,500/mo", note: "Dashboards + 2 ML models" },
      { tier: "Enterprise", range: "Custom", note: "Full MLOps + private data" },
    ],
    integrations: ["BigQuery", "Snowflake", "PostgreSQL", "Looker", "Metabase", "dbt"],
    expectedRoi: [
      { label: "Insight speed", value: "10x faster" },
      { label: "Forecast accuracy", value: "85–95%" },
      { label: "Analyst hours saved", value: "15–30 hrs/wk" },
    ],
  },
  {
    id: "process-automation",
    accent: "rose",
    overview:
      "End-to-end automation of HR, finance, approvals, and document-heavy operations — eliminating manual data entry and policy bottlenecks.",
    useCases: [
      "Invoice processing and AP automation",
      "Employee onboarding workflows",
      "Leave and expense approval chains",
      "Contract and document extraction",
    ],
    workflows: [
      {
        title: "Invoice → Payment",
        steps: ["Email intake", "OCR extract", "Validate", "Approval route", "ERP post"],
      },
    ],
    pricingExamples: [
      { tier: "Department", range: "$1,800–$3,000/mo", note: "1 department automated" },
      { tier: "Enterprise", range: "Custom", note: "Cross-functional automation" },
    ],
    integrations: ["QuickBooks", "Xero", "SAP", "BambooHR", "DocuSign", "Google Drive"],
    expectedRoi: [
      { label: "Processing time", value: "80% faster" },
      { label: "Error rate", value: "< 2%" },
      { label: "Cost reduction", value: "50–75%" },
    ],
  },
];

export function getServicePageDetail(id: string) {
  return servicePageDetails.find((service) => service.id === id);
}
