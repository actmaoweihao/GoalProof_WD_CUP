export const WRITE_GAS_LIMITS = {
  createMatch: 500_000n,
  submitResult: 200_000n,
  cancelMatch: 150_000n,
  pause: 120_000n,
  unpause: 120_000n,
  commitPrediction: 200_000n,
  revealPrediction: 260_000n
} as const;

export type GasLimitedWrite = keyof typeof WRITE_GAS_LIMITS;
