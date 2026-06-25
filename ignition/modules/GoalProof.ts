import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { id } from "ethers";

export default buildModule("GoalProofModule", (m) => {
  const admin = m.getAccount(0);
  const oracle = m.getAccount(1);
  const goalProof = m.contract("GoalProof", [admin]);
  m.call(goalProof, "grantRole", [id("ORACLE_ROLE"), oracle], { id: "GrantOracleRole" });
  return { goalProof };
});
