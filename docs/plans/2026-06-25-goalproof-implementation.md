# GoalProof MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete, locally reproducible commit–reveal football prediction application from the supplied GoalProof specification.

**Architecture:** A Hardhat 3 Solidity project is the authoritative state layer and a Vite/React TypeScript app is the user interface. Browser-only secret storage preserves reveal material, while contract events provide the off-chain leaderboard and audit trail.

**Tech Stack:** Node.js 24, pnpm 9, Hardhat 3, Solidity 0.8.28, OpenZeppelin Contracts 5, ethers 6, React 19, Vite 8, wagmi 3, viem 2, Vitest.

---

### Task 1: Bootstrap the workspace

**Files:** Create root workspace/config files, `frontend/` scaffold, environment examples, and documentation skeletons.

1. Initialize Git and package metadata with pinned dependencies.
2. Add Hardhat, TypeScript, lint, formatting, and workspace configuration.
3. Add Vite/React entry files and scripts.
4. Install dependencies and verify an empty compile/build.

### Task 2: Implement and test the core contract

**Files:** Create `contracts/GoalProof.sol` and contract tests under `test/`.

1. Write failing tests for access control and match lifecycle.
2. Implement roles, fixture creation/read/cancel, events, errors, and pause controls.
3. Write failing tests for commitment, result, reveal, scoring, and boundaries.
4. Implement the commit–reveal state machine and counters.
5. Add the cross-layer commitment vector and full integration test.
6. Run compile and all contract tests until green.

### Task 3: Add deterministic deployment and demo automation

**Files:** Create `ignition/modules/GoalProof.ts`, `scripts/*.ts`, `shared/*.ts`, and deployment output handling.

1. Add an Ignition deployment module and role configuration.
2. Add ABI/deployment export.
3. Add repeatable fixture seed and complete multi-wallet demo flow.
4. Add gas collection and assert expected scores/results.

### Task 4: Build and test frontend domain modules

**Files:** Create `frontend/src/lib/*`, ABI/config modules, and unit tests.

1. Test and implement commitment hashing and random salt generation.
2. Test and implement scoped secret storage plus recovery import/export.
3. Test and implement match phases, formatting, errors, and leaderboard aggregation.
4. Verify TypeScript and Vitest.

### Task 5: Build the browser vertical slice

**Files:** Create React pages, components, hooks, styles, and router configuration.

1. Add wallet/network/deployment status and responsive navigation.
2. Add home, matches, and match-detail commit/reveal flows.
3. Add event-derived leaderboard and wallet profile.
4. Add role-gated admin/oracle/pause controls.
5. Add transaction lifecycle feedback and recovery-file UX.
6. Run lint, typecheck, unit tests, and production build.

### Task 6: Harden delivery and documentation

**Files:** Complete `README.md`, `DECISIONS.md`, `docs/*.md`, CI, and gas report.

1. Document architecture, threat model, tests, demo, setup, and limitations.
2. Generate gas evidence and test summary.
3. Run the full `pnpm check`, local CLI demo, and clean-secret scan.
4. Fix all failures and record any compatibility deviations.

