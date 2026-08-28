import { describe, expect, it } from "vitest";
import { extractJsonFromText } from "./parse-json.js";
import { synthesisSchema } from "./schema.js";

const validSynthesis = {
  businessProfile: {
    summary: "Acme is a B2B SaaS company.",
    industry: "saas",
    teamSize: "small",
    operatingModel: "Subscription",
  },
  executiveSummary: "Prioritize the lead workflow.",
  scorecard: ["Operations", "Growth", "Technology"].map((dimension) => ({
    dimension,
    score: 60,
    rationale: "Measured evidence",
    evidenceRefs: ["ev-1"],
  })),
  findings: [
    {
      title: "Manual routing",
      category: "sales",
      severity: "high",
      summary: "Routing is manual.",
      evidenceRefs: ["ev-1"],
    },
    {
      title: "Thin proof",
      category: "trust",
      severity: "medium",
      summary: "Proof is limited.",
      evidenceRefs: ["ev-2"],
    },
  ],
  competitors: [],
  opportunities: [
    {
      title: "Lead routing",
      outcome: "Faster response",
      workflow: "Lead qualification",
      impact: "high",
      effort: "medium",
      integrations: ["CRM"],
      evidenceRefs: ["ev-1"],
    },
  ],
  stackArchitecture: [
    {
      layer: "CRM",
      recommendation: "HubSpot",
      reason: "Workflow record",
      evidenceRefs: ["ev-1"],
    },
  ],
  roadmap: [
    {
      phase: "Foundation",
      objective: "Measure",
      deliverables: ["Baseline"],
      dependencies: [],
      estimatedWeeks: 2,
    },
  ],
  risks: ["Data quality"],
  assumptions: ["Workflow owner exists"],
  unknowns: ["Lead volume"],
  confidence: { level: "medium", rationale: "Partial coverage" },
};

describe("synthesisSchema", () => {
  it("accepts valid synthesis JSON", () => {
    expect(synthesisSchema.parse(validSynthesis)).toEqual(validSynthesis);
  });

  it("rejects missing findings", () => {
    expect(() =>
      synthesisSchema.parse({ ...validSynthesis, findings: [] }),
    ).toThrow();
  });

  it("rejects invalid team size", () => {
    expect(() =>
      synthesisSchema.parse({
        ...validSynthesis,
        businessProfile: {
          ...validSynthesis.businessProfile,
          teamSize: "huge",
        },
      }),
    ).toThrow();
  });

  it("requires opportunities", () => {
    expect(() =>
      synthesisSchema.parse({ ...validSynthesis, opportunities: [] }),
    ).toThrow();
  });
});

describe("extractJsonFromText", () => {
  it("parses fenced JSON blocks", () => {
    const parsed = extractJsonFromText(
      'Here is the result:\n```json\n{"ok":true}\n```',
    );
    expect(parsed).toEqual({ ok: true });
  });

  it("parses raw JSON objects", () => {
    expect(extractJsonFromText('{"ok":true}')).toEqual({ ok: true });
  });

  it("repairs truncated JSON objects", () => {
    const parsed = extractJsonFromText(
      '{"businessSummary":"Acme","painPoints":["a","b"',
    );
    expect(parsed).toEqual({
      businessSummary: "Acme",
      painPoints: ["a"],
    });
  });
});
