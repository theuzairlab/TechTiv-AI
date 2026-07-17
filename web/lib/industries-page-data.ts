import type { IndustrySlug } from "@/lib/industries";

export type IndustryPainPoint = {
  title: string;
  description: string;
};

export type IndustryOpportunity = {
  title: string;
  description: string;
};

export type IndustryWorkflow = {
  title: string;
  steps: string[];
};

export type ArchitectureLayer = {
  name: string;
  description: string;
  components: string[];
};

export type IndustryRoiMetric = {
  label: string;
  value: string;
  detail: string;
};

export type IndustryPageDetail = {
  slug: IndustrySlug;
  headline: string;
  tagline: string;
  painPoints: IndustryPainPoint[];
  aiOpportunities: IndustryOpportunity[];
  workflowExamples: IndustryWorkflow[];
  architecture: ArchitectureLayer[];
  roiMetrics: IndustryRoiMetric[];
};

export const industryPageDetails: IndustryPageDetail[] = [
  {
    slug: "real-estate",
    headline: "AI that never misses a lead",
    tagline:
      "From portal inquiries to booked viewings — automate qualification, follow-up, and CRM updates across every channel.",
    painPoints: [
      { title: "Slow lead response", description: "Hot buyers contact multiple agents — first response wins, but teams can't answer 24/7." },
      { title: "Manual CRM entry", description: "Agents re-type leads from portals, WhatsApp, and calls into disconnected systems." },
      { title: "Missed follow-ups", description: "Nurture sequences fall through when reps are in showings or offline." },
      { title: "Scheduling friction", description: "Back-and-forth to book viewings costs deals and agent time." },
    ],
    aiOpportunities: [
      { title: "AI voice receptionist", description: "Answer every call, qualify budget and timeline, and book viewings automatically." },
      { title: "WhatsApp lead bot", description: "Instant replies on property inquiries with listing match and viewing links." },
      { title: "CRM automation", description: "Auto-create deals, assign agents, and trigger nurture based on lead score." },
      { title: "Predictive lead scoring", description: "Prioritize buyers most likely to convert this week." },
    ],
    workflowExamples: [
      { title: "Portal lead → Booked viewing", steps: ["Zillow inquiry", "AI qualify", "CRM create", "WhatsApp nurture", "Calendar book"] },
      { title: "Missed call → Recovered lead", steps: ["Voicemail", "AI callback", "Qualify", "Agent alert", "Follow-up sequence"] },
    ],
    architecture: [
      { name: "Capture layer", description: "Every channel feeds one pipeline", components: ["Website forms", "Portals", "Phone", "WhatsApp"] },
      { name: "AI intelligence", description: "Qualify and route in real time", components: ["Voice AI", "Chat AI", "Lead scoring", "Intent classify"] },
      { name: "Automation hub", description: "Workflows connect your stack", components: ["CRM sync", "Email/SMS", "Calendar", "Slack alerts"] },
      { name: "Outcomes", description: "Measurable conversion lift", components: ["Dashboards", "Agent tasks", "Pipeline reports"] },
    ],
    roiMetrics: [
      { label: "Lead response time", value: "< 60 sec", detail: "vs hours manually" },
      { label: "Conversion lift", value: "25–40%", detail: "on qualified leads" },
      { label: "Agent hours saved", value: "15+ hrs/wk", detail: "per agent" },
    ],
  },
  {
    slug: "healthcare",
    headline: "Patient care without the admin burden",
    tagline:
      "Automate intake, scheduling, reminders, and tier-1 support — HIPAA-aware workflows that keep staff focused on patients.",
    painPoints: [
      { title: "Phone queue overload", description: "Front desk spends hours on scheduling and repeat questions." },
      { title: "No-show appointments", description: "Empty slots cost revenue and disrupt provider schedules." },
      { title: "Manual intake forms", description: "Paper and PDF intake create errors and delays before visits." },
      { title: "After-hours gaps", description: "Patients can't book or get answers when the clinic is closed." },
    ],
    aiOpportunities: [
      { title: "AI appointment booking", description: "Voice and chat scheduling with insurance pre-check prompts." },
      { title: "Reminder automation", description: "SMS, voice, and email sequences that cut no-shows dramatically." },
      { title: "Patient support bot", description: "FAQ, directions, prep instructions, and refill routing." },
      { title: "Digital intake AI", description: "Extract and validate patient data from forms into your EHR workflow." },
    ],
    workflowExamples: [
      { title: "New patient → Scheduled", steps: ["Web intake", "AI validate", "Insurance check", "Slot offer", "Confirm + remind"] },
      { title: "No-show prevention", steps: ["Appt booked", "T-48h remind", "T-2h confirm", "Reschedule if needed"] },
    ],
    architecture: [
      { name: "Patient channels", description: "Omnichannel access", components: ["Phone", "Web chat", "SMS", "Patient portal"] },
      { name: "Clinical AI layer", description: "Safe, scoped automation", components: ["Voice AI", "Intake OCR", "Triage rules", "HIPAA logging"] },
      { name: "Practice operations", description: "Connected to your systems", components: ["EHR sync", "Calendar", "Billing triggers", "Staff alerts"] },
      { name: "Compliance & audit", description: "Traceable automation", components: ["Access logs", "Consent tracking", "Reporting"] },
    ],
    roiMetrics: [
      { label: "No-show reduction", value: "40–60%", detail: "with smart reminders" },
      { label: "Front desk load", value: "-50%", detail: "on routine calls" },
      { label: "Intake processing", value: "3x faster", detail: "digital + AI" },
    ],
  },
  {
    slug: "ecommerce",
    headline: "Revenue on autopilot",
    tagline:
      "Recover abandoned carts, scale support, and personalize upsells — AI that works every hour your store is open.",
    painPoints: [
      { title: "Cart abandonment", description: "70%+ of carts never checkout without timely, personalized recovery." },
      { title: "Support ticket volume", description: "Where is my order? returns, and sizing questions overwhelm teams." },
      { title: "Generic marketing", description: "One-size email blasts underperform vs personalized AI segments." },
      { title: "Review collection", description: "Manual outreach means fewer reviews and weaker social proof." },
    ],
    aiOpportunities: [
      { title: "Abandoned cart AI", description: "Multi-channel recovery with dynamic offers based on cart value." },
      { title: "Support automation", description: "Order tracking, returns, and product Q&A across chat and email." },
      { title: "AI upsell engine", description: "Post-purchase and browse-based recommendations that lift AOV." },
      { title: "Content at scale", description: "Product descriptions, ads, and social posts generated on-brand." },
    ],
    workflowExamples: [
      { title: "Abandoned cart recovery", steps: ["Cart exit", "Wait 1hr", "AI email", "WhatsApp nudge", "Discount if needed"] },
      { title: "Order support deflection", steps: ["Chat open", "Track order", "Resolve or escalate", "CRM note", "CSAT survey"] },
    ],
    architecture: [
      { name: "Storefront signals", description: "Real-time commerce events", components: ["Shopify/Woo", "Analytics", "Email list", "Ads pixels"] },
      { name: "AI decision layer", description: "Personalize every touchpoint", components: ["Cart scoring", "Support NLP", "Recommendations", "Sentiment"] },
      { name: "Automation engine", description: "Orchestrate journeys", components: ["Klaviyo", "WhatsApp", "Helpdesk", "Inventory sync"] },
      { name: "Growth analytics", description: "ROI you can measure", components: ["Recovery rate", "AOV lift", "CSAT", "LTV models"] },
    ],
    roiMetrics: [
      { label: "Cart recovery", value: "15–25%", detail: "of abandoned revenue" },
      { label: "Support deflection", value: "45–65%", detail: "tier-1 automated" },
      { label: "AOV increase", value: "12–18%", detail: "via AI upsell" },
    ],
  },
  {
    slug: "law-firm",
    headline: "More cases, less paperwork",
    tagline:
      "Automate client intake, document review, and scheduling so attorneys focus on billable work and client outcomes.",
    painPoints: [
      { title: "Slow intake process", description: "Potential clients drop off during long forms and callback delays." },
      { title: "Document bottlenecks", description: "Contracts and discovery files consume paralegal hours." },
      { title: "Scheduling chaos", description: "Consultations and court prep compete for calendar bandwidth." },
      { title: "Client status inquiries", description: "Repeated where-is-my-case calls drain staff time." },
    ],
    aiOpportunities: [
      { title: "Intake automation", description: "AI-guided intake that qualifies case type and collects documents." },
      { title: "Document AI", description: "Extract clauses, summarize depositions, and flag risks faster." },
      { title: "Client portal bot", description: "Secure updates on case status and next steps 24/7." },
      { title: "Scheduling intelligence", description: "Auto-book consults and sync court deadlines to calendars." },
    ],
    workflowExamples: [
      { title: "Lead → Signed retainer", steps: ["Web inquiry", "AI qualify", "Doc request", "Consult book", "CRM + conflict check"] },
      { title: "Contract review assist", steps: ["Upload PDF", "AI extract", "Risk flags", "Attorney review", "Client summary"] },
    ],
    architecture: [
      { name: "Client acquisition", description: "Capture and qualify matters", components: ["Website", "Referral forms", "Phone", "Live chat"] },
      { name: "Legal AI processing", description: "Document and intake intelligence", components: ["OCR/NLP", "Clause extraction", "Intake bots", "Conflict rules"] },
      { name: "Practice management", description: "Integrated firm workflows", components: ["Clio/MyCase", "Calendar", "Billing", "Doc management"] },
      { name: "Client experience", description: "Transparency at scale", components: ["Portal", "Status bots", "Secure messaging"] },
    ],
    roiMetrics: [
      { label: "Intake speed", value: "40% faster", detail: "lead to consult" },
      { label: "Doc review time", value: "-60%", detail: "first-pass AI" },
      { label: "Billable hour gain", value: "8+ hrs/wk", detail: "per attorney" },
    ],
  },
  {
    slug: "agency",
    headline: "Scale delivery without scaling headcount",
    tagline:
      "AI-powered outreach, reporting, and lead gen so your agency wins more clients and retains them longer.",
    painPoints: [
      { title: "Manual outreach limits", description: "SDRs can't personalize at the volume needed to fill pipeline." },
      { title: "Reporting drag", description: "Client reports consume senior hours every month." },
      { title: "Inconsistent lead flow", description: "Feast-or-famine pipeline when teams are busy on delivery." },
      { title: "CRM hygiene", description: "Deals and activities fall out of sync across tools." },
    ],
    aiOpportunities: [
      { title: "AI outreach sequences", description: "Hyper-personalized email and LinkedIn at 10x rep capacity." },
      { title: "Automated client reporting", description: "Pull metrics, generate narratives, and deliver on schedule." },
      { title: "Lead gen agents", description: "Prospect, enrich, and qualify leads into your CRM overnight." },
      { title: "CRM workflow AI", description: "Auto-log activities, score deals, and trigger playbooks." },
    ],
    workflowExamples: [
      { title: "Prospect → Booked call", steps: ["ICP list", "AI enrich", "Personalized sequence", "Reply handle", "Calendar"] },
      { title: "Monthly client report", steps: ["Pull ad data", "AI narrative", "Charts", "Review gate", "Client email"] },
    ],
    architecture: [
      { name: "GTM data layer", description: "Prospects and clients unified", components: ["CRM", "Ad platforms", "Analytics", "Enrichment APIs"] },
      { name: "Agency AI agents", description: "Outbound and delivery assist", components: ["SDR bot", "Report AI", "Content AI", "Scoring"] },
      { name: "Workflow automation", description: "Repeatable playbooks", components: ["n8n/Zapier", "Slack", "Email", "Dashboards"] },
      { name: "Client outcomes", description: "Prove ROI continuously", components: ["Live dashboards", "Automated QBRs", "Alerts"] },
    ],
    roiMetrics: [
      { label: "Outreach capacity", value: "5–10x", detail: "vs manual SDR" },
      { label: "Report time saved", value: "20+ hrs/mo", detail: "per account" },
      { label: "Pipeline velocity", value: "2–3x", detail: "faster qualification" },
    ],
  },
  {
    slug: "saas",
    headline: "Grow trials, reduce churn",
    tagline:
      "AI onboarding, support, and product-led growth flows that convert trials and keep customers longer.",
    painPoints: [
      { title: "Trial drop-off", description: "Users never reach aha moment without guided, timely nudges." },
      { title: "Support scaling cost", description: "Ticket volume grows faster than headcount at Series A+." },
      { title: "Churn blind spots", description: "At-risk accounts aren't flagged until it's too late." },
      { title: "Onboarding inconsistency", description: "Every CSM runs a different playbook for new accounts." },
    ],
    aiOpportunities: [
      { title: "AI onboarding flows", description: "Personalized setup paths based on use case and product signals." },
      { title: "In-app support AI", description: "Context-aware help that deflects tickets and drives activation." },
      { title: "Churn prediction", description: "ML models flag accounts for outreach before renewal risk." },
      { title: "Usage intelligence", description: "Auto-insights on feature adoption and expansion opportunities." },
    ],
    workflowExamples: [
      { title: "Trial → Paid conversion", steps: ["Signup", "AI onboard", "Usage nudges", "Sales alert", "Upgrade offer"] },
      { title: "Churn save play", steps: ["Risk score", "CSM alert", "AI email", "Call schedule", "Offer workflow"] },
    ],
    architecture: [
      { name: "Product signals", description: "Behavior-driven automation", components: ["Product analytics", "Billing", "Support", "CRM"] },
      { name: "SaaS AI layer", description: "Activation and retention", components: ["Onboard bot", "Support AI", "Churn ML", "Health scores"] },
      { name: "Revenue operations", description: "Aligned GTM motions", components: ["HubSpot", "Intercom", "Slack", "Playbooks"] },
      { name: "Executive visibility", description: "Board-ready metrics", components: ["NRR dashboards", "Cohort reports", "Forecast AI"] },
    ],
    roiMetrics: [
      { label: "Churn reduction", value: "25–35%", detail: "with early intervention" },
      { label: "Trial conversion", value: "+20–30%", detail: "guided onboarding" },
      { label: "Support cost", value: "-40%", detail: "AI deflection" },
    ],
  },
  {
    slug: "logistics",
    headline: "Smarter dispatch, happier customers",
    tagline:
      "Automate dispatch, route optimization, and customer notifications with AI workflows built for operations teams.",
    painPoints: [
      { title: "Manual dispatch", description: "Coordinators juggle calls, spreadsheets, and driver updates." },
      { title: "Route inefficiency", description: "Fuel and time wasted on suboptimal routing decisions." },
      { title: "Customer status calls", description: "Where is my shipment? drives call center volume." },
      { title: "Delayed exception handling", description: "Delays aren't communicated proactively to customers." },
    ],
    aiOpportunities: [
      { title: "Dispatch automation", description: "Auto-assign jobs based on location, capacity, and SLA." },
      { title: "Route optimization AI", description: "Dynamic rerouting for traffic, weather, and priority." },
      { title: "Proactive notifications", description: "AI-triggered SMS/email updates at every milestone." },
      { title: "Operations dashboards", description: "Real-time fleet visibility with anomaly alerts." },
    ],
    workflowExamples: [
      { title: "Order → Delivered", steps: ["Order in", "AI route", "Driver assign", "Track updates", "POD confirm"] },
      { title: "Delay exception", steps: ["ETA slip", "AI detect", "Customer notify", "Reroute", "Manager alert"] },
    ],
    architecture: [
      { name: "Operations intake", description: "Orders and fleet data unified", components: ["TMS/WMS", "GPS telematics", "Customer portal", "EDI"] },
      { name: "Logistics AI core", description: "Optimize and predict", components: ["Route AI", "Demand forecast", "Exception detect", "ETA models"] },
      { name: "Execution layer", description: "Drivers and customers in sync", components: ["Driver app", "SMS/email", "Webhook automations", "Slack ops"] },
      { name: "Performance analytics", description: "Continuous improvement", components: ["OTIF metrics", "Cost per mile", "CSAT", "Fleet KPIs"] },
    ],
    roiMetrics: [
      { label: "Route efficiency", value: "12–18%", detail: "fuel & time saved" },
      { label: "On-time delivery", value: "+15%", detail: "with proactive ops" },
      { label: "Status call volume", value: "-55%", detail: "automated updates" },
    ],
  },
  {
    slug: "finance",
    headline: "Compliance at speed",
    tagline:
      "Automate KYC, document processing, and client service — enterprise-grade workflows with audit trails built in.",
    painPoints: [
      { title: "Manual KYC/AML", description: "Document collection and verification slow onboarding." },
      { title: "Document-heavy processes", description: "Invoices, statements, and contracts need manual review." },
      { title: "Client inquiry volume", description: "Balance, transfer, and status questions flood support." },
      { title: "Compliance reporting", description: "Regulatory reports require painful data aggregation." },
    ],
    aiOpportunities: [
      { title: "KYC automation", description: "ID verification, document extraction, and risk scoring pipelines." },
      { title: "Document processing AI", description: "OCR and validation for invoices, statements, and applications." },
      { title: "Client support AI", description: "Secure bots for account inquiries with escalation rules." },
      { title: "Compliance workflows", description: "Automated audit logs and regulatory report generation." },
    ],
    workflowExamples: [
      { title: "Client onboarding", steps: ["Application", "KYC docs", "AI verify", "Risk score", "Account open"] },
      { title: "Invoice processing", steps: ["Email intake", "OCR extract", "Validate", "Approve route", "ERP post"] },
    ],
    architecture: [
      { name: "Secure intake", description: "Encrypted client channels", components: ["Portal", "Email", "API", "Branch scan"] },
      { name: "Financial AI", description: "Document and risk intelligence", components: ["OCR/NLP", "KYC models", "Fraud rules", "Support bot"] },
      { name: "Core systems", description: "Integrated operations", components: ["Core banking", "ERP", "CRM", "Compliance DB"] },
      { name: "Governance", description: "Audit-ready automation", components: ["Immutable logs", "Approval chains", "Reg reporting"] },
    ],
    roiMetrics: [
      { label: "Processing speed", value: "50% faster", detail: "document workflows" },
      { label: "KYC turnaround", value: "-70%", detail: "time to verify" },
      { label: "Error rate", value: "< 2%", detail: "with AI validation" },
    ],
  },
];

export function getIndustryPageDetail(slug: string): IndustryPageDetail | undefined {
  return industryPageDetails.find((detail) => detail.slug === slug);
}
