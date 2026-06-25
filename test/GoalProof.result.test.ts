import { expect } from "chai";
import { createMatch, deployFixture, networkHelpers } from "./helpers.js";

describe("GoalProof oracle results", function () {
  it("allows the oracle to submit at kickoff and emits the result", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.setNextBlockTimestamp(times.kickoffTime);
    await expect(goalProof.connect(oracle).submitResult(1, 2, 0))
      .to.emit(goalProof, "ResultSubmitted")
      .withArgs(1, 2, 0, oracle.address);
    const matchData = await goalProof.getMatch(1);
    expect(matchData.resultSubmitted).to.equal(true);
    expect(matchData.actualHomeScore).to.equal(2);
    expect(matchData.actualAwayScore).to.equal(0);
  });

  it("rejects a result one second before kickoff", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.setNextBlockTimestamp(times.kickoffTime - 1);
    await expect(goalProof.connect(oracle).submitResult(1, 2, 0)).to.be.revertedWithCustomError(
      goalProof,
      "MatchNotStarted"
    );
  });

  it("rejects duplicate results", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await goalProof.connect(oracle).submitResult(1, 2, 0);
    await expect(goalProof.connect(oracle).submitResult(1, 1, 1)).to.be.revertedWithCustomError(
      goalProof,
      "ResultAlreadySubmitted"
    );
  });

  it("rejects an invalid match", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    await expect(goalProof.connect(oracle).submitResult(1, 2, 0)).to.be.revertedWithCustomError(
      goalProof,
      "InvalidMatchId"
    );
  });

  it("rejects a canceled match", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await goalProof.cancelMatch(1);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await expect(goalProof.connect(oracle).submitResult(1, 2, 0)).to.be.revertedWithCustomError(
      goalProof,
      "MatchCanceledError"
    );
  });

  for (const scores of [
    [31, 0],
    [0, 31]
  ]) {
    it(`rejects an out-of-range score ${scores.join("-")}`, async function () {
      const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
      const times = await createMatch(goalProof);
      await networkHelpers.time.increaseTo(times.kickoffTime);
      await expect(
        goalProof.connect(oracle).submitResult(1, scores[0], scores[1])
      ).to.be.revertedWithCustomError(goalProof, "ScoreOutOfRange");
    });
  }

  it("accepts the maximum score boundary", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    const receipt = await (await goalProof.connect(oracle).submitResult(1, 30, 30)).wait();
    expect(receipt?.status).to.equal(1);
  });

  it("rejects results while paused", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await goalProof.pause();
    await expect(goalProof.connect(oracle).submitResult(1, 2, 0)).to.be.revertedWithCustomError(
      goalProof,
      "EnforcedPause"
    );
  });
});
