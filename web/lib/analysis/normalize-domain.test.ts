import { describe, expect, it } from "vitest";
import {
  InvalidDomainError,
  normalizeDomain,
} from "@/lib/analysis/normalize-domain";

describe("normalizeDomain", () => {
  it("strips protocol and www", () => {
    expect(normalizeDomain("https://www.Example.com")).toBe("example.com");
  });

  it("strips path and query", () => {
    expect(normalizeDomain("example.com/about?ref=1")).toBe("example.com");
  });

  it("handles bare domains", () => {
    expect(normalizeDomain("stripe.com")).toBe("stripe.com");
  });

  it("throws on empty input", () => {
    expect(() => normalizeDomain("   ")).toThrow(InvalidDomainError);
  });

  it("throws on invalid host", () => {
    expect(() => normalizeDomain("not a domain")).toThrow(InvalidDomainError);
  });
});
