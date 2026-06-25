import { useQuery } from "@tanstack/react-query";
import { parseAbiItem, type Address } from "viem";
import { usePublicClient } from "wagmi";
import { deploymentBlock, goalProofAddress } from "../config/deployment";

const committedEvent = parseAbiItem(
  "event PredictionCommitted(uint256 indexed matchId, address indexed user, bytes32 commitment, uint64 committedAt)"
);
const revealedEvent = parseAbiItem(
  "event PredictionRevealed(uint256 indexed matchId, address indexed user, uint8 predictedHomeScore, uint8 predictedAwayScore, uint8 pointsAwarded)"
);

export function useProfileHistory(user?: Address) {
  const client = usePublicClient();
  return useQuery({
    queryKey: ["profile-history", user, client?.chain.id],
    enabled: Boolean(client && user),
    refetchInterval: 5_000,
    queryFn: async () => {
      if (!client || !user) return [];
      const [commits, reveals] = await Promise.all([
        client.getLogs({
          address: goalProofAddress,
          event: committedEvent,
          args: { user },
          fromBlock: deploymentBlock
        }),
        client.getLogs({
          address: goalProofAddress,
          event: revealedEvent,
          args: { user },
          fromBlock: deploymentBlock
        })
      ]);
      const revealsByMatch = new Map(
        reveals.map((log) => [log.args.matchId!.toString(), log.args])
      );
      return commits
        .map((log) => ({
          matchId: log.args.matchId!,
          commitment: log.args.commitment!,
          committedAt: log.args.committedAt!,
          reveal: revealsByMatch.get(log.args.matchId!.toString())
        }))
        .reverse();
    }
  });
}
