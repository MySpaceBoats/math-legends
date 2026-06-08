import { QuizResult, ScoringResult } from './types'
import { calculateXP } from './xpCalculator'
import { calculateElo } from './eloCalculator'
import { evaluateBadges } from './badgeEngine'

export function processQuizResult(result: QuizResult, currentElo: number): ScoringResult {
  const xpBreakdown = calculateXP(result)
  const eloResult = calculateElo(result, currentElo)
  const badgesAwarded = evaluateBadges(result)

  return {
    xpGained: xpBreakdown.total,
    xpBreakdown,
    eloDelta: eloResult.delta,
    newElo: eloResult.newRating,
    badgesAwarded,
  }
}
