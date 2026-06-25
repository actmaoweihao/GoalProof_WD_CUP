# Security and Threat Model

## Safeguards

- Deadlines are enforced in Solidity; the frontend cannot bypass them.
- Predictions are committed once and cannot be edited.
- Result submission requires `ORACLE_ROLE` and is immutable.
- Reveals bind chain, contract, wallet, match, score, and salt through `abi.encode`.
- Duplicate commits, duplicate reveals, duplicate scoring, copied reveals, malformed scores, and canceled matches revert with custom errors.
- Pause controls cover commit, result, and reveal writes.
- The contract has no payable functions, external calls, token transfers, upgrade proxy, user enumeration, or on-chain sorting.

## Trust assumptions and limitations

- The oracle is trusted to report the correct real-world result.
- The default admin controls role grants and revocations.
- Block producers can vary timestamps slightly; exact boundary policy is documented and tested.
- Users must preserve their salts. Local storage is not safe against a compromised browser, device loss, or manual clearing.
- Event indexing starts from the configured deployment block and assumes the selected chain and address are correct.
- Team names are display metadata, not authenticated tournament identifiers.
- The project is a non-financial classroom MVP, not audited production software.

## Secret handling

No private key or salt belongs in `.env`, Git, analytics, or logs. The browser recovery record contains the prediction and salt, so users should treat exported JSON as private until reveal. Root/frontend environment variables contain only public RPC and deployment configuration.

## Manual review checklist

- [x] Role administration and deploy-time grants
- [x] Timestamp comparisons at −1, exact, and +1 boundaries
- [x] Commitment encoding types and order
- [x] Score range and integer conversions
- [x] Stable indexed events
- [x] Cancellation and result immutability
- [x] Reveal deadline and duplicate-score prevention
- [x] Privacy expectations of public getters
