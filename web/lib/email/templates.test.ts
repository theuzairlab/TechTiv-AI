import { describe, expect, it } from "vitest";
import {
  analysisReadySubject,
  buildAnalysisReadyHtml,
  buildAnalysisReadyText,
  buildMagicLinkHtml,
  magicLinkSubject,
} from "@/lib/email/templates";

describe("email templates", () => {
  it("builds analysis-ready subject and body with escaped domain", () => {
    const params = {
      to: "lead@example.com",
      name: "Alex",
      domain: "acme.com",
      analysisId: "analysis_1",
      magicLinkUrl: "https://app.example/magic?token=abc",
      costEstimateUSD: 1999,
      timelineWeeks: 8,
    };

    expect(analysisReadySubject(params.domain)).toContain("acme.com");
    expect(buildAnalysisReadyText(params)).toContain("View your blueprint");
    expect(buildAnalysisReadyText(params)).toContain("$1,999");
    expect(buildAnalysisReadyHtml(params)).toContain("View your blueprint");
    expect(buildAnalysisReadyHtml(params)).toContain(
      "https://app.example/magic?token=abc",
    );
  });

  it("escapes HTML in analysis-ready template", () => {
    const html = buildAnalysisReadyHtml({
      to: "lead@example.com",
      name: '<script>alert(1)</script>',
      domain: "evil.com",
      analysisId: "a1",
      magicLinkUrl: "https://app.example/link",
    });

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("builds magic-link subject and HTML", () => {
    expect(magicLinkSubject()).toMatch(/sign-in/i);
    const html = buildMagicLinkHtml({
      to: "lead@example.com",
      magicLinkUrl: "https://app.example/verify",
    });
    expect(html).toContain("Sign in");
    expect(html).toContain("https://app.example/verify");
  });
});
