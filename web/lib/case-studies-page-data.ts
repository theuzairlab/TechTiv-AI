import { caseStudies, type CaseStudy } from "@/lib/case-studies";

export type CaseStudyPageDetail = {
  challenge: string;
  solution: string;
  timeline: string;
  deploymentDuration: string;
  implementationPhases: ReadonlyArray<{
    week: string;
    title: string;
    description: string;
  }>;
  workflow: ReadonlyArray<{ step: string; tool: string }>;
  integrations: readonly string[];
  outcomeHighlights: readonly string[];
  analyticsSnapshot: ReadonlyArray<{ label: string; value: string }>;
};

export type DetailedCaseStudy = CaseStudy & CaseStudyPageDetail;

export const socialProofStats = [
  { label: "Client deployments", value: "40+", icon: "building" as const },
  { label: "Avg hours saved / week", value: "18 hrs", icon: "clock" as const },
  { label: "Avg revenue uplift", value: "+34%", icon: "trending" as const },
  { label: "Avg response time cut", value: "92%", icon: "zap" as const },
] as const;

export const proofPillars = [
  {
    title: "Before / After",
    description:
      "Every story documents the manual process we replaced and the automated system that runs today.",
  },
  {
    title: "Measurable outcomes",
    description:
      "Hours saved, revenue increase, response speed, and cost reduction — tracked from day one.",
  },
  {
    title: "Implementation proof",
    description:
      "Phased rollout timelines, workflow diagrams, and live automation analytics from real deployments.",
  },
  {
    title: "Client voice",
    description:
      "Direct quotes from operators who saw the transformation in their day-to-day operations.",
  },
] as const;

export const implementationProcess = [
  {
    phase: "01",
    title: "Discovery & audit",
    description:
      "Map current workflows, bottlenecks, and integration points. Define success metrics before build.",
    duration: "Week 1",
  },
  {
    phase: "02",
    title: "Architecture design",
    description:
      "Design automation stack, AI agent flows, and CRM connections. Client sign-off on blueprint.",
    duration: "Week 1–2",
  },
  {
    phase: "03",
    title: "Build & integrate",
    description:
      "Deploy agents, workflows, and dashboards. Connect to existing tools with zero downtime cutover.",
    duration: "Week 2–4",
  },
  {
    phase: "04",
    title: "Test & optimize",
    description:
      "Run parallel testing, tune prompts and routing, validate metrics against baseline benchmarks.",
    duration: "Week 4–5",
  },
  {
    phase: "05",
    title: "Launch & scale",
    description:
      "Go live with monitoring, team training, and ongoing optimization as volume grows.",
    duration: "Week 5+",
  },
] as const;

