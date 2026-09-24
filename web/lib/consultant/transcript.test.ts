import { describe, expect, it } from "vitest";
import { collapseRepeatedPhrases, mergeTranscript } from "./transcript";

describe("collapseRepeatedPhrases", () => {
  it("drops repeated words and phrases", () => {
    expect(collapseRepeatedPhrases("I've I've I've reviewed reviewed your setup")).toBe(
      "I've reviewed your setup",
    );
    expect(
      collapseRepeatedPhrases(
        "Thanks for joining Thanks for joining. Where would you like to start today? Where would you like to start today?",
      ),
    ).toBe("Thanks for joining Where would you like to start today?");
  });
});

describe("mergeTranscript", () => {
  it("keeps cumulative snapshots instead of concatenating them", () => {
    expect(mergeTranscript("Hello, NxtFlight.", "Hello, NxtFlight. Thanks for joining.")).toBe(
      "Hello, NxtFlight. Thanks for joining.",
    );
  });

  it("joins word deltas with spaces", () => {
    expect(mergeTranscript("Thanks", "for")).toBe("Thanks for");
    expect(mergeTranscript("Thanks for", " joining")).toBe("Thanks for joining");
  });

  it("does not append a phrase that was already spoken", () => {
    expect(mergeTranscript("Thanks for joining.", "Thanks for joining.")).toBe("Thanks for joining.");
    expect(mergeTranscript("Thanks for joining.", "joining.")).toBe("Thanks for joining.");
  });
});
