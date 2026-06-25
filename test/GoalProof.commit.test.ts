import { expect } from "chai";
import { createMatch, deployFixture, fixedSalt, networkHelpers, ZERO_HASH } from "./helpers.js";

describe("GoalProof prediction commitments", function () {
  it("stores only a hash and timestamp before the deadline", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    const hash = fixedSalt("commitment");
    await expect(goalProof.connect(alice).commitPrediction(1, hash)).to.emit(
      goalProof,
      "PredictionCommitted"
    );
    const prediction = await goalProof.getPrediction(1, alice.address);
    expect(prediction.commitment).to.equal(hash);
    expect(prediction.committedAt).to.be.greaterThan(0);
    expect(prediction.predictedHomeScore).to.equal(0);
    expect(prediction.predictedAwayScore).to.equal(0);
    expect(prediction.revealed).to.equal(false);
  });

  it("rejects a zero commitment", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await expect(
      goalProof.connect(alice).commitPrediction(1, ZERO_HASH)
    ).to.be.revertedWithCustomError(goalProof, "ZeroCommitment");
  });

  it("rejects an invalid match", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await expect(
      goalProof.connect(alice).commitPrediction(1, fixedSalt("x"))
    ).to.be.revertedWithCustomError(goalProof, "InvalidMatchId");
  });

  it("rejects a canceled match", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await goalProof.cancelMatch(1);
    await expect(
      goalProof.connect(alice).commitPrediction(1, fixedSalt("x"))
    ).to.be.revertedWithCustomError(goalProof, "MatchCanceledError");
  });

  it("rejects a duplicate commitment", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await goalProof.connect(alice).commitPrediction(1, fixedSalt("x"));
    await expect(
      goalProof.connect(alice).commitPrediction(1, fixedSalt("y"))
    ).to.be.revertedWithCustomError(goalProof, "PredictionAlreadyCommitted");
  });

  it("allows different users to commit for the same match", async function () {
    const { goalProof, alice, bob } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await goalProof.connect(alice).commitPrediction(1, fixedSalt("a"));
    await goalProof.connect(bob).commitPrediction(1, fixedSalt("b"));
    expect((await goalProof.getPrediction(1, bob.address)).commitment).to.equal(fixedSalt("b"));
  });

  it("accepts a commitment one second before the deadline", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.setNextBlockTimestamp(times.commitDeadline - 1);
    const receipt = await (
      await goalProof.connect(alice).commitPrediction(1, fixedSalt("x"))
    ).wait();
    expect(receipt?.status).to.equal(1);
  });

  it("rejects a commitment exactly at the deadline", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.setNextBlockTimestamp(times.commitDeadline);
    await expect(
      goalProof.connect(alice).commitPrediction(1, fixedSalt("x"))
    ).to.be.revertedWithCustomError(goalProof, "CommitPeriodClosed");
  });

  it("rejects a commitment after the deadline", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.increaseTo(times.commitDeadline + 1);
    await expect(
      goalProof.connect(alice).commitPrediction(1, fixedSalt("x"))
    ).to.be.revertedWithCustomError(goalProof, "CommitPeriodClosed");
  });

  it("rejects commitments while paused", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await goalProof.pause();
    await expect(
      goalProof.connect(alice).commitPrediction(1, fixedSalt("x"))
    ).to.be.revertedWithCustomError(goalProof, "EnforcedPause");
  });
});
