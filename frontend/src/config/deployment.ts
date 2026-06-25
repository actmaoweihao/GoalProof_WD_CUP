import { getAddress, isAddress, zeroAddress, type Address } from "viem";

export const configuredChainId = Number(import.meta.env.VITE_CHAIN_ID || 31337);
export const configuredRpcUrl = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
const configuredAddress = import.meta.env.VITE_GOALPROOF_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const goalProofAddress: Address = isAddress(configuredAddress)
  ? getAddress(configuredAddress)
  : zeroAddress;
export const deploymentBlock = BigInt(import.meta.env.VITE_DEPLOYMENT_BLOCK || 0);
export const hasDeploymentAddress = goalProofAddress !== zeroAddress;
