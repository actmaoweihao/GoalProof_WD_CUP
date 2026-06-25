export type MatchData = {
  homeTeam: string;
  awayTeam: string;
  kickoffTime: bigint;
  commitDeadline: bigint;
  revealDeadline: bigint;
  actualHomeScore: number;
  actualAwayScore: number;
  resultSubmitted: boolean;
  canceled: boolean;
  revealCount: number;
};

export type PredictionData = {
  commitment: `0x${string}`;
  reasonHash: `0x${string}`;
  committedAt: bigint;
  revealedAt: bigint;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  revealed: boolean;
};

export function normalizeMatch(value: unknown): MatchData | undefined {
  if (!value) return undefined;
  const named = value as Record<string, unknown>;
  const tuple = value as readonly unknown[];
  return {
    homeTeam: String(named.homeTeam ?? tuple[0]),
    awayTeam: String(named.awayTeam ?? tuple[1]),
    kickoffTime: BigInt((named.kickoffTime as bigint) ?? (tuple[2] as bigint)),
    commitDeadline: BigInt((named.commitDeadline as bigint) ?? (tuple[3] as bigint)),
    revealDeadline: BigInt((named.revealDeadline as bigint) ?? (tuple[4] as bigint)),
    actualHomeScore: Number(named.actualHomeScore ?? tuple[5]),
    actualAwayScore: Number(named.actualAwayScore ?? tuple[6]),
    resultSubmitted: Boolean(named.resultSubmitted ?? tuple[7]),
    canceled: Boolean(named.canceled ?? tuple[8]),
    revealCount: Number(named.revealCount ?? tuple[9])
  };
}

export function normalizePrediction(value: unknown): PredictionData | undefined {
  if (!value) return undefined;
  const named = value as Record<string, unknown>;
  const tuple = value as readonly unknown[];
  return {
    commitment: String(named.commitment ?? tuple[0]) as `0x${string}`,
    reasonHash: String(named.reasonHash ?? tuple[1]) as `0x${string}`,
    committedAt: BigInt((named.committedAt as bigint) ?? (tuple[2] as bigint)),
    revealedAt: BigInt((named.revealedAt as bigint) ?? (tuple[3] as bigint)),
    predictedHomeScore: Number(named.predictedHomeScore ?? tuple[4]),
    predictedAwayScore: Number(named.predictedAwayScore ?? tuple[5]),
    pointsAwarded: Number(named.pointsAwarded ?? tuple[6]),
    revealed: Boolean(named.revealed ?? tuple[7])
  };
}
