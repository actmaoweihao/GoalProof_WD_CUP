import type { Address, Hex } from "viem";

export type ScoreEvent = {
  user: Address;
  matchId: bigint;
  points: number;
  newTotalScore: bigint;
  blockNumber: bigint;
  transactionHash?: Hex;
  logIndex?: number;
};

export type RevealEvent = {
  user: Address;
  matchId: bigint;
  pointsAwarded: number;
};

export type LeaderboardRow = {
  rank: number;
  address: Address;
  totalScore: number;
  scoredMatches: number;
  exactScores: number;
  firstScoredBlock: bigint;
};

export function aggregateLeaderboard(scoreEvents: ScoreEvent[], reveals: RevealEvent[]) {
  const exact = new Set(
    reveals
      .filter((event) => event.pointsAwarded === 5)
      .map((event) => `${event.user.toLowerCase()}:${event.matchId}`)
  );
  const rows = new Map<Address, Omit<LeaderboardRow, "rank">>();
  for (const event of scoreEvents) {
    const address = event.user.toLowerCase() as Address;
    const previous = rows.get(address);
    rows.set(address, {
      address,
      totalScore: Number(event.newTotalScore),
      scoredMatches: (previous?.scoredMatches ?? 0) + 1,
      exactScores:
        (previous?.exactScores ?? 0) +
        (exact.has(`${address}:${event.matchId}`) ? 1 : 0),
      firstScoredBlock:
        previous && previous.firstScoredBlock < event.blockNumber
          ? previous.firstScoredBlock
          : event.blockNumber
    });
  }
  return [...rows.values()]
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.exactScores - a.exactScores ||
        Number(a.firstScoredBlock - b.firstScoredBlock) ||
        a.address.localeCompare(b.address)
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
