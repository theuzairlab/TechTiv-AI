export type TeamSizeEstimate = "solo" | "small" | "medium" | "large";

export type PricingTier = "starter" | "growth" | "enterprise";

export type PricingInput = {
  teamSizeEstimate: TeamSizeEstimate;
  painPointTags: string[];
  toolCount: number;
  automationCount: number;
  highImpactAutomationCount: number;
  mediumImpactAutomationCount: number;
  lowImpactAutomationCount: number;
  industryTag: string;
  scope?: NormalizedScope;
};

export type NormalizedScope = {
  workflowCount: number;
  integrationCount: number;
  migration: "none" | "light" | "complex";
  complexity: "low" | "medium" | "high";
  compliance: "standard" | "regulated";
  support: "launch" | "managed";
  monthlyVolume?: number;
};

export type PricingBreakdown = {
  tier: PricingTier;
  baseUSD: number;
  painPointModifierUSD: number;
  toolModifierUSD: number;
  automationModifierUSD: number;
  teamSizeModifierUSD: number;
  industryMultiplier: number;
};

export type PricingResult = {
  costEstimateUSD: number;
  timelineWeeks: number;
  tier: PricingTier;
  breakdown: PricingBreakdown;
  engineVersion: "scope-v2";
  range: { lowUSD: number; highUSD: number };
  lineItems: Array<{ label: string; amountUSD: number }>;
  assumptions: string[];
};
