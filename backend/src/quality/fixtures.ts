import type { NormalizedScope } from "../pricing/types.js";

export type QualityFixture = {
  name: string;
  domain: string;
  intake: Record<string, unknown>;
  expectedScope: NormalizedScope;
};

export const QUALITY_FIXTURES: QualityFixture[] = [
  {
    name: "SaaS",
    domain: "saas.example",
    intake: {
      companyName: "Signal SaaS",
      industry: "saas",
      volumes: "900 leads per month",
    },
    expectedScope: {
      workflowCount: 3,
      integrationCount: 4,
      migration: "light",
      complexity: "medium",
      compliance: "standard",
      support: "launch",
      monthlyVolume: 900,
    },
  },
  {
    name: "Local service",
    domain: "plumber.example",
    intake: {
      companyName: "City Plumbing",
      industry: "home services",
      location: "Austin",
    },
    expectedScope: {
      workflowCount: 2,
      integrationCount: 2,
      migration: "none",
      complexity: "low",
      compliance: "standard",
      support: "managed",
    },
  },
  {
    name: "E-commerce",
    domain: "shop.example",
    intake: {
      companyName: "Example Shop",
      industry: "ecommerce",
      volumes: "12000 orders per month",
    },
    expectedScope: {
      workflowCount: 4,
      integrationCount: 6,
      migration: "complex",
      complexity: "high",
      compliance: "standard",
      support: "managed",
      monthlyVolume: 12_000,
    },
  },
  {
    name: "Social-only",
    domain: "social-business.techtiv.local",
    intake: {
      companyName: "Social Studio",
      industry: "creator services",
      socialLinks: { instagram: "https://instagram.com/socialstudio" },
    },
    expectedScope: {
      workflowCount: 1,
      integrationCount: 1,
      migration: "none",
      complexity: "low",
      compliance: "standard",
      support: "launch",
    },
  },
];
