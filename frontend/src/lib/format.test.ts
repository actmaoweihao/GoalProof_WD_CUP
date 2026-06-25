import { describe, expect, it } from "vitest";
import { formatCountdown, shortAddress } from "./format";

describe("format helpers", () => {
  it("shortens wallet addresses", () => {
    expect(shortAddress("0x1234567890123456789012345678901234567890")).toBe("0x1234…7890");
  });

  it("formats countdowns", () => {
    expect(formatCountdown(5_000, 1_000_000)).toBe("1小时 6分");
  });
});
