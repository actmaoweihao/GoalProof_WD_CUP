import { describe, expect, it } from "vitest";
import { getErrorMessage, getTechnicalError } from "./errors";

describe("error mapping", () => {
  it("maps contract errors to readable Chinese", () => {
    expect(getErrorMessage(new Error("execution reverted: CommitmentMismatch()"))).toContain(
      "salt"
    );
    expect(getErrorMessage(new Error("PredictionNotCommitted(1, 0xabc)"))).toContain("没有找到");
  });

  it("preserves raw technical details", () => {
    expect(getTechnicalError(new Error("raw rpc failure"))).toBe("raw rpc failure");
  });

  it("uses a safe fallback", () => {
    expect(getErrorMessage(new Error("unknown"))).toContain("技术详情");
  });
});
