import { expect } from "chai";
import { deployFixture, networkHelpers } from "./helpers.js";

describe("GoalProof scoring", function () {
  const cases = [
    { name: "exact home win", predicted: [2, 0], actual: [2, 0], points: 5 },
    { name: "correct non-exact home win", predicted: [3, 1], actual: [2, 0], points: 3 },
    { name: "wrong home-win prediction", predicted: [1, 1], actual: [2, 0], points: 0 },
    { name: "exact draw", predicted: [1, 1], actual: [1, 1], points: 5 },
    { name: "correct non-exact draw", predicted: [0, 0], actual: [1, 1], points: 3 },
    { name: "exact away win", predicted: [0, 2], actual: [0, 2], points: 5 },
    { name: "correct non-exact away win", predicted: [1, 3], actual: [0, 2], points: 3 },
    { name: "zero-zero exact result", predicted: [0, 0], actual: [0, 0], points: 5 },
    { name: "maximum boundary", predicted: [30, 29], actual: [30, 0], points: 3 }
  ];

  for (const testCase of cases) {
    it(testCase.name, async function () {
      const { goalProof } = await networkHelpers.loadFixture(deployFixture);
      expect(
        await goalProof.calculatePoints(
          testCase.predicted[0],
          testCase.predicted[1],
          testCase.actual[0],
          testCase.actual[1]
        )
      ).to.equal(testCase.points);
    });
  }
});
