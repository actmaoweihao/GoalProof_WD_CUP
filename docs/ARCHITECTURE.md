# Architecture

GoalProof is a backend-free pnpm workspace. The smart contract is the authoritative state machine; the React application reads it over JSON-RPC and asks an injected wallet to sign writes.

```mermaid
flowchart LR
  U[User wallet] -->|signs transactions| C[GoalProof.sol]
  A[Admin wallet] -->|fixtures and pause| C
  O[Oracle wallet] -->|final result| C
  F[React + wagmi] -->|reads state and logs| C
  F -->|private score and salt| L[(Browser localStorage)]
  C -->|ScoreAwarded events| B[Off-chain leaderboard]
```

## Contract boundary

`GoalProof.sol` controls match validity, role authorization, time boundaries, commitment uniqueness, result immutability, reveal verification, points, counters, cancellation, and pause state. It accepts no ETH, makes no external calls, and contains no unbounded user loops.

## Commitment data flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as GoalProof
    participant O as Oracle
    U->>F: Enter score prediction
    F->>F: Generate salt and commitment
    F->>F: Save scoped recovery record
    F->>C: commitPrediction(matchId, commitment)
    O->>C: submitResult(matchId, actualScore)
    U->>F: Reveal prediction
    F->>C: revealPrediction(score, salt)
    C->>C: Verify, score, and store
    C-->>F: ScoreAwarded event
```

The commitment uses `keccak256(abi.encode(chainId, contract, user, matchId, homeScore, awayScore, salt))`. Chain, contract, and wallet domain separation prevents copying or reusing a commitment elsewhere.

## Frontend modules

- `lib/commitment.ts`: canonical viem encoding and cryptographic salt generation.
- `lib/saltStorage.ts`: validation, scoped storage, recovery export/import.
- `lib/phases.ts`: deterministic UI state from chain timestamps.
- `hooks/useLeaderboard.ts`: event query and deterministic ranking.
- pages: home, fixtures, prediction detail, leaderboard, profile, and role-gated operations.
