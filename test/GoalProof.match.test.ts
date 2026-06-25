import { expect } from "chai";
import { createMatch, deployFixture, networkHelpers } from "./helpers.js";

describe("GoalProof match lifecycle", function () {
  it("creates a valid sequential match and emits its data", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    const now = await networkHelpers.time.latest();
    await expect(goalProof.createMatch("BRA", "ARG", now + 20, now + 10, now + 30))
      .to.emit(goalProof, "MatchCreated")
      .withArgs(1, "BRA", "ARG", now + 20, now + 10, now + 30);
    expect(await goalProof.matchCount()).to.equal(1);
  });

  it("retrieves complete match data", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    const matchData = await goalProof.getMatch(1);
    expect(matchData.homeTeam).to.equal("BRA");
    expect(matchData.awayTeam).to.equal("ARG");
    expect(matchData.kickoffTime).to.equal(times.kickoffTime);
    expect(matchData.commitDeadline).to.equal(times.commitDeadline);
    expect(matchData.revealDeadline).to.equal(times.revealDeadline);
    expect(matchData.resultSubmitted).to.equal(false);
    expect(matchData.canceled).to.equal(false);
    expect(matchData.revealCount).to.equal(0);
  });

  for (const [home, away] of [
    ["", "ARG"],
    ["BRA", ""]
  ]) {
    it(`rejects an empty team name (${JSON.stringify([home, away])})`, async function () {
      const { goalProof } = await networkHelpers.loadFixture(deployFixture);
      const now = await networkHelpers.time.latest();
      await expect(
        goalProof.createMatch(home, away, now + 20, now + 10, now + 30)
      ).to.be.revertedWithCustomError(goalProof, "EmptyTeamName");
    });
  }

  it("rejects identical team names", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    const now = await networkHelpers.time.latest();
    await expect(
      goalProof.createMatch("BRA", "BRA", now + 20, now + 10, now + 30)
    ).to.be.revertedWithCustomError(goalProof, "IdenticalTeams");
  });

  it("rejects an expired commit deadline", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    const now = await networkHelpers.time.latest();
    await expect(
      goalProof.createMatch("BRA", "ARG", now + 20, now, now + 30)
    ).to.be.revertedWithCustomError(goalProof, "InvalidTimeConfiguration");
  });

  it("rejects a commit deadline after kickoff", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    const now = await networkHelpers.time.latest();
    await expect(
      goalProof.createMatch("BRA", "ARG", now + 10, now + 20, now + 30)
    ).to.be.revertedWithCustomError(goalProof, "InvalidTimeConfiguration");
  });

  it("rejects a reveal deadline equal to kickoff", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    const now = await networkHelpers.time.latest();
    await expect(
      goalProof.createMatch("BRA", "ARG", now + 20, now + 10, now + 20)
    ).to.be.revertedWithCustomError(goalProof, "InvalidTimeConfiguration");
  });

  it("rejects an invalid match id", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    await expect(goalProof.getMatch(1)).to.be.revertedWithCustomError(
      goalProof,
      "InvalidMatchId"
    );
  });

  it("cancels a valid unresolved match", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await expect(goalProof.cancelMatch(1)).to.emit(goalProof, "MatchCanceled").withArgs(1);
    expect((await goalProof.getMatch(1)).canceled).to.equal(true);
  });

  it("rejects double cancellation", async function () {
    const { goalProof } = await networkHelpers.loadFixture(deployFixture);
    await createMatch(goalProof);
    await goalProof.cancelMatch(1);
    await expect(goalProof.cancelMatch(1)).to.be.revertedWithCustomError(
      goalProof,
      "MatchAlreadyCanceled"
    );
  });

  it("rejects canceling a resolved match", async function () {
    const { goalProof, oracle } = await networkHelpers.loadFixture(deployFixture);
    const times = await createMatch(goalProof);
    await networkHelpers.time.increaseTo(times.kickoffTime);
    await goalProof.connect(oracle).submitResult(1, 2, 0);
    await expect(goalProof.cancelMatch(1)).to.be.revertedWithCustomError(
      goalProof,
      "ResultAlreadySubmitted"
    );
  });
});
