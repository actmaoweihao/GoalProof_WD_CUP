import { Link, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { CommitPanel } from "../components/CommitPanel";
import { ProofPassport } from "../components/ProofPassport";
import { RevealPanel } from "../components/RevealPanel";
import { useMatch } from "../hooks/useMatch";
import { formatKickoff, shortAddress } from "../lib/format";
import { getMatchPhase, PHASE_LABELS } from "../lib/phases";

export function MatchDetailPage() {
  const matchId = BigInt(useParams().matchId || "0");
  const { address } = useAccount();
  const { match, prediction, isLoading, error, refetch } = useMatch(matchId, address);
  if (isLoading) return <div className="empty-state">正在读取比赛和钱包状态…</div>;
  if (error || !match) return <div className="empty-state error-state">找不到这场链上比赛。</div>;
  const phase = getMatchPhase(match, undefined, prediction?.revealed);
  const hasCommitment = Boolean(
    prediction?.commitment && prediction.commitment !== `0x${"0".repeat(64)}`
  );
  const hasReasonHash = Boolean(
    prediction?.reasonHash && prediction.reasonHash !== `0x${"0".repeat(64)}`
  );
  return (
    <section className="page-section detail-page">
      <Link className="text-link" to="/matches">
        ← 返回比赛
      </Link>
      <div className="detail-hero">
        <div>
          <div className="eyebrow">DEMO FIXTURE #{matchId.toString()}</div>
          <div className="detail-fixture">
            <strong>{match.homeTeam}</strong>
            <span>—</span>
            <strong>{match.awayTeam}</strong>
          </div>
          <p>
            {formatKickoff(match.kickoffTime)} · 当前钱包 {shortAddress(address)}
          </p>
        </div>
        <div className={`phase phase-${phase.toLowerCase()}`}>{PHASE_LABELS[phase]}</div>
      </div>
      <div className="timeline">
        <div className="done">
          <i>1</i>
          <span>
            Commit
            <br />
            <small>{hasCommitment ? "已提交" : "等待"}</small>
          </span>
        </div>
        <hr />
        <div className={match.resultSubmitted ? "done" : ""}>
          <i>2</i>
          <span>
            Result
            <br />
            <small>
              {match.resultSubmitted
                ? `${match.actualHomeScore}–${match.actualAwayScore}`
                : "等待预言机"}
            </small>
          </span>
        </div>
        <hr />
        <div className={prediction?.revealed ? "done" : ""}>
          <i>3</i>
          <span>
            Reveal
            <br />
            <small>{prediction?.revealed ? `+${prediction.pointsAwarded} 分` : "待公开"}</small>
          </span>
        </div>
      </div>
      {!address && <div className="empty-state">连接钱包后即可提交或公开预测。</div>}
      {address && phase === "COMMIT_OPEN" && !hasCommitment && (
        <CommitPanel
          key={`${address}-${matchId}-commit`}
          matchId={matchId}
          onConfirmed={() => void refetch()}
        />
      )}
      {hasCommitment && !prediction?.revealed && (
        <section className="commitment-receipt">
          <div>
            <div className="eyebrow">ON-CHAIN COMMITMENT</div>
            <h2>预测已密封</h2>
            <p>
              链上只能看到下面的承诺哈希
              {hasReasonHash ? "和预测理由哈希" : ""}；比分仍保留在你的浏览器中。
            </p>
          </div>
          <div className="receipt-code-stack">
            <code>{prediction?.commitment}</code>
            {hasReasonHash && <code>{prediction?.reasonHash}</code>}
          </div>
        </section>
      )}
      {address && phase === "REVEAL_OPEN" && !prediction?.revealed && (
        <RevealPanel
          key={`${address}-${matchId}-reveal`}
          matchId={matchId}
          chainReasonHash={prediction?.reasonHash}
          actualHomeScore={match.resultSubmitted ? match.actualHomeScore : undefined}
          actualAwayScore={match.resultSubmitted ? match.actualAwayScore : undefined}
          onConfirmed={() => void refetch()}
        />
      )}
      {prediction?.revealed && (
        <>
          <div className="result-celebration">
            <span>SETTLED ON-CHAIN</span>
            <strong>+{prediction.pointsAwarded}</strong>
            <h2>
              {prediction.predictedHomeScore}–{prediction.predictedAwayScore} 已验证
            </h2>
            <p>这次预测已写入你的 GoalProof 声誉记录。</p>
          </div>
          <ProofPassport
            matchId={matchId}
            match={match}
            prediction={prediction}
            address={address}
          />
        </>
      )}
      {phase === "WAITING_FOR_KICKOFF" && (
        <div className="empty-state">承诺窗口已关闭，等待比赛开赛。</div>
      )}
      {phase === "WAITING_FOR_RESULT" && (
        <div className="empty-state">比赛已开赛，等待预言机提交最终比分。</div>
      )}
      {phase === "REVEAL_CLOSED" && !prediction?.revealed && (
        <div className="empty-state error-state">公开窗口已关闭，未公开的承诺不能得分。</div>
      )}
    </section>
  );
}
