import { useState } from "react";
import { keccak256, toBytes } from "viem";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { goalProofAbi } from "../abi";
import { goalProofAddress } from "../config/deployment";
import { TransactionStatus } from "../components/TransactionStatus";

const MANAGER = keccak256(toBytes("MATCH_MANAGER_ROLE"));
const ORACLE = keccak256(toBytes("ORACLE_ROLE"));
const PAUSER = keccak256(toBytes("PAUSER_ROLE"));
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString().slice(0, 16);

export function AdminPage() {
  const { address } = useAccount();
  const [homeTeam, setHomeTeam] = useState("BRA");
  const [awayTeam, setAwayTeam] = useState("ARG");
  const [commitAt, setCommitAt] = useState(inMinutes(5));
  const [kickoffAt, setKickoffAt] = useState(inMinutes(6));
  const [revealAt, setRevealAt] = useState(inMinutes(30));
  const [matchId, setMatchId] = useState(1);
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(0);
  const [localError, setLocalError] = useState<unknown>();
  const permissions = useReadContracts({
    contracts: address ? [MANAGER, ORACLE, PAUSER].map((role) => ({ address: goalProofAddress, abi: goalProofAbi, functionName: "hasRole", args: [role, address] })) : [],
    query: { enabled: Boolean(address) }
  });
  const paused = useReadContract({ address: goalProofAddress, abi: goalProofAbi, functionName: "paused" });
  const roles = permissions.data?.map((item) => Boolean(item.result)) ?? [false, false, false];
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } });

  async function write(functionName: string, args: readonly unknown[] = []) {
    try {
      setLocalError(undefined);
      await writeContractAsync({ address: goalProofAddress, abi: goalProofAbi, functionName, args });
    } catch (writeError) { setLocalError(writeError); }
  }
  return (
    <section className="page-section">
      <div className="page-title"><div><div className="eyebrow">ROLE-GATED OPERATIONS</div><h1>比赛控制台</h1></div><p>界面只隐藏无权操作；真正的权限边界始终在 Solidity。</p></div>
      {!address && <div className="empty-state">请连接管理员或预言机钱包。</div>}
      {address && <div className="role-strip"><span className={roles[0] ? "active" : ""}>比赛管理员 {roles[0] ? "✓" : "—"}</span><span className={roles[1] ? "active" : ""}>预言机 {roles[1] ? "✓" : "—"}</span><span className={roles[2] ? "active" : ""}>暂停员 {roles[2] ? "✓" : "—"}</span></div>}
      <div className="admin-grid">
        <section className="admin-card"><div className="eyebrow">CREATE MATCH</div><h2>创建演示比赛</h2><div className="form-grid"><label className="field"><span>主队</span><input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} /></label><label className="field"><span>客队</span><input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} /></label><label className="field"><span>承诺截止</span><input type="datetime-local" value={commitAt} onChange={(e) => setCommitAt(e.target.value)} /></label><label className="field"><span>开赛时间</span><input type="datetime-local" value={kickoffAt} onChange={(e) => setKickoffAt(e.target.value)} /></label><label className="field field-wide"><span>公开截止</span><input type="datetime-local" value={revealAt} onChange={(e) => setRevealAt(e.target.value)} /></label></div><button className="button button-primary button-wide" disabled={!roles[0] || isPending} onClick={() => write("createMatch", [homeTeam, awayTeam, BigInt(Math.floor(new Date(kickoffAt).getTime() / 1000)), BigInt(Math.floor(new Date(commitAt).getTime() / 1000)), BigInt(Math.floor(new Date(revealAt).getTime() / 1000))])}>创建比赛</button></section>
        <section className="admin-card"><div className="eyebrow">ORACLE RESULT</div><h2>提交最终赛果</h2><div className="form-grid"><label className="field field-wide"><span>比赛 ID</span><input type="number" min="1" value={matchId} onChange={(e) => setMatchId(Number(e.target.value))} /></label><label className="field"><span>主队比分</span><input type="number" min="0" max="30" value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} /></label><label className="field"><span>客队比分</span><input type="number" min="0" max="30" value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} /></label></div><button className="button button-primary button-wide" disabled={!roles[1] || isPending} onClick={() => write("submitResult", [BigInt(matchId), homeScore, awayScore])}>提交不可修改的赛果</button><button className="button button-ghost button-wide" disabled={!roles[0] || isPending} onClick={() => write("cancelMatch", [BigInt(matchId)])}>取消这场比赛</button></section>
      </div>
      {address && roles[2] && <section className="pause-bar"><div><strong>紧急暂停</strong><span>当前状态：{paused.data ? "已暂停" : "正常运行"}</span></div><button className="button button-warning" disabled={isPending} onClick={() => write(paused.data ? "unpause" : "pause")}>{paused.data ? "恢复合约" : "暂停写操作"}</button></section>}
      <TransactionStatus pending={isPending} hash={hash} confirming={receipt.isLoading} confirmed={receipt.isSuccess} error={localError || error || receipt.error} />
    </section>
  );
}
