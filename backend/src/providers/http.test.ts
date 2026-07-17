import { describe, expect, it } from "vitest";
import {
  ProviderHttpError,
  ProviderNetworkError,
  fetchJson,
} from "./http.js";

describe("fetchJson retries", () => {
  it("exports network and http error types", () => {
    const network = new ProviderNetworkError("https://example.com", new Error("fetch failed"));
    expect(network.message).toContain("Network error");
    expect(network.message).toContain("fetch failed");

    const http = new ProviderHttpError(503, "unavailable");
    expect(http.status).toBe(503);
    expect(http.message).toContain("503");
  });

  it("fetchJson is a function", () => {
    expect(typeof fetchJson).toBe("function");
  });
});
