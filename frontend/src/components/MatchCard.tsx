import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useMatch } from "../hooks/useMatch";
import { formatCountdown, formatKickoff } from "../lib/format";
import { getMatchPhase, PHASE_LABELS } from "../lib/phases";

export function MatchCard({ matchId }: { matchId: bigint }) {
  const { address } = useAccount();
  const { match, prediction, isLoading } = useMatch(matchId, address);
  if (isLoading || !match) return <article className="match-card skeleton">正在读取链上比赛…</article>;
  const phase = getMatchPhase(match, undefined, prediction?.revealed);
  return (
    <article className="match-card">
      <div className="card-meta"><span>DEMO #{matchId.toString()}</span><span className={`phase phase-${phase.toLowerCase()}`}>{PHASE_LABELS[phase]}</span></div>
      <div className="fixture"><strong>{match.homeTeam}</strong><span>VS</span><strong>{match.awayTeam}</strong></div>
      <p>{formatKickoff(match.kickoffTime)} · {phase === "COMMIT_OPEN" ? `${formatCountdown(match.commitDeadline)} 后截止` : `${match.revealCount} 人已结算`}</p>
      <div className="card-flags">
        <span>{prediction?.commitment && prediction.commitment !== `0x${"0".repeat(64)}` ? "✓ 已承诺" : "○ 未承诺"}</span>
        <span>{match.resultSubmitted ? `赛果 ${match.actualHomeScore}–${match.actualAwayScore}` : "赛果待定"}</span>
        {prediction?.revealed && <span>+{prediction.pointsAwarded} 分</span>}
      </div>
      <Link className="text-link" to={`/matches/${matchId}`}>进入比赛 →</Link>
    </article>
  );
}
