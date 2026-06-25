import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { network } from "hardhat";
import { id, isAddress, parseEther } from "ethers";
import type { GoalProof } from "../types/ethers-contracts/GoalProof.js";

const target = process.env.TARGET_ADDRESS;
if (!target || !isAddress(target)) {
  throw new Error(
    "Usage: TARGET_ADDRESS=0x... hardhat run scripts/grant-local-operator.ts --network localhost"
  );
}

const { ethers } = await network.create();
const [admin] = await ethers.getSigners();
const addresses = JSON.parse(
  await readFile(resolve("ignition/deployments/chain-31337/deployed_addresses.json"), "utf8")
) as Record<string, string>;
const contractAddress = addresses["GoalProofModule#GoalProof"];
if (!contractAddress)
  throw new Error("GoalProof Ignition deployment not found. Run deploy:localhost first.");

const goalProof = (await ethers.getContractAt(
  "GoalProof",
  contractAddress
)) as unknown as GoalProof;
const roleNames = ["MATCH_MANAGER_ROLE", "ORACLE_ROLE", "PAUSER_ROLE"] as const;

for (const roleName of roleNames) {
  const role = id(roleName);
  if (await goalProof.hasRole(role, target)) {
    console.log(`${roleName}: already granted`);
    continue;
  }
  await (await goalProof.grantRole(role, target)).wait();
  console.log(`${roleName}: granted`);
}

const beforeBalance = await ethers.provider.getBalance(target);
const fundingAmount = parseEther("10");
if (beforeBalance < parseEther("1")) {
  await (await admin.sendTransaction({ to: target, value: fundingAmount })).wait();
  console.log(`Funded ${target} with 10 local ETH`);
} else {
  console.log(`Funding skipped; current balance is ${ethers.formatEther(beforeBalance)} local ETH`);
}

const afterBalance = await ethers.provider.getBalance(target);
console.log(
  JSON.stringify(
    {
      contractAddress,
      operator: target,
      balanceEth: ethers.formatEther(afterBalance),
      roles: Object.fromEntries(
        await Promise.all(
          roleNames.map(async (roleName) => [
            roleName,
            await goalProof.hasRole(id(roleName), target)
          ])
        )
      )
    },
    null,
    2
  )
);
