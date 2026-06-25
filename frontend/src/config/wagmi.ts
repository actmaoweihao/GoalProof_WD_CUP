import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia, type Chain } from "viem/chains";
import { configuredChainId, configuredRpcUrl } from "./deployment";

export const hardhatLocal: Chain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "Local Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [configuredRpcUrl] }
  },
  testnet: true
};

export const configuredChain = configuredChainId === sepolia.id ? sepolia : hardhatLocal;

export const wagmiConfig = createConfig({
  chains: [configuredChain],
  connectors: [injected()],
  transports: { [configuredChain.id]: http(configuredRpcUrl) }
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
