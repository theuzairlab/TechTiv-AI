export type CaseStudyMetric = {
  label: string;
  before: string;
  after: string;
};

export type CaseStudy = {
  id: string;
  client: string;
  industry: string;
  headline: string;
  summary: string;
  beforeSummary: string;
  afterSummary: string;
  metrics: CaseStudyMetric[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  systems: readonly string[];
  accent: "cyan" | "lime" | "violet" | "rose";
};

export const caseStudies: CaseStudy[] = [
  {
    id: "apex-realty",
    client: "Apex Realty",
    industry: "Real Estate",
    headline: "From missed calls to 24/7 AI lead capture",
    summary:
      "A 15-agent real estate firm automated lead response, qualification, and CRM follow-ups.",
    beforeSummary:
      "Agents manually answered calls, leads waited hours for callbacks, and CRM data was inconsistent across the team.",
    afterSummary:
      "AI voice receptionist handles after-hours calls, auto-qualifies leads, and syncs every interaction to HubSpot in real time.",
    metrics: [
      { label: "Hours saved", before: "12 hrs/wk manual", after: "2 hrs/wk" },
      { label: "Revenue increase", before: "Baseline", after: "+34%" },
      { label: "Response speed", before: "4.2 min avg", after: "12 sec" },
      { label: "Cost reduction", before: "—", after: "41%" },
    ],
    testimonial: {
      quote:
        "We went from losing weekend leads to booking showings automatically. Our agents focus on closings, not chasing voicemails.",
      author: "Sarah Mitchell",
      role: "Managing Director, Apex Realty",
    },
    systems: ["AI Voice Agent", "CRM Automation", "Lead Qualification"],
    accent: "cyan",
  },
  {
    id: "pulse-health",
    client: "Pulse Health",
    industry: "Healthcare",
    headline: "Patient intake and reminders on autopilot",
    summary:
      "A multi-location clinic reduced no-shows and support load with AI scheduling and reminders.",
    beforeSummary:
      "Front desk was overwhelmed with calls, appointment reminders were manual, and no-show rates were climbing.",
    afterSummary:
      "AI booking assistant handles scheduling 24/7, automated SMS reminders, and support bot deflects routine questions.",
    metrics: [
      { label: "Hours saved", before: "18 hrs/wk", after: "4 hrs/wk" },
      { label: "Revenue increase", before: "Baseline", after: "+22%" },
      { label: "Response speed", before: "8 min avg", after: "Instant" },
      { label: "Cost reduction", before: "—", after: "38%" },
    ],
    testimonial: {
      quote:
        "No-shows dropped dramatically and our staff finally has breathing room. Patients love the instant booking experience.",
      author: "Dr. James Chen",
      role: "Founder, Pulse Health",
    },
    systems: ["AI Appointment System", "Support Bot", "Workflow Automation"],
    accent: "lime",
  },
  {
    id: "nordscale",
    client: "NordScale",
    industry: "Ecommerce",
    headline: "Abandoned carts recovered with AI outreach",
    summary:
      "A DTC brand automated support, cart recovery, and review collection across channels.",
    beforeSummary:
      "Support tickets piled up during sales peaks, abandoned carts were never followed up, and reviews were inconsistent.",
    afterSummary:
      "AI support handles 68% of tickets, personalized cart recovery emails fire automatically, and review requests run post-purchase.",
    metrics: [
      { label: "Hours saved", before: "25 hrs/wk", after: "6 hrs/wk" },
      { label: "Revenue increase", before: "Baseline", after: "+28%" },
      { label: "Response speed", before: "2.5 hrs", after: "< 30 sec" },
      { label: "Cost reduction", before: "—", after: "45%" },
    ],
    testimonial: {
      quote:
        "Cart recovery alone paid for the entire system in the first month. Support quality actually improved while costs dropped.",
      author: "Elena Vasquez",
      role: "COO, NordScale",
    },
    systems: ["AI Support Bot", "Email Automation", "CRM Automation"],
    accent: "violet",
  },
  {
    id: "catalyst-agency",
    client: "Catalyst Agency",
    industry: "Agency",
    headline: "AI SDR pipeline scaled outreach 5x",
    summary:
      "A growth agency automated lead gen, outreach sequences, and client reporting.",
    beforeSummary:
      "SDRs spent hours on manual outreach, reporting took days each month, and lead quality was inconsistent.",
    afterSummary:
      "AI SDR system enriches leads, runs personalized sequences, and auto-generates client performance reports.",
    metrics: [
      { label: "Hours saved", before: "30 hrs/wk", after: "8 hrs/wk" },
      { label: "Revenue increase", before: "Baseline", after: "+52%" },
      { label: "Response speed", before: "6 hrs", after: "45 sec" },
      { label: "Cost reduction", before: "—", after: "36%" },
    ],
    testimonial: {
      quote:
        "We 5x'd our outreach capacity without hiring. Clients see better results and we deliver reports in hours, not days.",
      author: "Marcus Webb",
      role: "CEO, Catalyst Agency",
    },
    systems: ["AI Lead Generation", "Workflow Automation", "AI Reporting"],
    accent: "rose",
  },
];

export function getCaseStudy(id: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.id === id);
}
