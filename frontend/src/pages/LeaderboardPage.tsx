import { Link } from "react-router-dom";
import { ActionHint } from "../components/ActionHint";
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
        {error && (
          <ActionHint
            tone="error"
            title="暂时无法读取事件"
            description="请确认本地链、合约地址和当前网络一致。排行榜依赖链上事件。"
            primary={{ label: "回比赛页", to: "/matches" }}
          />
        )}
        {!isLoading && !error && data.length === 0 && (
          <ActionHint
            title="还没有已公开的预测"
            description="排行榜只统计已经 Reveal 并结算的预测。先完成一次 Commit → Result → Reveal 流程。"
            primary={{ label: "去比赛页开始", to: "/matches" }}
            secondary={{ label: "演示者去管理页", to: "/admin" }}
          />
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
