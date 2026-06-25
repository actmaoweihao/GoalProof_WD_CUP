import { expect } from "chai";
import { createMatch, deployFixture, fixedSalt, networkHelpers } from "./helpers.js";

async function committedFixture() {
  const fixture = await deployFixture();
  const { goalProof, alice, oracle } = fixture;
  const times = await createMatch(goalProof);
  const salt = fixedSalt("alice-secret");
  const commitment = await goalProof.computeCommitment(alice.address, 1, 2, 0, salt);
  await goalProof.connect(alice).commitPrediction(1, commitment);
  return { ...fixture, times, salt, commitment, oracle };
}

async function resolvedFixture() {
  const fixture = await committedFixture();
  await networkHelpers.time.increaseTo(fixture.times.kickoffTime);
  await fixture.goalProof.connect(fixture.oracle).submitResult(1, 2, 0);
  return fixture;
}

describe("GoalProof reveals", function () {
  it("verifies, stores, scores, counts, and emits an exact reveal", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await expect(goalProof.connect(alice).revealPrediction(1, 2, 0, salt))
      .to.emit(goalProof, "PredictionRevealed")
      .withArgs(1, alice.address, 2, 0, 5)
      .and.to.emit(goalProof, "ScoreAwarded")
      .withArgs(alice.address, 1, 5, 5);

    const prediction = await goalProof.getPrediction(1, alice.address);
    expect(prediction.revealed).to.equal(true);
    expect(prediction.revealedAt).to.be.greaterThan(0);
    expect(prediction.predictedHomeScore).to.equal(2);
    expect(prediction.predictedAwayScore).to.equal(0);
    expect(prediction.pointsAwarded).to.equal(5);
    expect(await goalProof.totalScores(alice.address)).to.equal(5);
    expect(await goalProof.validRevealCounts(alice.address)).to.equal(1);
    expect(await goalProof.exactScoreCounts(alice.address)).to.equal(1);
    expect((await goalProof.getMatch(1)).revealCount).to.equal(1);
  });

  it("accepts a reveal exactly at the deadline", async function () {
    const { goalProof, alice, salt, times } = await networkHelpers.loadFixture(resolvedFixture);
    await networkHelpers.time.setNextBlockTimestamp(times.revealDeadline);
    const receipt = await (await goalProof.connect(alice).revealPrediction(1, 2, 0, salt)).wait();
    expect(receipt?.status).to.equal(1);
  });

  it("rejects a reveal after the deadline", async function () {
    const { goalProof, alice, salt, times } = await networkHelpers.loadFixture(resolvedFixture);
    await networkHelpers.time.increaseTo(times.revealDeadline + 1);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "RevealPeriodClosed");
  });

  it("rejects a reveal before a result", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(committedFixture);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "ResultNotSubmitted");
  });

  it("rejects a reveal without a commitment", async function () {
    const { goalProof, bob, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await expect(
      goalProof.connect(bob).revealPrediction(1, 2, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "PredictionNotCommitted");
  });

  it("rejects the wrong salt", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(resolvedFixture);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, fixedSalt("wrong"))
    ).to.be.revertedWithCustomError(goalProof, "CommitmentMismatch");
  });

  it("rejects the wrong score", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 1, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "CommitmentMismatch");
  });

  it("prevents another wallet from copying reveal data", async function () {
    const { goalProof, bob, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await expect(
      goalProof.connect(bob).revealPrediction(1, 2, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "PredictionNotCommitted");
  });

  it("rejects duplicate reveal and scoring", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await goalProof.connect(alice).revealPrediction(1, 2, 0, salt);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "PredictionAlreadyRevealed");
    expect(await goalProof.totalScores(alice.address)).to.equal(5);
  });

  it("rejects an out-of-range predicted score", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 31, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "ScoreOutOfRange");
  });

  it("rejects a canceled match", async function () {
    const { goalProof, alice } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await goalProof.cancelMatch(1);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, fixedSalt("x"))
    ).to.be.revertedWithCustomError(goalProof, "MatchCanceledError");
  });

  it("rejects reveals while paused", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await goalProof.pause();
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, salt)
    ).to.be.revertedWithCustomError(goalProof, "EnforcedPause");
  });

  it("unpauses and permits settlement", async function () {
    const { goalProof, alice, salt } = await networkHelpers.loadFixture(resolvedFixture);
    await goalProof.pause();
    await goalProof.unpause();
    const receipt = await (await goalProof.connect(alice).revealPrediction(1, 2, 0, salt)).wait();
    expect(receipt?.status).to.equal(1);
  });
});
