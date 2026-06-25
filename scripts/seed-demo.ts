import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { network } from "hardhat";
import { id } from "ethers";
import { DEMO_MATCHES } from "../shared/demoMatches.js";
import type { GoalProof } from "../types/ethers-contracts/GoalProof.js";

const { ethers, networkHelpers } = await network.create();
const [admin, oracle] = await ethers.getSigners();
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
if (!(await goalProof.hasRole(id("ORACLE_ROLE"), oracle.address))) {
  await (await goalProof.grantRole(id("ORACLE_ROLE"), oracle.address)).wait();
}

const now = await networkHelpers.time.latest();
for (const [index, fixture] of DEMO_MATCHES.entries()) {
  const commitDeadline = now + 300 + index * 60;
  const kickoffTime = commitDeadline + 60;
  const revealDeadline = kickoffTime + 1_800;
  await (
    await goalProof.createMatch(
      fixture.homeTeam,
      fixture.awayTeam,
      kickoffTime,
      commitDeadline,
      revealDeadline
    )
  ).wait();
}

const deployment = {
  chainId: Number((await ethers.provider.getNetwork()).chainId),
  contractAddress,
  deploymentBlock: 0,
  deployer: admin.address,
  oracle: oracle.address,
  deployedAt: new Date().toISOString()
};
await mkdir(resolve("deployments"), { recursive: true });
await writeFile(resolve("deployments/localhost.json"), `${JSON.stringify(deployment, null, 2)}\n`);
console.log(`Seeded ${DEMO_MATCHES.length} demo fixtures at ${deployment.contractAddress}`);
console.log(JSON.stringify(deployment, null, 2));
