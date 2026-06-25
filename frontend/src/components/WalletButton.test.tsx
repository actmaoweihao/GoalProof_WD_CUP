import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WalletButton } from "./WalletButton";

const connectAsync = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, chainId: undefined, isConnected: false }),
  useConnect: () => ({
    connectors: [{ id: "injected" }],
    connectAsync,
    isPending: false
  }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
  useSwitchChain: () => ({ switchChain: vi.fn() })
}));

vi.mock("../config/wagmi", () => ({
  configuredChain: { id: 31337, name: "Hardhat Local" }
}));

describe("WalletButton", () => {
  it("shows a helpful message when no browser wallet is injected", () => {
    Object.defineProperty(window, "ethereum", { configurable: true, value: undefined });

    render(<WalletButton />);
    fireEvent.click(screen.getByRole("button", { name: "连接钱包" }));

    expect(screen.getByText(/没有检测到钱包插件/)).toBeInTheDocument();
    expect(connectAsync).not.toHaveBeenCalled();
  });
});
