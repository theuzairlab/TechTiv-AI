import { describe, expect, it } from "vitest";

function scoreFromCategory(
  categories: Record<string, { score?: number | null }> | undefined,
  key: string,
): number | null {
  const score = categories?.[key]?.score;
  if (score == null) return null;
  return Math.round(score * 100);
}

describe("pagespeed score parsing", () => {
  it("converts lighthouse category scores to 0-100", () => {
    expect(
      scoreFromCategory(
        {
          performance: { score: 0.91 },
          seo: { score: 0.88 },
        },
        "performance",
      ),
    ).toBe(91);
  });

  it("returns null for missing categories", () => {
    expect(scoreFromCategory({}, "performance")).toBeNull();
  });
});

describe("provider env helpers", () => {
  it("builds https url from bare domain", async () => {
    const { toWebsiteUrl } = await import("./env.js");
    expect(toWebsiteUrl("stripe.com")).toBe("https://stripe.com");
    expect(toWebsiteUrl("https://stripe.com")).toBe("https://stripe.com");
  });
});
