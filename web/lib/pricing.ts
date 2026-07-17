export type PricingInputs = {
  workflows: number;
  integrations: number;
  aiModels: number;
  complexity: number;
  callVolume: number;
  supportVolume: number;
  crmRequired: boolean;
};

export type PricingResult = {
  setup: number;
  monthly: number;
  retainer: number;
  roi: {
    hoursSavedPerMonth: number;
    annualSavings: number;
    paybackMonths: number;
  };
  timelineWeeks: number;
  automationCoverage: number;
  systemLabel: string;
};

export const defaultPricingInputs: PricingInputs = {
  workflows: 4,
  integrations: 3,
  aiModels: 2,
  complexity: 2,
  callVolume: 500,
  supportVolume: 800,
  crmRequired: true,
};

export const pricingSliders = [
  {
    id: "workflows" as const,
    label: "Workflows",
    min: 1,
    max: 15,
    step: 1,
    unit: "automations",
  },
  {
    id: "integrations" as const,
    label: "Integrations",
    min: 1,
    max: 10,
    step: 1,
    unit: "tools",
  },
  {
    id: "aiModels" as const,
    label: "AI Models",
    min: 1,
    max: 5,
    step: 1,
    unit: "tier",
  },
  {
    id: "complexity" as const,
    label: "Automation Complexity",
    min: 1,
    max: 5,
    step: 1,
    unit: "level",
  },
  {
    id: "callVolume" as const,
    label: "Call Volume",
    min: 0,
    max: 5000,
    step: 100,
    unit: "/mo",
  },
  {
    id: "supportVolume" as const,
    label: "Support Volume",
    min: 0,
    max: 10000,
    step: 200,
    unit: "tickets/mo",
  },
] as const;

function getSystemLabel(inputs: PricingInputs): string {
  if (inputs.complexity >= 4 || inputs.workflows >= 10) {
    return "Enterprise AI Workflow System";
  }
  if (inputs.workflows >= 6 || inputs.integrations >= 6) {
    return "Advanced AI Workflow System";
  }
  return "AI Workflow System";
}

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const {
    workflows,
    integrations,
    aiModels,
    complexity,
    callVolume,
    supportVolume,
    crmRequired,
  } = inputs;

  const setup = Math.round(
    1800 +
      workflows * 220 +
      integrations * 180 +
      complexity * 450 +
      aiModels * 320 +
      (crmRequired ? 600 : 0) +
      Math.min(callVolume, 2000) * 0.15,
  );

  const monthly = Math.round(
    149 +
      workflows * 28 +
      integrations * 22 +
      aiModels * 55 +
      complexity * 40 +
      callVolume * 0.035 +
      supportVolume * 0.012 +
      (crmRequired ? 75 : 0),
  );

  const retainer = Math.round(
    899 +
      workflows * 45 +
      complexity * 120 +
      aiModels * 80 +
      integrations * 25,
  );

  const hoursSavedPerMonth = Math.round(
    workflows * 12 + integrations * 6 + complexity * 10 + aiModels * 8,
  );

  const hourlyRate = 55;
  const annualSavings = hoursSavedPerMonth * hourlyRate * 12;
  const paybackMonths = Math.max(
    1,
    Math.round(setup / Math.max(monthly + hoursSavedPerMonth * hourlyRate, 1)),
  );

  const timelineWeeks = Math.min(
    12,
    Math.max(2, Math.round(2 + complexity * 1.5 + workflows * 0.4)),
  );

  const automationCoverage = Math.min(
    95,
    Math.round(
      35 +
        workflows * 4 +
        integrations * 3 +
        complexity * 5 +
        (crmRequired ? 8 : 0),
    ),
  );

  return {
    setup,
    monthly,
    retainer,
    roi: {
      hoursSavedPerMonth,
      annualSavings,
      paybackMonths,
    },
    timelineWeeks,
    automationCoverage,
    systemLabel: getSystemLabel(inputs),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
