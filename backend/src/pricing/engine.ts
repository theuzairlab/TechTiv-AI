import {
  assignTier,
  getIndustryMultiplier,
  HIGH_IMPACT_AUTOMATION_FEE_USD,
  LOW_IMPACT_AUTOMATION_FEE_USD,
  MEDIUM_IMPACT_AUTOMATION_FEE_USD,
  PAIN_POINT_FEE_USD,
  FREE_PAIN_POINTS,
  FREE_TOOLS,
  TEAM_SIZE_MODIFIER_USD,
  TIER_BASE_USD,
  TIER_BASE_WEEKS,
  TOOL_FEE_USD,
} from "./rules.js";
import type { PricingInput, PricingResult } from "./types.js";

function painPointModifierUSD(painPointCount: number): number {
  return Math.max(0, painPointCount - FREE_PAIN_POINTS) * PAIN_POINT_FEE_USD;
}

function toolModifierUSD(toolCount: number): number {
  return Math.max(0, toolCount - FREE_TOOLS) * TOOL_FEE_USD;
}

function automationModifierUSD(input: PricingInput): number {
  return (
    input.highImpactAutomationCount * HIGH_IMPACT_AUTOMATION_FEE_USD +
    input.mediumImpactAutomationCount * MEDIUM_IMPACT_AUTOMATION_FEE_USD +
    input.lowImpactAutomationCount * LOW_IMPACT_AUTOMATION_FEE_USD
  );
}

function timelineWeeksFor(
  input: PricingInput,
  tier: PricingResult["tier"],
): number {
  let weeks = TIER_BASE_WEEKS[tier];
  weeks += Math.max(0, input.automationCount - 2);
  weeks += Math.floor(Math.max(0, input.painPointTags.length - 2) / 3);

  if (input.teamSizeEstimate === "large") {
    weeks += 2;
  }

  return weeks;
}

/** Deterministic pricing engine — never call an LLM for cost or timeline. */
export function calculatePricing(input: PricingInput): PricingResult {
  if (input.scope) {
    const scope = input.scope;
    const baseUSD = 4_500;
    const workflowUSD = scope.workflowCount * 1_800;
    const integrationUSD = scope.integrationCount * 900;
    const migrationUSD =
      scope.migration === "complex" ? 4_500 : scope.migration === "light" ? 1_500 : 0;
    const supportUSD = scope.support === "managed" ? 2_500 : 0;
    const complianceMultiplier = scope.compliance === "regulated" ? 1.2 : 1;
    const complexityMultiplier =
      scope.complexity === "high" ? 1.45 : scope.complexity === "medium" ? 1.2 : 1;
    const subtotal =
      baseUSD + workflowUSD + integrationUSD + migrationUSD + supportUSD;
    const costEstimateUSD = Math.round(
      subtotal * complianceMultiplier * complexityMultiplier,
    );
    const timelineWeeks =
      2 +
      scope.workflowCount +
      Math.ceil(scope.integrationCount / 2) +
      (scope.migration === "complex" ? 3 : scope.migration === "light" ? 1 : 0) +
      (scope.compliance === "regulated" ? 2 : 0);
    const tier: PricingResult["tier"] =
      costEstimateUSD >= 30_000
        ? "enterprise"
        : costEstimateUSD >= 14_000
          ? "growth"
          : "starter";
    return {
      costEstimateUSD,
      timelineWeeks,
      tier,
      engineVersion: "scope-v2",
      range: {
        lowUSD: Math.round(costEstimateUSD * 0.9),
        highUSD: Math.round(costEstimateUSD * 1.15),
      },
      lineItems: [
        { label: "Foundation", amountUSD: baseUSD },
        { label: `${scope.workflowCount} workflows`, amountUSD: workflowUSD },
        { label: `${scope.integrationCount} integrations`, amountUSD: integrationUSD },
        { label: "Data migration", amountUSD: migrationUSD },
        { label: "Managed launch support", amountUSD: supportUSD },
      ].filter((item) => item.amountUSD > 0),
      assumptions: [
        `${scope.workflowCount} scoped workflows`,
        `${scope.integrationCount} system integrations`,
        `${scope.complexity} implementation complexity`,
        `${scope.compliance} compliance profile`,
      ],
      breakdown: {
        tier,
        baseUSD,
        painPointModifierUSD: 0,
        toolModifierUSD: integrationUSD,
        automationModifierUSD: workflowUSD + migrationUSD + supportUSD,
        teamSizeModifierUSD: 0,
        industryMultiplier: complianceMultiplier * complexityMultiplier,
      },
    };
  }

  const tier = assignTier(input);
  const baseUSD = TIER_BASE_USD[tier];
  const painPointModifier = painPointModifierUSD(input.painPointTags.length);
  const toolModifier = toolModifierUSD(input.toolCount);
  const automationModifier = automationModifierUSD(input);
  const teamSizeModifier = TEAM_SIZE_MODIFIER_USD[input.teamSizeEstimate];
  const industryMultiplier = getIndustryMultiplier(input.industryTag);

  const subtotal =
    baseUSD +
    painPointModifier +
    toolModifier +
    automationModifier +
    teamSizeModifier;

  const costEstimateUSD = Math.round(subtotal * industryMultiplier);
  const timelineWeeks = timelineWeeksFor(input, tier);

  return {
    costEstimateUSD,
    timelineWeeks,
    tier,
    breakdown: {
      tier,
      baseUSD,
      painPointModifierUSD: painPointModifier,
      toolModifierUSD: toolModifier,
      automationModifierUSD: automationModifier,
      teamSizeModifierUSD: teamSizeModifier,
      industryMultiplier,
    },
    engineVersion: "scope-v2",
    range: {
      lowUSD: Math.round(costEstimateUSD * 0.9),
      highUSD: Math.round(costEstimateUSD * 1.15),
    },
    lineItems: [
      { label: "Base engagement", amountUSD: baseUSD },
      { label: "Workflow complexity", amountUSD: automationModifier },
      { label: "Tool integrations", amountUSD: toolModifier },
      { label: "Team enablement", amountUSD: teamSizeModifier },
      { label: "Additional discovery", amountUSD: painPointModifier },
    ].filter((item) => item.amountUSD > 0),
    assumptions: ["Legacy scope inputs normalized by deterministic engine"],
  };
}
