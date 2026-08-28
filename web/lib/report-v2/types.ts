export type EvidenceRefItem = {
  evidenceRefs: string[];
};

export type ReportV2 = {
  version: "2.0";
  generatedAt: string;
  coverage: {
    score: number;
    status: "complete" | "partial" | "limited";
    covered: string[];
    missing: string[];
    evidenceCount: number;
  };
  businessProfile: {
    summary: string;
    industry: string;
    teamSize: string;
    operatingModel: string;
  };
  executiveSummary: string;
  scorecard: Array<
    EvidenceRefItem & {
      dimension: string;
      score: number;
      rationale: string;
    }
  >;
  findings: Array<
    EvidenceRefItem & {
      title: string;
      category: string;
      severity: "high" | "medium" | "low";
      summary: string;
    }
  >;
  competitors: Array<
    EvidenceRefItem & {
      name: string;
      url?: string;
      positioning: string;
      verified: boolean;
    }
  >;
  opportunities: Array<
    EvidenceRefItem & {
      title: string;
      outcome: string;
      workflow: string;
      impact: "high" | "medium" | "low";
      effort: "high" | "medium" | "low";
      integrations: string[];
    }
  >;
  stackArchitecture: Array<
    EvidenceRefItem & {
      layer: string;
      recommendation: string;
      reason: string;
    }
  >;
  roadmap: Array<{
    phase: string;
    objective: string;
    deliverables: string[];
    dependencies: string[];
    estimatedWeeks: number;
  }>;
  risks: string[];
  assumptions: string[];
  unknowns: string[];
  confidence: { level: "high" | "medium" | "low"; rationale: string };
  pricing?: {
    engineVersion: string;
    costEstimateUSD: number;
    timelineWeeks: number;
    range: { lowUSD: number; highUSD: number };
    lineItems: Array<{ label: string; amountUSD: number }>;
    assumptions: string[];
  };
  roi?: {
    available: boolean;
    missingInputs?: string[];
    note?: string;
    scenarios?: Record<
      string,
      { annualBenefitUSD: number; paybackMonths: number }
    >;
  };
};

export function asReportV2(value: unknown): ReportV2 | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const report = value as Partial<ReportV2>;
  return report.version === "2.0" &&
    typeof report.executiveSummary === "string" &&
    Array.isArray(report.findings)
    ? (report as ReportV2)
    : null;
}
