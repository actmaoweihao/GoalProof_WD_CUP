import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { configuredChain } from "../config/wagmi";
import { shortAddress } from "../lib/format";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  if (!isConnected) {
    return (
      <button
        className="button button-primary"
        disabled={isPending || !connectors[0]}
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
      >
        {isPending ? "连接中…" : "连接钱包"}
      </button>
    );
  }
  if (chainId !== configuredChain.id) {
    return (
      <button className="button button-warning" onClick={() => switchChain({ chainId: configuredChain.id })}>
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
