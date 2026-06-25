import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import type { GoalProof } from "../types/ethers-contracts/GoalProof.js";

const { ethers, networkHelpers } = await network.create();
const [admin, oracle, alice] = await ethers.getSigners();
const goalProof = (await ethers.deployContract("GoalProof", [admin.address])) as unknown as GoalProof;
await goalProof.waitForDeployment();
await (await goalProof.grantRole(keccak256(toUtf8Bytes("ORACLE_ROLE")), oracle.address)).wait();

const now = await networkHelpers.time.latest();
const commitDeadline = now + 60;
const kickoffTime = now + 120;
const revealDeadline = now + 300;
const create = await (
  await goalProof.createMatch("BRA", "ARG", kickoffTime, commitDeadline, revealDeadline)
).wait();
const salt = keccak256(toUtf8Bytes("gas-snapshot"));
const commitment = await goalProof.computeCommitment(alice.address, 1, 2, 0, salt);
const commit = await (await goalProof.connect(alice).commitPrediction(1, commitment)).wait();
await networkHelpers.time.increaseTo(kickoffTime);
const result = await (await goalProof.connect(oracle).submitResult(1, 2, 0)).wait();
const reveal = await (await goalProof.connect(alice).revealPrediction(1, 2, 0, salt)).wait();

const report = {
  environment: "Hardhat local simulated network",
  compiler: "solc 0.8.28, optimizer 200 runs, Cancun EVM",
  generatedAt: new Date().toISOString(),
  qualification: "Classroom measurements only; not production cost estimates.",
  functions: {
    createMatch: create!.gasUsed.toString(),
    commitPrediction: commit!.gasUsed.toString(),
    submitResult: result!.gasUsed.toString(),
    revealPrediction: reveal!.gasUsed.toString()
  }
};
await mkdir(resolve("docs"), { recursive: true });
await writeFile(resolve("docs/gas-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.table(report.functions);
