import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FileText,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";

export type ContactPath = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  anchor: string;
  featured?: boolean;
};

export const contactPaths: ContactPath[] = [
  {
    id: "discovery",
    icon: Sparkles,
    title: "AI-assisted onboarding",
    description:
      "Multi-step AI interview that scores your automation opportunities and generates a tailored blueprint.",
    cta: "Start AI Discovery",
    anchor: "/discovery",
    featured: true,
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice AI consultation",
    description:
      "Talk to our AI consultant — business analysis, workflow recommendations, pricing estimates, and scheduling.",
    cta: "Talk to AI",
    anchor: "#voice",
  },
  {
    id: "schedule",
    icon: Calendar,
    title: "Book strategy call",
    description:
      "Pick a time with our AI transformation team for a 30-minute strategy session.",
    cta: "View calendar",
    anchor: "#schedule",
  },
  {
    id: "form",
    icon: FileText,
    title: "Manual form & proposal",
    description:
      "Prefer a form? Tell us about your business and request a custom automation proposal.",
    cta: "Fill out form",
    anchor: "#form",
  },
];

export const formInterestOptions = [
  { value: "proposal", label: "Custom automation proposal" },
  { value: "consultation", label: "Strategy consultation" },
  { value: "pricing", label: "Pricing & ROI estimate" },
  { value: "partnership", label: "Agency / partnership inquiry" },
  { value: "general", label: "General question" },
] as const;

export const formIndustryOptions = [
  "Real Estate",
  "Healthcare",
  "Ecommerce",
  "Agency / Marketing",
  "SaaS / Technology",
  "Professional Services",
  "Other",
] as const;

export const formBudgetOptions = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Not sure yet",
] as const;

export const contactInfo = {
  email: "hello@techtivai.com",
  responseTime: "Within 24 hours",
  hours: "Mon–Fri, 9am–6pm EST",
  guarantee: "Free discovery session · No commitment required",
} as const;

export const consultationBenefits = [
  {
    title: "Business analysis",
    description: "We map your workflows, bottlenecks, and integration landscape before recommending systems.",
  },
  {
    title: "Tailored recommendations",
    description: "Every proposal includes specific AI systems, workflow diagrams, and phased rollout plans.",
  },
  {
    title: "ROI projections",
    description: "Hours saved, cost reduction, and revenue uplift estimates based on comparable deployments.",
  },
  {
    title: "Implementation roadmap",
    description: "Clear timeline from discovery to launch with milestones, integrations, and success metrics.",
  },
] as const;

export const contactFaqs = [
  {
    question: "What's the difference between AI Discovery and a strategy call?",
    answer:
      "AI Discovery is a self-guided, multi-step interview that instantly scores opportunities and generates a blueprint. A strategy call is a live 30-minute session with our team to review your goals, answer questions, and refine the roadmap together.",
  },
  {
    question: "How does the voice AI consultant work?",
    answer:
      "Click 'Talk To Your AI Consultant' to start a voice session. The AI asks discovery questions, analyzes your needs, recommends automation systems, estimates pricing, and can book a follow-up meeting — all in natural conversation.",
  },
  {
    question: "How quickly will I receive a proposal?",
    answer:
      "AI Discovery generates an instant blueprint. Manual form submissions and strategy calls typically receive a detailed proposal within 24–48 business hours, including pricing breakdown and implementation timeline.",
  },
  {
    question: "Is there any cost for the initial consultation?",
    answer:
      "No. AI Discovery, voice consultation demo, and strategy calls are free with no commitment. We only charge when you engage us for implementation.",
  },
  {
    question: "What should I prepare before a strategy call?",
    answer:
      "Bring context on your team size, current tools (CRM, phone, email), biggest operational bottlenecks, and any automation you've already tried. Running AI Discovery first gives us a head start.",
  },
] as const;
