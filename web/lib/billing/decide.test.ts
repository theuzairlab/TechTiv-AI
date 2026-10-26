import { describe, expect, it } from "vitest";
import { decideCharge } from "@/lib/billing/decide";

const base = {
  hasRealEmail: true,
  freeRunsUsed: 0,
  freeLimit: 1,
  isSalesClient: false,
  hasUnusedCredit: false,
};

describe("decideCharge", () => {
  it("asks for an email before it can tell a first run from a second", () => {
    expect(decideCharge({ ...base, hasRealEmail: false })).toBe("email_required");
  });

  it("lets the first run start for free", () => {
    expect(decideCharge(base)).toBe("allow");
  });

  it("asks for payment on the next run", () => {
    expect(decideCharge({ ...base, freeRunsUsed: 1 })).toBe("payment_required");
  });

  it("uses one paid credit instead of asking again", () => {
    expect(
      decideCharge({ ...base, freeRunsUsed: 1, hasUnusedCredit: true }),
    ).toBe("use_credit");
  });

  it("lets a won or proposal lead keep starting runs", () => {
    expect(
      decideCharge({ ...base, freeRunsUsed: 3, isSalesClient: true }),
    ).toBe("allow");
  });
});
