import { expect } from "chai";
import {
  createMatch,
  deployFixture,
  MATCH_MANAGER_ROLE,
  ORACLE_ROLE,
  PAUSER_ROLE,
  networkHelpers
} from "./helpers.js";

describe("GoalProof access control", function () {
  it("grants all operational roles to the deployer", async function () {
    const { goalProof, admin } = await networkHelpers.loadFixture(deployFixture);
    expect(await goalProof.hasRole(await goalProof.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true);
    expect(await goalProof.hasRole(MATCH_MANAGER_ROLE, admin.address)).to.equal(true);
    expect(await goalProof.hasRole(ORACLE_ROLE, admin.address)).to.equal(true);
    expect(await goalProof.hasRole(PAUSER_ROLE, admin.address)).to.equal(true);
  });

  it("rejects match creation by an unauthorized wallet", async function () {
    const { goalProof, outsider } = await networkHelpers.loadFixture(deployFixture);
    const now = await networkHelpers.time.latest();
    await expect(
      goalProof.connect(outsider).createMatch("BRA", "ARG", now + 20, now + 10, now + 30)
    ).to.be.revertedWithCustomError(goalProof, "AccessControlUnauthorizedAccount");
  });

  it("rejects result submission by an unauthorized wallet", async function () {
    const { goalProof, outsider } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await expect(goalProof.connect(outsider).submitResult(1, 2, 0)).to.be.revertedWithCustomError(
      goalProof,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("rejects pausing by an unauthorized wallet", async function () {
    const { goalProof, outsider } = await networkHelpers.loadFixture(deployFixture);
    await expect(goalProof.connect(outsider).pause()).to.be.revertedWithCustomError(
      goalProof,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("allows an admin to grant the oracle role", async function () {
    const { goalProof, outsider } = await networkHelpers.loadFixture(deployFixture);
    await goalProof.grantRole(ORACLE_ROLE, outsider.address);
    expect(await goalProof.hasRole(ORACLE_ROLE, outsider.address)).to.equal(true);
  });

  it("allows a newly granted oracle to submit a result", async function () {
    const { goalProof, outsider } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await goalProof.grantRole(ORACLE_ROLE, outsider.address);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await expect(goalProof.connect(outsider).submitResult(1, 2, 0)).to.emit(
      goalProof,
      "ResultSubmitted"
    );
  });

  it("prevents a revoked oracle from submitting a result", async function () {
    const { goalProof, outsider } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await goalProof.grantRole(ORACLE_ROLE, outsider.address);
    await goalProof.revokeRole(ORACLE_ROLE, outsider.address);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await expect(goalProof.connect(outsider).submitResult(1, 2, 0)).to.be.revertedWithCustomError(
      goalProof,
      "AccessControlUnauthorizedAccount"
    );
  });
});
