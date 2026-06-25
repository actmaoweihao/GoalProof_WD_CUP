import { useQuery } from "@tanstack/react-query";
import { parseAbiItem, type Address } from "viem";
import { usePublicClient } from "wagmi";
import { deploymentBlock, goalProofAddress } from "../config/deployment";
import { aggregateLeaderboard } from "../lib/leaderboard";

const scoreEvent = parseAbiItem(
  "event ScoreAwarded(address indexed user, uint256 indexed matchId, uint8 points, uint256 newTotalScore)"
);
const revealEvent = parseAbiItem(
  "event PredictionRevealed(uint256 indexed matchId, address indexed user, uint8 predictedHomeScore, uint8 predictedAwayScore, uint8 pointsAwarded)"
);

export function useLeaderboard() {
  const client = usePublicClient();
  return useQuery({
    queryKey: ["leaderboard", client?.chain.id, goalProofAddress],
    enabled: Boolean(client),
    refetchInterval: 5_000,
    queryFn: async () => {
      if (!client) return [];
      const [scores, reveals] = await Promise.all([
        client.getLogs({
          address: goalProofAddress,
          event: scoreEvent,
          fromBlock: deploymentBlock
        }),
        client.getLogs({
          address: goalProofAddress,
          event: revealEvent,
          fromBlock: deploymentBlock
        })
      ]);
      return aggregateLeaderboard(
        scores.map((log) => ({
          user: log.args.user as Address,
          matchId: log.args.matchId!,
          points: Number(log.args.points),
          newTotalScore: log.args.newTotalScore!,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex
        })),
        reveals.map((log) => ({
          user: log.args.user as Address,
          matchId: log.args.matchId!,
          pointsAwarded: Number(log.args.pointsAwarded)
        }))
      );
    }
  });
}
