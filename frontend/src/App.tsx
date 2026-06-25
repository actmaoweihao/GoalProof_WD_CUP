import { NavLink, Route, Routes } from "react-router-dom";
import { useAccount, useBytecode } from "wagmi";
import { WalletButton } from "./components/WalletButton";
import { goalProofAddress, hasDeploymentAddress } from "./config/deployment";
import { configuredChain } from "./config/wagmi";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { MatchDetailPage } from "./pages/MatchDetailPage";
import { MatchesPage } from "./pages/MatchesPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  const { chainId, isConnected } = useAccount();
  const bytecode = useBytecode({ address: goalProofAddress, query: { enabled: hasDeploymentAddress && chainId === configuredChain.id } });
  const wrongNetwork = isConnected && chainId !== configuredChain.id;
  const missingContract = bytecode.isFetched && (!bytecode.data || bytecode.data === "0x");
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/"><span className="brand-mark">G</span><span><strong>GoalProof</strong><small>预测有据</small></span></NavLink>
        <nav><NavLink to="/matches">比赛</NavLink><NavLink to="/leaderboard">排行榜</NavLink><NavLink to="/profile">我的记录</NavLink><NavLink to="/admin">管理</NavLink></nav>
        <div className="header-actions"><span className="network-pill">{configuredChain.name}</span><WalletButton /></div>
      </header>
      {(wrongNetwork || missingContract) && <div className="network-banner">{wrongNetwork ? `网络不匹配：请切换到 ${configuredChain.name}。` : "当前地址没有 GoalProof 合约代码。若本地节点刚重启，请重新部署并更新地址。"}</div>}
      <main className="content"><Routes><Route path="/" element={<HomePage />} /><Route path="/matches" element={<MatchesPage />} /><Route path="/matches/:matchId" element={<MatchDetailPage />} /><Route path="/leaderboard" element={<LeaderboardPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/profile/:address" element={<ProfilePage />} /><Route path="/admin" element={<AdminPage />} /></Routes></main>
      <footer><div className="brand"><span className="brand-mark">G</span><span><strong>GoalProof</strong><small>Commit · Reveal · Prove</small></span></div><p>课程演示项目 · 无投注、无资金池、无真实赛事声明</p><code>{goalProofAddress.slice(0, 10)}…{goalProofAddress.slice(-6)}</code></footer>
    </div>
  );
}
