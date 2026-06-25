import { describe, expect, it } from "vitest";
import { aggregateLeaderboard, type RevealEvent, type ScoreEvent } from "./leaderboard";

const alice = "0x0000000000000000000000000000000000000001";
const bob = "0x0000000000000000000000000000000000000002";
const charlie = "0x0000000000000000000000000000000000000003";

describe("leaderboard aggregation", () => {
  it("aggregates totals and exact scores", () => {
    const scores: ScoreEvent[] = [
      { user: alice, matchId: 1n, points: 5, newTotalScore: 5n, blockNumber: 10n },
      { user: bob, matchId: 1n, points: 3, newTotalScore: 3n, blockNumber: 11n },
      { user: bob, matchId: 2n, points: 3, newTotalScore: 6n, blockNumber: 20n }
    ];
    const reveals: RevealEvent[] = [
      { user: alice, matchId: 1n, pointsAwarded: 5 },
      { user: bob, matchId: 1n, pointsAwarded: 3 },
      { user: bob, matchId: 2n, pointsAwarded: 3 }
    ];
    const rows = aggregateLeaderboard(scores, reveals);
    expect(rows.map((row) => [row.address, row.totalScore, row.exactScores])).toEqual([
      [bob, 6, 0],
      [alice, 5, 1]
    ]);
  });

  it("uses exact score then first block then address as tie-breakers", () => {
    const scores: ScoreEvent[] = [
      { user: charlie, matchId: 1n, points: 3, newTotalScore: 3n, blockNumber: 12n },
      { user: bob, matchId: 1n, points: 3, newTotalScore: 3n, blockNumber: 10n },
      { user: alice, matchId: 1n, points: 3, newTotalScore: 3n, blockNumber: 10n }
    ];
    expect(aggregateLeaderboard(scores, []).map((row) => row.address)).toEqual([
      alice,
      bob,
      charlie
    ]);
  });
});
