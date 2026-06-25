export type MatchPhase =
  | "CANCELED"
  | "COMMIT_OPEN"
  | "WAITING_FOR_KICKOFF"
  | "WAITING_FOR_RESULT"
  | "REVEAL_OPEN"
  | "REVEAL_CLOSED"
  | "COMPLETED";

export type MatchTimingState = {
  canceled: boolean;
  resultSubmitted: boolean;
  commitDeadline: bigint;
  kickoffTime: bigint;
  revealDeadline: bigint;
};

export function getMatchPhase(
  match: MatchTimingState,
  nowSeconds = BigInt(Math.floor(Date.now() / 1000)),
  userRevealed = false
): MatchPhase {
  if (match.canceled) return "CANCELED";
  if (match.resultSubmitted && userRevealed) return "COMPLETED";
  if (nowSeconds < match.commitDeadline) return "COMMIT_OPEN";
  if (nowSeconds < match.kickoffTime) return "WAITING_FOR_KICKOFF";
  if (!match.resultSubmitted) return nowSeconds > match.revealDeadline ? "REVEAL_CLOSED" : "WAITING_FOR_RESULT";
  if (nowSeconds <= match.revealDeadline) return "REVEAL_OPEN";
  return "REVEAL_CLOSED";
}

export const PHASE_LABELS: Record<MatchPhase, string> = {
  CANCELED: "已取消",
  COMMIT_OPEN: "提交预测",
  WAITING_FOR_KICKOFF: "等待开赛",
  WAITING_FOR_RESULT: "等待赛果",
  REVEAL_OPEN: "公开预测",
  REVEAL_CLOSED: "公开已截止",
  COMPLETED: "已结算"
};
