import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { configuredChain } from "../config/wagmi";
import { shortAddress } from "../lib/format";

function getInjectedProvider() {
  return typeof window === "undefined"
    ? undefined
    : (window as Window & { ethereum?: unknown }).ethereum;
}

function walletErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (/user rejected|rejected request|request rejected|denied/i.test(error.message)) {
      return "钱包已取消连接请求。";
    }
    if (/provider.*not found|no provider|ethereum provider/i.test(error.message)) {
      return "当前 Chrome 没有检测到钱包插件，请安装或启用 MetaMask / Rabby 后刷新。";
    }
    return error.message;
  }
  return "钱包连接失败，请确认插件已解锁并允许当前网站连接。";
}

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const hasInjectedProvider = Boolean(getInjectedProvider());
  const injectedConnector = useMemo(
    () => connectors.find((connector) => connector.id === "injected") ?? connectors[0],
    [connectors]
  );

  if (!isConnected) {
    return (
      <div className="wallet-action">
        <button
          className="button button-primary"
          disabled={isPending || !injectedConnector}
          onClick={async () => {
            setConnectionError(null);
            if (!hasInjectedProvider) {
              setConnectionError(
                "当前 Chrome 没有检测到钱包插件，请安装或启用 MetaMask / Rabby 后刷新。"
              );
              return;
            }
            if (!injectedConnector) {
              setConnectionError("没有可用的钱包连接器，请刷新页面后重试。");
              return;
            }
            try {
              await connectAsync({ connector: injectedConnector });
            } catch (error) {
              setConnectionError(walletErrorMessage(error));
            }
          }}
        >
          {isPending ? "连接中…" : "连接钱包"}
        </button>
        {connectionError && <span className="wallet-error">{connectionError}</span>}
      </div>
    );
  }
  if (chainId !== configuredChain.id) {
    return (
      <button
        className="button button-warning"
        onClick={() => switchChain({ chainId: configuredChain.id })}
      >
        切换到 {configuredChain.name}
      </button>
    );
  }
  return (
    <button className="wallet-chip" onClick={() => disconnect()} title="点击断开钱包">
      <span className="status-dot" /> {shortAddress(address)}
    </button>
  );
}
