import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { goalProofAbi } from "../abi";
import { configuredChainId, goalProofAddress } from "../config/deployment";
import {
  analyzePredictionReason,
  computePredictionReasonHash,
  normalizePredictionReason
} from "../lib/aiReason";
import { computePredictionCommitment, generateSalt } from "../lib/commitment";
import { WRITE_GAS_LIMITS } from "../lib/gas";
import { saveSecret, type StoredPredictionSecret } from "../lib/saltStorage";
import { TransactionStatus } from "./TransactionStatus";

export function CommitPanel({
  matchId,
  onConfirmed
}: {
  matchId: bigint;
  onConfirmed: () => void;
}) {
  const { address } = useAccount();
  const [home, setHome] = useState(2);
  const [away, setAway] = useState(0);
  const [reason, setReason] = useState("巴西进攻状态更好，阿根廷后防存在伤病风险。");
  const [localError, setLocalError] = useState<unknown>();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } });
  const confirmationNotified = useRef(false);
  const analysis = useMemo(() => analyzePredictionReason(reason, home, away), [away, home, reason]);

  useEffect(() => {
    if (receipt.isSuccess && !confirmationNotified.current) {
      confirmationNotified.current = true;
      onConfirmed();
    }
  }, [receipt.isSuccess, onConfirmed]);

  async function submit() {
    if (!address) return setLocalError(new Error("请先连接钱包。"));
    if (![home, away].every((score) => Number.isInteger(score) && score >= 0 && score <= 30)) {
      return setLocalError(new Error("比分必须是 0 到 30 的整数。"));
    }
    const normalizedReason = normalizePredictionReason(reason);
    if (normalizedReason.length < 8) {
      return setLocalError(new Error("请写下至少 8 个字的预测理由，用于生成赛前理由证明。"));
    }
    setLocalError(undefined);
    const salt = generateSalt();
    const commitment = computePredictionCommitment({
      chainId: configuredChainId,
      contractAddress: goalProofAddress,
      userAddress: address,
      matchId,
      predictedHomeScore: home,
      predictedAwayScore: away,
      salt
    });
    const reasonHash = computePredictionReasonHash({
      chainId: configuredChainId,
      contractAddress: goalProofAddress,
      userAddress: address,
      matchId,
      reason: normalizedReason
    });
    const secret: StoredPredictionSecret = {
      version: 1,
      chainId: configuredChainId,
      contractAddress: goalProofAddress,
      walletAddress: address,
      matchId: matchId.toString(),
      predictedHomeScore: home,
      predictedAwayScore: away,
      salt,
      commitment,
      reason: normalizedReason,
      reasonHash,
      aiTags: analysis.tags,
      aiSummary: analysis.summary,
      aiRiskLevel: analysis.riskLevel,
      createdAt: new Date().toISOString()
    };
    saveSecret(secret);
    try {
      const transactionHash = await writeContractAsync({
        address: goalProofAddress,
        abi: goalProofAbi,
        functionName: "commitPredictionWithReason",
        args: [matchId, commitment, reasonHash],
        gas: WRITE_GAS_LIMITS.commitPredictionWithReason
      });
      saveSecret({ ...secret, transactionHash });
    } catch (submitError) {
      setLocalError(submitError);
    }
  }

  return (
    <section className="action-panel">
      <div className="eyebrow">01 · COMMIT</div>
      <h2>密封你的比分预测</h2>
      <p>浏览器先保存随机 salt，链上交易只包含不可逆的 32 字节哈希。</p>
      <div className="score-inputs">
        <label>
          <span>主队</span>
          <input
            type="number"
            min="0"
            max="30"
            value={home}
            onChange={(event) => setHome(Number(event.target.value))}
          />
        </label>
        <b>:</b>
        <label>
          <span>客队</span>
          <input
            type="number"
            min="0"
            max="30"
            value={away}
            onChange={(event) => setAway(Number(event.target.value))}
          />
        </label>
      </div>
      <label className="field reason-field">
        <span>预测理由</span>
        <textarea
          value={reason}
          maxLength={600}
          onChange={(event) => setReason(event.target.value)}
          placeholder="例如：巴西进攻状态更好，阿根廷后防存在伤病风险。"
        />
      </label>
      <div className="ai-reason-card">
        <div>
          <span className="ai-badge">LOCAL AI</span>
          <strong>赛前理由分析</strong>
        </div>
        <p>{analysis.summary}</p>
        <div className="tag-row">
          {analysis.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          <span>风险：{analysis.riskLevel}</span>
        </div>
        {analysis.cautions.length > 0 && <small>{analysis.cautions[0]}</small>}
      </div>
      <div className="warning-box">
        <strong>保管提醒</strong>
        <span>
          清空浏览器数据会丢失 salt 和预测理由，届时无法公开和证明赛前判断。提交后请导出恢复文件。
        </span>
      </div>
      <button
        className="button button-primary button-wide"
        disabled={isPending || receipt.isLoading}
        onClick={submit}
      >
        生成承诺并提交
      </button>
      <TransactionStatus
        pending={isPending}
        hash={hash}
        confirming={receipt.isLoading}
        confirmed={receipt.isSuccess}
        error={localError || error || receipt.error}
      />
    </section>
  );
}
