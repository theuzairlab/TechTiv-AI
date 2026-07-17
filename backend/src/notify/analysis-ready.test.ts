import { describe, expect, it } from "vitest";

function resolveBaseUrl(env: Record<string, string | undefined>): string | null {
  const url =
    env.WEB_APP_URL?.trim() ||
    env.BETTER_AUTH_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

describe("notify analysis-ready config", () => {
  it("prefers WEB_APP_URL and strips trailing slash", () => {
    expect(
      resolveBaseUrl({
        WEB_APP_URL: "http://localhost:3000/",
        BETTER_AUTH_URL: "http://other",
      }),
    ).toBe("http://localhost:3000");
  });

  it("falls back to BETTER_AUTH_URL", () => {
    expect(
      resolveBaseUrl({
        BETTER_AUTH_URL: "https://app.techtivai.com",
      }),
    ).toBe("https://app.techtivai.com");
  });

  it("returns null when unset", () => {
    expect(resolveBaseUrl({})).toBeNull();
  });
});
