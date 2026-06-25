import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import type { GoalProof } from "../types/ethers-contracts/GoalProof.js";

export const connection = await network.create();
export const { ethers, networkHelpers } = connection;

export const MATCH_MANAGER_ROLE = keccak256(toUtf8Bytes("MATCH_MANAGER_ROLE"));
export const ORACLE_ROLE = keccak256(toUtf8Bytes("ORACLE_ROLE"));
export const PAUSER_ROLE = keccak256(toUtf8Bytes("PAUSER_ROLE"));
export const ZERO_HASH = `0x${"00".repeat(32)}`;

export async function deployFixture() {
  const [admin, oracle, alice, bob, charlie, outsider] = await ethers.getSigners();
  const goalProof = (await ethers.deployContract("GoalProof", [
    admin.address
  ])) as unknown as GoalProof;
  await goalProof.waitForDeployment();
  await goalProof.grantRole(ORACLE_ROLE, oracle.address);
  return { goalProof, admin, oracle, alice, bob, charlie, outsider };
}

export async function createMatch(goalProof: GoalProof) {
  const now = await networkHelpers.time.latest();
  const times = {
    commitDeadline: now + 100,
    kickoffTime: now + 200,
    revealDeadline: now + 500
  };
  await goalProof.createMatch(
    "BRA",
    "ARG",
    times.kickoffTime,
    times.commitDeadline,
    times.revealDeadline
  );
  return times;
}

export function fixedSalt(label: string) {
  return keccak256(toUtf8Bytes(label));
}
