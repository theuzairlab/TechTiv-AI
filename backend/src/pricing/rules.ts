import type { PricingInput, PricingTier } from "./types.js";

export const TIER_BASE_USD: Record<PricingTier, number> = {
  starter: 999,
  growth: 1999,
  enterprise: 4999,
};

export const TIER_BASE_WEEKS: Record<PricingTier, number> = {
  starter: 4,
  growth: 8,
  enterprise: 12,
};

export const PAIN_POINT_FEE_USD = 100;
export const FREE_PAIN_POINTS = 2;

export const TOOL_FEE_USD = 75;
export const FREE_TOOLS = 2;

export const HIGH_IMPACT_AUTOMATION_FEE_USD = 200;
export const MEDIUM_IMPACT_AUTOMATION_FEE_USD = 100;
export const LOW_IMPACT_AUTOMATION_FEE_USD = 50;

export const TEAM_SIZE_MODIFIER_USD = {
  solo: 0,
  small: 0,
  medium: 300,
  large: 800,
} as const;

export const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  saas: 1,
  ecommerce: 1.05,
  retail: 1.05,
  healthcare: 1.15,
  finance: 1.2,
  fintech: 1.2,
  agency: 1,
  default: 1,
};

export function assignTier(input: PricingInput): PricingTier {
  if (
    input.teamSizeEstimate === "large" ||
    input.painPointTags.length >= 6 ||
    input.automationCount >= 5 ||
    input.highImpactAutomationCount >= 3
  ) {
    return "enterprise";
  }

  if (
    input.teamSizeEstimate === "medium" ||
    input.painPointTags.length >= 3 ||
    input.automationCount >= 3 ||
    input.highImpactAutomationCount >= 2
  ) {
    return "growth";
  }

  return "starter";
}

export function getIndustryMultiplier(industryTag: string): number {
  const normalized = industryTag.trim().toLowerCase();
  return INDUSTRY_MULTIPLIERS[normalized] ?? INDUSTRY_MULTIPLIERS.default;
}
