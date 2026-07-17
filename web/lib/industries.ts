import type { LucideIcon } from "lucide-react";
import {
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  Megaphone,
  Scale,
  ShoppingCart,
  Truck,
} from "lucide-react";

export type IndustryAccent = "cyan" | "lime" | "violet" | "rose";

export type Industry = {
  slug: string;
  name: string;
  description: string;
  features: readonly string[];
  icon: LucideIcon;
  accent: IndustryAccent;
  metric: string;
};

export const industries: Industry[] = [
  {
    slug: "real-estate",
    name: "Real Estate",
    description:
      "Capture, qualify, and convert leads 24/7 with AI voice and CRM automation.",
    features: [
      "AI lead qualification",
      "WhatsApp automation",
      "CRM workflows",
      "Appointment scheduling",
      "AI voice receptionists",
    ],
    icon: Home,
    accent: "cyan",
    metric: "3x faster lead response",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description:
      "Automate patient intake, reminders, and support while staying compliant.",
    features: [
      "Appointment booking",
      "Patient reminders",
      "Support AI",
      "Intake automation",
      "Voice assistants",
    ],
    icon: HeartPulse,
    accent: "lime",
    metric: "60% fewer no-shows",
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    description:
      "Recover carts, automate support, and drive upsells with AI systems.",
    features: [
      "Support automation",
      "Abandoned cart AI",
      "AI upselling",
      "Review automation",
      "AI content systems",
    ],
    icon: ShoppingCart,
    accent: "violet",
    metric: "22% cart recovery rate",
  },
  {
    slug: "law-firm",
    name: "Law Firms",
    description:
      "Streamline intake, documents, and client communication with AI.",
    features: [
      "Intake automation",
      "Document AI",
      "Scheduling AI",
      "Client support systems",
    ],
    icon: Scale,
    accent: "rose",
    metric: "40% faster intake",
  },
  {
    slug: "agency",
    name: "Agencies",
    description:
      "Scale outreach, reporting, and lead gen without adding headcount.",
    features: [
      "Outreach AI",
      "Reporting automation",
      "Lead generation",
      "CRM workflows",
    ],
    icon: Megaphone,
    accent: "cyan",
    metric: "5x outreach capacity",
  },
  {
    slug: "saas",
    name: "SaaS",
    description:
      "Reduce churn with AI onboarding, support, and product-led growth flows.",
    features: [
      "Onboarding automation",
      "Support AI",
      "Churn prevention",
      "Usage analytics AI",
      "Trial conversion flows",
    ],
    icon: Laptop,
    accent: "lime",
    metric: "35% churn reduction",
  },
  {
    slug: "logistics",
    name: "Logistics",
    description:
      "Optimize dispatch, tracking, and operations with intelligent workflows.",
    features: [
      "Dispatch automation",
      "Route optimization AI",
      "Real-time tracking",
      "Customer notifications",
      "Operations dashboards",
    ],
    icon: Truck,
    accent: "violet",
    metric: "18% route efficiency gain",
  },
  {
    slug: "finance",
    name: "Finance",
    description:
      "Automate compliance, documents, and client service at enterprise scale.",
    features: [
      "Compliance workflows",
      "Document processing AI",
      "Client support AI",
      "KYC automation",
      "Reporting intelligence",
    ],
    icon: Landmark,
    accent: "rose",
    metric: "50% faster processing",
  },
];

export type IndustrySlug = (typeof industries)[number]["slug"];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
