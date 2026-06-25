const FRIENDLY_ERRORS: Record<string, string> = {
  CommitPeriodClosed: "预测提交截止时间已过。",
  PredictionAlreadyCommitted: "这个钱包已经为该比赛提交过预测。",
  CommitmentMismatch: "比分或恢复 salt 与原始承诺不匹配。",
  ResultNotSubmitted: "预言机尚未提交比赛结果。",
  RevealPeriodClosed: "公开预测的截止时间已过。",
  AccessControlUnauthorizedAccount: "当前钱包无权执行此操作。",
  UserRejectedRequestError: "你在钱包中取消了这笔交易。",
  EnforcedPause: "合约当前处于暂停状态。",
  MatchCanceledError: "这场比赛已被取消。",
  ScoreOutOfRange: "比分必须在 0 到 30 之间。",
  InvalidTimeConfiguration:
    "比赛时间配置无效：承诺截止必须晚于当前时间，开赛必须晚于承诺截止，公开截止必须晚于开赛。",
  "exceeds transaction gas cap":
    "钱包给出的 gas limit 超过本地链上限。请刷新页面后重试，前端已为交易设置合理 gas 上限。"
};

export function getErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  const known = Object.entries(FRIENDLY_ERRORS).find(([name]) => raw.includes(name));
  return known?.[1] ?? "交易未完成，请查看技术详情。";
}

export function getTechnicalError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
