import type { Address, Hex } from "viem";
import { configuredChainId, goalProofAddress } from "../config/deployment";
import type { MatchData, PredictionData } from "../lib/contract";
import { analyzePredictionReason, buildPostMatchReview } from "../lib/aiReason";
import { formatKickoff, shortAddress } from "../lib/format";
import { readSecret } from "../lib/saltStorage";

const ZERO_HASH = `0x${"0".repeat(64)}` as Hex;

export function ProofPassport({
  matchId,
  match,
  prediction,
  address
}: {
  matchId: bigint;
  match: MatchData;
  prediction: PredictionData;
  address?: Address;
}) {
  const secret = address ? readSecret(configuredChainId, goalProofAddress, address, matchId) : null;
  const reasonAnalysis = secret?.reason
    ? analyzePredictionReason(
        secret.reason,
        prediction.predictedHomeScore,
        prediction.predictedAwayScore
      )
    : null;
  const reasonHashMatches = Boolean(
    secret?.reasonHash &&
    prediction.reasonHash !== ZERO_HASH &&
    secret.reasonHash.toLowerCase() === prediction.reasonHash.toLowerCase()
  );
  const review =
    reasonAnalysis && match.resultSubmitted
      ? buildPostMatchReview({
          analysis: reasonAnalysis,
          predictedHomeScore: prediction.predictedHomeScore,
          predictedAwayScore: prediction.predictedAwayScore,
          actualHomeScore: match.actualHomeScore,
          actualAwayScore: match.actualAwayScore
        })
      : undefined;

  return (
    <section className="proof-passport" aria-label="Verified prediction proof passport">
      <div className="passport-stamp">VERIFIED</div>
      <div className="passport-head">
        <div>
          <div className="eyebrow">PROOF PASSPORT</div>
          <h2>可验证预测证明</h2>
          <p>这不是普通截图，而是一张由链上承诺、公开验证和 AI 复盘共同组成的声誉凭证。</p>
        </div>
        <div className="passport-score">
          <span>REPUTATION</span>
          <strong>+{prediction.pointsAwarded}</strong>
        </div>
      </div>
      <div className="passport-grid">
        <article>
          <span>预测者</span>
          <strong>{shortAddress(address)}</strong>
          <code>{address ?? "未连接"}</code>
        </article>
        <article>
          <span>比赛</span>
          <strong>
            {match.homeTeam} — {match.awayTeam}
          </strong>
          <code>Match #{matchId.toString()}</code>
        </article>
        <article>
          <span>预测 / 真实</span>
          <strong>
            {prediction.predictedHomeScore}:{prediction.predictedAwayScore} /{" "}
            {match.actualHomeScore}:{match.actualAwayScore}
          </strong>
          <code>{formatKickoff(prediction.committedAt)} committed</code>
        </article>
        <article>
          <span>证明状态</span>
          <strong>{reasonHashMatches ? "比分与理由均已验证" : "比分已验证"}</strong>
          <code>
            {prediction.reasonHash === ZERO_HASH ? "legacy commit" : "reasonHash present"}
          </code>
        </article>
      </div>
      <div className="passport-proof-lines">
        <div>
          <span>commitment</span>
          <code>{prediction.commitment}</code>
        </div>
        {prediction.reasonHash !== ZERO_HASH && (
          <div>
            <span>reasonHash</span>
            <code>{prediction.reasonHash}</code>
          </div>
        )}
      </div>
      {reasonAnalysis && (
        <div className="passport-ai">
          <span className="ai-badge">AI REVIEW</span>
          <p>{review}</p>
          <small>{reasonAnalysis.counterpoint}</small>
        </div>
      )}
    </section>
  );
}
