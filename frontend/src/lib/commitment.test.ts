import { describe, expect, it, vi } from "vitest";
import { computePredictionCommitment, generateSalt, isBytes32 } from "./commitment";

describe("commitment helpers", () => {
  it("matches the shared Solidity commitment vector", () => {
    expect(
      computePredictionCommitment({
        chainId: 31337,
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        userAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        matchId: 1n,
        predictedHomeScore: 2,
        predictedAwayScore: 0,
        salt: `0x${"11".repeat(32)}`
      })
    ).toBe("0x4c12594de0889d763b54f92b846d6858b3c04d6b600431a0ce0d98880f9a0a00");
  });

  it("generates a random 32-byte salt", () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      (array as Uint8Array).fill(0xab);
      return array;
    });
    expect(generateSalt()).toBe(`0x${"ab".repeat(32)}`);
  });

  it("validates bytes32 values", () => {
    expect(isBytes32(`0x${"ab".repeat(32)}`)).toBe(true);
    expect(isBytes32("0x1234")).toBe(false);
  });
});
