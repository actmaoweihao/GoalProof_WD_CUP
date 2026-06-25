import { getAddress, type Address, type Hex } from "viem";
import { isBytes32 } from "./commitment";

export type StoredPredictionSecret = {
  version: 1;
  chainId: number;
  contractAddress: Address;
  matchId: string;
  walletAddress: Address;
  predictedHomeScore: number;
  predictedAwayScore: number;
  salt: Hex;
  commitment: Hex;
  reason?: string;
  reasonHash?: Hex;
  aiTags?: string[];
  aiSummary?: string;
  aiRiskLevel?: string;
  createdAt: string;
  transactionHash?: Hex;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function secretStorageKey(
  chainId: number,
  contractAddress: Address,
  walletAddress: Address,
  matchId: bigint | string
) {
  return `goalproof:${chainId}:${contractAddress.toLowerCase()}:${walletAddress.toLowerCase()}:${matchId}`;
}

export function validateSecret(value: unknown): StoredPredictionSecret {
  if (!value || typeof value !== "object") throw new Error("Recovery file is not an object.");
  const item = value as Partial<StoredPredictionSecret>;
  if (item.version !== 1) throw new Error("Unsupported recovery version.");
  if (!Number.isSafeInteger(item.chainId) || Number(item.chainId) <= 0) {
    throw new Error("Invalid chain ID.");
  }
  if (!item.contractAddress || !item.walletAddress) throw new Error("Missing wallet scope.");
  const contractAddress = getAddress(item.contractAddress);
  const walletAddress = getAddress(item.walletAddress);
  if (!item.matchId || !/^\d+$/.test(item.matchId)) throw new Error("Invalid match ID.");
  for (const score of [item.predictedHomeScore, item.predictedAwayScore]) {
    if (!Number.isInteger(score) || Number(score) < 0 || Number(score) > 30) {
      throw new Error("Prediction score must be between 0 and 30.");
    }
  }
  if (!item.salt || !isBytes32(item.salt)) throw new Error("Invalid 32-byte salt.");
  if (!item.commitment || !isBytes32(item.commitment)) throw new Error("Invalid commitment.");
  if (item.reasonHash && !isBytes32(item.reasonHash)) throw new Error("Invalid reason hash.");
  if (item.reason !== undefined && typeof item.reason !== "string") {
    throw new Error("Invalid prediction reason.");
  }
  if (item.aiTags !== undefined && !Array.isArray(item.aiTags)) {
    throw new Error("Invalid AI tags.");
  }
  if (!item.createdAt || Number.isNaN(Date.parse(item.createdAt))) {
    throw new Error("Invalid creation timestamp.");
  }
  if (item.transactionHash && !isBytes32(item.transactionHash)) {
    throw new Error("Invalid transaction hash.");
  }
  return {
    version: 1,
    chainId: Number(item.chainId),
    contractAddress,
    matchId: item.matchId,
    walletAddress,
    predictedHomeScore: Number(item.predictedHomeScore),
    predictedAwayScore: Number(item.predictedAwayScore),
    salt: item.salt,
    commitment: item.commitment,
    reason: item.reason,
    reasonHash: item.reasonHash,
    aiTags: item.aiTags?.map(String),
    aiSummary: item.aiSummary ? String(item.aiSummary) : undefined,
    aiRiskLevel: item.aiRiskLevel ? String(item.aiRiskLevel) : undefined,
    createdAt: item.createdAt,
    transactionHash: item.transactionHash
  };
}

export function saveSecret(secret: StoredPredictionSecret, storage: StorageLike = localStorage) {
  const validated = validateSecret(secret);
  storage.setItem(
    secretStorageKey(
      validated.chainId,
      validated.contractAddress,
      validated.walletAddress,
      validated.matchId
    ),
    JSON.stringify(validated)
  );
  return validated;
}

export function readSecret(
  chainId: number,
  contractAddress: Address,
  walletAddress: Address,
  matchId: bigint | string,
  storage: StorageLike = localStorage
) {
  const raw = storage.getItem(secretStorageKey(chainId, contractAddress, walletAddress, matchId));
  return raw ? validateSecret(JSON.parse(raw)) : null;
}

export function deleteSecret(
  chainId: number,
  contractAddress: Address,
  walletAddress: Address,
  matchId: bigint | string,
  storage: StorageLike = localStorage
) {
  storage.removeItem(secretStorageKey(chainId, contractAddress, walletAddress, matchId));
}

export function exportSecret(secret: StoredPredictionSecret) {
  return JSON.stringify(validateSecret(secret), null, 2);
}

export function importSecret(
  json: string,
  expected: {
    chainId: number;
    contractAddress: Address;
    walletAddress: Address;
    matchId: bigint | string;
  },
  storage: StorageLike = localStorage
) {
  const secret = validateSecret(JSON.parse(json));
  if (
    secret.chainId !== expected.chainId ||
    secret.contractAddress.toLowerCase() !== expected.contractAddress.toLowerCase() ||
    secret.walletAddress.toLowerCase() !== expected.walletAddress.toLowerCase() ||
    secret.matchId !== expected.matchId.toString()
  ) {
    throw new Error("Recovery data belongs to a different wallet, network, contract, or match.");
  }
  return saveSecret(secret, storage);
}
