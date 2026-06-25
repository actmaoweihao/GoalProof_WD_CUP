import { describe, expect, it } from "vitest";
import { getMatchPhase } from "./phases";

const match = {
  canceled: false,
  resultSubmitted: false,
  commitDeadline: 100n,
  kickoffTime: 200n,
  revealDeadline: 300n
};

describe("match phase calculation", () => {
  it("covers every lifecycle phase", () => {
    expect(getMatchPhase(match, 99n)).toBe("COMMIT_OPEN");
    expect(getMatchPhase(match, 100n)).toBe("WAITING_FOR_KICKOFF");
    expect(getMatchPhase(match, 200n)).toBe("WAITING_FOR_RESULT");
    expect(getMatchPhase({ ...match, resultSubmitted: true }, 200n)).toBe("REVEAL_OPEN");
    expect(getMatchPhase({ ...match, resultSubmitted: true }, 301n)).toBe("REVEAL_CLOSED");
    expect(getMatchPhase({ ...match, resultSubmitted: true }, 250n, true)).toBe("COMPLETED");
    expect(getMatchPhase({ ...match, canceled: true }, 50n)).toBe("CANCELED");
  });

  it("closes an unresolved match after its reveal deadline", () => {
    expect(getMatchPhase(match, 301n)).toBe("REVEAL_CLOSED");
  });
});
