import { describe, expect, it } from "vitest";
import type { AnalysisEvidence } from "../generated/prisma/client.js";
import { calculatePricing } from "../pricing/engine.js";
import { calculateRoi } from "../pricing/roi.js";
import { calculateCoverage } from "../synthesis/coverage.js";
import { groundSynthesis } from "../synthesis/grounding.js";
import type { SynthesisResult } from "../synthesis/schema.js";
import { QUALITY_FIXTURES } from "./fixtures.js";

const evidence = [
  { evidenceKey: "web", sourceType: "website_page", entityConfidence: 1 },
  {
    evidenceKey: "tech",
    sourceType: "technical_measurement",
    entityConfidence: 1,
  },
  {
    evidenceKey: "market",
    sourceType: "competitor_candidate",
    entityConfidence: 0.8,
  },
  {
    evidenceKey: "local",
    sourceType: "local_visibility",
    entityConfidence: 0.7,
  },
] as AnalysisEvidence[];

const synthesis: SynthesisResult = {
  businessProfile: {
    summary: "Fixture business",
    industry: "saas",
    teamSize: "small",
    operatingModel: "Digital",
  },
  executiveSummary: "Prioritize one measurable workflow.",
  scorecard: ["Operations", "Growth", "Technology"].map((dimension) => ({
    dimension,
    score: 60,
    rationale: "Measured signal",
    evidenceRefs: ["web"],
  })),
  findings: [
    {
      title: "Finding A",
      category: "operations",
      severity: "high",
      summary: "Evidence-backed.",
      evidenceRefs: ["web"],
    },
    {
      title: "Finding B",
      category: "technology",
      severity: "medium",
      summary: "Evidence-backed.",
      evidenceRefs: ["tech"],
    },
  ],
  competitors: [
    {
      name: "Verified competitor",
      positioning: "Adjacent category",
      verified: true,
      evidenceRefs: ["market"],
    },
  ],
  opportunities: [
    {
      title: "Workflow",
      outcome: "Faster handling",
      workflow: "Lead routing",
      type: "automation_opportunity",
      impact: "high",
      effort: "medium",
      integrations: ["CRM"],
      evidenceRefs: ["web"],
    },
  ],
  stackArchitecture: [],
  socialGrowth: [],
  recommendedServices: [
    {
      problem: "Lead routing is manual.",
      service: "AI Automation & Workflow",
      techStack: ["CRM"],
      estimatedScope: "Automate lead routing.",
      estimatedTimelineWeeks: 3,
      ctaLabel: "Build This With TechTivAI",
    },
  ],
  currentTechStack: [],
  roadmap: [
    {
      phase: "Foundation",
      objective: "Measure",
      deliverables: ["Baseline"],
      dependencies: [],
      estimatedWeeks: 2,
    },
  ],
  risks: [],
  assumptions: [],
  unknowns: [],
  confidence: { level: "medium", rationale: "Fixture" },
};

describe("Report V2 quality gates", () => {
  it("degrades coverage honestly when sources are absent", () => {
    expect(calculateCoverage(evidence.slice(0, 1), false)).toMatchObject({
      status: "limited",
      score: 20,
    });
    expect(calculateCoverage(evidence, true)).toMatchObject({
      status: "complete",
      score: 100,
    });
  });

  it("keeps valid citations and verifies matched competitors", () => {
    const grounded = groundSynthesis(synthesis, evidence);
    expect(grounded.findings).toHaveLength(2);
    expect(grounded.competitors[0]?.verified).toBe(true);
    expect(
      grounded.findings.every((item) =>
        item.evidenceRefs.every((ref) =>
          evidence.some((source) => source.evidenceKey === ref),
        ),
      ),
    ).toBe(true);
  });

  it.each(QUALITY_FIXTURES)(
    "prices $name scopes deterministically",
    ({ expectedScope }) => {
      const input = {
        teamSizeEstimate: "small" as const,
        painPointTags: [],
        toolCount: 0,
        automationCount: 0,
        highImpactAutomationCount: 0,
        mediumImpactAutomationCount: 0,
        lowImpactAutomationCount: 0,
        industryTag: "general",
        scope: expectedScope,
      };
      expect(calculatePricing(input)).toEqual(calculatePricing(input));
      expect(calculatePricing(input).engineVersion).toBe("scope-v2");
    },
  );

  it("withholds ROI instead of inventing missing benefits", () => {
    expect(calculateRoi({ monthlyVolume: 100 }, 10_000)).toMatchObject({
      available: false,
      missingInputs: expect.arrayContaining([
        "minutesPerItem",
        "hourlyCostUSD",
        "automatablePercent",
      ]),
    });
  });
});
