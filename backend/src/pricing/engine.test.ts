import { describe, expect, it } from "vitest";
import { calculatePricing } from "./engine.js";
import { assignTier } from "./rules.js";
import type { PricingInput } from "./types.js";

const baseInput: PricingInput = {
  teamSizeEstimate: "solo",
  painPointTags: ["manual reporting", "slow follow-up"],
  toolCount: 2,
  automationCount: 1,
  highImpactAutomationCount: 1,
  mediumImpactAutomationCount: 0,
  lowImpactAutomationCount: 0,
  industryTag: "saas",
};

describe("assignTier", () => {
  it("assigns starter for solo with few pain points", () => {
    expect(assignTier(baseInput)).toBe("starter");
  });

  it("assigns growth for medium team", () => {
    expect(
      assignTier({ ...baseInput, teamSizeEstimate: "medium", automationCount: 3 }),
    ).toBe("growth");
  });

  it("assigns enterprise for large team", () => {
    expect(
      assignTier({
        ...baseInput,
        teamSizeEstimate: "large",
        painPointTags: ["a", "b", "c", "d", "e", "f"],
        automationCount: 5,
        highImpactAutomationCount: 3,
      }),
    ).toBe("enterprise");
  });
});

describe("calculatePricing", () => {
  it("returns starter tier pricing for a solo founder profile", () => {
    const result = calculatePricing(baseInput);
    expect(result.tier).toBe("starter");
    expect(result.costEstimateUSD).toBe(1199);
    expect(result.timelineWeeks).toBe(4);
  });

  it("returns growth tier pricing for a medium team profile", () => {
    const result = calculatePricing({
      teamSizeEstimate: "medium",
      painPointTags: ["a", "b", "c", "d"],
      toolCount: 4,
      automationCount: 3,
      highImpactAutomationCount: 2,
      mediumImpactAutomationCount: 1,
      lowImpactAutomationCount: 0,
      industryTag: "saas",
    });

    expect(result.tier).toBe("growth");
    expect(result.costEstimateUSD).toBeGreaterThan(1999);
    expect(result.timelineWeeks).toBeGreaterThanOrEqual(8);
  });

  it("applies industry multiplier for finance", () => {
    const saas = calculatePricing(baseInput);
    const finance = calculatePricing({ ...baseInput, industryTag: "finance" });
    expect(finance.costEstimateUSD).toBeGreaterThan(saas.costEstimateUSD);
  });

  it("is deterministic for identical input", () => {
    const first = calculatePricing(baseInput);
    const second = calculatePricing(baseInput);
    expect(first).toEqual(second);
  });

  it("never returns zero cost or timeline", () => {
    const result = calculatePricing(baseInput);
    expect(result.costEstimateUSD).toBeGreaterThan(0);
    expect(result.timelineWeeks).toBeGreaterThan(0);
  });
});
