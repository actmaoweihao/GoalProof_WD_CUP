# 3–5 Minute Demo Script

## Setup before recording

Run these in separate terminals:

```bash
pnpm node
pnpm deploy:localhost
pnpm seed:localhost
pnpm frontend:dev
```

Import Hardhat accounts into the demo wallet: account 0 is admin, account 1 is oracle, account 2 is Alice, and account 3 is Bob. These keys are printed by the local node and must never be used on a public network.

## Recording flow

1. **Problem (20s):** Explain that a public prediction leaks the answer while a centralized private record requires trust.
2. **Alice commit (40s):** Connect account 2, open Demo Match 1, predict 2–0, and submit. Show that the UI and transaction expose only `bytes32` commitment data. Export the recovery JSON.
3. **Bob commit (30s):** Connect account 3 and commit 3–1. Point out the different opaque hash.
4. **Advance time (10s):** Run `pnpm time:localhost` to advance the simulated chain by 400 seconds.
5. **Oracle (30s):** Connect account 1, open Management, submit result 2–0 for match 1. State the trusted-oracle limitation.
6. **Reveal (50s):** Return to Alice and Bob. Reveal Alice for 5 points and Bob for 3 points. The browser loads their private local records.
7. **Evidence (35s):** Open Leaderboard and Profile, then show `pnpm check`, coverage, and `docs/gas-report.json`.
8. **Close (15s):** Reiterate no wagering, central oracle limitation, and decentralized oracle/badges as future work.

## Screenshot/video checklist

- [ ] Home page proof orbit and three-step method
- [ ] Two different on-chain commitment hashes
- [ ] Oracle role diagnostics and result submission
- [ ] Exact-score 5-point reveal
- [ ] Outcome-only 3-point reveal
- [ ] Event-derived leaderboard
- [ ] 80 passing automated tests and coverage report
- [ ] Gas report
