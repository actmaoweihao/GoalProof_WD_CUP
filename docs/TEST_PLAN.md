# Test Plan

## Automated suites

The contract suite contains 62 Mocha tests across access control, match creation/cancellation, commitments, oracle results, scoring, reveals, pause behavior, a fixed cross-layer commitment vector, and a full Alice/Bob integration flow.

The frontend contains 18 Vitest tests for salt generation, commitment parity, scoped secret storage, import/export validation, lifecycle phases, readable error mapping, leaderboard aggregation/tie-breaking, and formatting.

Run all critical gates:

```bash
pnpm check
pnpm contracts:coverage
pnpm contracts:gas
```

Current contract coverage: 98.29% lines and 98.04% statements.

## Manual browser checks

- Connect a Hardhat wallet and verify network status.
- Open four seeded fixtures and confirm phase/countdown state.
- Commit, confirm only a hash appears on-chain, and preserve recovery JSON.
- Advance local time, submit the oracle result, and reveal.
- Verify exact/outcome/wrong points and event-derived leaderboard.
- Verify unauthorized wallets do not see enabled admin actions and contract calls still revert.
- Restart the local node and verify the missing-contract warning appears before redeployment.
- Check desktop and mobile layouts.
