import { useReadContract } from "wagmi";
import type { Address } from "viem";
import { goalProofAbi } from "../abi";
import { goalProofAddress } from "../config/deployment";
import { normalizeMatch, normalizePrediction } from "../lib/contract";

export function useMatch(matchId: bigint, user?: Address) {
  const matchQuery = useReadContract({
    address: goalProofAddress,
    abi: goalProofAbi,
    functionName: "getMatch",
    args: [matchId],
    query: { enabled: matchId > 0n }
  });
  const predictionQuery = useReadContract({
    address: goalProofAddress,
    abi: goalProofAbi,
    functionName: "getPrediction",
    args: [matchId, user],
    query: { enabled: Boolean(user) && matchId > 0n }
  });
  return {
    match: normalizeMatch(matchQuery.data),
    prediction: normalizePrediction(predictionQuery.data),
    isLoading: matchQuery.isLoading || predictionQuery.isLoading,
    error: matchQuery.error || predictionQuery.error,
    refetch: async () => Promise.all([matchQuery.refetch(), predictionQuery.refetch()])
  };
}
