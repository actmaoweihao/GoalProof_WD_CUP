import { expect } from "chai";
import { AbiCoder, keccak256 } from "ethers";
import { deployFixture, networkHelpers } from "./helpers.js";

describe("GoalProof commitment vector", function () {
  it("matches canonical ABI encoding across Solidity and TypeScript", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    const salt = `0x${"11".repeat(32)}`;
    const contractAddress = await goalProof.getAddress();
    const chainId = (await goalProof.runner!.provider!.getNetwork()).chainId;
    const encoded = AbiCoder.defaultAbiCoder().encode(
      ["uint256", "address", "address", "uint256", "uint8", "uint8", "bytes32"],
      [chainId, contractAddress, alice.address, 1, 2, 0, salt]
    );
    const typescriptCommitment = keccak256(encoded);
    const solidityCommitment = await goalProof.computeCommitment(alice.address, 1, 2, 0, salt);
    expect(solidityCommitment).to.equal(typescriptCommitment);
    expect(solidityCommitment).to.equal(
      "0x4c12594de0889d763b54f92b846d6858b3c04d6b600431a0ce0d98880f9a0a00"
    );
  });
});
