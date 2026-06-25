export const EXACT_SCORE_POINTS = 5;
export const CORRECT_OUTCOME_POINTS = 3;

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
) {
  if (predictedHome === actualHome && predictedAway === actualAway) return EXACT_SCORE_POINTS;
  const predictedOutcome = Math.sign(predictedHome - predictedAway);
  const actualOutcome = Math.sign(actualHome - actualAway);
  return predictedOutcome === actualOutcome ? CORRECT_OUTCOME_POINTS : 0;
}
