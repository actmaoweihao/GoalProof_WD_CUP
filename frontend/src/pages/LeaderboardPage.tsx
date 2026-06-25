import { Link } from "react-router-dom";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { shortAddress } from "../lib/format";

export function LeaderboardPage() {
  const { data = [], isLoading, error } = useLeaderboard();
  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <div className="eyebrow">EVENT-DERIVED</div>
          <h1>声誉排行榜</h1>
        </div>
        <p>浏览器从 ScoreAwarded 事件重建；合约不做昂贵的链上排序。</p>
      </div>
      <div className="leaderboard-card">
        <div className="table-head">
          <span>排名 / 钱包</span>
          <span>已结算</span>
          <span>精准命中</span>
          <span>总分</span>
        </div>
        {isLoading && <div className="empty-row">正在索引链上事件…</div>}
        {error && <div className="empty-row">暂时无法读取事件。</div>}
        {!isLoading && !error && data.length === 0 && (
          <div className="empty-row">还没有已公开的预测。</div>
        )}
        {data.map((row) => (
          <Link
            className={`leader-row rank-${row.rank}`}
            key={row.address}
            to={`/profile/${row.address}`}
          >
            <span className="identity">
              <b>{row.rank.toString().padStart(2, "0")}</b>
              <i>{shortAddress(row.address)}</i>
            </span>
            <span>{row.scoredMatches}</span>
            <span>{row.exactScores}</span>
            <strong>{row.totalScore}</strong>
          </Link>
        ))}
      </div>
      <div className="method-note">
        <strong>同分规则</strong>
        <span>总分 → 精准命中数 → 首次得分区块 → 钱包地址字典序</span>
      </div>
    </section>
  );
}
