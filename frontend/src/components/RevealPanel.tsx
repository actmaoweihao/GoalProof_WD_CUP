import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Hex } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { goalProofAbi } from "../abi";
import { configuredChainId, goalProofAddress } from "../config/deployment";
import { isBytes32 } from "../lib/commitment";
import {
  exportSecret,
  importSecret,
  readSecret,
  type StoredPredictionSecret
} from "../lib/saltStorage";
import { TransactionStatus } from "./TransactionStatus";

export function RevealPanel({ matchId, onConfirmed }: { matchId: bigint; onConfirmed: () => void }) {
  const { address } = useAccount();
  const [secret, setSecret] = useState<StoredPredictionSecret | null>(() =>
    address ? readSecret(configuredChainId, goalProofAddress, address, matchId) : null
  );
  const [home, setHome] = useState(() => secret?.predictedHomeScore ?? 0);
  const [away, setAway] = useState(() => secret?.predictedAwayScore ?? 0);
  const [salt, setSalt] = useState(() => secret?.salt ?? "");
  const [localError, setLocalError] = useState<unknown>();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } });
  const confirmationNotified = useRef(false);

  useEffect(() => {
    if (receipt.isSuccess && !confirmationNotified.current) {
      confirmationNotified.current = true;
      onConfirmed();
    }
  }, [receipt.isSuccess, onConfirmed]);

  function downloadRecovery() {
    if (!secret) return;
    const url = URL.createObjectURL(new Blob([exportSecret(secret)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `goalproof-match-${matchId}-recovery.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function uploadRecovery(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !address) return;
    try {
      const imported = importSecret(await file.text(), {
        chainId: configuredChainId,
        contractAddress: goalProofAddress,
        walletAddress: address,
        matchId
      });
      setSecret(imported);
      setHome(imported.predictedHomeScore);
      setAway(imported.predictedAwayScore);
      setSalt(imported.salt);
      setLocalError(undefined);
    } catch (uploadError) {
      setLocalError(uploadError);
    }
  }

  async function reveal() {
    if (!isBytes32(salt)) return setLocalError(new Error("请输入 32 字节的 0x salt。"));
    try {
      setLocalError(undefined);
      await writeContractAsync({
        address: goalProofAddress,
        abi: goalProofAbi,
        functionName: "revealPrediction",
        args: [matchId, home, away, salt as Hex]
      });
    } catch (revealError) {
      setLocalError(revealError);
    }
  }

  return (
    <section className="action-panel reveal-panel">
      <div className="eyebrow">03 · REVEAL</div>
      <h2>公开并自动结算</h2>
      <p>{secret ? "已找到与当前钱包匹配的本地恢复记录。" : "未找到本地 salt，请导入恢复文件或手动填写。"}</p>
      <div className="score-inputs compact">
        <label><span>主队</span><input type="number" min="0" max="30" value={home} onChange={(event) => setHome(Number(event.target.value))} /></label><b>:</b>
        <label><span>客队</span><input type="number" min="0" max="30" value={away} onChange={(event) => setAway(Number(event.target.value))} /></label>
      </div>
      <label className="field"><span>恢复 salt</span><input className="mono-input" value={salt} onChange={(event) => setSalt(event.target.value)} placeholder="0x…64 hex characters" /></label>
      <div className="button-row">
        <button className="button button-secondary" onClick={downloadRecovery} disabled={!secret}>导出恢复文件</button>
        <label className="button button-secondary file-button">导入恢复文件<input type="file" accept="application/json" onChange={uploadRecovery} /></label>
      </div>
      <button className="button button-primary button-wide" disabled={isPending || receipt.isLoading} onClick={reveal}>验证承诺并公开</button>
      <TransactionStatus pending={isPending} hash={hash} confirming={receipt.isLoading} confirmed={receipt.isSuccess} error={localError || error || receipt.error} />
    </section>
  );
}
