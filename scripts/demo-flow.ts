import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import type { GoalProof } from "../types/ethers-contracts/GoalProof.js";

const { ethers, networkHelpers } = await network.create();
const [admin, oracle, alice, bob, charlie] = await ethers.getSigners();
const goalProof = (await ethers.deployContract("GoalProof", [admin.address])) as unknown as GoalProof;
await goalProof.waitForDeployment();
await (await goalProof.grantRole(keccak256(toUtf8Bytes("ORACLE_ROLE")), oracle.address)).wait();

const gas: Record<string, string> = {};
const now = await networkHelpers.time.latest();
const commitDeadline = now + 120;
const kickoffTime = now + 180;
const revealDeadline = now + 600;
const createReceipt = await (
  await goalProof.createMatch("BRA", "ARG", kickoffTime, commitDeadline, revealDeadline)
).wait();
gas.createMatch = createReceipt!.gasUsed.toString();

const players = [
  { signer: alice, home: 2, away: 0, salt: keccak256(toUtf8Bytes("goalproof-alice")) },
  { signer: bob, home: 3, away: 1, salt: keccak256(toUtf8Bytes("goalproof-bob")) },
  { signer: charlie, home: 1, away: 1, salt: keccak256(toUtf8Bytes("goalproof-charlie")) }
];

for (const [index, player] of players.entries()) {
  const commitment = await goalProof.computeCommitment(
    player.signer.address,
    1,
    player.home,
    player.away,
    player.salt
  );
  const receipt = await (
    await goalProof.connect(player.signer).commitPrediction(1, commitment)
  ).wait();
  if (index === 0) gas.commitPrediction = receipt!.gasUsed.toString();
  const stored = await goalProof.getPrediction(1, player.signer.address);
  assert.equal(stored.commitment, commitment);
  assert.equal(stored.predictedHomeScore, 0n, "committed score must remain hidden");
}

await networkHelpers.time.increaseTo(kickoffTime);
const resultReceipt = await (await goalProof.connect(oracle).submitResult(1, 2, 0)).wait();
gas.submitResult = resultReceipt!.gasUsed.toString();

for (const [index, player] of players.entries()) {
  const receipt = await (
    await goalProof
      .connect(player.signer)
      .revealPrediction(1, player.home, player.away, player.salt)
  ).wait();
  if (index === 0) gas.revealPrediction = receipt!.gasUsed.toString();
}

const totals = {
  Alice: Number(await goalProof.totalScores(alice.address)),
  Bob: Number(await goalProof.totalScores(bob.address)),
  Charlie: Number(await goalProof.totalScores(charlie.address))
};
assert.deepEqual(totals, { Alice: 5, Bob: 3, Charlie: 0 });
assert.equal((await goalProof.getMatch(1)).revealCount, 3n);

console.log("GoalProof deterministic demo completed successfully");
console.table(totals);
console.table(gas);
