import { describe, expect, it } from "vitest";
import {
  analyzePredictionReason,
  buildPostMatchReview,
  computePredictionReasonHash,
  normalizePredictionReason
} from "./aiReason";

describe("AI prediction reason helpers", () => {
  it("normalizes whitespace before hashing", () => {
    expect(normalizePredictionReason("  巴西   进攻 状态好\n阿根廷后防有伤病  ")).toBe(
      "巴西 进攻 状态好 阿根廷后防有伤病"
    );
  });

  it("computes a domain-separated reason hash", () => {
    const base = {
      chainId: 31337,
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const,
      userAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as const,
      matchId: 1n,
      reason: "巴西进攻状态好，阿根廷后防有伤病。"
    };

    expect(computePredictionReasonHash(base)).toMatch(/^0x[0-9a-f]{64}$/);
    expect(computePredictionReasonHash({ ...base, matchId: 2n })).not.toBe(
      computePredictionReasonHash(base)
    );
  });

  it("turns a free-form reason into tags and a risk level", () => {
    const analysis = analyzePredictionReason(
      "巴西进攻状态好，阿根廷后防有伤病，但历史交锋也有压力。",
      2,
      0
    );

    expect(analysis.tags).toEqual(
      expect.arrayContaining(["进攻状态", "防守质量", "伤病停赛", "历史交锋"])
    );
    expect(analysis.riskLevel).toBe("均衡");
  });

  it("builds a post-match review from actual scores", () => {
    const analysis = analyzePredictionReason("巴西进攻状态好。", 3, 1);

    expect(
      buildPostMatchReview({
        analysis,
        predictedHomeScore: 3,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 0
      })
    ).toContain("胜平负方向正确");
  });
});
