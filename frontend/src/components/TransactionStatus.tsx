import type { Hex } from "viem";
import { getErrorMessage, getTechnicalError } from "../lib/errors";

export function TransactionStatus({
  pending,
  hash,
  confirming,
  confirmed,
  error
}: {
  pending?: boolean;
  hash?: Hex;
  confirming?: boolean;
  confirmed?: boolean;
  error?: unknown;
}) {
  if (!pending && !hash && !error) return null;
  return (
    <div className={`transaction-status ${error ? "is-error" : ""}`} aria-live="polite">
      <strong>
        {error
          ? "失败"
          : pending
            ? "等待钱包签名"
            : confirmed
              ? "已确认"
              : confirming
                ? "等待链上确认"
                : "已提交"}
      </strong>
      {hash && <code>{hash.slice(0, 14)}…{hash.slice(-8)}</code>}
      {Boolean(error) && (
        <>
          <span>{getErrorMessage(error)}</span>
          <details><summary>技术详情</summary><pre>{getTechnicalError(error)}</pre></details>
        </>
      )}
    </div>
  );
}
