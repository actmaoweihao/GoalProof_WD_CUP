# GoalProof Decision Log

## D-001 — No real-money staking

No ETH, tokens, odds, deposits, or prize pools are implemented. This preserves the commit–reveal learning objective without introducing financial or legal risk.

## D-002 — Authorized oracle for the MVP

An `ORACLE_ROLE` account submits final scores. Oracle centralization is visible in the UI and security notes; a decentralized sports oracle is future work.

## D-003 — Automatic scoring during reveal

A valid reveal verifies the commitment, stores the prediction, and awards points atomically. There is no separate claim transaction.

## D-004 — Event-derived leaderboard

The frontend aggregates `ScoreAwarded` and `PredictionRevealed` events. Solidity stores totals but never loops over or sorts users.

## D-005 — Scoped local salt storage plus recovery JSON

Secrets are keyed by chain, contract, wallet, and match. They are written before signature request and can be exported/imported, but are never sent on-chain or logged.

## D-006 — No upgradeable proxy

A direct deployment is easier to audit and demonstrate and has a smaller attack surface.

## D-007 — Badges remain a non-blocking extension

The optional ERC-1155 badge was not implemented. The complete core flow is stronger course evidence than an additional contract that could complicate settlement.

## D-008 — Vite 7 with Rollup WASM on this Windows environment

Vite 8's Rolldown native binding was blocked by local Application Control. Vite 7.3.5 and `@rollup/wasm-node` preserve the same React/Vite product architecture and produce a clean production build without requiring a native bundler binary.

## D-009 — Hardhat 3 native coverage and matcher APIs

Hardhat 3 provides `hardhat test --coverage`, so no Hardhat-2-only coverage plugin is installed. Successful-transaction tests wait for receipts instead of using the removed legacy `not.to.be.reverted` matcher.

## D-010 — Local-first, Sepolia-ready delivery

The local lifecycle, deterministic scripts, coverage, and frontend are complete. Sepolia configuration is included but no public deployment was attempted because no user RPC/key credentials were supplied.
