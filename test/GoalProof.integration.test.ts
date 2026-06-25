import { expect } from "chai";
import { createMatch, deployFixture, fixedSalt, networkHelpers } from "./helpers.js";

describe("GoalProof end-to-end integration", function () {
  it("settles exact and outcome-only predictions for Alice and Bob", async function () {
    const { goalProof, oracle, alice, bob } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    const aliceSalt = fixedSalt("integration-alice");
    const bobSalt = fixedSalt("integration-bob");
    const aliceCommitment = await goalProof.computeCommitment(alice.address, 1, 2, 0, aliceSalt);
    const bobCommitment = await goalProof.computeCommitment(bob.address, 1, 3, 1, bobSalt);

    await goalProof.connect(alice).commitPrediction(1, aliceCommitment);
    await goalProof.connect(bob).commitPrediction(1, bobCommitment);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await goalProof.connect(oracle).submitResult(1, 2, 0);

    await expect(goalProof.connect(alice).revealPrediction(1, 2, 0, aliceSalt))
      .to.emit(goalProof, "ScoreAwarded")
      .withArgs(alice.address, 1, 5, 5);
    await expect(goalProof.connect(bob).revealPrediction(1, 3, 1, bobSalt))
      .to.emit(goalProof, "ScoreAwarded")
      .withArgs(bob.address, 1, 3, 3);

    expect(await goalProof.totalScores(alice.address)).to.equal(5);
    expect(await goalProof.totalScores(bob.address)).to.equal(3);
    expect((await goalProof.getMatch(1)).revealCount).to.equal(2);
    await expect(
      goalProof.connect(alice).revealPrediction(1, 2, 0, aliceSalt)
    ).to.be.revertedWithCustomError(goalProof, "PredictionAlreadyRevealed");
  });
});
