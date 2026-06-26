import { useReadContract } from "wagmi";
import { goalProofAbi } from "../abi";
import { FlowGuide } from "../components/FlowGuide";
import { MatchCard } from "../components/MatchCard";
import { goalProofAddress } from "../config/deployment";

export function MatchesPage() {
  const { data, isLoading, error } = useReadContract({
    address: goalProofAddress,
    abi: goalProofAbi,
    functionName: "matchCount"
  });
  const count = Number(data ?? 0);
  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <div className="eyebrow">DEMO FIXTURES</div>
          <h1>比赛与预测阶段</h1>
        </div>
        <p>所有状态均来自当前网络的 GoalProof 合约。</p>
      </div>
      <FlowGuide
        compact
        eyebrow="PLAYER FLOW"
        title="普通用户流程：选比赛 → Commit → 等赛果 → Reveal"
        steps={[
          {
            title: "连接钱包",
            description: "右上角连接 MetaMask，确认网络是 Hardhat Local。"
          },
          {
            title: "选择比赛",
            description: "点进仍可提交预测的比赛卡片。"
          },
          {
            title: "提交 Commit",
            description: "输入比分和理由，保存恢复文件。"
          },
          {
            title: "公开 Reveal",
            description: "赛果提交后回到详情页公开预测。"
          }
        ]}
      />
      {isLoading && <div className="empty-state">正在读取链上比赛…</div>}
      {error && (
        <div className="empty-state error-state">
          无法读取合约。请确认本地节点、网络和部署地址。
        </div>
      )}
      {!isLoading && !error && count === 0 && (
        <div className="empty-state">尚无比赛。请用管理员钱包在管理页创建演示比赛。</div>
      )}
      <div className="match-grid">
        {Array.from({ length: count }, (_, index) => (
          <MatchCard key={index + 1} matchId={BigInt(index + 1)} />
        ))}
      </div>
    </section>
  );
}
