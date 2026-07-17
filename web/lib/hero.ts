export const heroMetrics = [
  {
    value: 300,
    suffix: "+",
    label: "AI Systems Deployed",
  },
  {
    value: 12,
    suffix: "x",
    label: "Productivity Increase",
  },
  {
    value: 85,
    suffix: "%",
    label: "Operational Automation",
  },
  {
    value: 24,
    suffix: "/7",
    label: "AI Workforce",
  },
] as const;

export const heroPrompts = [
  "I run a real estate company",
  "I want to automate support",
  "How can AI reduce costs?",
  "We need lead qualification AI",
] as const;

type MockResponse = {
  keywords: string[];
  response: string;
};

export const heroMockResponses: MockResponse[] = [
  {
    keywords: ["real estate", "property", "agent", "realtor"],
    response:
      "For real estate, I recommend an AI voice receptionist, WhatsApp lead automation, and CRM workflows. Estimated savings: 28 hours per week across your team.",
  },
  {
    keywords: ["support", "customer", "ticket", "helpdesk"],
    response:
      "A GPT-powered support bot with knowledge base integration can deflect 60–70% of tickets. Pair it with workflow automation for escalations and CRM sync.",
  },
  {
    keywords: ["cost", "save", "budget", "expensive", "reduce"],
    response:
      "Most clients see 40–60% cost reduction in repetitive ops within 90 days. Start with workflow automation and an AI voice agent for highest ROI.",
  },
  {
    keywords: ["lead", "qualification", "sales", "outreach", "sdr"],
    response:
      "An AI SDR system with lead enrichment, email sequences, and CRM routing typically increases qualified leads by 3–5x while cutting response time to under 60 seconds.",
  },
  {
    keywords: ["healthcare", "clinic", "patient", "medical"],
    response:
      "Healthcare teams benefit from AI appointment booking, patient reminders, and intake automation — HIPAA-ready workflows with voice assistants for after-hours coverage.",
  },
  {
    keywords: ["ecommerce", "shop", "store", "cart"],
    response:
      "Ecommerce automation: abandoned cart recovery AI, 24/7 support bot, and AI upsell flows. Most stores recover 15–25% of lost carts automatically.",
  },
];

export const heroDefaultResponse =
  "Tell me more about your business — industry, team size, and biggest operational bottleneck. I'll map the right AI systems and estimated ROI for you.";

export function getMockChatResponse(input: string): string {
  const normalized = input.toLowerCase();

  for (const mock of heroMockResponses) {
    if (mock.keywords.some((keyword) => normalized.includes(keyword))) {
      return mock.response;
    }
  }

  return heroDefaultResponse;
}
