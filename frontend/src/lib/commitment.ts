import { encodeAbiParameters, keccak256, type Address, type Hex } from "viem";

export type CommitmentInput = {
  chainId: number;
  contractAddress: Address;
  userAddress: Address;
  matchId: bigint;
  predictedHomeScore: number;
  predictedAwayScore: number;
  salt: Hex;
};

export function computePredictionCommitment(input: CommitmentInput): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "uint8" },
        { type: "bytes32" }
      ],
      [
        BigInt(input.chainId),
        input.contractAddress,
        input.userAddress,
        input.matchId,
        input.predictedHomeScore,
        input.predictedAwayScore,
        input.salt
      ]
    )
  );
}

export function generateSalt(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function isBytes32(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}
