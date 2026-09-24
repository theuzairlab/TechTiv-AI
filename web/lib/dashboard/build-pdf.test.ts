import { describe, expect, it } from "vitest";
import type { AnalysisDetail } from "./types";
import { buildProposalPdf } from "./build-pdf";

describe("buildProposalPdf", () => {
  it("generates a PDF when report content contains Unicode", async () => {
    const detail = {
      id: "analysis-1",
      domain: "example.com",
      status: "DONE",
      errorMsg: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      leadEmail: "owner@example.com",
      evidence: [],
      consultation: [],
      pdfUnlocked: true,
      proposal: {
        id: "proposal-1",
        status: "SENT",
        strategyJson: null,
        techStack: [],
        automationBlueprint: [],
        narrativeText:
          "AI-ready growth — improve conversion → automate follow-up 🚀 “today”.",
        costEstimateUSD: null,
        timelineWeeks: null,
        pdfUrl: null,
        reportJson: null,
      },
    } as AnalysisDetail;

    const bytes = await buildProposalPdf(detail);

    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
  });
});
