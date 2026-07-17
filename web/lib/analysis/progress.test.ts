import { describe, expect, it } from "vitest";
import {
  getStatusIndex,
  isTerminalStatus,
  progressPercent,
} from "@/lib/analysis/progress";

describe("analysis progress helpers", () => {
  it("orders pipeline statuses", () => {
    expect(getStatusIndex("QUEUED")).toBe(0);
    expect(getStatusIndex("SYNTHESIZING")).toBeGreaterThan(
      getStatusIndex("CRAWLING"),
    );
    expect(getStatusIndex("DONE")).toBeGreaterThan(
      getStatusIndex("GENERATING_PDF"),
    );
  });

  it("computes progress percent", () => {
    expect(progressPercent("DONE")).toBe(100);
    expect(progressPercent("FAILED")).toBe(0);
    expect(progressPercent("QUEUED")).toBeGreaterThan(0);
    expect(progressPercent("QUEUED")).toBeLessThan(100);
  });

  it("detects terminal statuses", () => {
    expect(isTerminalStatus("DONE")).toBe(true);
    expect(isTerminalStatus("FAILED")).toBe(true);
    expect(isTerminalStatus("PRICING")).toBe(false);
  });
});
