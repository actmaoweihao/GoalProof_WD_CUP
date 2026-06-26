import { useParams } from "react-router-dom";
import { isAddress, type Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { goalProofAbi } from "../abi";
import { ActionHint } from "../components/ActionHint";
import { goalProofAddress } from "../config/deployment";
import { useProfileHistory } from "../hooks/useProfileHistory";
import { formatKickoff, shortAddress } from "../lib/format";

export function ProfilePage() {
  const { address: connectedAddress } = useAccount();
  const param = useParams().address;
  const address = (param && isAddress(param) ? param : connectedAddress) as Address | undefined;
  const stats = useReadContracts({
    contracts: address
      ? [
          {
            address: goalProofAddress,
            abi: goalProofAbi,
            functionName: "totalScores",
            args: [address]
          },
          {
            address: goalProofAddress,
            abi: goalProofAbi,
            functionName: "validRevealCounts",
            args: [address]
          },
          {
            address: goalProofAddress,
            abi: goalProofAbi,
            functionName: "exactScoreCounts",
            args: [address]
          }
        ]
      : [],
    query: { enabled: Boolean(address) }
  });
  const { data: history = [], isLoading } = useProfileHistory(address);
  if (!address) {
    return (
      <section className="page-section">
        <ActionHint
          title="还不知道要看哪个钱包"
          description="连接钱包后这里会显示你的预测声誉记录；也可以从排行榜点进别人的公开记录。"
          primary={{ label: "去比赛页开始预测", to: "/matches" }}
          secondary={{ label: "查看排行榜", to: "/leaderboard" }}
        />
      </section>
    );
  }
  const values = stats.data?.map((item) => Number(item.result ?? 0)) ?? [0, 0, 0];
  return (
    <section className="page-section">
      <div className="profile-head">
        <div className="avatar-mark">GP</div>
        <div>
          <div className="eyebrow">ON-CHAIN PROFILE</div>
          <h1>{shortAddress(address)}</h1>
          <code>{address}</code>
        </div>
      </div>
      <div className="stat-grid">
        <article>
          <span>总声誉分</span>
          <strong>{values[0]}</strong>
        </article>
        <article>
          <span>有效公开</span>
          <strong>{values[1]}</strong>
        </article>
        <article>
          <span>精准命中</span>
          <strong>{values[2]}</strong>
        </article>
      </div>
      <div className="section-heading">
        <div>
          <div className="eyebrow">PREDICTION HISTORY</div>
          <h2>承诺与公开记录</h2>
        </div>
      </div>
      <div className="history-list">
        {isLoading && <div className="empty-state">正在读取历史事件…</div>}
        {!isLoading && history.length === 0 && (
          <ActionHint
            title="这个钱包还没有提交预测"
            description="先去比赛页选择一场可 Commit 的比赛。Reveal 成功后，这里会出现可验证的历史记录。"
            primary={{ label: "去比赛页预测", to: "/matches" }}
          />
        )}
        {history.map((item) => (
          <article key={item.matchId.toString()}>
            <div>
              <span>比赛 #{item.matchId.toString()}</span>
              <strong>
                {item.reveal
                  ? `${Number(item.reveal.predictedHomeScore)}–${Number(item.reveal.predictedAwayScore)}`
                  : "密封中"}
              </strong>
            </div>
            <div>
              <span>{formatKickoff(item.committedAt)}</span>
              <code>{item.commitment.slice(0, 12)}…</code>
              {item.reasonHash && <code>AI {item.reasonHash.slice(0, 12)}…</code>}
            </div>
            <b>{item.reveal ? `+${Number(item.reveal.pointsAwarded)} 分` : "等待公开"}</b>
          </article>
        ))}
      </div>
      {address.toLowerCase() === connectedAddress?.toLowerCase() && (
        <div className="warning-box">
          <strong>恢复记录只在本机</strong>
          <span>链上历史能证明承诺存在，但无法替你恢复 salt。请为未公开预测保留恢复文件。</span>
        </div>
      )}
    </section>
  );
}