const caseStudyDetails: Record<string, CaseStudyPageDetail> = {
  "apex-realty": {
    challenge:
      "Weekend and after-hours leads went to voicemail. Agents spent mornings returning calls instead of showing homes. CRM records were incomplete and duplicated across the team.",
    solution:
      "Deployed an AI voice receptionist integrated with HubSpot — auto-qualifies budget and timeline, books showings, and syncs every call transcript and lead score in real time.",
    timeline: "5-week rollout",
    deploymentDuration: "Live in 34 days",
    implementationPhases: [
      {
        week: "Week 1",
        title: "Call flow audit",
        description: "Mapped 847 inbound calls, identified peak loss windows, and defined qualification criteria.",
      },
      {
        week: "Week 2",
        title: "Voice agent build",
        description: "Trained AI receptionist on property inventory, agent availability, and booking rules.",
      },
      {
        week: "Week 3",
        title: "CRM integration",
        description: "HubSpot sync for contacts, deal stages, and automated follow-up sequences.",
      },
      {
        week: "Week 4",
        title: "Parallel testing",
        description: "AI handled 40% of calls alongside human backup — tuned routing and escalation paths.",
      },
      {
        week: "Week 5",
        title: "Full launch",
        description: "24/7 coverage enabled. Dashboard live for team visibility into lead pipeline.",
      },
    ],
    workflow: [
      { step: "Inbound call", tool: "AI Voice Agent" },
      { step: "Qualify lead", tool: "AI Scoring" },
      { step: "Book showing", tool: "Calendar API" },
      { step: "Sync CRM", tool: "HubSpot" },
      { step: "Agent alert", tool: "Slack + SMS" },
    ],
    integrations: ["HubSpot", "Google Calendar", "Twilio", "Slack"],
    outcomeHighlights: [
      "Weekend lead capture rate increased from 23% to 94%",
      "Average callback time dropped from 4.2 min to 12 seconds",
      "Agent admin time reduced by 10 hours per week",
    ],
    analyticsSnapshot: [
      { label: "Calls handled", value: "1,240/mo" },
      { label: "Qualified leads", value: "68%" },
      { label: "Showings booked", value: "312/mo" },
    ],
  },
  "pulse-health": {
    challenge:
      "Front desk staff juggled phone scheduling, insurance questions, and walk-ins. Manual SMS reminders led to 22% no-show rates and patient frustration with hold times.",
    solution:
      "AI booking assistant on web and phone, automated reminder sequences, and a support bot for FAQs — all connected to the practice management system.",
    timeline: "6-week rollout",
    deploymentDuration: "Live in 41 days",
    implementationPhases: [
      {
        week: "Week 1",
        title: "Patient journey map",
        description: "Documented intake, scheduling, reminders, and support touchpoints across 3 locations.",
      },
      {
        week: "Week 2",
        title: "Booking assistant",
        description: "Built AI scheduler with insurance pre-check and provider availability logic.",
      },
      {
        week: "Week 3",
        title: "Reminder automation",
        description: "SMS and email sequences with confirm/reschedule links tied to calendar slots.",
      },
      {
        week: "Week 4",
        title: "Support bot deploy",
        description: "Deflected routine questions — hours, directions, prep instructions, insurance basics.",
      },
      {
        week: "Week 5–6",
        title: "Multi-location launch",
        description: "Rolled out location by location with staff training and live monitoring dashboards.",
      },
    ],
    workflow: [
      { step: "Patient inquiry", tool: "AI Chat + Voice" },
      { step: "Check availability", tool: "PMS API" },
      { step: "Book appointment", tool: "Calendar Sync" },
      { step: "Send reminders", tool: "SMS Automation" },
      { step: "Handle FAQs", tool: "Support Bot" },
    ],
    integrations: ["Jane App", "Twilio", "Google Calendar", "Zapier"],
    outcomeHighlights: [
      "No-show rate reduced from 22% to 9%",
      "Front desk call volume down 61% during peak hours",
      "Patient satisfaction score up 28 points",
    ],
    analyticsSnapshot: [
      { label: "Appointments booked", value: "2.1k/mo" },
      { label: "Bot deflection", value: "54%" },
      { label: "Reminder confirm", value: "87%" },
    ],
  },
  "nordscale": {
    challenge:
      "Black Friday support queues hit 4-hour response times. Abandoned carts had no follow-up. Review collection was ad-hoc and inconsistent across product lines.",
    solution:
      "AI support bot handling tier-1 tickets, personalized cart recovery sequences, and automated post-purchase review requests — all orchestrated through Shopify and Klaviyo.",
    timeline: "4-week rollout",
    deploymentDuration: "Live in 28 days",
    implementationPhases: [
      {
        week: "Week 1",
        title: "Support taxonomy",
        description: "Categorized 6 months of tickets — identified 68% as fully automatable tier-1 issues.",
      },
      {
        week: "Week 2",
        title: "AI support deploy",
        description: "Trained on product catalog, shipping policies, and return workflows.",
      },
      {
        week: "Week 3",
        title: "Cart recovery flows",
        description: "Behavior-triggered email and SMS sequences with dynamic product recommendations.",
      },
      {
        week: "Week 4",
        title: "Review automation",
        description: "Post-delivery review requests with incentive logic and sentiment routing.",
      },
    ],
    workflow: [
      { step: "Support ticket", tool: "AI Support Bot" },
      { step: "Cart abandoned", tool: "Klaviyo Trigger" },
      { step: "Personalized outreach", tool: "AI Email" },
      { step: "Order delivered", tool: "Shopify Webhook" },
      { step: "Review request", tool: "Automation Flow" },
    ],
    integrations: ["Shopify", "Klaviyo", "Gorgias", "Stripe"],
    outcomeHighlights: [
      "68% of support tickets resolved without human intervention",
      "Cart recovery revenue added $47k in first 90 days",
      "Average review volume increased 3.2x per product",
    ],
    analyticsSnapshot: [
      { label: "Tickets resolved", value: "4.8k/mo" },
      { label: "Cart recovery", value: "18%" },
      { label: "CSAT score", value: "4.7/5" },
    ],
  },
  "catalyst-agency": {
    challenge:
      "SDRs manually researched leads and sent generic outreach. Monthly client reports took 3 days each. Pipeline quality varied wildly between team members.",
    solution:
      "AI SDR system for lead enrichment and personalized sequences, plus automated client reporting dashboards that pull live campaign data.",
    timeline: "5-week rollout",
    deploymentDuration: "Live in 36 days",
    implementationPhases: [
      {
        week: "Week 1",
        title: "Pipeline audit",
        description: "Analyzed outreach templates, conversion rates, and reporting workflows across 12 clients.",
      },
      {
        week: "Week 2",
        title: "Lead enrichment",
        description: "Built AI research agent pulling firmographics, tech stack, and trigger events.",
      },
      {
        week: "Week 3",
        title: "Outreach sequences",
        description: "Personalized multi-channel sequences with A/B testing and reply classification.",
      },
      {
        week: "Week 4",
        title: "Reporting automation",
        description: "Live dashboards replacing manual slide decks — auto-generated weekly client summaries.",
      },
      {
        week: "Week 5",
        title: "Team rollout",
        description: "SDR team trained on AI-assisted workflow. Capacity increased 5x without new hires.",
      },
    ],
    workflow: [
      { step: "Lead sourced", tool: "Apollo + AI" },
      { step: "Enrich & score", tool: "AI Research" },
      { step: "Personalized outreach", tool: "AI SDR" },
      { step: "Reply handling", tool: "AI Classifier" },
      { step: "Client report", tool: "Auto Dashboard" },
    ],
    integrations: ["HubSpot", "Apollo", "LinkedIn Sales Nav", "Looker Studio"],
    outcomeHighlights: [
      "Outreach capacity scaled 5x with same team size",
      "Client report delivery dropped from 3 days to 2 hours",
      "Meeting booking rate increased 47%",
    ],
    analyticsSnapshot: [
      { label: "Leads enriched", value: "12k/mo" },
      { label: "Reply rate", value: "14.2%" },
      { label: "Reports auto-gen", value: "48/wk" },
    ],
  },
};

export const detailedCaseStudies: DetailedCaseStudy[] = caseStudies.map(
  (study) => ({
    ...study,
    ...caseStudyDetails[study.id],
  }),
);

export function getDetailedCaseStudy(id: string): DetailedCaseStudy | undefined {
  return detailedCaseStudies.find((study) => study.id === id);
}
