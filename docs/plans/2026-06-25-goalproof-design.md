# GoalProof MVP Design

## Product boundary and chosen approach

GoalProof will be implemented as a pnpm monorepo with a Hardhat 3 Solidity project at the repository root and a Vite/React client in `frontend/`. The core deliverable is a real commit–reveal vertical slice: match creation, domain-separated commitments, oracle result submission, reveal-time settlement, event-derived rankings, deterministic demo automation, and a browser interface that performs the same transactions. No server or database is introduced. Solidity remains authoritative for permissions, time boundaries, results, and scores; the browser stores only the private recovery material needed to reveal. This keeps the blockchain argument academically clear: public commitments prove timing and integrity, while private salts preserve pre-result secrecy.

Three implementation approaches were considered. A Foundry contract project plus React would provide excellent Solidity tooling but split the TypeScript test and deployment story. A frontend simulation would be quick but would fail the central learning objective. The selected Hardhat 3 workspace uses one language for deployment, tests, scripts, and UI helpers while matching the supplied specification. Optional ERC-1155 badges and public-testnet deployment are explicitly non-blocking extensions; neither will be allowed to weaken the locally reproducible MVP.

## Components, data flow, and failure model

`GoalProof.sol` owns roles, fixtures, commitments, results, reveals, counters, and points. It makes no external calls, accepts no ETH, uses custom errors, and emits stable events used by the UI. Deployment exports the ABI and localhost metadata for the client. The client computes `keccak256(abi.encode(chainId, contract, user, matchId, scores, salt))`, persists its recovery record before requesting a wallet signature, submits only the hash, and later reconstructs the reveal transaction from local data or an imported recovery file. Leaderboard rows are aggregated from `ScoreAwarded` and `PredictionRevealed` logs with deterministic tie-breaking.

Failures are surfaced at three levels: Solidity rejects invalid state transitions, shared TypeScript helpers validate user-controlled inputs and recovery records, and UI transaction state distinguishes signature, broadcast, confirmation, and decoded contract errors. A missing contract deployment produces a dedicated network-state warning. Tests cover authorization, exact deadline boundaries, commitment parity, scoring, end-to-end settlement, salt persistence, phase derivation, error mapping, and leaderboard aggregation. CLI demo assertions and a gas snapshot provide presentation evidence beyond unit tests.

