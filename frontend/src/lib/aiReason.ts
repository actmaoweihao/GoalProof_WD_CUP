import { encodeAbiParameters, keccak256, type Address, type Hex } from "viem";

export type ReasonRiskLevel = "保守" | "均衡" | "激进";

export type ReasonAnalysis = {
  normalizedReason: string;
  tags: string[];
  riskLevel: ReasonRiskLevel;
  summary: string;
  signals: string[];
  cautions: string[];
  counterpoint: string;
  reviewFocus: string;
};

export type ReasonHashInput = {
  chainId: number;
  contractAddress: Address;
  userAddress: Address;
  matchId: bigint;
  reason: string;
};

const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: "进攻状态", keywords: ["进攻", "火力", "射门", "前锋", "进球", "状态"] },
  { tag: "防守质量", keywords: ["防守", "后防", "门将", "丢球", "零封"] },
  { tag: "伤病停赛", keywords: ["伤病", "受伤", "停赛", "缺阵", "轮休"] },
  { tag: "历史交锋", keywords: ["历史", "交锋", "往绩", "上次", "以往"] },
  { tag: "主客场因素", keywords: ["主场", "客场", "旅途", "天气", "草皮"] },
  { tag: "战术风格", keywords: ["控球", "反击", "高压", "阵型", "战术"] },
  { tag: "心理动量", keywords: ["士气", "压力", "信心", "心态", "复仇"] },
  { tag: "直觉判断", keywords: ["感觉", "直觉", "看好", "猜", "倾向"] }
];

export function normalizePredictionReason(reason: string) {
  return reason.trim().replace(/\s+/g, " ");
}

export function computePredictionReasonHash(input: ReasonHashInput): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "string" }
      ],
      [
        BigInt(input.chainId),
        input.contractAddress,
        input.userAddress,
        input.matchId,
        normalizePredictionReason(input.reason)
      ]
    )
  );
}

export function analyzePredictionReason(
  reason: string,
  predictedHomeScore?: number,
  predictedAwayScore?: number
): ReasonAnalysis {
  const normalizedReason = normalizePredictionReason(reason);
  const tags = TAG_RULES.filter(({ keywords }) =>
    keywords.some((keyword) => normalizedReason.includes(keyword))
  ).map(({ tag }) => tag);
  if (tags.length === 0 && normalizedReason) tags.push("主观判断");

  const scoreGap =
    predictedHomeScore === undefined || predictedAwayScore === undefined
      ? 0
      : Math.abs(predictedHomeScore - predictedAwayScore);
  const riskLevel: ReasonRiskLevel =
    scoreGap >= 3 || tags.includes("直觉判断")
      ? "激进"
      : tags.length >= 3 && scoreGap <= 1
        ? "保守"
        : "均衡";
  const signals = tags.slice(0, 3);
  const cautions = [
    riskLevel === "激进" ? "预测幅度或依据偏主观，赛后复盘要警惕过度自信。" : "",
    !tags.includes("防守质量") ? "理由里较少提到防守变量，可能低估失球风险。" : "",
    !tags.includes("伤病停赛") ? "未明确考虑伤病/停赛信息，真实比赛中这是高影响变量。" : ""
  ].filter(Boolean);
  const counterpoint = buildCounterpoint(tags, riskLevel);
  const reviewFocus = buildReviewFocus(tags);

  return {
    normalizedReason,
    tags,
    riskLevel,
    summary: normalizedReason
      ? `AI 将这段理由归纳为：${tags.slice(0, 4).join("、")}；整体属于${riskLevel}型判断。`
      : "写下预测理由后，AI 会把它整理成可复盘的判断标签。",
    signals,
    cautions,
    counterpoint,
    reviewFocus
  };
}

function buildCounterpoint(tags: string[], riskLevel: ReasonRiskLevel) {
  if (tags.includes("进攻状态") && !tags.includes("防守质量")) {
    return "反方质询：进攻优势不一定能转化为比分优势，如果对手低位防守或门将发挥出色，预测可能被压缩。";
  }
  if (tags.includes("伤病停赛")) {
    return "反方质询：伤病信息影响很大，但市场和球队战术通常会提前调整，不能只按缺阵名单线性推断结果。";
  }
  if (tags.includes("历史交锋")) {
    return "反方质询：历史交锋样本可能已经过期，阵容、教练和比赛阶段变化会削弱往绩参考价值。";
  }
  if (riskLevel === "激进") {
    return "反方质询：大比分或强倾向判断更容易受单个红牌、点球或早段进球影响，需要准备赛后反例解释。";
  }
  return "反方质询：这条理由较均衡，但仍需要说明哪个关键变量最可能推翻你的判断。";
}

function buildReviewFocus(tags: string[]) {
  if (tags.includes("进攻状态")) return "赛后重点复盘射门质量、转化率和关键机会数量。";
  if (tags.includes("防守质量")) return "赛后重点复盘失球来源、防线站位和门将表现。";
  if (tags.includes("伤病停赛")) return "赛后重点复盘替补球员和阵容调整是否改变了预期。";
  if (tags.includes("战术风格")) return "赛后重点复盘控球、反击和阵型变化是否符合赛前判断。";
  return "赛后重点复盘预测理由中最核心的一条依据是否真的发生。";
}

export function buildPostMatchReview({
  analysis,
  predictedHomeScore,
  predictedAwayScore,
  actualHomeScore,
  actualAwayScore
}: {
  analysis: ReasonAnalysis;
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
}) {
  const exact = predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore;
  const predictedOutcome = Math.sign(predictedHomeScore - predictedAwayScore);
  const actualOutcome = Math.sign(actualHomeScore - actualAwayScore);
  const outcomeMatched = predictedOutcome === actualOutcome;

  if (exact) {
    return `AI 复盘：比分完全命中。赛前理由中的「${analysis.signals[0] ?? "核心判断"}」与结果高度一致，但仍建议保留恢复文件作为赛前证据。`;
  }
  if (outcomeMatched) {
    return `AI 复盘：胜平负方向正确，但比分幅度有偏差。赛前理由抓住了方向，下一步可以重点复盘「${analysis.cautions[0] ?? "进球数区间"}」。`;
  }
  return `AI 复盘：结果方向未命中。这不代表理由无效，但说明「${analysis.signals[0] ?? "主要依据"}」可能被其他变量覆盖，适合赛后记录一次反例。`;
}
