import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteSecret,
  exportSecret,
  importSecret,
  readSecret,
  saveSecret,
  secretStorageKey,
  type StoredPredictionSecret
} from "./saltStorage";

const secret: StoredPredictionSecret = {
  version: 1,
  chainId: 31337,
  contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  matchId: "1",
  walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  predictedHomeScore: 2,
  predictedAwayScore: 0,
  salt: `0x${"11".repeat(32)}`,
  commitment: `0x${"22".repeat(32)}`,
  createdAt: "2026-06-25T00:00:00.000Z"
};

describe("salt storage", () => {
  beforeEach(() => localStorage.clear());

  it("creates a wallet/chain/contract/match-scoped key", () => {
    expect(secretStorageKey(31337, secret.contractAddress, secret.walletAddress, 1n)).toBe(
      "goalproof:31337:0x5fbdb2315678afecb367f032d93f642f64180aa3:0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc:1"
    );
  });

  it("saves and reads a validated secret", () => {
    saveSecret(secret);
    expect(readSecret(31337, secret.contractAddress, secret.walletAddress, 1n)).toMatchObject({
      predictedHomeScore: 2,
      salt: secret.salt
    });
  });

  it("deletes a secret", () => {
    saveSecret(secret);
    deleteSecret(31337, secret.contractAddress, secret.walletAddress, 1n);
    expect(readSecret(31337, secret.contractAddress, secret.walletAddress, 1n)).toBeNull();
  });

  it("exports and imports recovery JSON", () => {
    const json = exportSecret(secret);
    const imported = importSecret(json, {
      chainId: 31337,
      contractAddress: secret.contractAddress,
      walletAddress: secret.walletAddress,
      matchId: 1n
    });
    expect(imported.commitment).toBe(secret.commitment);
  });

  it("rejects recovery JSON for another wallet scope", () => {
    expect(() =>
      importSecret(exportSecret(secret), {
        chainId: 1,
        contractAddress: secret.contractAddress,
        walletAddress: secret.walletAddress,
        matchId: 1n
      })
    ).toThrow(/different wallet, network, contract, or match/);
  });

  it("rejects malformed recovery data", () => {
    expect(() => importSecret("{}", {
      chainId: 31337,
      contractAddress: secret.contractAddress,
      walletAddress: secret.walletAddress,
      matchId: 1n
    })).toThrow(/version/);
  });
});
